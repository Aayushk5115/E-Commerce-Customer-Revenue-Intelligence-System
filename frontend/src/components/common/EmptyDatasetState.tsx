import React, { useState } from 'react';
import { UploadCloud, Database, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AddCompanyModal } from './AddCompanyModal';
import type { CompanyMetadata } from '../../types';

interface EmptyDatasetStateProps {
  companyId: string;
  companyName?: string;
  onDatasetUploaded?: () => void;
}

export const EmptyDatasetState: React.FC<EmptyDatasetStateProps> = ({
  companyId,
  companyName = 'This Company',
  onDatasetUploaded,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const mockMeta: CompanyMetadata = {
    company_id: companyId,
    company_name: companyName,
    company_slug: companyId,
    logo_badge: '🏢',
    industry: 'E-Commerce',
    description: '',
    dataset_source: 'No Dataset',
    dataset_status: 'NO_DATASET',
    is_synthetic: false,
  };

  return (
    <div className="py-16 px-4 max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
      {/* Icon Graphic */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-3xl blur-xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
          <UploadCloud size={36} />
        </div>
      </div>

      {/* Main Text */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold">
          <Database size={12} />
          <span>No Transaction Dataset Available</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Dataset for {companyName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          This company currently has no ingested transaction data. Upload a CSV or Excel sales dataset to automatically compute RFM segmentation, customer lifetime metrics, SKU diagnostics, and ARIMA revenue forecasts.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <UploadCloud size={16} />
          <span>+ Upload Company Dataset</span>
        </button>
      </div>

      {/* Supported formats pill */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <strong className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">Supported Files</strong>
          <span>CSV • XLSX • XLS • JSON</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <strong className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">Real Processing</strong>
          <span>Zero fake data fabrication</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <strong className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">Data Privacy</strong>
          <span>Automatic PII masking</span>
        </div>
      </div>

      {/* Upload Modal */}
      <AddCompanyModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetCompany={mockMeta}
        onCompanyCreated={() => {
          setIsUploadOpen(false);
          if (onDatasetUploaded) onDatasetUploaded();
          window.location.reload();
        }}
      />
    </div>
  );
};
