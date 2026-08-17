import axios from 'axios';
import type {
  FilterOptions,
  FilterState,
  ExecutiveKpis,
  RevenueTrendItem,
  CategoryRevenueItem,
  RegionRevenueItem,
  TopProductItem,
  CustomerKpis,
  CustomerSegmentItem,
  ChurnAnalytics,
  ClvDistributionItem,
  CustomerRetentionItem,
  CustomerTableResponse,
  ProductKpis,
  ProductPerformance,
  ProductTableResponse,
  ForecastResponse,
  CohortResponse,
  MarketingResponse,
  BusinessInsight,
} from '../types';

const getBaseUrl = (): string => {
  let rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').trim();
  // Remove trailing slashes
  rawUrl = rawUrl.replace(/\/+$/, '');
  // If the user provided URL without /api, append it automatically
  if (!rawUrl.endsWith('/api') && !rawUrl.includes('/api/')) {
    rawUrl = `${rawUrl}/api`;
  }
  return rawUrl;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to support Render free tier cold-start wakeups
});

const buildParams = (filters?: FilterState) => {
  const params: Record<string, string> = {};
  if (!filters) return params;

  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  if (filters.category && filters.category !== 'All') params.category = filters.category;
  if (filters.region && filters.region !== 'All') params.region = filters.region;
  if (filters.channel && filters.channel !== 'All') params.channel = filters.channel;
  if (filters.segment && filters.segment !== 'All') params.segment = filters.segment;

  return params;
};

export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const res = await api.get<FilterOptions>('/filters');
  return res.data;
};

export const fetchExecutiveKpis = async (filters?: FilterState): Promise<ExecutiveKpis> => {
  const res = await api.get<ExecutiveKpis>('/kpis', { params: buildParams(filters) });
  return res.data;
};

export const fetchRevenueTrend = async (filters?: FilterState): Promise<RevenueTrendItem[]> => {
  const res = await api.get<RevenueTrendItem[]>('/revenue/trend', { params: buildParams(filters) });
  return res.data;
};

export const fetchRevenueByCategory = async (filters?: FilterState): Promise<CategoryRevenueItem[]> => {
  const res = await api.get<CategoryRevenueItem[]>('/revenue/by-category', { params: buildParams(filters) });
  return res.data;
};

export const fetchRevenueByRegion = async (filters?: FilterState, limit: number = 10): Promise<RegionRevenueItem[]> => {
  const res = await api.get<RegionRevenueItem[]>('/revenue/by-region', {
    params: { ...buildParams(filters), limit },
  });
  return res.data;
};

export const fetchTopProducts = async (filters?: FilterState, limit: number = 10): Promise<TopProductItem[]> => {
  const res = await api.get<TopProductItem[]>('/revenue/top-products', {
    params: { ...buildParams(filters), limit },
  });
  return res.data;
};

export const fetchCustomerKpis = async (filters?: FilterState): Promise<CustomerKpis> => {
  const res = await api.get<CustomerKpis>('/customers/kpis', { params: buildParams(filters) });
  return res.data;
};

export const fetchCustomerSegments = async (): Promise<CustomerSegmentItem[]> => {
  const res = await api.get<CustomerSegmentItem[]>('/customers/segments');
  return res.data;
};

export const fetchChurnAnalytics = async (): Promise<ChurnAnalytics> => {
  const res = await api.get<ChurnAnalytics>('/customers/churn');
  return res.data;
};

export const fetchClvDistribution = async (): Promise<ClvDistributionItem[]> => {
  const res = await api.get<ClvDistributionItem[]>('/customers/clv-distribution');
  return res.data;
};

export const fetchCustomerRetentionTrend = async (): Promise<CustomerRetentionItem[]> => {
  const res = await api.get<CustomerRetentionItem[]>('/customers/retention-trend');
  return res.data;
};

export const fetchCustomersTable = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  segment?: string,
  riskLevel?: string,
  sortBy: string = 'total_spent',
  sortOrder: string = 'desc'
): Promise<CustomerTableResponse> => {
  const res = await api.get<CustomerTableResponse>('/customers', {
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
      segment: segment !== 'All' ? segment : undefined,
      risk_level: riskLevel !== 'All' ? riskLevel : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    },
  });
  return res.data;
};

export const fetchProductKpis = async (filters?: FilterState, brand?: string): Promise<ProductKpis> => {
  const res = await api.get<ProductKpis>('/products/kpis', {
    params: { ...buildParams(filters), brand: brand !== 'All' ? brand : undefined },
  });
  return res.data;
};

export const fetchProductPerformance = async (filters?: FilterState, brand?: string): Promise<ProductPerformance> => {
  const res = await api.get<ProductPerformance>('/products/performance', {
    params: { ...buildParams(filters), brand: brand !== 'All' ? brand : undefined },
  });
  return res.data;
};

export const fetchProductsTable = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  category?: string,
  brand?: string,
  sortBy: string = 'revenue',
  sortOrder: string = 'desc'
): Promise<ProductTableResponse> => {
  const res = await api.get<ProductTableResponse>('/products', {
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      brand: brand !== 'All' ? brand : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    },
  });
  return res.data;
};

export const fetchForecast = async (horizon: number = 6): Promise<ForecastResponse> => {
  const res = await api.get<ForecastResponse>('/forecast', { params: { horizon } });
  return res.data;
};

export const fetchCohorts = async (): Promise<CohortResponse> => {
  const res = await api.get<CohortResponse>('/cohorts');
  return res.data;
};

export const fetchMarketing = async (): Promise<MarketingResponse> => {
  const res = await api.get<MarketingResponse>('/marketing');
  return res.data;
};

export const fetchInsights = async (filters?: FilterState): Promise<BusinessInsight[]> => {
  const res = await api.get<BusinessInsight[]>('/insights', { params: buildParams(filters) });
  return res.data;
};

// CSV Export Helper Utility
export const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default api;
