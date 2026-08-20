from fastapi import FastAPI, Query, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import os
import sys

# Ensure local imports work whether run from root or backend directory
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from analytics_engine import manager, engine

app = FastAPI(
    title="E-Commerce Multi-Company Customer & Revenue Intelligence API",
    description="Multi-tenant, high-performance analytics API powering executive overview, customer RFM/churn intelligence, product analytics, ARIMA forecasting, marketing ROAS/CAC, and dynamic business insights across multiple enterprise companies.",
    version="3.0.0"
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
        "service": "E-Commerce Multi-Company Customer & Revenue Intelligence API",
        "version": "3.0.0",
        "companies_url": "/api/companies",
        "docs_url": "/docs"
    }

# ==========================================
# 0. COMPANY DISCOVERY & REGISTRY
# ==========================================
@app.get("/api/companies")
def get_companies():
    """Returns the list of all registered companies with metadata and live summary metrics."""
    return manager.list_companies()

@app.get("/api/companies/{company_id}")
def get_company(company_id: str = Path(..., description="Unique company ID or slug (e.g., company-1, company-2)")):
    """Returns company profile metadata and status for a specific company."""
    meta = manager.get_company_meta(company_id)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Company '{company_id}' not found.")
    
    eng = manager.get_engine(company_id)
    kpis = eng.calculate_kpis()
    
    comp_data = dict(meta)
    comp_data["live_kpis"] = {
        "total_revenue": kpis.get("total_revenue", 0),
        "total_orders": kpis.get("total_orders", 0),
        "total_customers": kpis.get("total_customers", 0),
        "profit_margin": kpis.get("profit_margin", 0),
        "revenue_growth": kpis.get("revenue_growth", 0)
    }
    return comp_data

# ==========================================
# 1. COMPANY-AWARE FILTER OPTIONS
# ==========================================
@app.get("/api/companies/{company_id}/filters")
@app.get("/api/filters")
def get_filters(company_id: str = "company-1"):
    """Returns available categories, regions, acquisition channels, segments, brands, and date limits for the company."""
    eng = manager.get_engine(company_id)
    return eng.get_filter_options()

# ==========================================
# 2. COMPANY-AWARE EXECUTIVE & FINANCIAL METRICS
# ==========================================
@app.get("/api/companies/{company_id}/kpis")
@app.get("/api/kpis")
def get_kpis(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Calculates Total Revenue, Profit, Margin, Orders, Customers, AOV, Retention Rate with period deltas."""
    eng = manager.get_engine(company_id)
    return eng.calculate_kpis(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
        channel=channel,
        segment=segment
    )

@app.get("/api/companies/{company_id}/revenue/trend")
@app.get("/api/revenue/trend")
def get_revenue_trend(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Returns monthly revenue, profit, orders, and YoY / MoM growth rates for the company."""
    eng = manager.get_engine(company_id)
    return eng.get_revenue_trend(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
        channel=channel,
        segment=segment
    )

@app.get("/api/companies/{company_id}/revenue/by-category")
@app.get("/api/revenue/by-category")
def get_revenue_by_category(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    channel: Optional[str] = Query(None)
):
    """Returns revenue, profit, order counts, and share % per product category for the company."""
    eng = manager.get_engine(company_id)
    return eng.get_revenue_by_category(
        start_date=start_date,
        end_date=end_date,
        region=region,
        channel=channel
    )

@app.get("/api/companies/{company_id}/revenue/by-region")
@app.get("/api/revenue/by-region")
def get_revenue_by_region(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """Returns geographic revenue breakdown by shipping state for the company."""
    eng = manager.get_engine(company_id)
    return eng.get_revenue_by_region(
        start_date=start_date,
        end_date=end_date,
        category=category,
        channel=channel,
        limit=limit
    )

@app.get("/api/companies/{company_id}/revenue/top-products")
@app.get("/api/revenue/top-products")
def get_top_products(
    company_id: str = "company-1",
    limit: int = Query(10, ge=1, le=50)
):
    """Returns top grossing products for the company."""
    eng = manager.get_engine(company_id)
    return eng.get_top_products(limit=limit)

# ==========================================
# 3. COMPANY-AWARE CUSTOMER INTELLIGENCE & CHURN
# ==========================================
@app.get("/api/companies/{company_id}/customers/kpis")
@app.get("/api/customers/kpis")
def get_customer_kpis(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    segment: Optional[str] = Query(None)
):
    """Returns active customers, new vs returning, repeat rate, avg CLV, churn rate, and at-risk revenue."""
    eng = manager.get_engine(company_id)
    return eng.get_customer_kpis(
        start_date=start_date,
        end_date=end_date,
        channel=channel,
        segment=segment
    )

@app.get("/api/companies/{company_id}/customers/segments")
@app.get("/api/customers/segments")
def get_customer_segments(company_id: str = "company-1"):
    """Returns customer breakdown by RFM Segment (Champions, Loyal, At Risk, etc.)."""
    eng = manager.get_engine(company_id)
    return eng.get_customer_segments()

@app.get("/api/companies/{company_id}/customers/churn")
@app.get("/api/customers/churn")
def get_churn_analytics(company_id: str = "company-1"):
    """Returns churn risk level distribution, ML model comparison (Random Forest vs Logistic Regression), and feature importances."""
    eng = manager.get_engine(company_id)
    return eng.get_churn_analytics()

@app.get("/api/companies/{company_id}/customers/clv")
@app.get("/api/customers/clv")
def get_clv_distribution(company_id: str = "company-1"):
    """Returns customer distribution across CLV spend tiers."""
    eng = manager.get_engine(company_id)
    return eng.get_clv_distribution()

@app.get("/api/companies/{company_id}/customers/retention")
@app.get("/api/customers/retention")
def get_customer_retention_trend(company_id: str = "company-1"):
    """Returns monthly customer retention rate trend over time."""
    eng = manager.get_engine(company_id)
    return eng.get_customer_retention_trend()

@app.get("/api/companies/{company_id}/customers")
@app.get("/api/customers")
def get_customers(
    company_id: str = "company-1",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    sort_by: str = Query("total_spent"),
    sort_order: str = Query("desc")
):
    """Returns paginated, searchable customer table with RFM scores and churn risk. Names and emails are PII-masked."""
    eng = manager.get_engine(company_id)
    return eng.get_customers_table(
        page=page,
        page_size=page_size,
        search=search,
        segment=segment,
        risk_level=risk_level,
        sort_by=sort_by,
        sort_order=sort_order
    )

# ==========================================
# 4. COMPANY-AWARE PRODUCT INTELLIGENCE
# ==========================================
@app.get("/api/companies/{company_id}/products/kpis")
@app.get("/api/products/kpis")
def get_product_kpis(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None)
):
    """Returns catalog metrics: active SKUs, units sold, revenue, profit, avg margin, return rate, best sellers."""
    eng = manager.get_engine(company_id)
    return eng.get_product_kpis(
        start_date=start_date,
        end_date=end_date,
        category=category,
        brand=brand
    )

@app.get("/api/companies/{company_id}/products/performance")
@app.get("/api/products/performance")
def get_product_performance(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None)
):
    """Returns 2x2 Boston Matrix classification (Stars, Volume Drivers, High-Margin Gems, Underperformers) and scatter data."""
    eng = manager.get_engine(company_id)
    return eng.get_product_performance(
        start_date=start_date,
        end_date=end_date,
        category=category,
        brand=brand
    )

