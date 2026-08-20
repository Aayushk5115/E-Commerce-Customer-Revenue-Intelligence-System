import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, RefreshCw, Filter, Clock, ArrowLeft } from 'lucide-react';
import { CompanySwitcher } from '../common/CompanySwitcher';
import { CurrencySelector } from '../common/CurrencySelector';
import type { FilterState, CompanyMetadata } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  filters: FilterState;
  lastUpdated: string;
  currentCompanyId?: string;
  onCompanyChange?: (company: CompanyMetadata) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  onRefresh,
  isRefreshing,
  filters,
  lastUpdated,
  currentCompanyId,
  onCompanyChange,
}) => {
  const navigate = useNavigate();

  // Count active non-default filters
  const activeFilterCount = [
    filters.category && filters.category !== 'All' ? `Cat: ${filters.category}` : null,
    filters.region && filters.region !== 'All' ? `Reg: ${filters.region}` : null,
    filters.channel && filters.channel !== 'All' ? `Chan: ${filters.channel}` : null,
    filters.segment && filters.segment !== 'All' ? `Seg: ${filters.segment}` : null,
    filters.datePreset && filters.datePreset !== 'all' ? filters.datePreset.toUpperCase() : null,
  ].filter(Boolean);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Side: Mobile Menu, Back to Home & Company Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>

          {/* Back to Home / Company Catalog */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Return to Companies Catalog"
            aria-label="Return to Companies Catalog"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Company Switcher Dropdown */}
          <CompanySwitcher
            currentCompanyId={currentCompanyId}
            onCompanyChange={onCompanyChange}
          />

          <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Active Filter Pills & Refresh Action */}
        <div className="flex items-center flex-wrap gap-2.5 justify-between md:justify-end">
          {/* Active Filter Pills */}
          {activeFilterCount.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full">
                <Filter size={11} className="text-blue-500" />
                {activeFilterCount.length} Active:
              </span>
              {activeFilterCount.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-full"
                >
                  {f}
                </span>
              ))}
              {activeFilterCount.length > 3 && (
                <span className="text-[10px] text-slate-400 font-bold">
                  +{activeFilterCount.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Currency Selector (₹ INR / $ USD) */}
          <CurrencySelector />

          {/* Last Updated Timestamp */}
          <div className="hidden lg:flex items-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Clock size={13} className="mr-1.5 text-slate-400" />
            <span>Updated {lastUpdated}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={`${isRefreshing ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
