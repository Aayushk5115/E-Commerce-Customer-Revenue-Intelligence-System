-- SQL ANALYTICS FOR E-COMMERCE INTELLIGENCE SYSTEM
-- This file contains over 40 essential business queries for the platform.

-- ==========================================
-- 1. REVENUE & FINANCIAL PERFORMANCE
-- ==========================================

-- 1.1 Total Revenue
SELECT SUM(total_amount) AS total_revenue FROM orders WHERE order_status != 'Cancelled';

-- 1.2 Total Profit
SELECT SUM(item_profit) AS total_profit 
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'Cancelled';

-- 1.3 Profit Margin
SELECT 
    SUM(item_profit) / NULLIF(SUM(item_revenue), 0) AS profit_margin 
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'Cancelled';

-- 1.4 Monthly Revenue
SELECT 
    DATE_TRUNC('month', order_date) AS month, 
    SUM(total_amount) AS monthly_revenue 
FROM orders 
WHERE order_status != 'Cancelled'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- 1.5 Year-over-Year Growth (YoY)
WITH monthly AS (
    SELECT DATE_TRUNC('month', order_date) AS month, SUM(total_amount) AS revenue 
    FROM orders WHERE order_status != 'Cancelled' GROUP BY 1
)
SELECT 
    month, 
    revenue,
    LAG(revenue, 12) OVER (ORDER BY month) AS prev_year_revenue,
    (revenue - LAG(revenue, 12) OVER (ORDER BY month)) / NULLIF(LAG(revenue, 12) OVER (ORDER BY month), 0) AS yoy_growth
FROM monthly;

-- 1.6 Month-over-Month Growth (MoM)
WITH monthly AS (
    SELECT DATE_TRUNC('month', order_date) AS month, SUM(total_amount) AS revenue 
    FROM orders WHERE order_status != 'Cancelled' GROUP BY 1
)
SELECT 
    month, 
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    (revenue - LAG(revenue, 1) OVER (ORDER BY month)) / NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0) AS mom_growth
FROM monthly;

-- 1.7 Revenue by Category
SELECT 
    p.category, 
    SUM(oi.item_revenue) AS category_revenue 
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'Cancelled'
GROUP BY p.category
ORDER BY category_revenue DESC;

-- 1.8 Revenue by Subcategory
SELECT p.subcategory, SUM(oi.item_revenue) AS subcat_revenue
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.subcategory ORDER BY subcat_revenue DESC;

-- 1.9 Revenue by Region (State)
SELECT shipping_state, SUM(total_amount) AS state_revenue
FROM orders WHERE order_status != 'Cancelled'
GROUP BY shipping_state ORDER BY state_revenue DESC;

-- 1.10 Revenue by Acquisition Channel
SELECT c.acquisition_channel, SUM(o.total_amount) AS channel_revenue
FROM orders o JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_status != 'Cancelled'
GROUP BY c.acquisition_channel ORDER BY channel_revenue DESC;

-- ==========================================
-- 2. CUSTOMER METRICS
-- ==========================================

-- 2.1 Total Customers
SELECT COUNT(DISTINCT customer_id) AS total_customers FROM customers;

-- 2.2 New vs Returning Customers (Purchasing in current month)
WITH customer_first_purchase AS (
    SELECT customer_id, MIN(order_date) AS first_purchase_date
    FROM orders WHERE order_status != 'Cancelled' GROUP BY customer_id
)
SELECT 
    DATE_TRUNC('month', o.order_date) AS order_month,
    COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.order_date) = DATE_TRUNC('month', f.first_purchase_date) THEN o.customer_id END) AS new_customers,
    COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', o.order_date) > DATE_TRUNC('month', f.first_purchase_date) THEN o.customer_id END) AS returning_customers
FROM orders o
JOIN customer_first_purchase f ON o.customer_id = f.customer_id
WHERE o.order_status != 'Cancelled'
GROUP BY 1 ORDER BY 1;

-- 2.3 Repeat Purchase Rate
WITH customer_orders AS (
    SELECT customer_id, COUNT(order_id) AS order_count FROM orders WHERE order_status != 'Cancelled' GROUP BY 1
)
SELECT 
    COUNT(CASE WHEN order_count > 1 THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) AS repeat_purchase_rate
FROM customer_orders;

