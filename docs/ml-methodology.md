# Machine Learning Methodology: E-Commerce Intelligence System

## 1. RFM & K-Means Customer Segmentation
**Objective**: Identify high-value customers and map behavioral segments.
**Approach**:
1. **RFM Calculation**: Extracted Recency (days since last purchase), Frequency (total orders), and Monetary (total spend) from historical order data.
2. **Rule-Based Scoring**: Divided the RFM metrics into quintiles (1-5), and applied heuristic rules to label segments like "Champions" and "At Risk".
3. **K-Means Clustering**: 
   - Addressed right-skew in monetary data using a `log1p` transformation.
   - Standardized features using `StandardScaler`.
   - Applied `KMeans` with $k=5$ to identify natural groupings without predefined biases.

## 2. Customer Churn Prediction
**Objective**: Predict which customers are at risk of abandoning the platform.
**Definition of Churn**: A customer who has not made a purchase in the last 90 days.
**Approach**:
1. **Feature Engineering**: Engineered features including `average_order_value`, `frequency`, `age`, and `acquisition_channel`.
2. **Models Evaluated**: 
   - `LogisticRegression`: Baseline model for interpretability.
   - `RandomForestClassifier`: Selected for handling non-linear relationships and capturing feature importance.
3. **Evaluation Metrics**: ROC-AUC, F1-Score, and Recall were prioritized over simple Accuracy due to the inherent class imbalance of churn datasets.
4. **Output**: Assigned a continuous churn probability to every customer, mapped to High/Medium/Low risk categories for the frontend dashboard.

## 3. Revenue Forecasting (ARIMA)
**Objective**: Forecast the next 6 months of total platform revenue.
**Approach**:
1. **Data Aggregation**: Grouped total non-cancelled order revenue into monthly periods.
2. **Baseline**: Established a 3-month Moving Average as a simple baseline.
3. **Time-Series Modeling**: Utilized `ARIMA (1,1,1)` from `statsmodels`. Evaluated the model using Mean Absolute Percentage Error (MAPE).
4. **Output**: Generated a 6-month forward projection including upper and lower 95% confidence intervals, visualized via Recharts on the dashboard.
