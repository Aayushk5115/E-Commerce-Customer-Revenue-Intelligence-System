from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import os
import sys

# Ensure local imports work whether run from root or backend directory
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from analytics_engine import engine

app = FastAPI(
    title="E-Commerce Customer & Revenue Intelligence API",
    description="High-performance analytics API powering executive overview, customer RFM/churn intelligence, product analytics, ARIMA forecasting, marketing ROAS/CAC, and dynamic business insights.",
    version="2.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "E-Commerce Customer & Revenue Intelligence API",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

# ==========================================
# 1. FILTER OPTIONS
# ==========================================
@app.get("/api/filters")
def get_filters():
    """Returns available categories, regions, acquisition channels, segments, brands, and date range limits."""
    return engine.get_filter_options()

# ==========================================
# 2. EXECUTIVE & FINANCIAL METRICS
# ==========================================
@app.get("/api/kpis")
def get_kpis(
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Calculates Total Revenue, Profit, Margin, Orders, Customers, AOV, Retention Rate with period deltas."""
    return engine.calculate_kpis(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
        channel=channel,
        segment=segment
    )

@app.get("/api/revenue/trend")
def get_revenue_trend(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Returns monthly revenue, profit, orders, and YoY / MoM growth rates."""
    return engine.get_revenue_trend(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
        channel=channel,
        segment=segment
    )

@app.get("/api/revenue/by-category")
def get_revenue_by_category(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None)
):
    """Returns revenue, profit, order counts, and share % per product category."""
    return engine.get_revenue_by_category(
        start_date=start_date,
        end_date=end_date,
        region=region,
        channel=channel
    )

@app.get("/api/revenue/by-region")
def get_revenue_by_region(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """Returns geographic revenue and order distribution by state/region."""
    return engine.get_revenue_by_region(
        start_date=start_date,
        end_date=end_date,
        category=category,
        channel=channel,
        limit=limit
    )

@app.get("/api/revenue/top-products")
def get_top_products(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """Returns top performing products by revenue, profit, and volume."""
    return engine.get_top_products(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
        limit=limit
    )

# ==========================================
# 3. CUSTOMER INTELLIGENCE & CHURN
# ==========================================
@app.get("/api/customers/kpis")
def get_customer_kpis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Returns customer KPIs: CLV, Repeat Purchase Rate, Churn Rate, High-Risk Customers, Revenue at Risk."""
    return engine.get_customer_kpis(
        start_date=start_date,
        end_date=end_date,
        channel=channel,
        segment=segment
    )

@app.get("/api/customers/segments")
def get_customer_segments():
    """Returns customer distribution across RFM segments with counts, percentage, revenue, and average spend."""
    return engine.get_customer_segments()

@app.get("/api/customers/churn")
def get_churn_analytics():
    """Returns churn risk distribution (Low/Med/High), scikit-learn model evaluation metrics, and feature importances."""
    return engine.get_churn_analytics()

@app.get("/api/customers/clv-distribution")
def get_clv_distribution():
    """Returns customer lifetime value distribution by spend brackets."""
    return engine.get_clv_distribution()

@app.get("/api/customers/retention-trend")
def get_customer_retention_trend():
    """Returns monthly customer retention rates over time."""
    return engine.get_customer_retention_trend()

@app.get("/api/customers")
def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    sort_by: str = Query('total_spent'),
    sort_order: str = Query('desc')
):
    """Paginated, searchable, sortable list of customers with RFM scores, churn probabilities, and order stats."""
    return engine.get_customers_table(
        page=page,
        page_size=page_size,
        search=search,
        segment=segment,
        risk_level=risk_level,
        sort_by=sort_by,
        sort_order=sort_order
    )

# ==========================================
# 4. PRODUCT INTELLIGENCE
# ==========================================
@app.get("/api/products/kpis")
def get_product_kpis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None)
):
    """Returns total products, units sold, revenue, profit, avg margin, return rate, and best sellers."""
    return engine.get_product_kpis(
        start_date=start_date,
        end_date=end_date,
        category=category,
        brand=brand
    )

@app.get("/api/products/performance")
def get_product_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None)
):
    """Returns category breakdown, top revenue/profit products, scatter plot data, and 2x2 BCG quadrant matrix."""
    return engine.get_product_performance(
        start_date=start_date,
        end_date=end_date,
        category=category,
        brand=brand
    )

@app.get("/api/products")
def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    sort_by: str = Query('revenue'),
    sort_order: str = Query('desc')
):
    """Paginated, searchable, sortable product catalog with units sold, revenue, profit, margin, and return rate."""
    return engine.get_products_table(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        brand=brand,
        sort_by=sort_by,
        sort_order=sort_order
    )

# ==========================================
# 5. TIME SERIES FORECASTING
# ==========================================
@app.get("/api/forecast")
def get_forecast(horizon: int = Query(6, ge=3, le=12)):
    """Returns actual monthly revenue + ARIMA forecasted revenue with 95% confidence intervals and model comparisons."""
    return engine.get_forecast(horizon=horizon)

# ==========================================
# 6. COHORT RETENTION ANALYSIS
# ==========================================
@app.get("/api/cohorts")
def get_cohorts():
    """Returns first-purchase cohort retention matrix heatmap for Month 0 through Month 11."""
    return engine.get_cohort_analysis()

# ==========================================
# 7. MARKETING & ACQUISITION ANALYTICS
# ==========================================
@app.get("/api/marketing")
def get_marketing():
    """Returns marketing spend, revenue, CAC, ROAS, conversion rate, channel comparison, and campaign performance."""
    return engine.get_marketing_analytics()

# ==========================================
# 8. DYNAMIC BUSINESS INSIGHTS ENGINE
# ==========================================
@app.get("/api/insights")
def get_insights(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None)
):
    """Generates automated, rule-based business insights and action recommendations from live filtered metrics."""
    return engine.get_business_insights(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
