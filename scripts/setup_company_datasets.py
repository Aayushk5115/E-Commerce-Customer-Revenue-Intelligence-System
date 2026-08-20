import os
import shutil
import pandas as pd
import numpy as np

def setup_company_datasets():
    base_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    companies_dir = os.path.join(base_data_dir, "companies")
    os.makedirs(companies_dir, exist_ok=True)

    print("Loading base datasets...")
    orders = pd.read_csv(os.path.join(base_data_dir, "orders.csv"))
    order_items = pd.read_csv(os.path.join(base_data_dir, "order_items.csv"))
    products = pd.read_csv(os.path.join(base_data_dir, "products.csv"))
    customers = pd.read_csv(os.path.join(base_data_dir, "customers.csv"))
    returns = pd.read_csv(os.path.join(base_data_dir, "returns.csv")) if os.path.exists(os.path.join(base_data_dir, "returns.csv")) else pd.DataFrame()
    marketing_camp = pd.read_csv(os.path.join(base_data_dir, "marketing_campaigns.csv")) if os.path.exists(os.path.join(base_data_dir, "marketing_campaigns.csv")) else pd.DataFrame()
    marketing_perf = pd.read_csv(os.path.join(base_data_dir, "marketing_performance.csv")) if os.path.exists(os.path.join(base_data_dir, "marketing_performance.csv")) else pd.DataFrame()
    ml_output_dir = os.path.join(base_data_dir, "ml_output")

    # -------------------------------------------------------------
    # Company 1: OmniStore Global Retail (Full Benchmark Dataset)
    # -------------------------------------------------------------
    c1_dir = os.path.join(companies_dir, "company-1")
    os.makedirs(os.path.join(c1_dir, "ml_output"), exist_ok=True)
    print("Setting up company-1 (OmniStore)...")
    orders.to_csv(os.path.join(c1_dir, "orders.csv"), index=False)
    order_items.to_csv(os.path.join(c1_dir, "order_items.csv"), index=False)
    products.to_csv(os.path.join(c1_dir, "products.csv"), index=False)
    customers.to_csv(os.path.join(c1_dir, "customers.csv"), index=False)
    if not returns.empty: returns.to_csv(os.path.join(c1_dir, "returns.csv"), index=False)
    if not marketing_camp.empty: marketing_camp.to_csv(os.path.join(c1_dir, "marketing_campaigns.csv"), index=False)
    if not marketing_perf.empty: marketing_perf.to_csv(os.path.join(c1_dir, "marketing_performance.csv"), index=False)
    if os.path.exists(ml_output_dir):
        for f in os.listdir(ml_output_dir):
            shutil.copy(os.path.join(ml_output_dir, f), os.path.join(c1_dir, "ml_output", f))

    # Helper function to partition datasets for other companies
    def create_partition(company_id, target_categories, cust_limit, order_limit, column_alias_style=False):
        c_dir = os.path.join(companies_dir, company_id)
        os.makedirs(os.path.join(c_dir, "ml_output"), exist_ok=True)
        print(f"Setting up {company_id}...")

        # Filter products by target categories (or top items)
        comp_prods = products[products['category'].isin(target_categories)].copy()
        if comp_prods.empty:
            comp_prods = products.sample(n=min(len(products), 200), random_state=42).copy()
        prod_ids = set(comp_prods['product_id'])

        # Filter order items
        comp_items = order_items[order_items['product_id'].isin(prod_ids)].copy()
        if len(comp_items) > order_limit * 2:
            comp_items = comp_items.sample(n=order_limit * 2, random_state=42)
        
        valid_order_ids = set(comp_items['order_id'])
        comp_orders = orders[orders['order_id'].isin(valid_order_ids)].copy()
        if len(comp_orders) > order_limit:
            comp_orders = comp_orders.sample(n=order_limit, random_state=42)
            valid_order_ids = set(comp_orders['order_id'])
            comp_items = comp_items[comp_items['order_id'].isin(valid_order_ids)]

        cust_ids = set(comp_orders['customer_id'])
        comp_cust = customers[customers['customer_id'].isin(cust_ids)].copy()

        # Returns
        comp_returns = returns[returns['order_id'].isin(valid_order_ids)].copy() if not returns.empty else pd.DataFrame()

        # Marketing
        comp_camp = marketing_camp.copy() if not marketing_camp.empty else pd.DataFrame()
        comp_perf = marketing_perf.copy() if not marketing_perf.empty else pd.DataFrame()
        if not comp_perf.empty:
            comp_perf['spend'] = (comp_perf['spend'] * (order_limit / 100000.0)).round(2)
            comp_perf['revenue_generated'] = (comp_perf['revenue_generated'] * (order_limit / 100000.0)).round(2)

        # Apply column alias variations to demonstrate data normalization layer
        if column_alias_style:
            comp_orders_save = comp_orders.rename(columns={
                'order_id': 'OrderID',
                'customer_id': 'CustomerID',
                'order_date': 'OrderDate',
                'total_amount': 'TotalAmount',
                'order_status': 'OrderStatus'
            })
            comp_cust_save = comp_cust.rename(columns={
                'customer_id': 'CustomerID',
                'first_name': 'FirstName',
                'last_name': 'LastName',
                'email': 'EmailAddress',
                'acquisition_channel': 'AcquisitionChannel'
            })
        else:
            comp_orders_save = comp_orders
            comp_cust_save = comp_cust

        comp_orders_save.to_csv(os.path.join(c_dir, "orders.csv"), index=False)
        comp_items.to_csv(os.path.join(c_dir, "order_items.csv"), index=False)
        comp_prods.to_csv(os.path.join(c_dir, "products.csv"), index=False)
        comp_cust_save.to_csv(os.path.join(c_dir, "customers.csv"), index=False)
        if not comp_returns.empty: comp_returns.to_csv(os.path.join(c_dir, "returns.csv"), index=False)
        if not comp_camp.empty: comp_camp.to_csv(os.path.join(c_dir, "marketing_campaigns.csv"), index=False)
        if not comp_perf.empty: comp_perf.to_csv(os.path.join(c_dir, "marketing_performance.csv"), index=False)

        # Copy ML output files if available
        if os.path.exists(ml_output_dir):
            for f in os.listdir(ml_output_dir):
                shutil.copy(os.path.join(ml_output_dir, f), os.path.join(c_dir, "ml_output", f))

    # -------------------------------------------------------------
    # Company 2: TechGear Innovations (Consumer Electronics)
    # -------------------------------------------------------------
    create_partition(
        company_id="company-2",
        target_categories=['Electronics', 'Computers', 'Accessories'],
        cust_limit=12800,
        order_limit=42500,
        column_alias_style=True # Tests CustomerID & OrderDate alias mapping
    )

    # -------------------------------------------------------------
    # Company 3: Aura Fashion & Apparel (Fashion & Footwear)
    # -------------------------------------------------------------
    create_partition(
        company_id="company-3",
        target_categories=['Clothing', 'Footwear', 'Accessories', 'Beauty'],
        cust_limit=16400,
        order_limit=58000,
        column_alias_style=False
    )

    # -------------------------------------------------------------
    # Company 4: Nordic Living & Home (Home & Modern Living)
    # -------------------------------------------------------------
    create_partition(
        company_id="company-4",
        target_categories=['Home & Kitchen', 'Furniture', 'Home Decor', 'Garden'],
        cust_limit=8900,
        order_limit=28900,
        column_alias_style=True
    )

    # -------------------------------------------------------------
    # Company 5: Gourmet Pantry & Organics (Food & Beverage)
    # -------------------------------------------------------------
    create_partition(
        company_id="company-5",
        target_categories=['Groceries', 'Gourmet Food', 'Health & Personal Care', 'Sports & Fitness'],
        cust_limit=14100,
        order_limit=64200,
        column_alias_style=False
    )

    print("All multi-company datasets successfully provisioned.")

if __name__ == "__main__":
    setup_company_datasets()
