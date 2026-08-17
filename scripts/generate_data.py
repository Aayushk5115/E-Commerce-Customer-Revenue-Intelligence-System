import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# Configuration
NUM_CUSTOMERS = 20000
NUM_PRODUCTS = 1000
NUM_ORDERS = 100000
NUM_CAMPAIGNS = 50
START_DATE = datetime(2021, 1, 1)
END_DATE = datetime(2023, 12, 31)
DATA_DIR = 'data'

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

np.random.seed(42)
random.seed(42)

def generate_dates(start, end, n, sort=False):
    dates = start + (end - start) * np.random.rand(n)
    if sort:
        dates.sort()
    return pd.to_datetime(dates).round('s')

print("Generating Products...")
categories = {
    'Electronics': {'subcategories': ['Smartphones', 'Laptops', 'Audio', 'Accessories'], 'margin': (0.1, 0.3), 'price': (20, 2000)},
    'Apparel': {'subcategories': ['Shirts', 'Pants', 'Shoes', 'Outerwear'], 'margin': (0.4, 0.7), 'price': (15, 200)},
    'Home & Garden': {'subcategories': ['Furniture', 'Decor', 'Kitchen', 'Tools'], 'margin': (0.3, 0.5), 'price': (10, 1000)},
    'Sports': {'subcategories': ['Fitness', 'Outdoor', 'Team Sports'], 'margin': (0.2, 0.4), 'price': (10, 500)},
    'Beauty': {'subcategories': ['Skincare', 'Makeup', 'Haircare'], 'margin': (0.5, 0.8), 'price': (5, 100)}
}

products = []
for i in range(1, NUM_PRODUCTS + 1):
    cat = random.choice(list(categories.keys()))
    subcat = random.choice(categories[cat]['subcategories'])
    price_range = categories[cat]['price']
    margin_range = categories[cat]['margin']
    
    unit_cost = round(random.uniform(price_range[0], price_range[1]), 2)
    margin = random.uniform(margin_range[0], margin_range[1])
    selling_price = round(unit_cost / (1 - margin), 2)
    
    products.append({
        'product_id': i,
        'product_name': f"{subcat} Product {i}",
        'category': cat,
        'subcategory': subcat,
        'brand': f"Brand {random.randint(1, 100)}",
        'unit_cost': unit_cost,
        'selling_price': selling_price,
        'stock_quantity': random.randint(50, 1000)
    })

products_df = pd.DataFrame(products)
products_df.to_csv(f"{DATA_DIR}/products.csv", index=False)


print("Generating Customers...")
acquisition_channels = ['Organic Search', 'Direct', 'Paid Search', 'Social Media', 'Email', 'Referral']
states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']

customers = pd.DataFrame({
    'customer_id': range(1, NUM_CUSTOMERS + 1),
    'first_name': [f"First{i}" for i in range(1, NUM_CUSTOMERS + 1)],
    'last_name': [f"Last{i}" for i in range(1, NUM_CUSTOMERS + 1)],
    'email': [f"user{i}@example.com" for i in range(1, NUM_CUSTOMERS + 1)],
    'gender': np.random.choice(['Male', 'Female', 'Other'], NUM_CUSTOMERS, p=[0.48, 0.48, 0.04]),
    'age': np.random.normal(35, 12, NUM_CUSTOMERS).clip(18, 80).astype(int),
    'city': [f"City{random.randint(1, 100)}" for _ in range(NUM_CUSTOMERS)],
    'state': np.random.choice(states, NUM_CUSTOMERS),
    'country': 'USA',
    'signup_date': generate_dates(START_DATE, END_DATE, NUM_CUSTOMERS),
    'acquisition_channel': np.random.choice(acquisition_channels, NUM_CUSTOMERS, p=[0.3, 0.2, 0.2, 0.15, 0.1, 0.05])
})
customers.to_csv(f"{DATA_DIR}/customers.csv", index=False)


print("Generating Orders and Order Items...")
# Customers make orders after their signup date
order_dates = []
customer_ids = []

for _ in range(NUM_ORDERS):
    cid = random.randint(1, NUM_CUSTOMERS)
    c_signup = customers.loc[cid-1, 'signup_date']
    if c_signup < END_DATE:
        odate = c_signup + (END_DATE - c_signup) * random.random()
        order_dates.append(odate)
        customer_ids.append(cid)

NUM_ACTUAL_ORDERS = len(order_dates)

orders = pd.DataFrame({
    'order_id': range(1, NUM_ACTUAL_ORDERS + 1),
    'customer_id': customer_ids,
    'order_date': order_dates,
    'order_status': np.random.choice(['Completed', 'Cancelled', 'Returned'], NUM_ACTUAL_ORDERS, p=[0.85, 0.05, 0.10]),
    'payment_method': np.random.choice(['Credit Card', 'PayPal', 'Debit Card', 'Apple Pay'], NUM_ACTUAL_ORDERS),
    'shipping_city': [f"City{random.randint(1, 100)}" for _ in range(NUM_ACTUAL_ORDERS)],
    'shipping_state': np.random.choice(states, NUM_ACTUAL_ORDERS),
    'shipping_cost': np.random.uniform(0, 25, NUM_ACTUAL_ORDERS).round(2),
})

# Generate Order Items
order_items = []
order_item_id = 1
order_totals = []
order_discounts = []

products_dict = products_df.set_index('product_id').to_dict('index')

