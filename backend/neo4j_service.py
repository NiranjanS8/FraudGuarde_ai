from neo4j import GraphDatabase
import os
from datetime import datetime

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "yourpassword")

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        with _driver.session() as s:
            s.run("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE")
            s.run("CREATE CONSTRAINT IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE")
    return _driver

def close_driver():
    global _driver
    if _driver:
        _driver.close()
        _driver = None

def save_transaction(tx_data: dict):
    drv = get_driver()
    with drv.session() as session:
        session.write_transaction(_create_tx, tx_data)

def _create_tx(tx, data):
    timestamp = data.get("timestamp") or datetime.utcnow().isoformat()
    
    cypher = """
    MERGE (a:Account {id: $account_id})
      ON CREATE SET a.created = datetime()
    CREATE (t:Transaction {
        id: $id,
        amount: $transaction_amount,
        prediction: $prediction,
        probability: $probability,
        fraud_score: $fraud_score,
        timestamp: datetime($timestamp),
        created_at: datetime()
    })
    MERGE (a)-[:MADE]->(t)
    RETURN t.id AS savedId
    """
    
    params = {
        "id": data.get("id") or f"txn-{int(datetime.now().timestamp()*1000)}",
        "account_id": data.get("account_id", "unknown-account"),
        "transaction_amount": float(data.get("transaction_amount", 0)),
        "prediction": data.get("prediction", "Unknown"),
        "probability": float(data.get("probability", 0.0)),
        "fraud_score": float(data.get("fraud_score", 0.0)),
        "timestamp": timestamp
    }
    
    tx.run(cypher, params)