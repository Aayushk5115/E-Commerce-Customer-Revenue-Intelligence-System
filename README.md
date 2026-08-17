# E-Commerce Customer & Revenue Intelligence System

## 📊 Project Overview
The **E-Commerce Customer & Revenue Intelligence System** is an end-to-end data analytics platform designed to transform raw e-commerce transactional data into actionable business insights. It provides deep visibility into revenue performance, customer segmentation (RFM), churn prediction, and future revenue forecasting.

This project was built from scratch, including realistic data generation, database design, data pipelining, machine learning models, RESTful APIs, and an interactive React dashboard.

## 💼 Business Problem
E-commerce businesses generate massive amounts of data but often struggle to identify actionable insights. Specifically, they need to answer:
- Who are our most valuable customers? (RFM Segmentation)
- Which customers are at risk of leaving? (Churn Prediction)
- How much revenue can we expect in the next 6 months? (Time Series Forecasting)
- Which products and marketing channels provide the highest ROI? (Analytics)

## 🎯 Objectives
- **Data Engineering**: Generate and validate a realistic 3-year dataset (100k+ orders, 20k+ customers).
- **Data Modeling**: Design a robust PostgreSQL schema.
- **Analytics**: Develop 40+ advanced SQL queries for core KPIs.
- **Machine Learning**: Implement K-Means clustering for customer segmentation and Random Forest/Logistic Regression for churn prediction.
- **Backend API**: Expose ML predictions and SQL analytics via FastAPI.
- **Frontend Dashboard**: Build a modern, responsive React dashboard using Vite, Tailwind CSS, and Recharts to visualize insights.

## 🏗️ Architecture & Technology Stack
- **Database**: PostgreSQL (Designed for analytical queries)
- **Data Pipeline**: Python, Pandas, NumPy
- **Machine Learning**: Scikit-Learn (K-Means, Random Forest, Logistic Regression), Statsmodels (ARIMA)
- **Backend API**: Python, FastAPI, SQLAlchemy
- **Frontend Dashboard**: React, Vite, Tailwind CSS, Recharts

## 📁 Repository Structure
```
├── analytics/         # Data analysis notebooks/scripts
├── backend/           # FastAPI application (main.py, models.py)
├── data/              # Raw generated CSVs and ML output
├── docs/              # Documentation (Architecture, Data Dictionary, etc.)
├── frontend/          # React + Vite dashboard
├── ml/                # Machine learning scripts (churn, rfm, forecasting)
├── scripts/           # Data generation and database loading scripts
├── sql/               # PostgreSQL schema and analytical queries
└── task.md            # Project task tracker
```

## 🚀 How to Run

1. **Clone the repository**
2. **Setup Python Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. **Generate Data & Setup Database**
   - Run `python scripts/generate_data.py`
   - Setup a local PostgreSQL server (`localhost:5432`, `postgres/postgres`).
   - Run `python scripts/load_data.py`
4. **Run Machine Learning Pipelines**
   - `python ml/rfm_segmentation.py`
   - `python ml/churn_prediction.py`
   - `python ml/forecasting.py`
5. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
6. **Start the Frontend Dashboard**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📈 Key Deliverables & Insights
- **RFM Segmentation**: Successfully grouped customers into 5 core segments using K-Means clustering, allowing for targeted marketing.
- **Churn Prediction Model**: Achieved robust ROC-AUC scores using Random Forest, identifying high-risk customers with high precision.
- **Revenue Forecasting**: Utilized ARIMA to forecast the next 6 months of revenue with a 95% confidence interval.
- **Business Insights Engine**: Automated generation of key findings based on real-time KPI thresholds.

## 🤝 Author
Created as a professional portfolio project for Data Analyst / BI Analyst roles.
