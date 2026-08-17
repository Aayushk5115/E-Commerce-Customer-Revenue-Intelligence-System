-- Database Schema for E-Commerce Customer & Revenue Intelligence System

DROP TABLE IF EXISTS customer_sessions;
DROP TABLE IF EXISTS marketing_performance;
DROP TABLE IF EXISTS marketing_campaigns;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;


CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    gender VARCHAR(20),
    age INTEGER,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50),
    signup_date TIMESTAMP,
    acquisition_channel VARCHAR(100)
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    stock_quantity INTEGER
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date TIMESTAMP,
    order_status VARCHAR(50),
    payment_method VARCHAR(50),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(50),
    shipping_cost DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    discount DECIMAL(10,2),
    item_revenue DECIMAL(10,2),
    item_cost DECIMAL(10,2),
    item_profit DECIMAL(10,2)
);

CREATE TABLE returns (
    return_id INTEGER PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    customer_id INTEGER REFERENCES customers(customer_id),
    product_id INTEGER REFERENCES products(product_id),
    return_date TIMESTAMP,
    return_reason VARCHAR(255),
    quantity_returned INTEGER,
    refund_amount DECIMAL(10,2)
);

CREATE TABLE marketing_campaigns (
    campaign_id INTEGER PRIMARY KEY,
    campaign_name VARCHAR(255),
    channel VARCHAR(100),
    campaign_type VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    budget DECIMAL(15,2)
);

CREATE TABLE marketing_performance (
    campaign_id INTEGER REFERENCES marketing_campaigns(campaign_id),
    date DATE,
    impressions INTEGER,
    clicks INTEGER,
    conversions INTEGER,
    spend DECIMAL(10,2),
    revenue_generated DECIMAL(10,2),
    PRIMARY KEY (campaign_id, date)
);

CREATE TABLE customer_sessions (
    session_id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    session_date TIMESTAMP,
    channel VARCHAR(100),
    device VARCHAR(50),
    pages_viewed INTEGER,
    session_duration INTEGER,
    converted INTEGER
);

-- Create Indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_returns_order_id ON returns(order_id);
CREATE INDEX idx_sessions_customer_id ON customer_sessions(customer_id);
CREATE INDEX idx_customers_signup_date ON customers(signup_date);
