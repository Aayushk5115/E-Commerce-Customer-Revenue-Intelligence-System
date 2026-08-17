import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

DATA_DIR = 'data'
SCHEMA_FILE = 'sql/schema.sql'

tables = [
    'customers',
    'products',
    'orders',
    'order_items',
    'returns',
    'marketing_campaigns',
    'marketing_performance',
    'customer_sessions'
]

def load_data():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Creating schema...")
    with open(SCHEMA_FILE, 'r') as f:
        schema_sql = f.read()
    cursor.execute(schema_sql)
    
    for table in tables:
        csv_file = os.path.join(DATA_DIR, f"{table}.csv")
        if not os.path.exists(csv_file):
            print(f"Warning: {csv_file} not found. Skipping table {table}.")
            continue
            
        print(f"Loading data into {table}...")
        with open(csv_file, 'r') as f:
            # next(f) # Skip header if using copy_from, but copy_expert handles CSV headers
            copy_sql = f"COPY {table} FROM STDIN WITH CSV HEADER DELIMITER ',' NULL ''"
            cursor.copy_expert(sql=copy_sql, file=f)
            
    print("Data loading complete.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        load_data()
    except Exception as e:
        print(f"Error loading data: {e}")
