import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import os

DATA_DIR = 'data'
OUTPUT_DIR = 'data/ml_output'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def build_churn_model():
    print("Loading data for Churn Prediction...")
    customers = pd.read_csv(f"{DATA_DIR}/customers.csv")
    orders = pd.read_csv(f"{DATA_DIR}/orders.csv")
    orders['order_date'] = pd.to_datetime(orders['order_date'])
    
    # Define Churn: No purchase in the last 90 days
    current_date = orders['order_date'].max()
    churn_threshold = current_date - pd.Timedelta(days=90)
    
    # Feature Engineering
    customer_stats = orders[orders['order_status'] != 'Cancelled'].groupby('customer_id').agg(
        last_order_date=('order_date', 'max'),
        frequency=('order_id', 'count'),
        monetary=('total_amount', 'sum'),
        avg_order_value=('total_amount', 'mean')
    ).reset_index()
    
    # Target Variable
    customer_stats['is_churned'] = (customer_stats['last_order_date'] < churn_threshold).astype(int)
    
    # Merge with customer demographics
    features = pd.merge(customers[['customer_id', 'age', 'gender', 'acquisition_channel']], customer_stats, on='customer_id', how='inner')
    
    # Convert categorical to numerical
    features = pd.get_dummies(features, columns=['gender', 'acquisition_channel'], drop_first=True)
    
    # Define X and y
    X = features.drop(columns=['customer_id', 'last_order_date', 'is_churned'])
    y = features['is_churned']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training Logistic Regression...")
    lr_model = LogisticRegression(random_state=42)
    lr_model.fit(X_train_scaled, y_train)
    lr_preds = lr_model.predict(X_test_scaled)
    lr_probs = lr_model.predict_proba(X_test_scaled)[:, 1]
    
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train_scaled, y_train)
    rf_preds = rf_model.predict(X_test_scaled)
    rf_probs = rf_model.predict_proba(X_test_scaled)[:, 1]
    
    print("\n--- Model Evaluation ---")
    print("Logistic Regression:")
    print(f"Accuracy: {accuracy_score(y_test, lr_preds):.4f}")
    print(f"Precision: {precision_score(y_test, lr_preds):.4f}")
    print(f"Recall: {recall_score(y_test, lr_preds):.4f}")
    print(f"F1 Score: {f1_score(y_test, lr_preds):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, lr_probs):.4f}")
    
    print("\nRandom Forest:")
    print(f"Accuracy: {accuracy_score(y_test, rf_preds):.4f}")
    print(f"Precision: {precision_score(y_test, rf_preds):.4f}")
    print(f"Recall: {recall_score(y_test, rf_preds):.4f}")
    print(f"F1 Score: {f1_score(y_test, rf_preds):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, rf_probs):.4f}")
    
    # Using Random Forest to generate probabilities for all customers
    X_all_scaled = scaler.transform(X)
    features['churn_probability'] = rf_model.predict_proba(X_all_scaled)[:, 1]
    
    def assign_risk(prob):
        if prob > 0.7:
            return 'High Risk'
        elif prob > 0.4:
            return 'Medium Risk'
        else:
            return 'Low Risk'
            
    features['risk_level'] = features['churn_probability'].apply(assign_risk)
    
    output_df = features[['customer_id', 'is_churned', 'churn_probability', 'risk_level']]
    output_path = f"{OUTPUT_DIR}/churn_predictions.csv"
    output_df.to_csv(output_path, index=False)
    print(f"\nChurn predictions complete. Saved to {output_path}")

if __name__ == "__main__":
    build_churn_model()
