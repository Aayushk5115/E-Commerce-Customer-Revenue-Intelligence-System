import React from 'react';
import {
  ShieldCheck,
  X,
  Database,
  ExternalLink,
  Calendar,
  Layers,
  Coins,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import type { CompanyMetadata } from '../../types';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyMetadata;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  if (!isOpen) return null;

  const details = company.data_source_details || {
    provenance: company.dataset_source,
    citation: company.dataset_file || 'Public Repository Dataset',
    limitations: company.is_synthetic ? 'Algorithmic synthetic test dataset' : 'Public real-world sample without product cost data',
    supported_analytics: ['Executive Overview', 'Orders & Customers', 'Products & Categories', 'Revenue Forecasting'],
    unsupported_analytics: ['Product Cost (COGS) & Profit Margins'],
  };

  const baseCurr = company.base_currency || 'USD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10"
              style={{ backgroundColor: `${company.brand_color || '#3b82f6'}25` }}
            >
              <span>{company.logo_badge || '🏢'}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {company.company_name}
                </h3>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  company.is_synthetic
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                }`}>
                  {company.is_synthetic ? 'Synthetic Benchmark' : 'Public Provenance'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Data Provenance, Methodology & Capability Profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* Provenance Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} className="text-blue-400" />
                Data Source & Provenance
              </span>
              <span className="text-xs font-semibold text-blue-400 font-mono">
                {company.dataset_source}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Origin Repository</span>
                <span className="text-slate-200 font-semibold">{details.provenance}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Dataset Citation</span>
                <span className="text-slate-300 font-mono text-[11px] truncate block">{details.citation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Original / Base Currency</span>
                <span className="text-amber-300 font-bold font-mono">
                  {baseCurr === 'INR' ? '₹ INR (Indian Rupee)' : baseCurr === 'GBP' ? '£ GBP (British Pound)' : baseCurr === 'BRL' ? 'R$ BRL (Brazilian Real)' : '$ USD (US Dollar)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Total Records</span>
                <span className="text-slate-200 font-bold font-mono">
                  {company.total_orders?.toLocaleString() || '—'} Transactions
                </span>
              </div>
            </div>
          </div>

          {/* Transparency & Limitations */}
          <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-4 space-y-1.5 text-xs text-blue-200">
            <div className="flex items-center space-x-2 font-bold text-blue-300">
              <Info size={15} />
              <span>Data Transparency & Limitations:</span>
            </div>
            <p className="leading-relaxed text-[11px] text-blue-200/90 pl-6">
              {details.limitations}
            </p>
          </div>

          {/* Supported vs Unsupported Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supported */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Supported Analytics
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {details.supported_analytics.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2 text-[11px]">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unsupported / Unavailable */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertCircle size={14} />
                Explicitly Unavailable (No Fake Data)
              </span>
              <ul className="space-y-1 text-xs text-slate-400">
                {details.unsupported_analytics.length > 0 ? (
                  details.unsupported_analytics.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-[11px] italic">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[11px] text-slate-500">All standard benchmark modules enabled.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Zero Fabricated Data Guarantee</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
