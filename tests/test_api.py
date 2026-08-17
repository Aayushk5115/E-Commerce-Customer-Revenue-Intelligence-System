import pytest
from fastapi.testclient import TestClient
from backend.main import app
import pandas as pd
import os

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to E-Commerce Intelligence API"}

def test_get_kpis():
    response = client.get("/api/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_profit" in data
    assert "total_orders" in data
    assert "profit_margin" in data

def test_get_forecast():
    response = client.get("/api/forecast")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_insights():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "finding" in data[0]
        assert "recommendation" in data[0]

def test_data_generation_output():
    # Verify that data files were generated
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
    assert os.path.exists(os.path.join(data_dir, 'customers.csv'))
    assert os.path.exists(os.path.join(data_dir, 'orders.csv'))
    
    # Verify basic data integrity in the synthetic data
    df = pd.read_csv(os.path.join(data_dir, 'customers.csv'))
    assert len(df) > 0
    assert 'customer_id' in df.columns
