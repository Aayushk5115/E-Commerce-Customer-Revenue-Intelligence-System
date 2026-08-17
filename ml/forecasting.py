import pandas as pd
import numpy as np
from datetime import datetime
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
import os

warnings.filterwarnings('ignore')

DATA_DIR = 'data'
OUTPUT_DIR = 'data/ml_output'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def mean_absolute_percentage_error(y_true, y_pred): 
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

def run_forecasting():
    print("Loading data for Revenue Forecasting...")
    orders = pd.read_csv(f"{DATA_DIR}/orders.csv")
    orders['order_date'] = pd.to_datetime(orders['order_date'])
    
    # Aggregate monthly revenue
    orders_completed = orders[orders['order_status'] != 'Cancelled']
    monthly_rev = orders_completed.resample('ME', on='order_date')['total_amount'].sum().reset_index()
    monthly_rev.columns = ['month', 'revenue']
    
    if len(monthly_rev) < 12:
        print("Not enough data points for reliable forecasting (need at least 12 months).")
        return
        
    print(f"Total months of data: {len(monthly_rev)}")
    
    # Train-test split (last 6 months for testing)
    train = monthly_rev[:-6]
    test = monthly_rev[-6:]
    
    print("\n--- Model Evaluation (Last 6 Months) ---")
    
    # 1. Baseline / Moving Average (3-month)
    ma_preds = train['revenue'].rolling(window=3).mean().iloc[-1]
    ma_predictions = [ma_preds] * len(test)
    
    ma_mae = mean_absolute_error(test['revenue'], ma_predictions)
    ma_mape = mean_absolute_percentage_error(test['revenue'], ma_predictions)
    print(f"Baseline Moving Average - MAE: {ma_mae:.2f}, MAPE: {ma_mape:.2f}%")
    
    # 2. ARIMA
    print("Training ARIMA Model...")
    arima_model = ARIMA(train['revenue'], order=(1, 1, 1))
    arima_fit = arima_model.fit()
    arima_preds = arima_fit.forecast(steps=len(test))
    
    arima_mae = mean_absolute_error(test['revenue'], arima_preds)
    arima_mape = mean_absolute_percentage_error(test['revenue'], arima_preds)
    print(f"ARIMA(1,1,1) - MAE: {arima_mae:.2f}, MAPE: {arima_mape:.2f}%")
    
    # Forecasting the future (next 6 months) based on ALL data
    print("\n--- Future Forecasting (Next 6 Months) ---")
    final_model = ARIMA(monthly_rev['revenue'], order=(1, 1, 1))
    final_fit = final_model.fit()
    
    # Get forecast and confidence intervals
    forecast_obj = final_fit.get_forecast(steps=6)
    forecast_values = forecast_obj.predicted_mean
    conf_int = forecast_obj.conf_int(alpha=0.05)
    
    last_month = monthly_rev['month'].iloc[-1]
    future_months = [last_month + pd.DateOffset(months=i) for i in range(1, 7)]
    
    forecast_df = pd.DataFrame({
        'month': future_months,
        'forecast_revenue': forecast_values.values,
        'lower_bound_95': conf_int.iloc[:, 0].values,
        'upper_bound_95': conf_int.iloc[:, 1].values
    })
    
    print(forecast_df)
    
    output_path = f"{OUTPUT_DIR}/revenue_forecast.csv"
    forecast_df.to_csv(output_path, index=False)
    
    # Also save historical for dashboard convenience
    hist_path = f"{OUTPUT_DIR}/historical_revenue.csv"
    monthly_rev.to_csv(hist_path, index=False)
    
    print(f"\nForecasting complete. Saved to {output_path}")

if __name__ == "__main__":
    run_forecasting()
