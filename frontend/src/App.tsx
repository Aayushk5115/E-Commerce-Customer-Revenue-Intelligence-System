import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { CustomerIntelligence } from './pages/CustomerIntelligence';
import { ProductIntelligence } from './pages/ProductIntelligence';
import { MarketingAnalytics } from './pages/MarketingAnalytics';
import { Forecasting } from './pages/Forecasting';
import { BusinessInsights } from './pages/BusinessInsights';
import { fetchFilterOptions, fetchCompanyDetail } from './services/api';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import type { FilterOptions, FilterState, CompanyMetadata } from './types';

// Page Title Mapping Helper
const getPageMeta = (pathname: string, companyName?: string) => {
  const compPrefix = companyName ? `${companyName} • ` : '';
  if (pathname.includes('/customers')) {
    return {
      title: `${compPrefix}Customer Intelligence & Churn Analytics`,
      subtitle: 'RFM segmentation, machine learning churn risk scoring, CLV distribution, and cohort retention.',
    };
  }
  if (pathname.includes('/products')) {
    return {
      title: `${compPrefix}Product & Merchandise Intelligence`,
      subtitle: 'Category profitability, top SKU sales, return rate diagnostics, and 2x2 portfolio performance matrix.',
    };
  }
  if (pathname.includes('/marketing')) {
    return {
      title: `${compPrefix}Marketing & Acquisition Analytics`,
      subtitle: 'Cross-channel ROAS, customer acquisition costs (CAC), conversion funnels, and campaign performance.',
    };
  }
  if (pathname.includes('/forecast')) {
    return {
      title: `${compPrefix}Predictive Revenue Forecasting (ARIMA)`,
      subtitle: 'Time-series predictive modeling with 95% confidence intervals and multi-horizon growth projections.',
    };
  }
  if (pathname.includes('/insights')) {
    return {
      title: `${compPrefix}Dynamic Business Insights & Prescriptive Engine`,
      subtitle: 'Automated rules-driven findings, actionable recommendations, and estimated revenue impact.',
    };
  }
  return {
    title: `${compPrefix}Executive Financial & Revenue Overview`,
    subtitle: 'High-level business KPIs, growth trajectories, category breakdown, and customer segment health.',
  };
};

const CompanyDashboardLayout: React.FC = () => {
  const { companyId = 'company-1' } = useParams<{ companyId: string }>();
  const location = useLocation();
  const { setCompanyBaseCurrency } = useCurrency();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [company, setCompany] = useState<CompanyMetadata | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    datePreset: 'all',
    category: 'All',
    region: 'All',
    channel: 'All',
    segment: 'All',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Fetch company metadata and sync base currency
  useEffect(() => {
    fetchCompanyDetail(companyId)
      .then((c) => {
        setCompany(c);
        if (c.base_currency) {
          setCompanyBaseCurrency(c.base_currency);
        }
      })
      .catch((err) => console.error('Failed to load company detail:', err));
  }, [companyId, setCompanyBaseCurrency]);

  // Load filter limits and options for active company
  useEffect(() => {
    fetchFilterOptions(companyId)
      .then((opts) => {
        setFilterOptions(opts);
        setFilters((prev) => ({
          ...prev,
          startDate: undefined,
          endDate: undefined,
        }));
      })
      .catch((err) => console.error('Failed to load filter options:', err));
  }, [companyId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setFilters((prev) => ({ ...prev }));
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 600);
  };

  const handleResetFilters = () => {
    if (filterOptions) {
      setFilters({
        datePreset: 'all',
        startDate: undefined,
        endDate: undefined,
        category: 'All',
        region: 'All',
        channel: 'All',
        segment: 'All',
      });
    }
  };

  const meta = getPageMeta(location.pathname, company?.company_name);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentCompanyId={companyId}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Sticky Header with Company Switcher & Currency Selector */}
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          filters={filters}
          lastUpdated={lastUpdated}
          currentCompanyId={companyId}
          onCompanyChange={(c) => {
            setCompany(c);
            if (c.base_currency) {
              setCompanyBaseCurrency(c.base_currency);
            }
          }}
        />

        {/* Company Analytics Sub-modules */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ExecutiveOverview
                  filterOptions={filterOptions}
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  companyId={companyId}
                />
              }
            />
            <Route
              path="customers"
              element={<CustomerIntelligence filters={filters} companyId={companyId} />}
            />
            <Route
              path="products"
              element={
                <ProductIntelligence
                  filterOptions={filterOptions}
                  filters={filters}
                  companyId={companyId}
                />
              }
            />
            <Route
              path="marketing"
              element={<MarketingAnalytics companyId={companyId} />}
            />
            <Route
              path="forecast"
              element={<Forecasting companyId={companyId} />}
            />
            <Route
              path="insights"
              element={<BusinessInsights filters={filters} companyId={companyId} />}
            />
            <Route
              path="*"
              element={
                <ExecutiveOverview
                  filterOptions={filterOptions}
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  companyId={companyId}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CurrencyProvider>
      <Router>
        <Routes>
          {/* Public Home Page - Company Catalog & Platform Overview */}
          <Route path="/" element={<HomePage />} />

          {/* Company-Specific Analytics Dashboard Route */}
          <Route path="/company/:companyId/*" element={<CompanyDashboardLayout />} />

          {/* Legacy route redirects for backward compatibility */}
          <Route path="/customers" element={<Navigate to="/company/company-1/customers" replace />} />
          <Route path="/products" element={<Navigate to="/company/company-1/products" replace />} />
          <Route path="/marketing" element={<Navigate to="/company/company-1/marketing" replace />} />
          <Route path="/forecast" element={<Navigate to="/company/company-1/forecast" replace />} />
          <Route path="/insights" element={<Navigate to="/company/company-1/insights" replace />} />

          {/* Catch-all redirect to Home Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

