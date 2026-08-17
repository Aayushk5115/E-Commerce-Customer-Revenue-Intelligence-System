import React from 'react';
import type { ProductMatrix } from '../../types';
import { Star, Flame, Sparkles, AlertCircle } from 'lucide-react';

interface PerformanceMatrixProps {
  matrix: ProductMatrix;
}

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ matrix }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>2x2 Product Portfolio Matrix (BCG-Style)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Strategic product categorization segmented across Median Revenue ($
          {(matrix.median_revenue / 1000).toFixed(1)}k) and Median Profit ($
          {(matrix.median_profit / 1000).toFixed(1)}k).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Stars (High Revenue + High Profit) */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <Star size={16} />
                </div>
                <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">
                  Stars (High Rev + High Profit)
                </h4>
              </div>
              <span className="text-xs font-extrabold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2.5 py-0.5 rounded-full">
                {matrix.stars_count} SKUs
              </span>
            </div>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mb-1">
              ${(matrix.stars_revenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400/90 leading-relaxed">
              Top core cash generators. Protect supply chain reliability, invest in premium ads, and maintain zero-stockout priority.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            Strategy: Maximize Availability & Brand Advertising
          </div>
        </div>

        {/* Quadrant 2: High-Margin Gems (Low Rev + High Profit) */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-300">
                  High-Margin Gems (Low Rev + High Profit)
                </h4>
              </div>
              <span className="text-xs font-extrabold bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 px-2.5 py-0.5 rounded-full">
                {matrix.high_margin_gems_count} SKUs
              </span>
            </div>
            <div className="text-xl font-black text-indigo-900 dark:text-indigo-200 mb-1">
              ${(matrix.high_margin_gems_revenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-400/90 leading-relaxed">
              Extremely profitable per unit but low volume. Uncap marketing budget, test targeted social campaigns, and featured banner placement.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
            Strategy: Increase Visibility & Cross-Sell Placement
          </div>
        </div>

        {/* Quadrant 3: Volume Drivers (High Rev + Low Profit) */}
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Flame size={16} />
                </div>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-300">
                  Volume Drivers (High Rev + Low Profit)
                </h4>
              </div>
              <span className="text-xs font-extrabold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2.5 py-0.5 rounded-full">
                {matrix.volume_drivers_count} SKUs
              </span>
            </div>
            <div className="text-xl font-black text-amber-900 dark:text-amber-200 mb-1">
              ${(matrix.volume_drivers_revenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/90 leading-relaxed">
              High top-line demand but thin unit margins. Renegotiate supplier COGS, bundle with high-margin accessories, or reduce discount depths.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/50 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            Strategy: Margin Optimization & Accessory Bundling
          </div>
        </div>

        {/* Quadrant 4: Underperformers (Low Rev + Low Profit) */}
        <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <AlertCircle size={16} />
                </div>
                <h4 className="font-bold text-sm text-rose-950 dark:text-rose-300">
                  Underperformers (Low Rev + Low Profit)
                </h4>
              </div>
              <span className="text-xs font-extrabold bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 px-2.5 py-0.5 rounded-full">
                {matrix.underperformers_count} SKUs
              </span>
            </div>
            <div className="text-xl font-black text-rose-900 dark:text-rose-200 mb-1">
              ${(matrix.underperformers_revenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-rose-800/80 dark:text-rose-400/90 leading-relaxed">
              Drain on inventory carrying costs and warehouse storage. Run clearance liquidations and consider phasing out low-turnover items.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-200/60 dark:border-rose-800/50 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
            Strategy: Clearance Clearance & SKU Rationalization
          </div>
        </div>
      </div>
    </div>
  );
};
