import pytest
from fastapi.testclient import TestClient
from backend.main import app
import os

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_filters():
    response = client.get("/api/filters")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "regions" in data
    assert "channels" in data
    assert "segments" in data
    assert len(data["categories"]) > 0

def test_get_kpis():
    response = client.get("/api/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_profit" in data
    assert "total_orders" in data
    assert "profit_margin" in data
    assert "revenue_growth" in data
    assert "prev_revenue" in data
    assert data["total_revenue"] > 0

def test_get_kpis_filtered():
    response = client.get("/api/kpis?category=Electronics&region=CA")
    assert response.status_code == 200
    data = response.json()
    assert data["total_revenue"] > 0

def test_get_revenue_trend():
    response = client.get("/api/revenue/trend")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "revenue" in data[0]
    assert "month" in data[0]

def test_get_revenue_by_category():
    response = client.get("/api/revenue/by-category")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "category" in data[0]
    assert "margin" in data[0]

def test_get_revenue_by_region():
    response = client.get("/api/revenue/by-region")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "region" in data[0]

def test_get_top_products():
    response = client.get("/api/revenue/top-products?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5

def test_get_customer_kpis():
    response = client.get("/api/customers/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "repeat_purchase_rate" in data
    assert "revenue_at_risk" in data

def test_get_customer_segments():
    response = client.get("/api/customers/segments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "segment" in data[0]

def test_get_churn_analytics():
    response = client.get("/api/customers/churn")
    assert response.status_code == 200
    data = response.json()
    assert "distribution" in data
    assert "models" in data
    assert "feature_importance" in data

def test_get_customers_table():
    response = client.get("/api/customers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "customers" in data
    assert len(data["customers"]) == 10
    assert data["total_records"] > 0

def test_get_product_kpis():
    response = client.get("/api/products/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data
    assert "avg_margin" in data
    assert "best_selling_product" in data

def test_get_product_performance():
    response = client.get("/api/products/performance")
    assert response.status_code == 200
    data = response.json()
    assert "category_performance" in data
    assert "top_by_revenue" in data
    assert "matrix" in data

def test_get_products_table():
    response = client.get("/api/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert len(data["products"]) == 10

def test_get_forecast():
    response = client.get("/api/forecast?horizon=6")
    assert response.status_code == 200
    data = response.json()
    assert "historical" in data
    assert "forecast" in data
    assert "models" in data
    assert len(data["forecast"]) == 6

def test_get_cohorts():
    response = client.get("/api/cohorts")
    assert response.status_code == 200
    data = response.json()
    assert "cohorts" in data
    assert len(data["cohorts"]) > 0

def test_get_marketing():
    response = client.get("/api/marketing")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "channels" in data
    assert "campaigns" in data

def test_get_insights():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    assert "finding" in data[0]
    assert "recommendation" in data[0]
