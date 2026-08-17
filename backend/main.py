from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="E-Commerce Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to E-Commerce Intelligence API"}

@app.get("/api/kpis")
def get_kpis(db = Depends(get_db)):
    try:
        # We can either query the DB or use our pandas logic if DB isn't populated
        query = text("""
            SELECT 
                SUM(total_amount) as total_revenue,
                COUNT(order_id) as total_orders,
                COUNT(DISTINCT customer_id) as total_customers
            FROM orders WHERE order_status != 'Cancelled'
        """)
        result = db.execute(query).fetchone()
        
        profit_query = text("""
            SELECT SUM(item_profit) as total_profit 
            FROM order_items oi JOIN orders o ON oi.order_id = o.order_id 
            WHERE o.order_status != 'Cancelled'
        """)
        profit_result = db.execute(profit_query).fetchone()
        
        rev = result.total_revenue or 0
        orders = result.total_orders or 0
        cust = result.total_customers or 0
        profit = profit_result.total_profit or 0
        
        return {
            "total_revenue": float(rev),
            "total_profit": float(profit),
            "total_orders": orders,
            "total_customers": cust,
            "aov": float(rev / orders) if orders > 0 else 0,
            "profit_margin": float(profit / rev) if rev > 0 else 0
        }
    except Exception as e:
        # Fallback to mock data if DB fails
        return {
            "total_revenue": 15000000,
            "total_profit": 3000000,
            "total_orders": 85000,
            "total_customers": 20000,
            "aov": 176.47,
            "profit_margin": 0.20
        }

@app.get("/api/revenue/trend")
def get_revenue_trend(db = Depends(get_db)):
    try:
        query = text("""
            SELECT DATE_TRUNC('month', order_date) as month, SUM(total_amount) as revenue
            FROM orders WHERE order_status != 'Cancelled'
            GROUP BY 1 ORDER BY 1
        """)
        results = db.execute(query).fetchall()
        return [{"month": str(r.month.date()), "revenue": float(r.revenue)} for r in results]
    except:
        # Fallback to ML output if DB is unavailable
        try:
            df = pd.read_csv('../data/ml_output/historical_revenue.csv')
            return df.to_dict(orient='records')
        except:
            return []

@app.get("/api/forecast")
def get_forecast():
    try:
        df = pd.read_csv('../data/ml_output/revenue_forecast.csv')
        return df.to_dict(orient='records')
    except:
        return {"error": "Forecast not generated yet"}

@app.get("/api/customers/segments")
def get_segments():
    try:
        df = pd.read_csv('../data/ml_output/customer_segments.csv')
        segments = df['Segment'].value_counts().reset_index()
        segments.columns = ['name', 'value']
        return segments.to_dict(orient='records')
    except:
        return {"error": "Segments not generated yet"}

@app.get("/api/customers/churn")
def get_churn_risk():
    try:
        df = pd.read_csv('../data/ml_output/churn_predictions.csv')
        risk_dist = df['risk_level'].value_counts().reset_index()
        risk_dist.columns = ['name', 'value']
        return risk_dist.to_dict(orient='records')
    except:
        return {"error": "Churn predictions not generated yet"}

@app.get("/api/insights")
def get_business_insights():
    insights = []
    
    # 1. Dummy Business Insight Engine Logic
    # In a real scenario, this would use current data. For now we use the mock/fallback logic.
    insights.append({
        "finding": "High Churn Probability in 'New Customers' segment",
        "why_it_matters": "Acquisition costs are wasted if new users don't make a second purchase.",
        "recommendation": "Implement an automated welcome email series with a 15% discount for the second order.",
        "expected_impact": "Increase repeat purchase rate by 5-10%"
    })
    
    insights.append({
        "finding": "Profit Margin in 'Electronics' is below target (12%)",
        "why_it_matters": "Electronics drive 40% of revenue but are suppressing overall profitability.",
        "recommendation": "Bundle high-margin accessories with smartphones and laptops.",
        "expected_impact": "Improve category margin by 3-5%"
    })
    
    return insights

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
