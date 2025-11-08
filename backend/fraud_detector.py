"""
Fraud Detection Algorithm for FraudGuard AI
Uses multiple features to detect fraudulent transactions
"""

def detect_fraud(transaction_data):
    """
    Analyze transaction data and return fraud prediction
    
    Args:
        transaction_data (dict): Transaction features
        
    Returns:
        dict: {
            'prediction': 'Fraudulent' or 'Legitimate',
            'probability': float (0.0 to 1.0),
            'fraud_score': float (0.0 to 10.0),
            'risk_factors': list of risk factor strings
        }
    """
    
    risk_score = 0.0
    risk_factors = []
    max_risk_score = 10.0
    
    # Extract features with defaults
    amount = float(transaction_data.get('transaction_amount', 0))
    frequency = int(transaction_data.get('transaction_frequency', 0))
    recipient_status = transaction_data.get('recipient_verification_status', 'verified')
    blacklist_status = int(transaction_data.get('recipient_blacklist_status', 0))
    device_fingerprint = int(transaction_data.get('device_fingerprinting', 0))
    vpn_proxy = int(transaction_data.get('vpn_proxy_usage', 0))
    geo_flags = transaction_data.get('geo_location_flags', 'normal')
    behavioral_bio = float(transaction_data.get('behavioral_biometrics', 0))
    time_since_last = float(transaction_data.get('time_since_last_transaction', 0))
    trust_score = int(transaction_data.get('social_trust_score', 50))
    account_age = float(transaction_data.get('account_age', 1))
    high_risk_time = int(transaction_data.get('high_risk_transaction_times', 0))
    past_fraud = int(transaction_data.get('past_fraudulent_behavior', 0))
    location_inconsistent = int(transaction_data.get('location_inconsistent', 0))
    normalized_amount = float(transaction_data.get('normalized_transaction_amount', 0))
    context_anomalies = float(transaction_data.get('transaction_context_anomalies', 0))
    fraud_complaints = int(transaction_data.get('fraud_complaints_count', 0))
    merchant_mismatch = int(transaction_data.get('merchant_category_mismatch', 0))
    daily_limit_exceeded = int(transaction_data.get('user_daily_limit_exceeded', 0))
    high_value_flags = int(transaction_data.get('recent_high_value_flags', 0))
    
    # ========== HIGH-RISK FLAGS (Critical Indicators) ==========
    
    # Recipient on blacklist (CRITICAL)
    if blacklist_status == 1:
        risk_score += 2.5
        risk_factors.append('Recipient is on blacklist')
    
    # VPN/Proxy usage (HIGH RISK)
    if vpn_proxy == 1:
        risk_score += 1.5
        risk_factors.append('VPN or proxy detected')
    
    # Device fingerprinting flag (HIGH RISK)
    if device_fingerprint == 1:
        risk_score += 1.2
        risk_factors.append('Suspicious device detected')
    
    # Past fraudulent behavior (CRITICAL)
    if past_fraud == 1:
        risk_score += 2.0
        risk_factors.append('History of fraudulent activity')
    
    # Location inconsistency (HIGH RISK)
    if location_inconsistent == 1:
        risk_score += 1.3
        risk_factors.append('Location inconsistency detected')
    
    # ========== RECIPIENT VERIFICATION (HIGH RISK) ==========
    
    if recipient_status == 'suspicious':
        risk_score += 2.0
        risk_factors.append('Recipient marked as suspicious')
    elif recipient_status == 'recently_registered':
        risk_score += 1.0
        risk_factors.append('Recipient recently registered')
    
    # ========== GEOGRAPHIC RISK (MEDIUM-HIGH RISK) ==========
    
    if geo_flags == 'high-risk':
        risk_score += 1.8
        risk_factors.append('High-risk geographic location')
    elif geo_flags == 'unusual':
        risk_score += 1.2
        risk_factors.append('Unusual geographic location')
    
    # ========== TRANSACTION AMOUNT PATTERNS ==========
    
    # Very high transaction amount
    if amount > 4000:
        risk_score += 1.5
        risk_factors.append('Very high transaction amount')
    elif amount > 2500:
        risk_score += 0.8
        risk_factors.append('High transaction amount')
    
    # Normalized amount (if very high)
    if normalized_amount > 0.8:
        risk_score += 1.0
        risk_factors.append('Unusually high normalized amount')
    elif normalized_amount > 0.6:
        risk_score += 0.5
    
    # ========== TRANSACTION FREQUENCY PATTERNS ==========
    
    # Very high frequency (potential fraud pattern)
    if frequency > 20:
        risk_score += 1.5
        risk_factors.append('Unusually high transaction frequency')
    elif frequency > 10:
        risk_score += 0.8
        risk_factors.append('High transaction frequency')
    
    # Very short time between transactions
    if time_since_last < 1.0:
        risk_score += 1.0
        risk_factors.append('Very short time since last transaction')
    elif time_since_last < 2.0:
        risk_score += 0.5
    
    # ========== USER BEHAVIOR AND TRUST ==========
    
    # Low social trust score
    if trust_score < 30:
        risk_score += 1.5
        risk_factors.append('Low social trust score')
    elif trust_score < 50:
        risk_score += 0.8
        risk_factors.append('Below average trust score')
    
    # Very new account
    if account_age < 0.5:
        risk_score += 1.2
        risk_factors.append('Very new account')
    elif account_age < 1.0:
        risk_score += 0.6
    
    # Behavioral biometrics (unusual behavior)
    if behavioral_bio > 2.5:
        risk_score += 1.3
        risk_factors.append('Unusual behavioral pattern')
    elif behavioral_bio > 2.0:
        risk_score += 0.7
    
    # ========== CONTEXTUAL ANOMALIES ==========
    
    # High context anomalies
    if context_anomalies > 2.5:
        risk_score += 1.4
        risk_factors.append('High contextual anomalies')
    elif context_anomalies > 1.5:
        risk_score += 0.8
    
    # Fraud complaints
    if fraud_complaints > 3:
        risk_score += 1.5
        risk_factors.append('Multiple fraud complaints')
    elif fraud_complaints > 0:
        risk_score += 0.7
        risk_factors.append('Previous fraud complaints')
    
    # ========== TRANSACTION TIMING ==========
    
    # High-risk transaction times
    if high_risk_time == 1:
        risk_score += 0.8
        risk_factors.append('Transaction at high-risk time')
    
    # ========== MERCHANT AND LIMIT FLAGS ==========
    
    # Merchant category mismatch
    if merchant_mismatch == 1:
        risk_score += 0.9
        risk_factors.append('Merchant category mismatch')
    
    # Daily limit exceeded
    if daily_limit_exceeded == 1:
        risk_score += 1.2
        risk_factors.append('Daily transaction limit exceeded')
    
    # Recent high-value flags
    if high_value_flags == 1:
        risk_score += 0.8
        risk_factors.append('Recent high-value transaction flags')
    
    # ========== CALCULATE FINAL SCORES ==========
    
    # Cap risk score at maximum
    risk_score = min(risk_score, max_risk_score)
    
    # Convert risk score to probability (0.0 to 1.0)
    # Using sigmoid-like function for better distribution
    probability = 1 / (1 + (10 / (risk_score + 0.1)) ** 2)
    
    # Ensure probability is reasonable
    if risk_score >= 7.0:
        probability = 0.85 + (risk_score - 7.0) * 0.05  # 0.85 to 0.95
    elif risk_score >= 5.0:
        probability = 0.65 + (risk_score - 5.0) * 0.10  # 0.65 to 0.85
    elif risk_score >= 3.0:
        probability = 0.35 + (risk_score - 3.0) * 0.15  # 0.35 to 0.65
    else:
        probability = risk_score * 0.12  # 0.0 to 0.36
    
    # Cap probability
    probability = min(probability, 0.98)
    probability = max(probability, 0.02)
    
    # Determine prediction
    if risk_score >= 5.0 or probability >= 0.7:
        prediction = 'Fraudulent'
    else:
        prediction = 'Legitimate'
    
    # Round values
    probability = round(probability, 3)
    risk_score = round(risk_score, 2)
    
    return {
        'prediction': prediction,
        'probability': probability,
        'fraud_score': risk_score,
        'risk_factors': risk_factors if risk_factors else ['Low risk indicators']
    }