@app.get("/api/companies/{company_id}/products")
@app.get("/api/products")
def get_products(
    company_id: str = "company-1",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    sort_by: str = Query("revenue"),
    sort_order: str = Query("desc")
):
    """Returns paginated product catalog with units sold, revenue, net profit, margin %, return rates, and stock quantity."""
    eng = manager.get_engine(company_id)
    return eng.get_products_table(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        brand=brand,
        sort_by=sort_by,
        sort_order=sort_order
    )

# ==========================================
# 5. COMPANY-AWARE ARIMA FORECASTING
# ==========================================
@app.get("/api/companies/{company_id}/forecast")
@app.get("/api/forecast")
def get_forecast(
    company_id: str = "company-1",
    horizon: int = Query(6, ge=3, le=12)
):
    """Returns historical revenue + ARIMA forecasted revenue with 95% confidence intervals and model comparisons."""
    eng = manager.get_engine(company_id)
    return eng.get_forecast(horizon=horizon)

# ==========================================
# 6. COMPANY-AWARE COHORT RETENTION ANALYSIS
# ==========================================
@app.get("/api/companies/{company_id}/cohorts")
@app.get("/api/cohorts")
def get_cohorts(company_id: str = "company-1"):
    """Returns first-purchase cohort retention matrix heatmap for Month 0 through Month 11."""
    eng = manager.get_engine(company_id)
    return eng.get_cohort_analysis()

# ==========================================
# 7. COMPANY-AWARE MARKETING & ACQUISITION ANALYTICS
# ==========================================
@app.get("/api/companies/{company_id}/marketing")
@app.get("/api/marketing")
def get_marketing(company_id: str = "company-1"):
    """Returns marketing spend, revenue, CAC, ROAS, conversion rate, channel comparison, and campaign performance."""
    eng = manager.get_engine(company_id)
    return eng.get_marketing_analytics()

# ==========================================
# 8. COMPANY-AWARE BUSINESS INSIGHTS ENGINE
# ==========================================
@app.get("/api/companies/{company_id}/insights")
@app.get("/api/insights")
def get_insights(
    company_id: str = "company-1",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None)
):
    """Generates automated, rule-based business insights and action recommendations from company live filtered metrics."""
    eng = manager.get_engine(company_id)
    return eng.get_business_insights(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
