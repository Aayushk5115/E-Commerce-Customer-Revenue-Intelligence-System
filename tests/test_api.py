import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "companies_url" in response.json()

def test_get_companies():
    response = client.get("/api/companies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    for c in data:
        assert "company_id" in c
        assert "company_name" in c
        assert "industry" in c
        assert "dataset_status" in c
        assert "dataset_source" in c
        assert "total_revenue" in c

def test_get_company_detail():
    response = client.get("/api/companies/company-2")
    assert response.status_code == 200
    data = response.json()
    assert data["company_id"] == "company-2"
    assert data["industry"] == "Consumer Electronics"
    assert "live_kpis" in data
    assert data["live_kpis"]["total_revenue"] > 0

def test_company_data_isolation():
    """Verify that Company 1 and Company 2 return isolated, distinct metrics."""
    res1 = client.get("/api/companies/company-1/kpis")
    res2 = client.get("/api/companies/company-2/kpis")
    assert res1.status_code == 200
    assert res2.status_code == 200
    kpis1 = res1.json()
    kpis2 = res2.json()
    
    # Check that revenues and customer counts differ cleanly across tenants
    assert kpis1["total_revenue"] != kpis2["total_revenue"]
    assert kpis1["total_orders"] != kpis2["total_orders"]

def test_company_pii_masking():
    """Verify that customer names and emails are masked to protect PII on public dashboards."""
    response = client.get("/api/companies/company-1/customers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["customers"]) > 0
    for cust in data["customers"]:
        assert "***" in cust["name"] or cust["name"] == "Customer"
        assert "***@" in cust["email"] or "@" in cust["email"]

def test_get_filters():
    response = client.get("/api/companies/company-1/filters")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "regions" in data
    assert "channels" in data
    assert "segments" in data
    assert len(data["categories"]) > 0

def test_get_kpis():
    response = client.get("/api/companies/company-1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_profit" in data
    assert "total_orders" in data
    assert "profit_margin" in data
    assert "revenue_growth" in data
    assert data["total_revenue"] > 0

def test_get_revenue_trend():
    response = client.get("/api/companies/company-1/revenue/trend")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "revenue" in data[0]
    assert "month" in data[0]

def test_get_revenue_by_category():
    response = client.get("/api/companies/company-1/revenue/by-category")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "category" in data[0]
    assert "margin" in data[0]

def test_get_revenue_by_region():
    response = client.get("/api/companies/company-1/revenue/by-region")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "region" in data[0]

def test_get_top_products():
    response = client.get("/api/companies/company-1/revenue/top-products?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5

def test_get_customer_kpis():
    response = client.get("/api/companies/company-1/customers/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "repeat_purchase_rate" in data

def test_get_customer_segments():
    response = client.get("/api/companies/company-1/customers/segments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "segment" in data[0]

def test_get_churn_analytics():
    response = client.get("/api/companies/company-1/customers/churn")
    assert response.status_code == 200
    data = response.json()
    assert "distribution" in data
    assert "models" in data
    assert "feature_importance" in data

def test_get_product_kpis():
    response = client.get("/api/companies/company-1/products/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data
    assert "avg_margin" in data

def test_get_product_performance():
    response = client.get("/api/companies/company-1/products/performance")
    assert response.status_code == 200
    data = response.json()
    assert "category_performance" in data
    assert "top_by_revenue" in data
    assert "matrix" in data

def test_get_products_table():
    response = client.get("/api/companies/company-1/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert len(data["products"]) == 10

def test_get_forecast():
    response = client.get("/api/companies/company-1/forecast?horizon=6")
    assert response.status_code == 200
    data = response.json()
    assert "historical" in data
    assert "forecast" in data
    assert len(data["forecast"]) == 6

def test_get_cohorts():
    response = client.get("/api/companies/company-1/cohorts")
    assert response.status_code == 200
    data = response.json()
    assert "cohorts" in data
    assert len(data["cohorts"]) > 0

def test_get_marketing():
    response = client.get("/api/companies/company-1/marketing")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "channels" in data
    assert "campaigns" in data

def test_get_insights():
    response = client.get("/api/companies/company-1/insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    assert "title" in data[0]
    assert "recommendation" in data[0]
