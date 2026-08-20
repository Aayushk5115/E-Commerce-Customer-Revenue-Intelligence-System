import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Database,
  ShieldCheck,
  Trash2,
  Table,
  UploadCloud,
  Loader2,
  TrendingUp,
  Coins
} from 'lucide-react';
import { fetchDatasetProfile } from '../../services/api';
import type { CompanyMetadata, DatasetProfileResponse } from '../../types';

interface DatasetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyMetadata;
  onOpenViewDataset: () => void;
  onOpenRemoveDataset: () => void;
  onOpenUploadDataset: () => void;
}

export const DatasetDetailsModal: React.FC<DatasetDetailsModalProps> = ({
  isOpen,
  onClose,
  company,
  onOpenViewDataset,
  onOpenRemoveDataset,
  onOpenUploadDataset,
}) => {
  const [profile, setProfile] = useState<DatasetProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDatasetProfile(company.company_id);
        if (isMounted) setProfile(data);
      } catch (err) {
        console.error('Error fetching dataset profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, company.company_id]);

  if (!isOpen) return null;

  const hasDataset = company.dataset_status !== 'NO_DATASET' && (company.total_orders || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ backgroundColor: `${company.brand_color || '#3b82f6'}20` }}
            >
              <span>{company.logo_badge || '🏢'}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {company.company_name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    hasDataset
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300'
                  }`}
                >
                  {hasDataset ? '● Dataset Ready' : '● No Dataset'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{company.industry} • Base: {company.base_currency || 'USD'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Profiling company dataset...</p>
            </div>
          ) : hasDataset ? (
            <>
              {/* Dataset Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Records
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {(profile?.total_orders || company.total_orders || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Unique Customers
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {(profile?.total_customers || company.total_customers || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quality Score
                  </span>
                  <span className="text-lg font-black text-emerald-600 font-mono mt-0.5 block">
                    {profile?.data_quality_score || 96}/100
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Base Currency
                  </span>
                  <span className="text-lg font-black text-blue-600 font-mono mt-0.5 block">
                    {company.base_currency === 'INR' ? '₹ INR' : '$ USD'}
                  </span>
                </div>
              </div>

              {/* Dataset File Info Table */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-500" />
                    <span>Uploaded Filename</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {profile?.original_filename || company.dataset_file || 'benchmark_orders.csv'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>Historical Date Range</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.date_range || 'Active Multi-Year History'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-500" />
                    <span>Normalized Tables</span>
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    Orders • Items • Customers • Products
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Database size={14} className="text-emerald-500" />
                    <span>Ingestion Pipeline</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Cleaned & Normalized to Schema
                  </span>
                </div>
              </div>

              {/* Supported Analytics Capabilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Analytics Capabilities
                </h4>
                <div className="space-y-1.5">
                  {(profile?.supported_analytics || [
                    'Revenue & Executive Overview',
                    'Customer Intelligence & RFM Segmentation',
                    'Product & Merchandise Intelligence',
                    'Predictive Revenue Forecasting (ARIMA)',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}

                  {(profile?.unsupported_analytics || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 italic"
                    >
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                <UploadCloud size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                No Dataset Uploaded
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This company currently does not have an active transaction dataset. Upload a CSV or Excel file to generate instant analytics.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUploadDataset();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <UploadCloud size={14} />
                <span>Upload Dataset Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {hasDataset ? (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenRemoveDataset();
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove Dataset</span>
              </button>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadDataset();
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Replace Dataset
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenViewDataset();
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Table size={14} />
                  <span>View Raw Dataset</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
