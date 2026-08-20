import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';
import { deleteCompanyDataset } from '../../services/api';
import type { CompanyMetadata } from '../../types';

interface RemoveDatasetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyMetadata;
  onDatasetRemoved: (updatedCompany: CompanyMetadata) => void;
}

export const RemoveDatasetDialog: React.FC<RemoveDatasetDialogProps> = ({
  isOpen,
  onClose,
  company,
  onDatasetRemoved,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmRemove = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteCompanyDataset(company.company_id);
      onDatasetRemoved(res.company);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to remove dataset.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 text-rose-600 dark:text-rose-400">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove Dataset
              </h3>
              <p className="text-xs text-slate-500">{company.company_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 flex items-start space-x-3">
            <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <strong className="block font-bold">
                Are you sure you want to remove this dataset?
              </strong>
              <p className="leading-relaxed">
                This will remove the uploaded dataset and all analytics, RFM models, customer lifetime metrics, and forecasts generated from it.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Company:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{company.company_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dataset File:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{company.dataset_file || 'Standard Dataset'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Orders:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{company.total_orders?.toLocaleString() || 0}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Note: The company profile will remain in the system with status <strong>"No Dataset"</strong>. You can upload a new dataset for this company at any time.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmRemove}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Removing Dataset...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Remove Dataset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
