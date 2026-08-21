import axios from 'axios';
import type {
  CompanyMetadata,
  CurrencyRateResponse,
  DatasetPreviewResponse,
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
  rawUrl = rawUrl.replace(/\/+$/, '');
  if (!rawUrl.endsWith('/api') && !rawUrl.includes('/api/')) {
    rawUrl = `${rawUrl}/api`;
  }
  return rawUrl;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
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

// ==========================================
// 0. CURRENCY EXCHANGE API
// ==========================================
export const fetchCurrencyRates = async (): Promise<CurrencyRateResponse> => {
  const res = await api.get<CurrencyRateResponse>('/currency/rates');
  return res.data;
};

// ==========================================
// 1. DATASET UPLOAD & COMPANY CREATION
// ==========================================
export const previewDatasetFile = async (file: File): Promise<DatasetPreviewResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<DatasetPreviewResponse>('/upload/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  });
  return res.data;
};

export const createCompanyWithDataset = async (
  formData: FormData
): Promise<{ status: string; message: string; company: CompanyMetadata }> => {
  const res = await api.post<{ status: string; message: string; company: CompanyMetadata }>(
    '/companies/create-with-dataset',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    }
  );
  return res.data;
};

export const createCompanyProfile = async (
  companyData: Partial<CompanyMetadata>
): Promise<{ status: string; message: string; company: CompanyMetadata }> => {
  const res = await api.post<{ status: string; message: string; company: CompanyMetadata }>(
    '/companies',
    companyData
  );
  return res.data;
};

