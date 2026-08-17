# Data Dictionary: E-Commerce Intelligence System

## Table: customers
| Column Name | Data Type | Description | Example | Source | Business Meaning |
|---|---|---|---|---|---|
| customer_id | INTEGER | Unique identifier for each customer | 1 | CRM / Signup System | Primary key for customer records |
| first_name | VARCHAR(100) | Customer's first name | John | User Input | Personalization and marketing |
| last_name | VARCHAR(100) | Customer's last name | Doe | User Input | Personalization |
| email | VARCHAR(255) | Email address | john.doe@email.com | User Input | Primary contact method for marketing/CRM |
| gender | VARCHAR(20) | Customer's gender | Male | User Input | Demographic segmentation |
| age | INTEGER | Customer's age | 34 | User Input | Demographic segmentation |
| city | VARCHAR(100) | Customer's city | Los Angeles | Shipping Info | Geographic segmentation |
| state | VARCHAR(50) | Customer's state | CA | Shipping Info | Geographic segmentation |
| signup_date | TIMESTAMP | Date the customer registered | 2021-01-15 10:00:00 | System Generated | Cohort tracking and customer age |
| acquisition_channel | VARCHAR(100) | Marketing channel that brought the customer | Organic Search | UTM Parameters | Evaluates marketing effectiveness |

## Table: orders
| Column Name | Data Type | Description | Example | Source | Business Meaning |
|---|---|---|---|---|---|
| order_id | INTEGER | Unique identifier for each order | 10234 | E-Commerce Platform | Primary key for orders |
| customer_id | INTEGER | ID of the purchasing customer | 1 | E-Commerce Platform | Links order to customer profile |
| order_date | TIMESTAMP | Timestamp of order creation | 2023-05-12 14:22:00 | System Generated | Time-series tracking and seasonality |
| order_status | VARCHAR(50) | Current status of the order | Completed | Fulfillment System | Identifies valid vs cancelled revenue |
| payment_method | VARCHAR(50) | Method used for checkout | Credit Card | Payment Gateway | Financial reconciliation |
| total_amount | DECIMAL(10,2) | Final amount paid by customer | 145.99 | Calculated (Cart) | Primary revenue metric |

## Table: products
| Column Name | Data Type | Description | Example | Source | Business Meaning |
|---|---|---|---|---|---|
| product_id | INTEGER | Unique identifier for each product | 501 | Inventory System | Primary key for catalog items |
| category | VARCHAR(100) | Top-level product category | Electronics | Merchandising | Category performance tracking |
| unit_cost | DECIMAL(10,2) | Cost to purchase/manufacture | 45.00 | ERP/Finance | Used to calculate profit margins |
| selling_price | DECIMAL(10,2) | Price shown to customer | 99.99 | Pricing Engine | Base price before discounts |

## Table: marketing_performance
| Column Name | Data Type | Description | Example | Source | Business Meaning |
|---|---|---|---|---|---|
| campaign_id | INTEGER | Identifier for the ad campaign | 12 | Ad Platform | Links to campaign metadata |
| spend | DECIMAL(10,2) | Daily ad spend | 450.00 | Ad Platform (Google/Meta) | Marketing expense (CAC calculation) |
| revenue_generated | DECIMAL(10,2) | Revenue attributed to campaign | 1200.00 | Attribution Tool | Used for ROAS calculation |
