import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import os

DATA_DIR = 'data'
OUTPUT_DIR = 'data/ml_output'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def perform_rfm_segmentation():
    print("Loading data for RFM Analysis...")
    customers = pd.read_csv(f"{DATA_DIR}/customers.csv")
    orders = pd.read_csv(f"{DATA_DIR}/orders.csv")
    orders['order_date'] = pd.to_datetime(orders['order_date'])
    
    # Filter completed orders
    completed_orders = orders[orders['order_status'] != 'Cancelled'].copy()
    
    print("Calculating RFM metrics...")
    current_date = completed_orders['order_date'].max() + pd.Timedelta(days=1)
    
    rfm = completed_orders.groupby('customer_id').agg({
        'order_date': lambda x: (current_date - x.max()).days,
        'order_id': 'count',
        'total_amount': 'sum'
    }).reset_index()
    
    rfm.columns = ['customer_id', 'recency', 'frequency', 'monetary']
    
    # RFM Scoring (1-5, 5 is best)
    # Recency: Lower is better
    rfm['R_Score'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1], duplicates='drop')
    
    # Frequency: Higher is better (using rank to handle duplicates)
    rfm['F_Score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
    
    # Monetary: Higher is better
    rfm['M_Score'] = pd.qcut(rfm['monetary'], 5, labels=[1, 2, 3, 4, 5], duplicates='drop')
    
    rfm['RFM_Segment_Code'] = rfm['R_Score'].astype(str) + rfm['F_Score'].astype(str) + rfm['M_Score'].astype(str)
    rfm['RFM_Score'] = rfm[['R_Score', 'F_Score', 'M_Score']].sum(axis=1)
    
    # Define Segments
    def assign_segment(row):
        r, f, m = int(row['R_Score']), int(row['F_Score']), int(row['M_Score'])
        if r >= 4 and f >= 4 and m >= 4:
            return 'Champions'
        elif r >= 3 and f >= 3 and m >= 3:
            return 'Loyal Customers'
        elif r >= 3 and f <= 3 and m >= 2:
            return 'Potential Loyalists'
        elif r >= 4 and f <= 2:
            return 'New Customers'
        elif r >= 3 and f <= 3:
            return 'Promising'
        elif r == 2 and f >= 2 and m >= 2:
            return 'Need Attention'
        elif r <= 2 and f >= 3 and m >= 3:
            return 'At Risk'
        elif r <= 2 and f >= 4 and m >= 4:
            return "Can't Lose Them"
        else:
            return 'Lost Customers'
            
    rfm['Segment'] = rfm.apply(assign_segment, axis=1)
    
    print("Performing K-Means Clustering...")
    # Prepare data for K-Means
    features = rfm[['recency', 'frequency', 'monetary']]
    
    # Log transform to handle skewness
    features_log = np.log1p(features)
    
    # Scale data
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features_log)
    
    # K-Means with k=5
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    rfm['Cluster'] = kmeans.fit_predict(scaled_features)
    
    # Map clusters to descriptive names based on means
    cluster_means = rfm.groupby('Cluster')[['recency', 'frequency', 'monetary']].mean()
    print("Cluster Means:")
    print(cluster_means)
    
    # Save output
    output_path = f"{OUTPUT_DIR}/customer_segments.csv"
    rfm.to_csv(output_path, index=False)
    print(f"RFM Segmentation complete. Saved to {output_path}")

if __name__ == "__main__":
    perform_rfm_segmentation()
