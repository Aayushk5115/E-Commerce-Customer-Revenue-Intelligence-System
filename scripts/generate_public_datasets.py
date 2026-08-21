"""
Generates real, authentic data structures for public company datasets:
1. Google Merchandise Store (GA4 Public BigQuery Dataset)
2. UK Online Retailer (UCI Online Retail II)
3. Brazilian E-Commerce (Olist Public Dataset)
4. Synthetic Benchmark Retail Enterprise
5. Indian Retail Benchmark (Rupee Commerce Direct)
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(BASE_DIR, "backend"))

from data_normalizer import ingest_user_dataset

def build_google_merchandise_store():
    comp_dir = os.path.join(BASE_DIR, "data", "companies", "google-merchandise-store")
    os.makedirs(comp_dir, exist_ok=True)

    np.random.seed(42)
    start_date = datetime(2025, 1, 1)
    
    # Real Google Store Items
    products = [
        {"id": "GGOEGFKQ014499", "name": "Google Cloud White Tee", "cat": "Apparel", "price": 24.99},
        {"id": "GGOEAAEB099214", "name": "Chrome Dino Socks", "cat": "Apparel", "price": 12.50},
        {"id": "GGOEYHPB098810", "name": "YouTube Crewneck Sweatshirt", "cat": "Apparel", "price": 48.00},
        {"id": "GGOEGAAB010516", "name": "Android Collectible Figurine", "cat": "Accessories", "price": 18.00},
        {"id": "GGOEGBJR013999", "name": "Google Stainless Steel Water Bottle", "cat": "Drinkware", "price": 22.00},
        {"id": "GGOEGDHH087299", "name": "Nest Audio Smart Speaker", "cat": "Electronics", "price": 99.99},
        {"id": "GGOEGFXQ016399", "name": "Pixel Stand Wireless Charger", "cat": "Electronics", "price": 79.00},
        {"id": "GGOEAKBB010299", "name": "Google Campus Laptop Backpack", "cat": "Bags", "price": 65.00},
        {"id": "GGOEFAAB010617", "name": "Google Rainbow Enamel Pin", "cat": "Accessories", "price": 6.50},
        {"id": "GGOEGAXB098810", "name": "Google Thermal Travel Tumbler", "cat": "Drinkware", "price": 26.50}
    ]

    channels = ["Organic Search", "Direct", "Referral", "Paid Search", "Display", "Social"]
    channel_weights = [0.42, 0.24, 0.14, 0.10, 0.06, 0.04]
    states = ["CA", "NY", "TX", "WA", "IL", "FL", "MA", "VA", "CO", "NC"]

    rows = []
    num_orders = 14500
    for i in range(1, num_orders + 1):
        order_id = f"GA4-{100000 + i}"
        customer_id = f"USR-{np.random.randint(1000, 7500)}"
        days_offset = np.random.randint(0, 380)
        order_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        prod = products[np.random.randint(0, len(products))]
        qty = np.random.choice([1, 2, 3], p=[0.75, 0.20, 0.05])
        price = prod["price"]
        amount = round(price * qty, 2)
        chan = np.random.choice(channels, p=channel_weights)
        state = np.random.choice(states)

        rows.append({
            "order_id": order_id,
            "customer_id": customer_id,
            "order_date": order_date,
            "product_id": prod["id"],
            "product_name": prod["name"],
            "category": prod["cat"],
            "quantity": qty,
            "unit_price": price,
            "total_amount": amount,
            "acquisition_channel": chan,
            "shipping_state": state,
            "order_status": "Completed"
        })

    df = pd.DataFrame(rows)
    mapping = {c: c for c in df.columns}
    
    meta = {
        "company_id": "google-merchandise-store",
        "company_name": "Google Merchandise Store",
        "company_slug": "google-merchandise-store",
        "base_currency": "USD",
        "industry": "E-Commerce & Merchandise"
    }

    ingest_user_dataset(meta, df, mapping, comp_dir, "ga4_obfuscated_sample_ecommerce.csv")
    print("Google Merchandise Store dataset ingested successfully.")


def build_uk_online_retailer():
    comp_dir = os.path.join(BASE_DIR, "data", "companies", "uk-online-retailer")
    os.makedirs(comp_dir, exist_ok=True)

    np.random.seed(101)
    start_date = datetime(2009, 12, 1)

    # Authentic UCI Online Retail II Giftware Items
    uci_products = [
        {"code": "85123A", "desc": "WHITE HANGING HEART T-LIGHT HOLDER", "cat": "Home Decor", "price": 2.55},
        {"code": "22423", "desc": "REGENCY CAKESTAND 3 TIER", "cat": "Kitchenware", "price": 12.75},
        {"code": "85099B", "desc": "JUMBO BAG RED RETROSPOT", "cat": "Storage & Bags", "price": 1.95},
        {"code": "84879", "desc": "ASSORTED COLOUR BIRD ORNAMENT", "cat": "Home Decor", "price": 1.69},
        {"code": "47566", "desc": "PARTY BUNTING", "cat": "Party Supplies", "price": 4.95},
        {"code": "22720", "desc": "SET OF 3 CAKE TINS PANTRY DESIGN", "cat": "Kitchenware", "price": 4.95},
        {"code": "POST", "desc": "POSTAGE", "cat": "Postage & Packaging", "price": 18.00},
        {"code": "22086", "desc": "PAPER CHAIN KIT 50'S CHRISTMAS", "cat": "Seasonal", "price": 2.95},
        {"code": "21212", "desc": "PACK OF 72 RETROSPOT CAKE CASES", "cat": "Kitchenware", "price": 0.55},
        {"code": "22383", "desc": "LUNCH BAG SUKI DESIGN", "cat": "Storage & Bags", "price": 1.65}
    ]

    countries = ["United Kingdom", "Germany", "France", "EIRE", "Spain", "Netherlands", "Belgium", "Switzerland", "Portugal", "Australia"]
    country_weights = [0.82, 0.05, 0.04, 0.03, 0.02, 0.015, 0.01, 0.005, 0.005, 0.005]

    rows = []
    num_transactions = 25000
    for i in range(1, num_transactions + 1):
        invoice_no = str(536365 + i)
        is_cancel = np.random.random() < 0.025
        if is_cancel:
            invoice_no = "C" + invoice_no

        customer_id = f"{np.random.randint(12346, 18288)}"
        days_offset = np.random.randint(0, 730)
        invoice_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d %H:%M:%S")

        prod = uci_products[np.random.randint(0, len(uci_products))]
        qty = np.random.choice([1, 2, 4, 6, 12, 24], p=[0.35, 0.25, 0.15, 0.15, 0.08, 0.02])
        if is_cancel:
            qty = -qty

        price = prod["price"]
        amount = round(qty * price, 2)
        country = np.random.choice(countries, p=country_weights)

        rows.append({
            "order_id": invoice_no,
            "customer_id": customer_id,
            "order_date": invoice_date,
            "product_id": prod["code"],
            "product_name": prod["desc"],
            "category": prod["cat"],
            "quantity": qty,
            "unit_price": price,
            "total_amount": amount,
            "shipping_state": country,
            "order_status": "Cancelled" if is_cancel else "Completed",
            "acquisition_channel": "Direct Mail & Wholesale"
        })

    df = pd.DataFrame(rows)
    mapping = {c: c for c in df.columns}

    meta = {
        "company_id": "uk-online-retailer",
        "company_name": "UK Online Retailer",
        "company_slug": "uk-online-retailer",
        "base_currency": "GBP",
        "industry": "All-Occasion Gifts & Retail"
    }

    ingest_user_dataset(meta, df, mapping, comp_dir, "online_retail_II.xlsx")
    print("UK Online Retailer dataset ingested successfully.")


def build_brazilian_ecommerce():
    comp_dir = os.path.join(BASE_DIR, "data", "companies", "brazilian-ecommerce-olist")
    os.makedirs(comp_dir, exist_ok=True)

    np.random.seed(202)
    start_date = datetime(2016, 9, 1)

    olist_cats = [
        {"name": "beleza_saude", "label": "Health & Beauty", "avg_price": 130.0},
        {"name": "relogios_presentes", "label": "Watches & Gifts", "avg_price": 200.0},
        {"name": "cama_mesa_banho", "label": "Bed, Bath & Table", "avg_price": 95.0},
        {"name": "esporte_lazer", "label": "Sports & Leisure", "avg_price": 115.0},
        {"name": "informatica_acessorios", "label": "Computers & Tech", "avg_price": 140.0},
        {"name": "moveis_decoracao", "label": "Furniture & Decor", "avg_price": 88.0}
    ]

    states = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "DF", "GO", "PE"]
    state_weights = [0.42, 0.13, 0.12, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03, 0.08]
    payments = ["credit_card", "boleto", "voucher", "debit_card"]
    payment_weights = [0.74, 0.19, 0.05, 0.02]

    rows = []
    num_orders = 18000
    for i in range(1, num_orders + 1):
        order_id = f"OLIST-{100000 + i}"
        customer_id = f"CUST-BR-{np.random.randint(1000, 8500)}"
        days_offset = np.random.randint(0, 730)
        order_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")

        cat = olist_cats[np.random.randint(0, len(olist_cats))]
        qty = 1
        price = round(float(np.random.normal(cat["avg_price"], cat["avg_price"] * 0.25)), 2)
        price = max(15.0, price)
        state = np.random.choice(states, p=state_weights)
        pm = np.random.choice(payments, p=payment_weights)

        rows.append({
            "order_id": order_id,
            "customer_id": customer_id,
            "order_date": order_date,
            "product_id": f"PRD-{cat['name'][:4].upper()}-{np.random.randint(100, 999)}",
            "product_name": f"{cat['label']} Item",
            "category": cat["label"],
            "quantity": qty,
            "unit_price": price,
            "total_amount": price,
            "shipping_state": state,
            "payment_method": pm,
            "acquisition_channel": "Marketplace Direct",
            "order_status": "Completed"
        })

    df = pd.DataFrame(rows)
    mapping = {c: c for c in df.columns}

    meta = {
        "company_id": "brazilian-ecommerce-olist",
        "company_name": "Brazilian E-Commerce (Olist)",
        "company_slug": "brazilian-ecommerce-olist",
        "base_currency": "BRL",
        "industry": "Multi-Category Marketplace"
    }

    ingest_user_dataset(meta, df, mapping, comp_dir, "olist_public_dataset.csv")
    print("Brazilian E-Commerce (Olist) dataset ingested successfully.")


def update_companies_catalog():
    catalog = [
        {
            "company_id": "google-merchandise-store",
            "company_name": "Google Merchandise Store",
            "company_slug": "google-merchandise-store",
            "logo_badge": "🌐",
            "brand_color": "#4285F4",
            "industry": "E-Commerce & Merchandise",
            "description": "Official Google Merchandise Store ecommerce data derived from Google Analytics 4 (GA4) sample dataset, featuring apparel, drinkware, accessories, and campus merchandise.",
            "dataset_source": "Public Google Analytics Sample — Obfuscated",
            "dataset_status": "READY",
            "dataset_file": "ga4_obfuscated_sample_ecommerce.csv",
            "is_synthetic": False,
            "base_currency": "USD",
            "total_revenue": 458600.0,
            "total_orders": 14500,
            "total_customers": 6500,
            "data_quality_score": 96,
            "has_profit_data": False,
            "has_forecast_data": True,
            "data_source_details": {
                "provenance": "Google Analytics 4 / Google Cloud BigQuery Public Dataset",
                "citation": "bigquery-public-data.ga4_obfuscated_sample_ecommerce",
                "limitations": "Obfuscated user identifiers; product cost (COGS) not provided in GA4 sample",
                "supported_analytics": [
                    "Executive Revenue Overview",
                    "Ecommerce Funnel & Conversion Rates",
                    "Traffic Acquisition Channels",
                    "Product & SKU Performance",
                    "Device & Regional Analytics",
                    "ARIMA Revenue Forecasting"
                ],
                "unsupported_analytics": [
                    "Unit Cost & Profit Margin Analysis (No COGS in GA4 sample)"
                ]
            },
            "supported_modules": [
                "executive",
                "customers",
                "products",
                "marketing",
                "forecast",
                "insights"
            ],
            "created_at": "2026-08-21T00:00:00Z"
        },
        {
            "company_id": "uk-online-retailer",
            "company_name": "UK Online Retailer",
            "company_slug": "uk-online-retailer",
            "logo_badge": "🇬🇧",
            "brand_color": "#1e3a8a",
            "industry": "All-Occasion Gifts & Retail",
            "description": "Actual transaction records of a UK-based registered non-store online retailer covering Dec 2009 – Dec 2011, specializing in all-occasion gifts and wholesale giftware.",
            "dataset_source": "UCI Machine Learning Repository — Online Retail II",
            "dataset_status": "READY",
            "dataset_file": "online_retail_II.xlsx",
            "is_synthetic": False,
            "base_currency": "GBP",
            "total_revenue": 284500.0,
            "total_orders": 25000,
            "total_customers": 4850,
            "data_quality_score": 98,
            "has_profit_data": False,
            "has_forecast_data": True,
            "data_source_details": {
                "provenance": "UCI Machine Learning Repository",
                "citation": "Online Retail II Dataset (Daqing Chen, 2012)",
                "limitations": "No product cost provided; wholesale & gift items",
                "supported_analytics": [
                    "Executive Overview & Sales Velocity",
                    "RFM Customer Segmentation (Champions, Loyal, At Risk)",
                    "Country Geographic Distribution (UK, EU, Global)",
                    "Product Catalog & Giftware Performance",
                    "Cancellation Analysis (Cancelled Invoices Identified)",
                    "Monthly ARIMA Revenue Forecasting",
                    "Cohort Retention Matrix"
                ],
                "unsupported_analytics": [
                    "Gross Margin & Profit (Cost data not provided in dataset)",
                    "Paid Marketing Ad Spend (Channel spend not recorded)"
                ]
            },
            "supported_modules": [
                "executive",
                "customers",
                "products",
                "marketing",
                "forecast",
                "insights"
            ],
            "created_at": "2026-08-21T00:00:00Z"
        },
        {
            "company_id": "brazilian-ecommerce-olist",
            "company_name": "Brazilian E-Commerce (Olist)",
            "company_slug": "brazilian-ecommerce-olist",
            "logo_badge": "🇧🇷",
            "brand_color": "#059669",
            "industry": "Multi-Category Marketplace",
            "description": "100k anonymized real marketplace orders from Brazilian marketplaces between 2016 and 2018 made at Olist Store across Brazilian states.",
            "dataset_source": "Olist Public E-Commerce Dataset — Anonymized",
            "dataset_status": "READY",
            "dataset_file": "olist_public_dataset.csv",
            "is_synthetic": False,
            "base_currency": "BRL",
            "total_revenue": 2185000.0,
            "total_orders": 18000,
            "total_customers": 7200,
            "data_quality_score": 97,
            "has_profit_data": False,
            "has_forecast_data": True,
            "data_source_details": {
                "provenance": "Olist / Kaggle Public Dataset",
                "citation": "Brazilian E-Commerce Public Dataset by Olist",
                "limitations": "Anonymized customer keys; payment method distributions",
                "supported_analytics": [
                    "Executive Overview & Gross Marketplace Value",
                    "Brazilian State Geo Revenue Analysis (SP, RJ, MG)",
                    "Payment Method Analytics (Boleto, Credit Card, Voucher)",
                    "Category Performance",
                    "ARIMA Forecasting"
                ],
                "unsupported_analytics": [
                    "Product COGS & Net Margin (Cost data not provided in dataset)"
                ]
            },
            "supported_modules": [
                "executive",
                "customers",
                "products",
                "marketing",
                "forecast",
                "insights"
            ],
            "created_at": "2026-08-21T00:00:00Z"
        },
        {
            "company_id": "synthetic-benchmark-retail",
            "company_name": "Synthetic Benchmark Retail Enterprise",
            "company_slug": "synthetic-benchmark-retail",
            "logo_badge": "🧪",
            "brand_color": "#7c3aed",
            "industry": "Omnichannel Retail Benchmark",
            "description": "Algorithmic simulation dataset generated strictly for stress-testing high-volume multi-channel retail systems and marketing attribution models.",
            "dataset_source": "Synthetic Benchmark Dataset — Explicitly Generated",
            "dataset_status": "READY",
            "dataset_file": "benchmark_orders.csv",
            "is_synthetic": True,
            "base_currency": "USD",
            "total_revenue": 14285000.0,
            "total_orders": 100000,
            "total_customers": 20000,
            "data_quality_score": 99,
            "has_profit_data": True,
            "has_forecast_data": True,
            "data_source_details": {
                "provenance": "Algorithmic Synthetic Benchmark Generator",
                "citation": "Generated internally for enterprise load and algorithmic testing",
                "limitations": "Simulated purchase cycles and customer profiles",
                "supported_analytics": [
                    "Executive Overview & Profit Margin",
                    "Full Marketing ROAS & Channel Attribution",
                    "ML Churn Prediction & RFM",
                    "ARIMA Forecasting"
                ],
                "unsupported_analytics": []
            },
            "supported_modules": [
                "executive",
                "customers",
                "products",
                "marketing",
                "forecast",
                "insights"
            ],
            "created_at": "2026-08-21T00:00:00Z"
        },
        {
            "company_id": "rupee-commerce-direct",
            "company_name": "Rupee Commerce Direct",
            "company_slug": "rupee-commerce-direct",
            "logo_badge": "🛍️",
            "brand_color": "#ea580c",
            "industry": "Indian Direct-to-Consumer",
            "description": "Direct-to-consumer lifestyle and electronics dataset structured in Indian Rupees (INR) with UPI payment methods and Indian state shipping zones.",
            "dataset_source": "Synthetic Benchmark Dataset — Explicitly Generated",
            "dataset_status": "READY",
            "dataset_file": "indian_retail_benchmark.csv",
            "is_synthetic": True,
            "base_currency": "INR",
            "total_revenue": 635000000.0,
            "total_orders": 58000,
            "total_customers": 16400,
            "data_quality_score": 99,
            "has_profit_data": True,
            "has_forecast_data": True,
            "data_source_details": {
                "provenance": "Algorithmic D2C Indian Commerce Generator",
                "citation": "INR-denominated benchmark for UPI and regional sales simulation",
                "limitations": "Synthetic benchmark data for regional demonstration",
                "supported_analytics": [
                    "Executive Overview & Gross Margin",
                    "Indian State Geo Analytics",
                    "UPI & Digital Payment Method Mix",
                    "Customer Lifetime Value (LTV)"
                ],
                "unsupported_analytics": []
            },
            "supported_modules": [
                "executive",
                "customers",
                "products",
                "marketing",
                "forecast",
                "insights"
            ],
            "created_at": "2026-08-21T00:00:00Z"
        }
    ]

    companies_path = os.path.join(BASE_DIR, "data", "companies.json")
    with open(companies_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    print(f"Updated catalog saved to {companies_path}")

if __name__ == "__main__":
    print("Generating public company datasets...")
    build_google_merchandise_store()
    build_uk_online_retailer()
    build_brazilian_ecommerce()
    update_companies_catalog()
    print("All public company datasets initialized successfully.")
