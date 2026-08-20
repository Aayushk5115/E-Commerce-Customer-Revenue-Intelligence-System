import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Database,
} from 'lucide-react';
import { fetchCompanies } from '../services/api';
import type { CompanyMetadata } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchCompanies()
      .then((data) => {
        if (isMounted) {
          setCompanies(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load companies:', err);
          setError('Unable to load company catalog. Please check backend connection.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const industries = ['All', ...Array.from(new Set(companies.map((c) => c.industry)))];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const formatNumber = (val?: number) => {
    if (!val) return '0';
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-emerald-600/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between pb-8 border-b border-slate-800/60 mb-12">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">
                E-Commerce Intelligence Platform
              </span>
              <span className="text-xs font-medium text-slate-400">
                Multi-Tenant Revenue & Customer BI System
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-400 border border-blue-800/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API v3.0 Online
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto pt-4 pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 mb-6 shadow-inner backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            <span>Select a Company to Explore Live Intelligence & ML Forecasts</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight leading-[1.15] mb-6">
            E-Commerce Customer &<br />Revenue Intelligence
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Data-driven insights into customers, revenue, products, and predictive business performance across enterprise partner ecosystems.
          </p>

          {/* Quick Platform Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
                <Users size={14} />
                <span>RFM Segmentation</span>
              </div>
              <p className="text-[11px] text-slate-400">9 automated cluster tiers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
                <BarChart3 size={14} />
                <span>ARIMA Forecasting</span>
              </div>
              <p className="text-[11px] text-slate-400">95% confidence bounds</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                <Zap size={14} />
                <span>Churn AI Scoring</span>
              </div>
              <p className="text-[11px] text-slate-400">Random Forest classifier</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <ShieldCheck size={14} />
                <span>Strict Tenant Isolation</span>
              </div>
              <p className="text-[11px] text-slate-400">Zero cross-company leak</p>
            </div>
          </div>
        </section>

        {/* Section Divider & Heading */}
        <section id="companies" className="pt-6 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 size={16} />
                <span>Analytics Partners / Companies</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Select a Company Dashboard
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choose any enterprise below to load its dedicated analytics suite, KPIs, and ML predictions.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search companies or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
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
                onClick={() => window.location.reload()}
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
                return (
                  <div
                    key={company.company_id}
                    onClick={() => navigate(`/company/${company.company_id}`)}
                    className="group relative rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer backdrop-blur-md"
                  >
                    {/* Top Card Section */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
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

                        {/* Dataset Status Tag */}
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {company.dataset_status || 'Active'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-5">
                        {company.description}
                      </p>

                      {/* Key Snapshot Stats */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                            Revenue
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {formatCurrency(company.total_revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                            Orders
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {formatNumber(company.total_orders)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                            Customers
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {formatNumber(company.total_customers)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <Database size={13} className="text-blue-400" />
                        <span className="truncate max-w-[160px]">{company.dataset_source}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/company/${company.company_id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm group-hover:gap-2 transition-all cursor-pointer"
                      >
                        <span>Explore Analytics</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredCompanies.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Building2 size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-sm">No companies match your filter.</p>
              <p className="text-slate-500 text-xs mt-1">Try clearing your search query or selecting 'All' industries.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustry('All');
                }}
                className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </section>

        {/* Architecture & Privacy Disclosure Section */}
        <section className="mt-12 pt-10 border-t border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                <Layers size={16} className="text-blue-400" />
                <span>Strict Multi-Tenant Isolation</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Every calculation, aggregation, and machine learning model executes strictly at the backend query level filtered by <code className="text-blue-300">company_id</code>. Zero cross-company data contamination.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                <Database size={16} className="text-indigo-400" />
                <span>Dynamic Schema Normalization</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Heterogeneous company CSV datasets with varying naming conventions (e.g. <code className="text-indigo-300">CustomerID</code> vs <code className="text-indigo-300">cust_id</code>) are automatically mapped and normalized on load.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>PII Masking & Privacy</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Real customer identifiers, full names, and email addresses are dynamically masked across all public table views to ensure complete compliance and privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© 2026 E-Commerce Customer & Revenue Intelligence System. Enterprise Multi-Company Architecture.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
