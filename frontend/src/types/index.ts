export interface CompanyMetadata {
  company_id: string;
  company_name: string;
  company_slug: string;
  logo_badge: string;
  brand_color?: string;
  industry: string;
  description: string;
  dataset_source: string;
  dataset_status: string;
  dataset_file?: string | null;
  is_synthetic: boolean;
  base_currency?: 'INR' | 'USD' | 'GBP' | 'BRL';
  total_revenue?: number;
  total_orders?: number;
  total_customers?: number;
  data_quality_score?: number;
  has_profit_data?: boolean;
  has_forecast_data?: boolean;
  data_source_details?: {
    provenance: string;
    citation: string;
    limitations: string;
    supported_analytics: string[];
    unsupported_analytics: string[];
  };
  supported_modules?: string[];
  created_at?: string;
  live_kpis?: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    profit_margin: number;
    revenue_growth: number;
  };
}

export interface CurrencyRateResponse {
  base: string;
  rates: {
    USD: number;
    INR: number;
    GBP?: number;
    BRL?: number;
  };
  last_updated: string;
  source: string;
}

export interface ColumnSummary {
  column_name: string;
  data_type: 'string' | 'numeric' | 'datetime' | 'boolean';
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  mapped_to: string;
}

export interface ValidationReport {
  is_valid: boolean;
  total_rows: number;
  total_columns: number;
  duplicate_rows: number;
  errors: string[];
  warnings: string[];
  column_summary: ColumnSummary[];
  suggested_mapping: Record<string, string>;
  available_target_fields: Record<string, string>;
}

export interface DatasetPreviewResponse {
  file_name: string;
  file_size_bytes: number;
  total_rows: number;
  total_columns: number;
  columns: string[];
  validation: ValidationReport;
  preview_rows: Record<string, any>[];
}

export type DatasetStatus = 'NO_DATASET' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'REMOVING';

export interface DatasetStatusResponse {
  company_id: string;
  company_name?: string;
  dataset_status: DatasetStatus | string;
  dataset_file?: string | null;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  data_quality_score: number;
  has_profit_data: boolean;
  has_forecast_data: boolean;
  base_currency: 'INR' | 'USD';
  uploaded_at?: string | null;
}

export interface DatasetProfileResponse {
  original_filename?: string | null;
  rows_received: number;
  rows_cleaned: number;
  rows_rejected: number;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  has_cost_data: boolean;
  has_forecast_data: boolean;
  data_quality_score: number;
  date_range: string;
  supported_analytics: string[];
  unsupported_analytics: string[];
  uploaded_at?: string;
}

export interface PaginatedDatasetResponse {
  total_records: number;
  page: number;
  limit: number;
  total_pages: number;
  columns: string[];
  rows: Record<string, any>[];
}

export interface FilterOptions {
  min_date: string;
  max_date: string;
  categories: string[];
  regions: string[];
  channels: string[];
  segments: string[];
  brands: string[];
}

export interface FilterState {
  startDate?: string;
  endDate?: string;
  category?: string;
  region?: string;
  channel?: string;
  segment?: string;
  datePreset?: string;
}

export interface ExecutiveKpis {
  total_revenue: number;
  total_profit: number;
  total_orders: number;
  total_customers: number;
  aov: number;
  profit_margin: number;
  retention_rate: number;
  revenue_growth: number;
  prev_revenue: number;
  prev_profit: number;
  prev_orders: number;
  prev_customers: number;
  prev_aov: number;
  prev_profit_margin: number;
  prev_retention_rate: number;
  revenue_change_pct: number;
  profit_change_pct: number;
  orders_change_pct: number;
  customers_change_pct: number;
  aov_change_pct: number;
  margin_change_pct: number;
  retention_change_pct: number;
}

export interface RevenueTrendItem {
  month: string;
  month_label: string;
  revenue: number;
  profit: number;
  orders: number;
  customers: number;
  margin: number;
  mom_growth: number;
  yoy_growth: number;
}

export interface CategoryRevenueItem {
  category: string;
  revenue: number;
  profit: number;
  orders: number;
  units_sold: number;
  margin: number;
  share_pct: number;
}

export interface RegionRevenueItem {
  region: string;
  state: string;
  revenue: number;
  profit: number;
  orders: number;
  customers: number;
}

export interface TopProductItem {
  product_id: number;
  product_name: string;
  category: string;
  revenue: number;
  profit: number;
  units_sold: number;
  margin: number;
}

export interface CustomerKpis {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  returning_customers: number;
  repeat_purchase_rate: number;
  avg_clv: number;
  churn_rate: number;
  high_risk_customers: number;
  revenue_at_risk: number;
  repeat_customers: number;
}

