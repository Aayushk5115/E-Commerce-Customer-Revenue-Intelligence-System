import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { CustomerIntelligence } from './pages/CustomerIntelligence';
import { ProductIntelligence } from './pages/ProductIntelligence';
import { MarketingAnalytics } from './pages/MarketingAnalytics';
import { Forecasting } from './pages/Forecasting';
import { BusinessInsights } from './pages/BusinessInsights';
import { fetchFilterOptions } from './services/api';
import type { FilterOptions, FilterState } from './types';

// Page Title Mapping Helper
const getPageMeta = (pathname: string) => {
  switch (pathname) {
    case '/':
      return {
        title: 'Executive Financial & Revenue Overview',
        subtitle: 'High-level business KPIs, growth trajectories, category breakdown, and customer segment health.',
      };
    case '/customers':
      return {
        title: 'Customer Intelligence & Churn Analytics',
        subtitle: 'RFM segmentation, machine learning churn risk scoring, CLV distribution, and cohort retention.',
      };
    case '/products':
      return {
        title: 'Product & Merchandise Intelligence',
        subtitle: 'Category profitability, top SKU sales, return rate diagnostics, and 2x2 portfolio performance matrix.',
      };
    case '/marketing':
      return {
        title: 'Marketing & Acquisition Analytics',
        subtitle: 'Cross-channel ROAS, customer acquisition costs (CAC), conversion funnels, and campaign performance.',
      };
    case '/forecast':
      return {
        title: 'Predictive Revenue Forecasting (ARIMA)',
        subtitle: 'Time-series predictive modeling with 95% confidence intervals and multi-horizon growth projections.',
      };
    case '/insights':
      return {
        title: 'Dynamic Business Insights & Prescriptive Engine',
        subtitle: 'Automated rules-driven findings, actionable recommendations, and estimated revenue impact.',
      };
    default:
      return {
        title: 'E-Commerce Intelligence Platform',
        subtitle: 'Real-time analytics and predictive data platform.',
      };
  }
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
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

  // Load initial filter limits and options
  useEffect(() => {
    fetchFilterOptions()
      .then((opts) => {
        setFilterOptions(opts);
        setFilters((prev) => ({
          ...prev,
          startDate: opts.min_date,
          endDate: opts.max_date,
        }));
      })
      .catch((err) => console.error('Failed to load filter options:', err));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger re-render of active components via filter clone or timestamp
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
        startDate: filterOptions.min_date,
        endDate: filterOptions.max_date,
        category: 'All',
        region: 'All',
        channel: 'All',
        segment: 'All',
      });
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Sticky Header */}
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          filters={filters}
          lastUpdated={lastUpdated}
        />

        {/* Page Body */}
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
                />
              }
            />
            <Route
              path="/customers"
              element={<CustomerIntelligence filters={filters} />}
            />
            <Route
              path="/products"
              element={
                <ProductIntelligence
                  filterOptions={filterOptions}
                  filters={filters}
                />
              }
            />
            <Route path="/marketing" element={<MarketingAnalytics />} />
            <Route path="/forecast" element={<Forecasting />} />
            <Route path="/insights" element={<BusinessInsights filters={filters} />} />
            {/* Catch-all redirect to Executive Overview */}
            <Route
              path="*"
              element={
                <ExecutiveOverview
                  filterOptions={filterOptions}
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
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
    <Router>
      <MainLayout />
    </Router>
  );
}