export const uploadCompanyDataset = async (
  companyId: string,
  file: File,
  columnMapping?: Record<string, string>
): Promise<{ status: string; message: string; company: CompanyMetadata; profile: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (columnMapping) {
    formData.append('column_mapping', json_stringify_clean(columnMapping));
  }
  const res = await api.post<{ status: string; message: string; company: CompanyMetadata; profile: any }>(
    `/companies/${companyId}/dataset/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    }
  );
  return res.data;
};

const json_stringify_clean = (obj: any) => JSON.stringify(obj);

export const fetchDatasetStatus = async (companyId: string): Promise<any> => {
  const res = await api.get(`/companies/${companyId}/dataset/status`);
  return res.data;
};

export const fetchDatasetProfile = async (companyId: string): Promise<any> => {
  const res = await api.get(`/companies/${companyId}/dataset/profile`);
  return res.data;
};

export const fetchDatasetPreview = async (companyId: string): Promise<any> => {
  const res = await api.get(`/companies/${companyId}/dataset/preview`);
  return res.data;
};

export const fetchRawDataset = async (
  companyId: string,
  page: number = 1,
  limit: number = 100,
  search: string = ''
): Promise<any> => {
  const res = await api.get(`/companies/${companyId}/dataset`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const deleteCompanyDataset = async (
  companyId: string
): Promise<{ status: string; message: string; company: CompanyMetadata }> => {
  const res = await api.delete<{ status: string; message: string; company: CompanyMetadata }>(
    `/companies/${companyId}/dataset`
  );
  return res.data;
};

// ==========================================
// 2. COMPANY REGISTRY & DISCOVERY
// ==========================================
export const fetchCompanies = async (): Promise<CompanyMetadata[]> => {
  const res = await api.get<CompanyMetadata[]>('/companies');
  return res.data;
};

export const fetchCompaniesCatalog = fetchCompanies;

export const fetchCompanyDetail = async (companyId: string = 'company-1'): Promise<CompanyMetadata> => {
  const res = await api.get<CompanyMetadata>(`/companies/${companyId}`);
  return res.data;
};

// ==========================================
// 2. COMPANY-AWARE ANALYTICS APIs
// ==========================================
export const fetchFilterOptions = async (companyId: string = 'company-1'): Promise<FilterOptions> => {
  const res = await api.get<FilterOptions>(`/companies/${companyId}/filters`);
  return res.data;
};

export const fetchExecutiveKpis = async (
  companyId: string = 'company-1',
  filters?: FilterState
): Promise<ExecutiveKpis> => {
  const res = await api.get<ExecutiveKpis>(`/companies/${companyId}/kpis`, { params: buildParams(filters) });
  return res.data;
};

export const fetchRevenueTrend = async (
  companyId: string = 'company-1',
  filters?: FilterState
): Promise<RevenueTrendItem[]> => {
  const res = await api.get<RevenueTrendItem[]>(`/companies/${companyId}/revenue/trend`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const fetchRevenueByCategory = async (
  companyId: string = 'company-1',
  filters?: FilterState
): Promise<CategoryRevenueItem[]> => {
  const res = await api.get<CategoryRevenueItem[]>(`/companies/${companyId}/revenue/by-category`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const fetchRevenueByRegion = async (
  companyId: string = 'company-1',
  filters?: FilterState,
  limit: number = 10
): Promise<RegionRevenueItem[]> => {
  const res = await api.get<RegionRevenueItem[]>(`/companies/${companyId}/revenue/by-region`, {
    params: { ...buildParams(filters), limit },
  });
  return res.data;
};

export const fetchTopProducts = async (
  companyId: string = 'company-1',
  filters?: FilterState,
  limit: number = 10
): Promise<TopProductItem[]> => {
  const res = await api.get<TopProductItem[]>(`/companies/${companyId}/revenue/top-products`, {
    params: { ...buildParams(filters), limit },
  });
  return res.data;
};

export const fetchCustomerKpis = async (
  companyId: string = 'company-1',
  filters?: FilterState
): Promise<CustomerKpis> => {
  const res = await api.get<CustomerKpis>(`/companies/${companyId}/customers/kpis`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const fetchCustomerSegments = async (companyId: string = 'company-1'): Promise<CustomerSegmentItem[]> => {
  const res = await api.get<CustomerSegmentItem[]>(`/companies/${companyId}/customers/segments`);
  return res.data;
};

export const fetchChurnAnalytics = async (companyId: string = 'company-1'): Promise<ChurnAnalytics> => {
  const res = await api.get<ChurnAnalytics>(`/companies/${companyId}/customers/churn`);
  return res.data;
};

export const fetchClvDistribution = async (companyId: string = 'company-1'): Promise<ClvDistributionItem[]> => {
  const res = await api.get<ClvDistributionItem[]>(`/companies/${companyId}/customers/clv`);
  return res.data;
};

export const fetchCustomerRetentionTrend = async (
  companyId: string = 'company-1'
): Promise<CustomerRetentionItem[]> => {
  const res = await api.get<CustomerRetentionItem[]>(`/companies/${companyId}/customers/retention`);
  return res.data;
};

export const fetchCustomersTable = async (
  companyId: string = 'company-1',
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  segment?: string,
  riskLevel?: string,
  sortBy: string = 'total_spent',
  sortOrder: string = 'desc'
): Promise<CustomerTableResponse> => {
  const res = await api.get<CustomerTableResponse>(`/companies/${companyId}/customers`, {
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

export const fetchProductKpis = async (
  companyId: string = 'company-1',
  filters?: FilterState,
  brand?: string
): Promise<ProductKpis> => {
  const res = await api.get<ProductKpis>(`/companies/${companyId}/products/kpis`, {
    params: { ...buildParams(filters), brand: brand !== 'All' ? brand : undefined },
  });
  return res.data;
};

export const fetchProductPerformance = async (
  companyId: string = 'company-1',
  filters?: FilterState,
  brand?: string
): Promise<ProductPerformance> => {
  const res = await api.get<ProductPerformance>(`/companies/${companyId}/products/performance`, {
    params: { ...buildParams(filters), brand: brand !== 'All' ? brand : undefined },
  });
  return res.data;
};

export const fetchProductsTable = async (
  companyId: string = 'company-1',
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  category?: string,
  brand?: string,
  sortBy: string = 'revenue',
  sortOrder: string = 'desc'
): Promise<ProductTableResponse> => {
  const res = await api.get<ProductTableResponse>(`/companies/${companyId}/products`, {
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

export const fetchForecast = async (
  companyId: string = 'company-1',
  horizon: number = 6
): Promise<ForecastResponse> => {
  const res = await api.get<ForecastResponse>(`/companies/${companyId}/forecast`, { params: { horizon } });
  return res.data;
};

export const fetchCohorts = async (companyId: string = 'company-1'): Promise<CohortResponse> => {
  const res = await api.get<CohortResponse>(`/companies/${companyId}/cohorts`);
  return res.data;
};

export const fetchMarketing = async (companyId: string = 'company-1'): Promise<MarketingResponse> => {
  const res = await api.get<MarketingResponse>(`/companies/${companyId}/marketing`);
  return res.data;
};

export const fetchInsights = async (
  companyId: string = 'company-1',
  filters?: FilterState
): Promise<BusinessInsight[]> => {
  const res = await api.get<BusinessInsight[]>(`/companies/${companyId}/insights`, {
    params: buildParams(filters),
  });
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
