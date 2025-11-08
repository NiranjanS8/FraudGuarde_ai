"""
Test script for fraud detection algorithm
"""

from fraud_detector import detect_fraud

def test_fraud_detection():
    print("=" * 60)
    print("Testing Fraud Detection Algorithm")
    print("=" * 60)
    
    # Test 1: Clear Fraud Transaction
    print("\n1. Testing CLEAR FRAUD transaction...")
    fraud_transaction = {
        "transaction_amount": 4500,
        "transaction_frequency": 25,
        "recipient_verification_status": "suspicious",
        "recipient_blacklist_status": 1,
        "device_fingerprinting": 1,
        "vpn_proxy_usage": 1,
        "geo_location_flags": "high-risk",
        "behavioral_biometrics": 2.8,
        "time_since_last_transaction": 0.5,
        "social_trust_score": 15,
        "account_age": 0.2,
        "high_risk_transaction_times": 1,
        "past_fraudulent_behavior": 1,
        "location_inconsistent": 1,
        "normalized_transaction_amount": 0.9,
        "transaction_context_anomalies": 2.8,
        "fraud_complaints_count": 5,
        "merchant_category_mismatch": 1,
        "user_daily_limit_exceeded": 1,
        "recent_high_value_flags": 1
    }
    
    result = detect_fraud(fraud_transaction)
    print(f"   Prediction: {result['prediction']}")
    print(f"   Probability: {result['probability']:.3f}")
    print(f"   Fraud Score: {result['fraud_score']:.2f}/10.0")
    print(f"   Risk Factors: {len(result['risk_factors'])} factors detected")
    for factor in result['risk_factors'][:5]:  # Show first 5
        print(f"      - {factor}")
    
    if result['prediction'] == 'Fraudulent' and result['probability'] > 0.7:
        print("   [OK] CORRECTLY IDENTIFIED AS FRAUD")
    else:
        print("   [FAIL] Should be identified as fraud")
    
    # Test 2: Clear Legitimate Transaction
    print("\n2. Testing CLEAR LEGITIMATE transaction...")
    legitimate_transaction = {
        "transaction_amount": 250,
        "transaction_frequency": 3,
        "recipient_verification_status": "verified",
        "recipient_blacklist_status": 0,
        "device_fingerprinting": 0,
        "vpn_proxy_usage": 0,
        "geo_location_flags": "normal",
        "behavioral_biometrics": 0.5,
        "time_since_last_transaction": 12,
        "social_trust_score": 85,
        "account_age": 3.5,
        "high_risk_transaction_times": 0,
        "past_fraudulent_behavior": 0,
        "location_inconsistent": 0,
        "normalized_transaction_amount": 0.3,
        "transaction_context_anomalies": 0.2,
        "fraud_complaints_count": 0,
        "merchant_category_mismatch": 0,
        "user_daily_limit_exceeded": 0,
        "recent_high_value_flags": 0
    }
    
    result = detect_fraud(legitimate_transaction)
    print(f"   Prediction: {result['prediction']}")
    print(f"   Probability: {result['probability']:.3f}")
    print(f"   Fraud Score: {result['fraud_score']:.2f}/10.0")
    print(f"   Risk Factors: {result['risk_factors']}")
    
    if result['prediction'] == 'Legitimate' and result['probability'] < 0.3:
        print("   [OK] CORRECTLY IDENTIFIED AS LEGITIMATE")
    else:
        print("   [FAIL] Should be identified as legitimate")
    
    # Test 3: Borderline Case (Medium Risk)
    print("\n3. Testing BORDERLINE (medium risk) transaction...")
    borderline_transaction = {
        "transaction_amount": 2000,
        "transaction_frequency": 8,
        "recipient_verification_status": "recently_registered",
        "recipient_blacklist_status": 0,
        "device_fingerprinting": 0,
        "vpn_proxy_usage": 1,
        "geo_location_flags": "normal",
        "behavioral_biometrics": 1.5,
        "time_since_last_transaction": 5,
        "social_trust_score": 60,
        "account_age": 1.5,
        "high_risk_transaction_times": 0,
        "past_fraudulent_behavior": 0,
        "location_inconsistent": 0,
        "normalized_transaction_amount": 0.5,
        "transaction_context_anomalies": 1.0,
        "fraud_complaints_count": 1,
        "merchant_category_mismatch": 0,
        "user_daily_limit_exceeded": 0,
        "recent_high_value_flags": 0
    }
    
    result = detect_fraud(borderline_transaction)
    print(f"   Prediction: {result['prediction']}")
    print(f"   Probability: {result['probability']:.3f}")
    print(f"   Fraud Score: {result['fraud_score']:.2f}/10.0")
    print(f"   Risk Factors:")
    for factor in result['risk_factors']:
        print(f"      - {factor}")
    print("   [OK] Borderline case analyzed")
    
    # Test 4: High Amount but Legitimate
    print("\n4. Testing HIGH AMOUNT but legitimate transaction...")
    high_amount_legit = {
        "transaction_amount": 4800,  # High amount
        "transaction_frequency": 2,  # But low frequency
        "recipient_verification_status": "verified",
        "recipient_blacklist_status": 0,
        "device_fingerprinting": 0,
        "vpn_proxy_usage": 0,
        "geo_location_flags": "normal",
        "behavioral_biometrics": 0.3,
        "time_since_last_transaction": 24,
        "social_trust_score": 95,  # Very high trust
        "account_age": 4.5,  # Old account
        "high_risk_transaction_times": 0,
        "past_fraudulent_behavior": 0,
        "location_inconsistent": 0,
        "normalized_transaction_amount": 0.4,
        "transaction_context_anomalies": 0.1,
        "fraud_complaints_count": 0,
        "merchant_category_mismatch": 0,
        "user_daily_limit_exceeded": 0,
        "recent_high_value_flags": 0
    }
    
    result = detect_fraud(high_amount_legit)
    print(f"   Prediction: {result['prediction']}")
    print(f"   Probability: {result['probability']:.3f}")
    print(f"   Fraud Score: {result['fraud_score']:.2f}/10.0")
    print(f"   Risk Factors: {result['risk_factors']}")
    
    if result['prediction'] == 'Legitimate':
        print("   [OK] CORRECTLY IDENTIFIED AS LEGITIMATE (despite high amount)")
    else:
        print("   [WARN] Flagged as fraud (high amount triggered)")
    
    print("\n" + "=" * 60)
    print("Fraud Detection Tests Completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_fraud_detection()

