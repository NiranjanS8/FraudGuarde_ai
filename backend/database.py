import sqlite3
from datetime import datetime
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "fraudguard.db")



# ==============================
# 🧱 Database Initialization
# ==============================
def connect_db():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            from_account TEXT,
            to_account TEXT,
            transaction_amount REAL,
            prediction TEXT,
            probability REAL,
            fraud_score REAL,
            timestamp TEXT,
            transaction_frequency INTEGER,
            recipient_verification_status TEXT,
            recipient_blacklist_status INTEGER,
            device_fingerprinting INTEGER,
            vpn_proxy_usage INTEGER,
            geo_location_flags TEXT,
            behavioral_biometrics REAL,
            time_since_last_transaction REAL,
            social_trust_score REAL,
            account_age REAL,
            risk_factors TEXT
        )
        """)
        conn.commit()

init_db()
# ==============================
# 💾 Save Transaction
# ==============================
def save_transaction(data):
    """Insert or replace a transaction safely into the database"""
    try:
        with connect_db() as conn:
            c = conn.cursor()

            c.execute("""
                INSERT OR REPLACE INTO transactions (
                    id, from_account, to_account, transaction_amount,
                    prediction, probability, fraud_score, timestamp,
                    transaction_frequency, recipient_verification_status,
                    recipient_blacklist_status, device_fingerprinting,
                    vpn_proxy_usage, geo_location_flags, behavioral_biometrics,
                    time_since_last_transaction, social_trust_score, account_age, risk_factors
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get("id"),
                data.get("from_account"),
                data.get("to_account"),
                data.get("transaction_amount"),
                data.get("prediction"),
                data.get("probability"),
                data.get("fraud_score"),
                data.get("timestamp"),
                data.get("transaction_frequency"),
                data.get("recipient_verification_status"),
                data.get("recipient_blacklist_status"),
                data.get("device_fingerprinting"),
                data.get("vpn_proxy_usage"),
                data.get("geo_location_flags"),
                data.get("behavioral_biometrics"),
                data.get("time_since_last_transaction"),
                data.get("social_trust_score"),
                data.get("account_age"),
                json.dumps(data.get("risk_factors", []))
            ))

            conn.commit()
            print("[DB] Transaction saved successfully.")
            return True
    except Exception as e:
        print("[DB ERROR]", e)
        return False

# ==============================
# 🧠 Utility Functions
# ==============================
def query(sql, params=(), one=False):
    with connect_db() as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(sql, params)
        rv = cur.fetchall()
        return (dict(rv[0]) if rv else None) if one else [dict(r) for r in rv]

def execute(sql, params=()):
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount
# ==============================
# 📦 Get Transactions (with filters)
# ==============================
def get_transactions(prediction_filter=None, start_date=None, end_date=None, limit=100, offset=0):
    """
    Retrieve transactions with optional filters (prediction type, date range, pagination).
    """
    sql = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if prediction_filter:
        sql += " AND prediction = ?"
        params.append(prediction_filter)

    if start_date:
        sql += " AND timestamp >= ?"
        params.append(start_date)

    if end_date:
        sql += " AND timestamp <= ?"
        params.append(end_date)

    sql += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with connect_db() as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        return [dict(row) for row in rows]
def get_transaction_by_id(transaction_id):
    """Fetch one transaction by ID"""
    return query("SELECT * FROM transactions WHERE id = ?", (transaction_id,), one=True)

# ==============================
# 📊 Core DB Operations
# ==============================
def get_all_transactions(limit=10):
    return query("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?", (limit,))

def get_transaction_stats():
    total = query("SELECT COUNT(*) as c FROM transactions", one=True)["c"]
    frauds = query("SELECT COUNT(*) as c FROM transactions WHERE prediction='Fraudulent'", one=True)["c"]
    legitimate = total - frauds
    accuracy = round((legitimate / total) * 100, 2) if total > 0 else 0
    return {"total": total, "frauds": frauds, "legitimate": legitimate, "accuracy": accuracy}

def delete_transaction(transaction_id):
    return execute("DELETE FROM transactions WHERE id=?", (transaction_id,))

def delete_all_transactions():
    return execute("DELETE FROM transactions")


def search_by_prediction(prediction):
    return query("SELECT * FROM transactions WHERE prediction=? ORDER BY timestamp DESC", (prediction,))

# ==============================
# 🧩 Mini Text GUI
# ==============================
def print_header():
    os.system('cls' if os.name == 'nt' else 'clear')
    print("=" * 60)
    print("💼 FRAUDGUARD AI DATABASE VIEWER")
    print("=" * 60)
    stats = get_transaction_stats()
    print(f"📊 Total: {stats['total']} | 🚨 Frauds: {stats['frauds']} | ✅ Legit: {stats['legitimate']} | 🎯 Accuracy: {stats['accuracy']}%\n")

def pretty_print_transactions(transactions):
    if not transactions:
        print("⚠️  No transactions found.\n")
        return
    for t in transactions:
        print(f"🆔 {t['id']}")
        # print(f"👤 Account: {t['account_id']}")
        print(f"💰 Amount: {t['transaction_amount']}")
        print(f"🔮 Prediction: {t['prediction']} | Prob: {t['probability']} | Score: {t['fraud_score']}")
        print(f"🕒 Time: {t['timestamp']}")
        print("-" * 60)

def main_menu():
    while True:
        print_header()
        print("1️⃣  View latest 10 transactions")
        print("3️⃣  Search by prediction type (Fraudulent / Legitimate)")
        print("4️⃣  Show overall statistics")
        print("5️⃣  Delete transaction by ID")
        print("6️⃣  Delete all transactions ⚠️")
        print("0️⃣  Exit")
        choice = input("\nEnter your choice: ").strip()

        if choice == "1":
            txns = get_all_transactions(10)
            pretty_print_transactions(txns)
        elif choice == "3":
            pred = input("Enter prediction type (Fraudulent / Legitimate): ").strip()
            txns = search_by_prediction(pred)
            pretty_print_transactions(txns)
        elif choice == "4":
            stats = get_transaction_stats()
            print(f"\n📊 Statistics:\nTotal: {stats['total']}\nFrauds: {stats['frauds']}\nLegitimate: {stats['legitimate']}\nAccuracy: {stats['accuracy']}%\n")
        elif choice == "5":
            tid = input("Enter transaction ID to delete: ").strip()
            deleted = delete_transaction(tid)
            print("✅ Deleted" if deleted else "❌ Not found.")
        elif choice == "6":
            confirm = input("⚠️  Type 'YES' to confirm delete all: ").strip()
            if confirm == "YES":
                count = delete_all_transactions()
                print(f"🗑️  Deleted {count} transaction(s).")
        elif choice == "0":
            print("👋 Exiting FraudGuard DB Viewer...")
            break
        else:
            print("❌ Invalid choice.")

        input("\nPress Enter to continue...")

# ==============================
# 🚀 Run GUI
# ==============================
if __name__ == "__main__":
    init_db()
    main_menu()