export interface CustomerSegmentItem {
  name: string;
  segment: string;
  value: number;
  count: number;
  percentage: number;
  total_revenue: number;
  avg_spend: number;
  avg_orders: number;
  color: string;
}

export interface ChurnModelItem {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  is_selected: boolean;
  reason: string;
}

export interface ChurnFeatureItem {
  feature: string;
  importance: number;
}

export interface ChurnRiskItem {
  name: string;
  risk_level: string;
  value: number;
  count: number;
  percentage: number;
  revenue_at_risk: number;
  color: string;
}

export interface ChurnAnalytics {
  distribution: ChurnRiskItem[];
  models: ChurnModelItem[];
  feature_importance: ChurnFeatureItem[];
}

export interface ClvDistributionItem {
  range: string;
  customers: number;
  revenue: number;
  percentage: number;
}

export interface CustomerRetentionItem {
  month: string;
  month_label: string;
  starting_customers: number;
  retained_customers: number;
  retention_rate: number;
}

export interface CustomerRecord {
  customer_id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  channel: string;
  orders_count: number;
  total_spent: number;
  aov: number;
  last_order_date: string;
  rfm_segment: string;
  churn_probability: number;
  risk_level: string;
}

export interface CustomerTableResponse {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  customers: CustomerRecord[];
}

export interface ProductKpis {
  total_products: number;
  active_products: number;
  units_sold: number;
  revenue: number;
  profit: number;
  avg_margin: number;
  avg_return_rate: number;
  best_selling_product: string;
  most_profitable_product: string;
}

export interface ProductMatrix {
  stars_count: number;
  stars_revenue: number;
  volume_drivers_count: number;
  volume_drivers_revenue: number;
  high_margin_gems_count: number;
  high_margin_gems_revenue: number;
  underperformers_count: number;
  underperformers_revenue: number;
  median_revenue: number;
  median_profit: number;
}

export interface ScatterProductItem {
  product_id: number;
  product_name: string;
  category: string;
  revenue: number;
  profit: number;
  margin: number;
  units_sold: number;
  return_rate: number;
}

export interface ProductPerformance {
  category_performance: CategoryRevenueItem[];
  top_by_revenue: TopProductItem[];
  top_by_profit: TopProductItem[];
  scatter_data: ScatterProductItem[];
  matrix: ProductMatrix;
}

export interface ProductRecord {
  product_id: number;
  product_name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  cost: number;
  stock_quantity: number;
  units_sold: number;
  revenue: number;
  profit: number;
  margin: number;
  return_rate: number;
  return_count: number;
}

export interface ProductTableResponse {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  products: ProductRecord[];
}

export interface ForecastPoint {
  month: string;
  month_label: string;
  actual_revenue: number | null;
  forecast_revenue: number | null;
  lower_bound_95: number | null;
  upper_bound_95: number | null;
}

export interface ForecastModelMetric {
  model: string;
  mae: number;
  rmse: number;
  mape: number;
  is_selected: boolean;
  description: string;
}

export interface ForecastResponse {
  horizon_months: number;
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  combined: ForecastPoint[];
  total_projected_revenue: number;
  expected_growth: number;
  models: ForecastModelMetric[];
  selected_model: string;
  forecast_accuracy: string;
}

export interface CohortMonthData {
  month_index: number;
  percentage: number | null;
  count: number | null;
}

export interface CohortRow {
  cohort: string;
  cohort_label: string;
  cohort_size: number;
  retention: CohortMonthData[];
}

export interface CohortResponse {
  max_months: number;
  cohorts: CohortRow[];
}

export interface MarketingKpis {
  total_spend: number;
  total_revenue: number;
  overall_roas: number;
  overall_cac: number;
  conversion_rate: number;
  ctr: number;
  total_clicks: number;
  total_impressions: number;
}

export interface MarketingChannelItem {
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
  roas: number;
  cac: number;
  ctr: number;
  conversion_rate: number;
}

export interface MarketingCampaignItem {
  campaign_id: number;
  campaign_name: string;
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
  roas: number;
  cac: number;
}

export interface MarketingHighlights {
  best_channel_by_roas: string;
  best_roas: number;
  worst_channel_by_roas: string;
  worst_roas: number;
  highest_cac_channel: string;
  highest_cac: number;
  highest_revenue_channel: string;
  highest_revenue: number;
}

export interface MarketingResponse {
  kpis: MarketingKpis;
  channels: MarketingChannelItem[];
  campaigns: MarketingCampaignItem[];
  highlights: MarketingHighlights;
}

export interface BusinessInsight {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'positive' | 'info';
  finding: string;
  why_it_matters: string;
  recommendation: string;
  expected_impact: string;
}
