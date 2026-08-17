# E-Commerce Intelligence System - Interview Questions & Answers

## SQL & Database Design
**1. Why did you choose PostgreSQL over a NoSQL database for this project?**
*Answer:* E-commerce data is highly relational (customers -> orders -> items -> products). PostgreSQL allows for strict schema enforcement, foreign key constraints, and highly optimized JOIN operations which are essential for complex financial and analytical reporting. 

**2. How did you calculate Customer Lifetime Value (CLV) in SQL?**
*Answer:* I aggregated the `total_amount` from the `orders` table grouped by `customer_id`, ensuring I filtered out 'Cancelled' or 'Returned' orders to accurately reflect realized revenue.

**3. What is the difference between WHERE and HAVING, and how did you use them?**
*Answer:* `WHERE` filters rows before aggregations are applied, while `HAVING` filters after aggregations. For example, I used `WHERE order_status != 'Cancelled'` to filter raw orders, and `HAVING SUM(item_revenue) > 0` to find low-performing products that actually had sales.

**4. How did you optimize your SQL queries for a dataset with hundreds of thousands of records?**
*Answer:* I created indexes on frequently joined and filtered columns, such as `customer_id`, `order_date`, and `product_id`. I also utilized CTEs (Common Table Expressions) to break down complex queries like Cohort Analysis into readable and efficient steps.

## Python & Data Engineering
**5. How did you ensure data quality during the generation and loading process?**
*Answer:* I wrote a validation script using Pandas that checked for missing values, duplicate records, and logical impossibilities (e.g., negative quantities or prices). 

**6. Why use Pandas for the data pipeline instead of doing everything in SQL?**
*Answer:* Pandas excels at complex, iterative data transformations and generating synthetic data with precise statistical distributions (e.g., using numpy.random). It also acts as the perfect bridge to feed cleaned data directly into Scikit-learn for machine learning.

## Machine Learning & Advanced Analytics
**7. Can you explain your RFM segmentation methodology?**
*Answer:* RFM stands for Recency, Frequency, and Monetary value. I calculated these metrics for each customer, scored them using quintiles (`pd.qcut`), and mapped them to specific business segments (e.g., 'Champions' or 'At Risk'). 

**8. Why did you apply K-Means clustering in addition to rule-based RFM?**
*Answer:* While rule-based RFM is intuitive for business stakeholders, K-Means clustering discovers natural, hidden groupings in the data without predefined thresholds. I log-transformed and scaled the data before running K-Means to handle the heavy right-skew typical in monetary data.

**9. How did you handle the class imbalance in your Churn Prediction model?**
*Answer:* Churn prediction is often imbalanced (more retained customers than churned). While I evaluated accuracy, I prioritized metrics like the F1-Score, Precision, and ROC-AUC. 

**10. Why use Random Forest for churn prediction over Logistic Regression?**
*Answer:* Random Forest handles non-linear relationships and interactions between features better than Logistic Regression. 

**11. Explain your time-series forecasting approach.**
*Answer:* I used the ARIMA model from `statsmodels`. After aggregating revenue monthly, I established a baseline using a 3-month Moving Average. I then fit an ARIMA model, evaluating its performance via Mean Absolute Percentage Error (MAPE) against a hold-out test set before forecasting the next 6 months.

## Business Intelligence & Visualization
**12. How does your Business Insight Engine work?**
*Answer:* It uses a rule-based logic tier in the FastAPI backend that evaluates current KPIs against predefined thresholds. If a metric like "Electronics Profit Margin" dips below a target, it automatically generates a recommendation object displayed on the frontend.

**13. What is CAC and ROAS, and why are they important?**
*Answer:* CAC (Customer Acquisition Cost) measures how much we spend to acquire a new user. ROAS (Return on Ad Spend) measures the revenue generated per dollar spent on advertising. Together, they determine the sustainability and scalability of marketing campaigns.

*(This document provides a starting point for interview prep covering SQL, Data Engineering, ML, and BI concepts.)*