-- 2.4 Average Customer Spend
SELECT SUM(total_amount) / COUNT(DISTINCT customer_id) AS avg_customer_spend
FROM orders WHERE order_status != 'Cancelled';

-- 2.5 Customer Lifetime Value (CLV) - Historic Average
SELECT SUM(total_amount) / NULLIF(COUNT(DISTINCT customer_id), 0) AS clv 
FROM orders WHERE order_status != 'Cancelled';

-- 2.6 Top 10 Customers by Revenue
SELECT c.customer_id, c.first_name, c.last_name, SUM(o.total_amount) AS total_spent
FROM customers c JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_status != 'Cancelled'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC LIMIT 10;

-- 2.7 Customer Demographics (Gender & Age Group)
SELECT gender, 
    CASE 
        WHEN age < 25 THEN '18-24'
        WHEN age < 35 THEN '25-34'
        WHEN age < 45 THEN '35-44'
        WHEN age < 55 THEN '45-54'
        ELSE '55+' END AS age_group,
    COUNT(*) AS count
FROM customers GROUP BY 1, 2;

-- 2.8 Customer City Distribution
SELECT city, state, COUNT(*) as customer_count 
FROM customers GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10;

-- ==========================================
-- 3. PRODUCT PERFORMANCE
-- ==========================================

-- 3.1 Top Products by Revenue
SELECT p.product_name, SUM(oi.item_revenue) AS revenue
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.product_name ORDER BY revenue DESC LIMIT 10;

-- 3.2 Top Products by Profit
SELECT p.product_name, SUM(oi.item_profit) AS profit
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.product_name ORDER BY profit DESC LIMIT 10;

-- 3.3 Low Performing Products (Lowest Revenue with > 0 sales)
SELECT p.product_name, SUM(oi.item_revenue) AS revenue
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.product_name HAVING SUM(oi.item_revenue) > 0 ORDER BY revenue ASC LIMIT 10;

-- 3.4 Product Return Rate
SELECT 
    p.product_id, 
    p.product_name,
    COUNT(DISTINCT r.return_id) * 1.0 / NULLIF(COUNT(DISTINCT oi.order_id), 0) AS return_rate
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN returns r ON p.product_id = r.product_id AND oi.order_id = r.order_id
GROUP BY 1, 2 ORDER BY return_rate DESC LIMIT 20;

-- 3.5 Category Profitability (Margin)
SELECT 
    p.category, 
    SUM(oi.item_profit) / NULLIF(SUM(oi.item_revenue), 0) AS category_margin
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.category ORDER BY category_margin DESC;

-- 3.6 Best Selling Brands
SELECT p.brand, SUM(oi.quantity) as units_sold, SUM(oi.item_revenue) as revenue
FROM order_items oi JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled'
GROUP BY p.brand ORDER BY revenue DESC LIMIT 10;

-- ==========================================
-- 4. ORDER & FULFILLMENT METRICS
-- ==========================================

-- 4.1 Average Order Value (AOV)
SELECT SUM(total_amount) / COUNT(order_id) AS aov 
FROM orders WHERE order_status != 'Cancelled';

-- 4.2 Orders Per Customer
SELECT COUNT(order_id) * 1.0 / NULLIF(COUNT(DISTINCT customer_id), 0) AS orders_per_customer 
FROM orders WHERE order_status != 'Cancelled';

-- 4.3 Orders Per Month
SELECT DATE_TRUNC('month', order_date) AS month, COUNT(order_id) AS order_count
FROM orders GROUP BY 1 ORDER BY 1;

-- 4.4 Cancellation Rate
SELECT COUNT(CASE WHEN order_status = 'Cancelled' THEN 1 END) * 1.0 / COUNT(*) AS cancellation_rate
FROM orders;

-- 4.5 Average Items Per Order
SELECT SUM(quantity) * 1.0 / COUNT(DISTINCT order_id) AS avg_items_per_order
FROM order_items;

-- 4.6 Payment Method Popularity
SELECT payment_method, COUNT(*) AS count, SUM(total_amount) AS revenue
FROM orders WHERE order_status != 'Cancelled' GROUP BY 1 ORDER BY 2 DESC;

-- 4.7 Discount Impact on AOV
SELECT 
    CASE WHEN discount_amount > 0 THEN 'Discounted' ELSE 'Full Price' END AS discount_status,
    AVG(total_amount) AS avg_order_value,
    COUNT(*) AS order_count
