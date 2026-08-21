import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  ArrowRight,
  Database,
  Users,
  ShoppingBag,
  Coins,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';
import { fetchCompaniesCatalog } from '../services/api';
import { AddCompanyModal } from '../components/common/AddCompanyModal';
import { DatasetDetailsModal } from '../components/common/DatasetDetailsModal';
import { DataSourceModal } from '../components/common/DataSourceModal';
import type { CompanyMetadata } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedCompanyForUpload, setSelectedCompanyForUpload] = useState<CompanyMetadata | null>(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState<CompanyMetadata | null>(null);
  const [selectedCompanyForDataSource, setSelectedCompanyForDataSource] = useState<CompanyMetadata | null>(null);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompaniesCatalog();
      setCompanies(data);
    } catch (err: any) {
      console.error('Error fetching companies catalog:', err);
      setError('Unable to load company analytics directory. Backend may be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleCompanyCreated = (newCompany: CompanyMetadata) => {
    setCompanies((prev) => {
      const exists = prev.some((c) => c.company_id === newCompany.company_id);
      if (exists) {
        return prev.map((c) => (c.company_id === newCompany.company_id ? newCompany : c));
      }
      return [newCompany, ...prev];
    });
  };

  const industries = ['All', ...Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)))];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dataset_source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const formatCurrency = (val?: number, currency: string = 'USD') => {
    if (!val) {
      if (currency === 'INR') return '₹0';
      if (currency === 'GBP') return '£0';
      if (currency === 'BRL') return 'R$0';
      return '$0';
    }
    if (currency === 'INR') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
      return `₹${val.toLocaleString('en-IN')}`;
    } else if (currency === 'GBP') {
      if (val >= 1000000) return `£${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `£${(val / 1000).toFixed(0)}k`;
      return `£${val.toLocaleString('en-GB')}`;
    } else if (currency === 'BRL') {
      if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
      return `R$ ${val.toLocaleString('pt-BR')}`;
    } else {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${val.toLocaleString('en-US')}`;
    }
  };

  const formatNumber = (val?: number) => {
    if (!val) return '0';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const getCurrencyLabel = (curr: string = 'USD') => {
    switch (curr) {
      case 'INR': return '₹ INR';
      case 'GBP': return '£ GBP';
      case 'BRL': return 'R$ BRL';
      default: return '$ USD';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>E-Commerce Intelligence</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Enterprise
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Public & Enterprise Multi-Company Analytics Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>+ Add Company Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-12 pb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-semibold mb-6 shadow-inner">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>100% Real Public Datasets • Zero Fabricated Numbers • Transparent Methodology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            E-Commerce Customer &{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Revenue Intelligence
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analyze real-world ecommerce transaction datasets from Google Analytics, UCI Machine Learning, and Olist. Explore RFM segmentation, customer lifetime metrics, and ARIMA revenue forecasting.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#companies"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-slate-900 shadow-xl transition-all cursor-pointer"
            >
              <span>Explore Company Analytics</span>
              <ArrowRight size={16} />
            </a>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>+ Add Company Data (CSV / Excel)</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 mb-1">
                <Users size={14} className="text-blue-400" />
                <span>RFM Segmentation</span>
              </div>
              <p className="text-[11px] text-slate-400">Authentic customer behavior clusters</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 mb-1">
                <TrendingUp size={14} className="text-emerald-400" />
                <span>ARIMA Forecast</span>
              </div>
              <p className="text-[11px] text-slate-400">Time-series 95% confidence bands</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 mb-1">
                <Zap size={14} className="text-amber-400" />
                <span>Funnel & Conversion</span>
              </div>
              <p className="text-[11px] text-slate-400">GA4 ecommerce multi-step funnel</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 mb-1">
                <Coins size={14} className="text-purple-400" />
                <span>USD, INR, GBP, BRL</span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-currency exchange engine</p>
            </div>
          </div>
        </section>

        {/* Section Divider & Heading */}
        <section id="companies" className="pt-6 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 size={16} />
                <span>Company Analytics Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Select a Company Dashboard
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Explore real company datasets or add a new custom enterprise dataset.
              </p>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search companies, datasets, or sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer shrink-0"
              >
                <FileSpreadsheet size={14} />
                <span>+ Add Company Data</span>
              </button>
            </div>
          </div>

          {/* Industry Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  selectedIndustry === ind
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="py-24 text-center">
              <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Loading participating companies...</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-center max-w-xl mx-auto my-8">
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={loadCatalog}
                className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Company Cards Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => {
                const color = company.brand_color || '#3b82f6';
                const baseCurr = company.base_currency || 'USD';
                const hasDataset = company.dataset_status !== 'NO_DATASET' && (company.total_orders || 0) > 0;

                return (
                  <div
                    key={company.company_id}
                    className="group relative rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-md"
                  >
                    {/* Top Card Section */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-3.5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10"
                            style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
                          >
                            {company.logo_badge || '🏢'}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
                              {company.company_name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                              {company.industry}
                            </span>
                          </div>
                        </div>

                        {/* Base Currency Badge */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${
                          baseCurr === 'INR'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            : baseCurr === 'GBP'
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                            : baseCurr === 'BRL'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        }`}>
                          <Coins size={11} />
                          <span>{getCurrencyLabel(baseCurr)}</span>
                        </span>
                      </div>

                      {/* Source Label & Provenance Badge */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/90 text-xs">
                          <div className="flex items-center space-x-1.5 truncate">
                            <Database size={13} className="text-blue-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-300 truncate">
                              {company.dataset_source}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedCompanyForDataSource(company)}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded-md border border-blue-800/60 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <Info size={10} />
                            <span>Data Source</span>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {company.description}
                      </p>
                    </div>

                    {/* Bottom Snapshot Metrics & Dual CTAs */}
                    <div>
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4 text-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Revenue</span>
                          <span className="text-xs font-bold text-slate-200">
                            {hasDataset ? formatCurrency(company.total_revenue, baseCurr) : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Orders</span>
                          <span className="text-xs font-bold text-slate-200">
                            {hasDataset ? formatNumber(company.total_orders) : '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Customers</span>
                          <span className="text-xs font-bold text-slate-200">
                            {hasDataset ? formatNumber(company.total_customers) : '0'}
                          </span>
                        </div>
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedCompanyForDetails(company)}
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-center cursor-pointer"
                        >
                          Dataset Details
                        </button>
                        <button
                          onClick={() => navigate(`/company/${company.company_id}`)}
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                          <span>Explore</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Search State */}
          {!loading && !error && filteredCompanies.length === 0 && (
            <div className="py-16 text-center">
              <Building2 size={40} className="text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No companies found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No company matched "{searchQuery}". Try a different keyword or add a new company dataset.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all cursor-pointer"
              >
                + Add Company Data
              </button>
            </div>
          )}
        </section>

        {/* Data Architecture & Privacy Disclosure */}
        <section className="py-10 border-t border-slate-800/80 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Multi-Tenant Query Isolation • Transparent Dataset Provenance • Zero Fabricated Numbers</span>
            </div>
            <div>
              <span>E-Commerce Customer & Revenue Intelligence System v3.3</span>
            </div>
          </div>
        </section>
      </main>

      {/* Add Company Modal Wizard */}
      <AddCompanyModal
        isOpen={isAddModalOpen || selectedCompanyForUpload !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedCompanyForUpload(null);
        }}
        targetCompany={selectedCompanyForUpload}
        onCompanyCreated={(comp) => {
          handleCompanyCreated(comp);
          setIsAddModalOpen(false);
          setSelectedCompanyForUpload(null);
          loadCatalog();
        }}
      />

      {/* Dataset Details Modal */}
      {selectedCompanyForDetails && (
        <DatasetDetailsModal
          isOpen={true}
          onClose={() => setSelectedCompanyForDetails(null)}
          company={selectedCompanyForDetails}
          onDatasetRemoved={() => {
            setSelectedCompanyForDetails(null);
            loadCatalog();
          }}
          onUploadDataset={() => {
            setSelectedCompanyForUpload(selectedCompanyForDetails);
            setSelectedCompanyForDetails(null);
          }}
        />
      )}

      {/* Data Source & Methodology Modal */}
      {selectedCompanyForDataSource && (
        <DataSourceModal
          isOpen={true}
          onClose={() => setSelectedCompanyForDataSource(null)}
          company={selectedCompanyForDataSource}
        />
      )}
    </div>
  );
};

export default HomePage;
