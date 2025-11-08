from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import database as db
from datetime import datetime
import random
import os

# ==============================
# ⚙️ Flask App Initialization
# ==============================
app = Flask(
    __name__,
    static_folder="static/dist",  # Serve built React files from here
    static_url_path=""
)

# ✅ Enable CORS for development (remove for production if serving frontend from Flask)
CORS(app, resources={r"/*": {"origins": "*"}})

# ==============================
# 🩺 Health Check
# ==============================
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "database": "connected" if db.test_connection() else "unavailable",
        "service": "FraudGuard AI Backend"
    }), 200

# ==============================
# 🧠 Fraud Prediction Logic
# ==============================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    try:
        amount = float(data.get("transaction_amount", 0))
        vpn_flag = int(data.get("vpn_proxy_usage", 0))
        blacklist_flag = int(data.get("recipient_blacklist_status", 0))
        suspicious_verif = str(data.get("recipient_verification_status", "")).lower() == "suspicious"

        # Simple heuristic
        is_fraud = amount > 5000 or vpn_flag == 1 or blacklist_flag == 1 or suspicious_verif

        if is_fraud:
            probability = round(random.uniform(0.75, 0.99), 2)
            fraud_score = round(random.uniform(7.0, 10.0), 1)
            prediction = "Fraudulent"
        else:
            probability = round(random.uniform(0.0, 0.3), 2)
            fraud_score = round(random.uniform(1.0, 3.5), 1)
            prediction = "Legitimate"

        return jsonify({
            "prediction": prediction,
            "probability": probability,
            "fraud_score": fraud_score,
            "risk_factors": list(filter(None, [
                "High transaction amount" if amount > 5000 else "",
                "VPN usage detected" if vpn_flag else "",
                "Recipient blacklisted" if blacklist_flag else "",
                "Suspicious verification" if suspicious_verif else ""
            ]))
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 💾 Database Operations
# ==============================
@app.route("/save_transaction", methods=["POST"])
def save_transaction_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if "id" not in data:
            data["id"] = f"txn-{int(datetime.now().timestamp() * 1000)}"

        success = db.save_transaction(data)
        if success:
            return jsonify({
                "success": True,
                "message": "Transaction saved successfully",
                "transaction_id": data["id"]
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save transaction (duplicate or DB error)"
            }), 400
    except Exception as e:
        print(f"[ERROR] save_transaction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/transactions", methods=["GET"])
def get_transactions_endpoint():
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        prediction = request.args.get('prediction')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        transactions = db.get_transactions(
            prediction_filter=prediction,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset
        )

        return jsonify(transactions), 200
    except Exception as e:
        print(f"[ERROR] get_transactions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/<transaction_id>", methods=["GET"])
def get_transaction_endpoint(transaction_id):
    try:
        transaction = db.get_transaction_by_id(transaction_id)
        if transaction:
            return jsonify(transaction), 200
        else:
            return jsonify({"error": "Transaction not found"}), 404
    except Exception as e:
        print(f"[ERROR] get_transaction_by_id: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/stats", methods=["GET"])
def get_stats_endpoint():
    try:
        stats = db.get_transaction_stats()
        return jsonify(stats), 200
    except Exception as e:
        print(f"[ERROR] get_transaction_stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction_endpoint(transaction_id):
    try:
        success = db.delete_transaction(transaction_id)
        return jsonify({
            "success": success,
            "message": "Deleted" if success else "Not found"
        }), 200 if success else 404
    except Exception as e:
        print(f"[ERROR] delete_transaction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/transactions", methods=["DELETE"])
def delete_all_transactions_endpoint():
    try:
        count = db.delete_all_transactions()
        return jsonify({
            "success": True,
            "deleted_count": count
        }), 200
    except Exception as e:
        print(f"[ERROR] delete_all_transactions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get_transactions", methods=["GET"])
def get_transactions_alias():
    """Alias for frontend compatibility"""
    return get_transactions_endpoint()

# ==============================
# 🌐 Serve React Frontend
# ==============================
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist_dir = os.path.join(app.root_path, "static/dist")
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    else:
        return send_from_directory(dist_dir, "index.html")

# ==============================
# 🚦 Global Error Handler
# ==============================
@app.errorhandler(Exception)
def handle_exception(e):
    print(f"🔥 Backend Error: {e}")
    return jsonify({"error": str(e)}), 500

# ==============================
# 🚀 Run Server
# ==============================
if __name__ == "__main__":
    print("🚀 Starting FraudGuard AI Backend Server...")
    print("✅ Serving static files from: static/dist")
    app.run(host="0.0.0.0", port=8080)