for index, row in orders.iterrows():
    num_items = random.choices([1, 2, 3, 4, 5], weights=[0.5, 0.3, 0.1, 0.05, 0.05])[0]
    order_id = row['order_id']
    order_revenue = 0
    order_discount = 0
    
    for _ in range(num_items):
        pid = random.randint(1, NUM_PRODUCTS)
        qty = random.choices([1, 2, 3, 4, 5], weights=[0.7, 0.15, 0.08, 0.05, 0.02])[0]
        
        p = products_dict[pid]
        unit_price = p['selling_price']
        unit_cost = p['unit_cost']
        
        # Apply occasional discount
        discount_pct = 0
        if random.random() < 0.2:
            discount_pct = random.choice([0.1, 0.15, 0.2])
            
        discount_amt = round(unit_price * qty * discount_pct, 2)
        item_revenue = round((unit_price * qty) - discount_amt, 2)
        item_cost = round(unit_cost * qty, 2)
        item_profit = round(item_revenue - item_cost, 2)
        
        order_items.append({
            'order_item_id': order_item_id,
            'order_id': order_id,
            'product_id': pid,
            'quantity': qty,
            'unit_price': unit_price,
            'discount': discount_amt,
            'item_revenue': item_revenue,
            'item_cost': item_cost,
            'item_profit': item_profit
        })
        order_item_id += 1
        order_revenue += item_revenue
        order_discount += discount_amt
        
    order_totals.append(order_revenue)
    order_discounts.append(order_discount)

orders['discount_amount'] = order_discounts
orders['total_amount'] = [t + s for t, s in zip(order_totals, orders['shipping_cost'])]

orders.to_csv(f"{DATA_DIR}/orders.csv", index=False)
order_items_df = pd.DataFrame(order_items)
order_items_df.to_csv(f"{DATA_DIR}/order_items.csv", index=False)


print("Generating Returns...")
returned_orders = orders[orders['order_status'] == 'Returned']
returns = []
return_id = 1

for index, row in returned_orders.iterrows():
    oid = row['order_id']
    cid = row['customer_id']
    odate = row['order_date']
    
    # Get items for this order
    items = order_items_df[order_items_df['order_id'] == oid]
    
    for _, item in items.iterrows():
        if random.random() < 0.8: # 80% chance of returning each item in a returned order
            rdate = odate + timedelta(days=random.randint(1, 30))
            returns.append({
                'return_id': return_id,
                'order_id': oid,
                'customer_id': cid,
                'product_id': item['product_id'],
                'return_date': rdate,
                'return_reason': random.choice(['Defective', 'Wrong Item', 'Changed Mind', 'Did not match description']),
                'quantity_returned': item['quantity'],
                'refund_amount': item['item_revenue']
            })
            return_id += 1

returns_df = pd.DataFrame(returns)
returns_df.to_csv(f"{DATA_DIR}/returns.csv", index=False)


print("Generating Marketing Campaigns...")
campaigns = []
for i in range(1, NUM_CAMPAIGNS + 1):
    cdate = START_DATE + timedelta(days=random.randint(0, 700))
    campaigns.append({
        'campaign_id': i,
        'campaign_name': f"Campaign {i}",
        'channel': random.choice(['Google Ads', 'Facebook Ads', 'Email', 'Affiliate', 'Instagram']),
        'campaign_type': random.choice(['Awareness', 'Conversion', 'Retargeting']),
        'start_date': cdate,
        'end_date': cdate + timedelta(days=random.randint(10, 60)),
        'budget': random.randint(1000, 50000)
    })
campaigns_df = pd.DataFrame(campaigns)
campaigns_df.to_csv(f"{DATA_DIR}/marketing_campaigns.csv", index=False)


print("Generating Marketing Performance...")
performance = []
for index, camp in campaigns_df.iterrows():
    curr_date = camp['start_date']
    end_date = camp['end_date']
    daily_budget = camp['budget'] / (end_date - curr_date).days
    
    while curr_date <= end_date:
        spend = daily_budget * random.uniform(0.8, 1.2)
        impressions = int(spend * random.uniform(50, 200))
        clicks = int(impressions * random.uniform(0.01, 0.05))
        conversions = int(clicks * random.uniform(0.02, 0.1))
        revenue = conversions * random.uniform(50, 150)
        
        performance.append({
            'campaign_id': camp['campaign_id'],
            'date': curr_date.date(),
            'impressions': impressions,
            'clicks': clicks,
            'conversions': conversions,
            'spend': round(spend, 2),
            'revenue_generated': round(revenue, 2)
        })
        curr_date += timedelta(days=1)

performance_df = pd.DataFrame(performance)
performance_df.to_csv(f"{DATA_DIR}/marketing_performance.csv", index=False)

print("Generating Sessions...")
NUM_SESSIONS = 250000
session_dates = generate_dates(START_DATE, END_DATE, NUM_SESSIONS)
sessions = pd.DataFrame({
    'session_id': range(1, NUM_SESSIONS + 1),
    'customer_id': np.random.choice(customers['customer_id'].tolist() + [None]*50000, NUM_SESSIONS), # Some anonymous
    'session_date': session_dates,
    'channel': np.random.choice(acquisition_channels, NUM_SESSIONS),
    'device': np.random.choice(['Desktop', 'Mobile', 'Tablet'], NUM_SESSIONS, p=[0.4, 0.5, 0.1]),
    'pages_viewed': np.random.poisson(4, NUM_SESSIONS) + 1,
    'session_duration': np.random.exponential(180, NUM_SESSIONS).astype(int), # in seconds
    'converted': np.random.choice([0, 1], NUM_SESSIONS, p=[0.95, 0.05])
})
sessions.to_csv(f"{DATA_DIR}/customer_sessions.csv", index=False)

print("Data generation complete!")