FROM orders WHERE order_status != 'Cancelled' GROUP BY 1;

-- ==========================================
-- 5. MARKETING & ACQUISITION
-- ==========================================

-- 5.1 Customer Acquisition Cost (CAC) per Channel
SELECT 
    mc.channel,
    SUM(mp.spend) / NULLIF(SUM(mp.conversions), 0) AS cac
FROM marketing_campaigns mc
JOIN marketing_performance mp ON mc.campaign_id = mp.campaign_id
GROUP BY mc.channel;

-- 5.2 Return on Ad Spend (ROAS) per Channel
SELECT 
    mc.channel,
    SUM(mp.revenue_generated) / NULLIF(SUM(mp.spend), 0) AS roas
FROM marketing_campaigns mc
JOIN marketing_performance mp ON mc.campaign_id = mp.campaign_id
GROUP BY mc.channel;

-- 5.3 Overall Conversion Rate from Sessions
SELECT 
    SUM(converted) * 1.0 / NULLIF(COUNT(session_id), 0) AS overall_conversion_rate
FROM customer_sessions;

-- 5.4 Conversion Rate by Device
SELECT 
    device, 
    SUM(converted) * 1.0 / NULLIF(COUNT(session_id), 0) AS conversion_rate
FROM customer_sessions GROUP BY 1 ORDER BY 2 DESC;

-- 5.5 Marketing Spend vs Revenue over time (Monthly)
SELECT 
    DATE_TRUNC('month', date) AS month,
    SUM(spend) AS total_spend,
    SUM(revenue_generated) AS total_ad_revenue
FROM marketing_performance GROUP BY 1 ORDER BY 1;

-- 5.6 Best Performing Campaigns (by ROAS)
SELECT 
    mc.campaign_name, 
    SUM(mp.spend) AS spend, 
    SUM(mp.revenue_generated) AS revenue,
    SUM(mp.revenue_generated) / NULLIF(SUM(mp.spend), 0) AS roas
FROM marketing_campaigns mc
JOIN marketing_performance mp ON mc.campaign_id = mp.campaign_id
GROUP BY mc.campaign_name HAVING SUM(mp.spend) > 100
ORDER BY roas DESC LIMIT 10;

-- ==========================================
-- 6. RETENTION & COHORT
-- ==========================================

-- 6.1 Customer Retention Rate (Month over Month approx)
WITH active_customers AS (
    SELECT DISTINCT customer_id, DATE_TRUNC('month', order_date) AS active_month
    FROM orders WHERE order_status != 'Cancelled'
)
SELECT 
    a1.active_month,
    COUNT(DISTINCT a1.customer_id) AS starting_customers,
    COUNT(DISTINCT a2.customer_id) AS retained_customers,
    COUNT(DISTINCT a2.customer_id) * 1.0 / NULLIF(COUNT(DISTINCT a1.customer_id), 0) AS retention_rate
FROM active_customers a1
LEFT JOIN active_customers a2 ON a1.customer_id = a2.customer_id AND a2.active_month = a1.active_month + INTERVAL '1 month'
GROUP BY 1 ORDER BY 1;

-- 6.2 Basic Cohort Analysis (Retention by Signup Month)
WITH cohort_items AS (
    SELECT 
        c.customer_id,
        DATE_TRUNC('month', c.signup_date) AS cohort_month,
        DATE_TRUNC('month', o.order_date) AS order_month
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status != 'Cancelled'
)
SELECT 
    cohort_month,
    order_month,
    EXTRACT(MONTH FROM age(order_month, cohort_month)) AS months_since_signup,
    COUNT(DISTINCT customer_id) AS active_customers
FROM cohort_items
GROUP BY 1, 2, 3
ORDER BY 1, 2;

-- 6.3 Identify Churned Customers (No purchase in last 6 months)
-- Assuming current date is max order date
WITH max_date AS (SELECT MAX(order_date) AS max_dt FROM orders),
customer_last_order AS (
    SELECT customer_id, MAX(order_date) as last_order
    FROM orders GROUP BY customer_id
)
SELECT 
    c.customer_id, 
    c.first_name, 
    c.last_name, 
    clo.last_order
FROM customers c
JOIN customer_last_order clo ON c.customer_id = clo.customer_id
CROSS JOIN max_date md
WHERE clo.last_order < md.max_dt - INTERVAL '6 months';
