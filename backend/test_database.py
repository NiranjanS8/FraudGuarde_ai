"""
Test script for the FraudGuard AI database
Run this to verify the database is working correctly
"""

import database as db
from datetime import datetime

def test_database():
    print("=" * 50)
    print("Testing FraudGuard AI Database")
    print("=" * 50)
    
    # Test 1: Create Account
    print("\n1. Testing account creation...")
    success = db.create_or_update_account(
        account_id="test@example.com",
        email="test@example.com",
        name="Test User"
    )
    print(f"   Account creation: {'✓ Success' if success else '✗ Failed'}")
    
    # Test 2: Save Transaction
    print("\n2. Testing transaction save...")
    transaction_data = {
        "id": f"txn-test-{int(datetime.now().timestamp()*1000)}",
        "account_id": "test@example.com",
        "recipient_id": "recipient-123",
        "transaction_amount": 1500.50,
        "prediction": "Legitimate",
        "probability": 0.25,
        "fraud_score": 3.5,
        "timestamp": datetime.utcnow().isoformat(),
        "transaction_frequency": 5,
        "recipient_verification_status": "verified",
        "recipient_blacklist_status": 0,
        "device_fingerprinting": 0,
        "vpn_proxy_usage": 0,
        "geo_location_flags": "normal",
        "behavioral_biometrics": 0.5,
        "time_since_last_transaction": 12.5,
        "social_trust_score": 85,
        "account_age": 2.5,
        "risk_factors": ["Low risk transaction"]
    }
    
    success = db.save_transaction(transaction_data)
    transaction_id = transaction_data["id"]
    print(f"   Transaction save: {'✓ Success' if success else '✗ Failed'}")
    print(f"   Transaction ID: {transaction_id}")
    
    # Test 3: Get Transaction
    print("\n3. Testing get transaction by ID...")
    transaction = db.get_transaction_by_id(transaction_id)
    if transaction:
        print(f"   Get transaction: ✓ Success")
        print(f"   Amount: {transaction['transaction_amount']}")
        print(f"   Prediction: {transaction['prediction']}")
    else:
        print(f"   Get transaction: ✗ Failed")
    
    # Test 4: Get All Transactions
    print("\n4. Testing get all transactions...")
    transactions = db.get_transactions(limit=10)
    print(f"   Found {len(transactions)} transactions")
    if transactions:
        print(f"   First transaction: {transactions[0]['id']}")
    
    # Test 5: Get Statistics
    print("\n5. Testing statistics...")
    stats = db.get_transaction_stats()
    print(f"   Statistics: ✓ Success")
    print(f"   Total: {stats['total']}")
    print(f"   Frauds: {stats['frauds']}")
    print(f"   Legitimate: {stats['legitimate']}")
    print(f"   Accuracy: {stats.get('accuracy', 0)}%")
    
    # Test 6: Filter Transactions
    print("\n6. Testing filtered queries...")
    legitimate_txns = db.get_transactions(prediction_filter="Legitimate", limit=5)
    fraudulent_txns = db.get_transactions(prediction_filter="Fraudulent", limit=5)
    print(f"   Legitimate transactions: {len(legitimate_txns)}")
    print(f"   Fraudulent transactions: {len(fraudulent_txns)}")
    
    # Test 7: Account-specific queries
    print("\n7. Testing account-specific queries...")
    account_txns = db.get_transactions(account_id="test@example.com", limit=10)
    print(f"   Transactions for test@example.com: {len(account_txns)}")
    
    print("\n" + "=" * 50)
    print("Database tests completed!")
    print("=" * 50)
    print("\nTo view the database:")
    print("  sqlite3 backend/fraudguard.db")
    print("  .tables")
    print("  SELECT COUNT(*) FROM transactions;")
    print("  .exit")

if __name__ == "__main__":
    test_database()

