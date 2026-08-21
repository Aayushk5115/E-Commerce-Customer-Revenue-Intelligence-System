import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, RefreshCw, Filter, Clock, ArrowLeft, Table, Trash2, UploadCloud, Database, Info } from 'lucide-react';
import { CompanySwitcher } from '../common/CompanySwitcher';
import { CurrencySelector } from '../common/CurrencySelector';
import { ViewDatasetModal } from '../common/ViewDatasetModal';
import { RemoveDatasetDialog } from '../common/RemoveDatasetDialog';
import { AddCompanyModal } from '../common/AddCompanyModal';
import { DataSourceModal } from '../common/DataSourceModal';
import { fetchCompanyDetail } from '../../services/api';
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
  const [currentCompany, setCurrentCompany] = useState<CompanyMetadata | null>(null);
  const [isViewDatasetOpen, setIsViewDatasetOpen] = useState<boolean>(false);
  const [isRemoveDatasetOpen, setIsRemoveDatasetOpen] = useState<boolean>(false);
  const [isUploadDatasetOpen, setIsUploadDatasetOpen] = useState<boolean>(false);
  const [isDataSourceOpen, setIsDataSourceOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadMeta = async () => {
      if (!currentCompanyId) return;
      try {
        const meta = await fetchCompanyDetail(currentCompanyId);
        if (isMounted) setCurrentCompany(meta);
      } catch (err) {
        console.error('Error fetching company header meta:', err);
      }
    };
    loadMeta();
    return () => {
      isMounted = false;
    };
  }, [currentCompanyId, lastUpdated]);

  const hasDataset = currentCompany?.dataset_status !== 'NO_DATASET' && (currentCompany?.total_orders || 0) > 0;

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

        {/* Right Side: Active Filter Pills & Action Buttons */}
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

          {/* Data Source & Provenance Button */}
          {currentCompany && (
            <button
              onClick={() => setIsDataSourceOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
              title="View dataset origin, limitations & methodology"
            >
              <Info size={13} className="text-blue-500" />
              <span className="hidden sm:inline">Data Source & Methodology</span>
            </button>
          )}

          {/* Dataset Action Buttons */}
          {hasDataset ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsViewDatasetOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="View original paginated dataset"
              >
                <Table size={13} className="text-blue-500" />
                <span className="hidden sm:inline">View Dataset</span>
              </button>
              <button
                onClick={() => setIsRemoveDatasetOpen(true)}
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                title="Remove dataset"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsUploadDatasetOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
              title="Upload dataset for this company"
            >
              <UploadCloud size={14} />
              <span>Upload Dataset</span>
            </button>
          )}

          {/* Currency Selector (₹ INR / $ USD / £ GBP / R$ BRL) */}
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
              size={13}
              className={`${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* View Dataset Modal */}
      {currentCompany && (
        <ViewDatasetModal
          isOpen={isViewDatasetOpen}
          onClose={() => setIsViewDatasetOpen(false)}
          companyId={currentCompany.company_id}
          companyName={currentCompany.company_name}
        />
      )}

      {/* Remove Dataset Confirmation Dialog */}
      {currentCompany && (
        <RemoveDatasetDialog
          isOpen={isRemoveDatasetOpen}
          onClose={() => setIsRemoveDatasetOpen(false)}
          companyId={currentCompany.company_id}
          companyName={currentCompany.company_name}
          onDatasetRemoved={() => {
            setIsRemoveDatasetOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Upload Dataset for Empty Company Modal */}
      {currentCompany && (
        <AddCompanyModal
          isOpen={isUploadDatasetOpen}
          onClose={() => setIsUploadDatasetOpen(false)}
          targetCompany={currentCompany}
          onCompanyCreated={() => {
            setIsUploadDatasetOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Data Source & Methodology Modal */}
      {currentCompany && (
        <DataSourceModal
          isOpen={isDataSourceOpen}
          onClose={() => setIsDataSourceOpen(false)}
          company={currentCompany}
        />
      )}
    </header>
  );
};
