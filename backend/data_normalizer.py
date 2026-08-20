import pandas as pd
import numpy as np
import re
from typing import Dict, Any, Optional, List

# Standard Schema Target Column Aliases
COLUMN_ALIASES: Dict[str, Dict[str, List[str]]] = {
    "orders": {
        "order_id": ["order_id", "OrderID", "order_number", "invoice_no", "trans_id", "id", "Order_Id"],
        "customer_id": ["customer_id", "CustomerID", "cust_id", "client_id", "user_id", "Customer_Id"],
        "order_date": ["order_date", "OrderDate", "timestamp", "date", "order_time", "created_at", "Order_Date"],
        "order_status": ["order_status", "OrderStatus", "status", "state", "Order_Status"],
        "shipping_state": ["shipping_state", "state", "region", "State", "Region", "shipping_region", "province", "Shipping_State"],
        "payment_method": ["payment_method", "PaymentMethod", "payment_type", "method", "payment", "Payment_Method"],
        "total_amount": ["total_amount", "TotalAmount", "total", "amount", "revenue", "order_value", "Total_Amount"],
        "discount_amount": ["discount_amount", "DiscountAmount", "discount", "disc", "Discount_Amount"]
    },
    "order_items": {
        "order_item_id": ["order_item_id", "OrderItemID", "item_id", "line_item_id", "id"],
        "order_id": ["order_id", "OrderID", "order_number", "invoice_no"],
        "product_id": ["product_id", "ProductID", "prod_id", "item_id", "sku", "Product_Id"],
        "quantity": ["quantity", "Quantity", "qty", "units", "count", "num_items"],
        "unit_price": ["unit_price", "UnitPrice", "price", "selling_price", "rate"],
        "discount": ["discount", "Discount", "disc", "discount_amt"],
        "item_revenue": ["item_revenue", "ItemRevenue", "revenue", "total", "line_total", "amount"],
        "item_cost": ["item_cost", "ItemCost", "cost", "cogs", "line_cost"],
        "item_profit": ["item_profit", "ItemProfit", "profit", "net_profit", "margin_amt"]
    },
    "customers": {
        "customer_id": ["customer_id", "CustomerID", "cust_id", "client_id", "user_id", "Customer_Id"],
        "first_name": ["first_name", "FirstName", "fname", "given_name", "First_Name"],
        "last_name": ["last_name", "LastName", "lname", "surname", "family_name", "Last_Name"],
        "email": ["email", "Email", "email_address", "contact_email", "mail"],
        "city": ["city", "City", "town", "municipality"],
        "state": ["state", "State", "region", "province"],
        "acquisition_channel": ["acquisition_channel", "AcquisitionChannel", "channel", "source", "utm_source", "medium", "Acquisition_Channel"],
        "signup_date": ["signup_date", "SignupDate", "created_at", "registration_date", "join_date", "Signup_Date"],
        "gender": ["gender", "Gender", "sex"],
        "age": ["age", "Age"]
    },
    "products": {
        "product_id": ["product_id", "ProductID", "prod_id", "item_id", "sku", "Product_Id"],
        "product_name": ["product_name", "ProductName", "name", "title", "item_name", "description", "Product_Name"],
        "category": ["category", "Category", "product_category", "dept", "department", "Product_Category"],
        "subcategory": ["subcategory", "SubCategory", "sub_category", "sub_dept"],
        "brand": ["brand", "Brand", "manufacturer", "vendor", "make"],
        "unit_cost": ["unit_cost", "UnitCost", "cost", "cogs", "wholesale_price"],
        "selling_price": ["selling_price", "SellingPrice", "price", "unit_price", "retail_price"],
        "stock_quantity": ["stock_quantity", "StockQuantity", "stock", "inventory", "qty_on_hand"]
    },
    "returns": {
        "return_id": ["return_id", "ReturnID", "id", "rma_number"],
        "order_id": ["order_id", "OrderID", "order_number"],
        "product_id": ["product_id", "ProductID", "prod_id", "item_id"],
        "customer_id": ["customer_id", "CustomerID", "cust_id"],
        "return_date": ["return_date", "ReturnDate", "date", "returned_at"],
        "return_reason": ["return_reason", "ReturnReason", "reason"],
        "quantity_returned": ["quantity_returned", "QuantityReturned", "quantity", "qty"],
        "refund_amount": ["refund_amount", "RefundAmount", "amount", "refund"]
    }
}

def normalize_dataframe(df: pd.DataFrame, table_type: str) -> pd.DataFrame:
    """
    Normalizes DataFrame column names based on target schema aliases.
    Does not fabricate missing columns; preserves available data cleanly.
    """
    if table_type not in COLUMN_ALIASES:
        return df

    aliases = COLUMN_ALIASES[table_type]
    col_mapping = {}

    for target_col, possible_names in aliases.items():
        if target_col in df.columns:
            continue
        for possible_name in possible_names:
            # Check case-insensitive exact or strip match
            matches = [c for c in df.columns if c.strip().lower() == possible_name.lower()]
            if matches:
                col_mapping[matches[0]] = target_col
                break

    if col_mapping:
        df = df.rename(columns=col_mapping)

    return df

def mask_name(first_name: Any, last_name: Any) -> str:
    """
    Anonymizes / masks real customer names for privacy on public dashboards.
    Example: 'John', 'Doe' -> 'J*** D***'
    """
    f = str(first_name).strip() if pd.notnull(first_name) else ""
    l = str(last_name).strip() if pd.notnull(last_name) else ""

    if not f and not l:
        return "Customer"

    masked_f = f"{f[0]}***" if len(f) > 0 else ""
    masked_l = f"{l[0]}***" if len(l) > 0 else ""

    return f"{masked_f} {masked_l}".strip()

def mask_email(email: Any) -> str:
    """
    Anonymizes / masks customer email addresses.
    Example: 'alex.smith@gmail.com' -> 'a***@gmail.com'
    """
    e = str(email).strip() if pd.notnull(email) else ""
    if not e or "@" not in e:
        return "user@***.com"

    parts = e.split("@")
    user = parts[0]
    domain = parts[1] if len(parts) > 1 else "domain.com"

    masked_user = f"{user[0]}***" if len(user) > 0 else "u***"
    return f"{masked_user}@{domain}"
