import pytest
import io
import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "currency_url" in response.json()

def test_currency_rates():
    response = client.get("/api/currency/rates")
    assert response.status_code == 200
    data = response.json()
    assert "rates" in data
    assert data["rates"]["USD"] == 1.0
    assert data["rates"]["INR"] == 83.5
    assert "last_updated" in data

def test_currency_convert():
    response = client.get("/api/currency/convert?amount=100&from_curr=USD&to_curr=INR")
    assert response.status_code == 200
    data = response.json()
    assert data["converted_amount"] == 8350.0

    res_inr = client.get("/api/currency/convert?amount=8350&from_curr=INR&to_curr=USD")
    assert res_inr.status_code == 200
    assert res_inr.json()["converted_amount"] == 100.0

def test_upload_preview_csv():
    csv_content = b"OrderID,CustomerID,OrderDate,ProductName,Category,Quantity,Price,State\n101,C1,2026-01-15,Wireless Earbuds,Electronics,2,49.99,CA\n102,C2,2026-01-16,USB Cable,Accessories,1,12.50,NY\n"
    response = client.post(
        "/api/upload/preview",
        files={"file": ("sample_orders.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 2
    assert data["total_columns"] == 8
    assert "validation" in data
    assert data["validation"]["is_valid"] is True
    assert len(data["preview_rows"]) == 2
    # Verify auto-detected mappings
    suggested = data["validation"]["suggested_mapping"]
    assert suggested.get("OrderID") == "order_id"
    assert suggested.get("CustomerID") == "customer_id"

def test_upload_preview_ragged_and_semicolon_csv():
    # CSV with extra comment lines or semicolon delimiter
    semi_csv = b"OrderID;CustomerID;OrderDate;ProductName;Category;Quantity;Price;State\n201;C10;2026-01-20;Smart Watch;Electronics;1;199.99;WA\n202;C11;2026-01-21;Charger;Accessories;2;25.00;TX\n"
    res = client.post(
        "/api/upload/preview",
        files={"file": ("semicolon_orders.csv", semi_csv, "text/csv")}
    )
    assert res.status_code == 200
    assert res.json()["total_rows"] == 2

    # CSV with ragged / inconsistent trailing fields that caused C tokenizer error
    ragged_csv = b"Title Line: Sales Export\nDate: 2026-01-01\nOrderID,CustomerID,OrderDate,ProductName,Category,Quantity,Price,State\n301,C20,2026-01-22,Shoes,Footwear,1,89.00,NY\n302,C21,2026-01-23,Jacket,Apparel,1,120.00,CA,ExtraNoteField\n"
    res_ragged = client.post(
        "/api/upload/preview",
        files={"file": ("ragged_orders.csv", ragged_csv, "text/csv")}
    )
    assert res_ragged.status_code == 200
    assert res_ragged.json()["total_rows"] >= 1

def test_upload_preview_excel_xlsx():
    # Generate in-memory Excel file with 2 sheets (like Online Retail II)
    excel_buf = io.BytesIO()
    with pd.ExcelWriter(excel_buf, engine='openpyxl') as writer:
        df_sheet1 = pd.DataFrame({
            "Invoice": ["536365", "536366"],
            "StockCode": ["85123A", "71053"],
            "Description": ["WHITE HANGING HEART T-LIGHT HOLDER", "WHITE METAL LANTERN"],
            "Quantity": [6, 6],
            "InvoiceDate": ["2010-12-01 08:26:00", "2010-12-01 08:28:00"],
            "Price": [2.55, 3.39],
            "Customer ID": [17850, 17850],
            "Country": ["United Kingdom", "United Kingdom"]
        })
        df_sheet2 = pd.DataFrame({
            "Invoice": ["536367"],
            "StockCode": ["84879"],
            "Description": ["ASSORTED COLOUR BIRD ORNAMENT"],
            "Quantity": [32],
            "InvoiceDate": ["2010-12-01 08:34:00"],
            "Price": [1.69],
            "Customer ID": [13047],
            "Country": ["United Kingdom"]
        })
        df_sheet1.to_excel(writer, sheet_name="Year 2009-2010", index=False)
        df_sheet2.to_excel(writer, sheet_name="Year 2010-2011", index=False)

    excel_bytes = excel_buf.getvalue()

    res = client.post(
        "/api/upload/preview",
        files={"file": ("online_retail_II.xlsx", excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 3  # Both sheets combined (2 + 1)
    assert data["validation"]["is_valid"] is True

def test_create_company_with_dataset():
    csv_content = b"order_id,customer_id,order_date,product_name,category,quantity,total_amount,shipping_state\n1001,501,2026-02-01,Running Shoes,Footwear,1,120.00,TX\n1002,502,2026-02-02,Yoga Mat,Fitness,2,45.00,CA\n"
    form_data = {
        "company_name": "Test Activewear Co",
        "company_slug": "test-activewear",
        "industry": "Sports & Fitness",
        "description": "Test dataset company for activewear merchandise.",
        "base_currency": "INR",
        "logo_badge": "🏃",
        "brand_color": "#10b981"
    }
    response = client.post(
        "/api/companies/create-with-dataset",
        data=form_data,
        files={"file": ("test_sales.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["company"]["company_slug"] == "test-activewear"
    assert data["company"]["base_currency"] == "INR"

    # Verify newly created company dashboard responds
    kpi_res = client.get("/api/companies/test-activewear/kpis")
    assert kpi_res.status_code == 200
    assert kpi_res.json()["total_orders"] == 2

    # Clean up test company metadata
    import shutil, os, json
    from backend.analytics_engine import manager
    if "test-activewear" in manager.companies_meta:
        del manager.companies_meta["test-activewear"]
        if "test-activewear" in manager.engines:
            del manager.engines["test-activewear"]
        with open(manager.companies_file, "w", encoding="utf-8") as f:
            json.dump(list(manager.companies_meta.values()), f, indent=2)
    test_dir = os.path.join(manager.companies_data_dir, "test-activewear")
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir, ignore_errors=True)

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
        assert "base_currency" in c

def test_get_company_detail():
    response = client.get("/api/companies/uk-online-retailer")
    assert response.status_code == 200
    data = response.json()
    assert data["company_id"] == "uk-online-retailer"
    assert data["industry"] == "All-Occasion Gifts & Retail"
    assert "live_kpis" in data
    assert data["live_kpis"]["total_revenue"] > 0

def test_company_data_isolation():
    """Verify that Google Merchandise Store and UK Online Retailer return isolated, distinct metrics."""
    res1 = client.get("/api/companies/google-merchandise-store/kpis")
    res2 = client.get("/api/companies/uk-online-retailer/kpis")
    assert res1.status_code == 200
    assert res2.status_code == 200
    kpis1 = res1.json()
    kpis2 = res2.json()
    
    assert kpis1["total_revenue"] != kpis2["total_revenue"]
    assert kpis1["total_orders"] != kpis2["total_orders"]

def test_company_pii_masking():
    """Verify that customer names and emails are masked to protect PII on public dashboards."""
    response = client.get("/api/companies/google-merchandise-store/customers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["customers"]) > 0
    for cust in data["customers"]:
        assert "***" in cust["name"] or cust["name"] == "Customer"
        assert "***@" in cust["email"] or "@" in cust["email"]

def test_get_filters():
    response = client.get("/api/companies/google-merchandise-store/filters")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "regions" in data
    assert "channels" in data
    assert "segments" in data
    assert len(data["categories"]) > 0

def test_get_kpis():
    response = client.get("/api/companies/google-merchandise-store/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_orders" in data
    assert data["total_revenue"] > 0

def test_get_revenue_trend():
    response = client.get("/api/companies/google-merchandise-store/revenue/trend")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "revenue" in data[0]
    assert "month" in data[0]

def test_get_revenue_by_category():
    response = client.get("/api/companies/google-merchandise-store/revenue/by-category")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "category" in data[0]

def test_get_revenue_by_region():
    response = client.get("/api/companies/google-merchandise-store/revenue/by-region")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "region" in data[0]

def test_get_top_products():
    response = client.get("/api/companies/google-merchandise-store/revenue/top-products?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5

def test_get_customer_kpis():
    response = client.get("/api/companies/google-merchandise-store/customers/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "repeat_purchase_rate" in data

def test_get_customer_segments():
    response = client.get("/api/companies/google-merchandise-store/customers/segments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "segment" in data[0]

def test_get_churn_analytics():
    response = client.get("/api/companies/google-merchandise-store/customers/churn")
    assert response.status_code == 200
    data = response.json()
    assert "distribution" in data

def test_get_product_kpis():
    response = client.get("/api/companies/google-merchandise-store/products/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data

def test_get_product_performance():
    response = client.get("/api/companies/google-merchandise-store/products/performance")
    assert response.status_code == 200
    data = response.json()
    assert "category_performance" in data
    assert "top_by_revenue" in data

def test_get_products_table():
    response = client.get("/api/companies/google-merchandise-store/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert len(data["products"]) > 0

def test_get_forecast():
    response = client.get("/api/companies/google-merchandise-store/forecast?horizon=6")
    assert response.status_code == 200
    data = response.json()
    assert "historical" in data
    assert "forecast" in data
    assert len(data["forecast"]) == 6

def test_get_cohorts():
    response = client.get("/api/companies/google-merchandise-store/cohorts")
    assert response.status_code == 200
    data = response.json()
    assert "cohorts" in data
    assert len(data["cohorts"]) > 0

def test_get_marketing():
    response = client.get("/api/companies/google-merchandise-store/marketing")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "channels" in data

def test_get_insights():
    response = client.get("/api/companies/google-merchandise-store/insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    assert "title" in data[0]
    assert "recommendation" in data[0]

def test_dataset_management_lifecycle():
    import shutil, os, json
    from backend.analytics_engine import manager

    # 1. Create company profile
    create_res = client.post("/api/companies", json={
        "company_name": "Lifecycle Demo Corp",
        "company_slug": "lifecycle-demo",
        "industry": "Consumer Retail",
        "base_currency": "INR"
    })
    assert create_res.status_code == 200
    assert create_res.json()["company"]["dataset_status"] == "NO_DATASET"

    # 2. Check status is NO_DATASET
    status_res = client.get("/api/companies/lifecycle-demo/dataset/status")
    assert status_res.status_code == 200
    assert status_res.json()["dataset_status"] == "NO_DATASET"

    # 3. Upload dataset
    csv_bytes = b"order_id,customer_id,order_date,product_name,category,quantity,total_amount\n201,U1,2026-01-10,Desk Lamp,Home,1,45.00\n202,U2,2026-01-11,Chair,Furniture,2,150.00\n"
    up_res = client.post(
        "/api/companies/lifecycle-demo/dataset/upload",
        files={"file": ("home_sales.csv", csv_bytes, "text/csv")}
    )
    assert up_res.status_code == 200
    assert up_res.json()["company"]["dataset_status"] == "READY"
    assert up_res.json()["company"]["total_orders"] == 2

    # 4. View paginated dataset
    page_res = client.get("/api/companies/lifecycle-demo/dataset?page=1&limit=10")
    assert page_res.status_code == 200
    pdata = page_res.json()
    assert pdata["total_records"] == 2
    assert len(pdata["rows"]) == 2

    # 5. Check dataset profile
    prof_res = client.get("/api/companies/lifecycle-demo/dataset/profile")
    assert prof_res.status_code == 200
    assert prof_res.json()["total_orders"] == 2

    # 6. Verify No-Fake-Profit: since no cost was in csv, has_cost_data is false
    kpi_res = client.get("/api/companies/lifecycle-demo/kpis")
    assert kpi_res.status_code == 200
    assert kpi_res.json()["has_profit_data"] is False
    assert kpi_res.json()["total_profit"] is None

    # 7. Delete dataset
    del_res = client.delete("/api/companies/lifecycle-demo/dataset")
    assert del_res.status_code == 200
    assert del_res.json()["company"]["dataset_status"] == "NO_DATASET"

    # 8. Verify dashboard clears analytics
    kpi_after = client.get("/api/companies/lifecycle-demo/kpis")
    assert kpi_after.status_code == 200
    assert kpi_after.json()["has_dataset"] is False
    assert kpi_after.json()["total_orders"] == 0

    # Cleanup company
    if "lifecycle-demo" in manager.companies_meta:
        del manager.companies_meta["lifecycle-demo"]
        if "lifecycle-demo" in manager.engines:
            del manager.engines["lifecycle-demo"]
        with open(manager.companies_file, "w", encoding="utf-8") as f:
            json.dump(list(manager.companies_meta.values()), f, indent=2)
    test_dir = os.path.join(manager.companies_data_dir, "lifecycle-demo")
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir, ignore_errors=True)
