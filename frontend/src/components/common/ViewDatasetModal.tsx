import React, { useState, useEffect } from 'react';
import {
  Table as TableIcon,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { fetchRawDataset } from '../../services/api';
import type { CompanyMetadata } from '../../types';

interface ViewDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyMetadata;
}

export const ViewDatasetModal: React.FC<ViewDatasetModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadDataset = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRawDataset(company.company_id, currentPage, pageSize, searchQuery);
        if (isMounted) {
          setRows(data.rows || []);
          setColumns(data.columns || []);
          setTotalRecords(data.total_records || 0);
          setTotalPages(data.total_pages || 1);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.detail || err?.message || 'Failed to load dataset records.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadDataset, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [isOpen, company.company_id, currentPage, pageSize, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-7xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dataset Explorer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {company.company_name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {company.dataset_file || 'Standard Normalized Records'} • Showing {totalRecords.toLocaleString()} total rows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Pagination Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search across all dataset columns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Page Controls */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 font-mono font-medium text-slate-700 dark:text-slate-300">
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Loading dataset rows...</span>
              </div>
            </div>
          )}

          {error ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Failed to load dataset</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            </div>
          ) : rows.length === 0 && !isLoading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <TableIcon size={32} className="mx-auto text-slate-400 stroke-1" />
              <p className="text-sm font-medium">No records found matching your query.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-extrabold text-slate-500 uppercase tracking-wider text-[10px] w-12 text-center">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="py-2.5 px-3 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-[10px] text-slate-400 font-sans">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="py-2 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-xs truncate"
                        title={String(row[col] ?? '')}
                      >
                        {String(row[col] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 px-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>* Customer names and emails are automatically anonymized for security.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
