import pandas as pd
import os

DATA_DIR = 'data'
REPORT_PATH = 'docs/data_quality_report.md'

files_to_check = {
    'customers': 'customers.csv',
    'products': 'products.csv',
    'orders': 'orders.csv',
    'order_items': 'order_items.csv',
    'returns': 'returns.csv',
    'marketing_campaigns': 'marketing_campaigns.csv',
    'marketing_performance': 'marketing_performance.csv',
    'customer_sessions': 'customer_sessions.csv'
}

def check_data_quality():
    report_lines = ["# Data Quality Report\n"]
    
    total_records_all = 0
    total_issues = 0
    
    for name, filename in files_to_check.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            continue
            
        df = pd.read_csv(filepath)
        total_records = len(df)
        total_records_all += total_records
        
        missing_values = df.isnull().sum().sum()
        duplicate_records = df.duplicated().sum()
        
        # Add basic negative checks for relevant columns
        invalid_records = 0
        if 'quantity' in df.columns:
            invalid_records += (df['quantity'] <= 0).sum()
        if 'unit_price' in df.columns:
            invalid_records += (df['unit_price'] < 0).sum()
        
        total_issues += missing_values + duplicate_records + invalid_records
        
        valid_records = total_records - duplicate_records - invalid_records
        quality_pct = (valid_records / total_records * 100) if total_records > 0 else 0
        
        report_lines.append(f"## {name.capitalize()}")
        report_lines.append(f"- **Total Records:** {total_records}")
        report_lines.append(f"- **Missing Values:** {missing_values}")
        report_lines.append(f"- **Duplicate Records:** {duplicate_records}")
        report_lines.append(f"- **Invalid Records:** {invalid_records}")
        report_lines.append(f"- **Valid Records:** {valid_records}")
        report_lines.append(f"- **Data Quality:** {quality_pct:.2f}%\n")

    overall_quality = ((total_records_all - total_issues) / total_records_all * 100) if total_records_all > 0 else 0
    
    report_lines.insert(1, f"**Overall Data Quality:** {overall_quality:.2f}%\n")
    report_lines.insert(2, f"**Total Records Across All Tables:** {total_records_all}\n")
    
    with open(REPORT_PATH, 'w') as f:
        f.write("\n".join(report_lines))
        
    print(f"Data quality report generated at {REPORT_PATH}")

if __name__ == "__main__":
    check_data_quality()
