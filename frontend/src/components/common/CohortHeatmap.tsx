import React from 'react';
import type { CohortRow } from '../../types';

interface CohortHeatmapProps {
  cohorts: CohortRow[];
  maxMonths?: number;
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ cohorts, maxMonths = 12 }) => {
  // Helper to calculate color intensity based on retention percentage
  const getCellColor = (pct: number | null) => {
    if (pct === null || pct === undefined) {
      return 'bg-slate-50 dark:bg-slate-900 text-transparent';
    }
    if (pct >= 90) return 'bg-emerald-600 text-white font-bold';
    if (pct >= 75) return 'bg-emerald-500 text-white font-bold';
    if (pct >= 60) return 'bg-emerald-400 text-slate-900 font-semibold';
    if (pct >= 45) return 'bg-emerald-300 dark:bg-emerald-700 text-slate-900 dark:text-white font-medium';
    if (pct >= 30) return 'bg-emerald-200 dark:bg-emerald-800/70 text-slate-800 dark:text-emerald-100';
    if (pct >= 15) return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300';
    if (pct > 0) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Customer Cohort Retention Heatmap
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          First-purchase cohort retention behavior tracked over 12 consecutive months.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-2.5 px-3 text-left min-w-[90px]">Cohort</th>
              <th className="py-2.5 px-3 text-right min-w-[70px]">Users</th>
              {Array.from({ length: maxMonths }).map((_, idx) => (
                <th key={idx} className="py-2.5 px-2 text-center min-w-[45px]">
                  M{idx}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {cohorts.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {row.cohort_label}
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                  {row.cohort_size.toLocaleString()}
                </td>
                {Array.from({ length: maxMonths }).map((_, colIdx) => {
                  const dataPoint = row.retention.find((r) => r.month_index === colIdx);
                  const pct = dataPoint?.percentage;
                  const cnt = dataPoint?.count;

                  return (
                    <td
                      key={colIdx}
                      className="p-1 text-center"
                      title={
                        pct !== null && pct !== undefined
                          ? `Month ${colIdx}: ${pct}% (${cnt?.toLocaleString()} active buyers)`
                          : undefined
                      }
                    >
                      <div
                        className={`h-7 flex items-center justify-center rounded-lg text-[11px] transition-transform hover:scale-105 select-none ${getCellColor(
                          pct ?? null
                        )}`}
                      >
                        {pct !== null && pct !== undefined ? `${pct.toFixed(0)}%` : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-medium">Retention Intensity Scale:</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px]">0%</span>
          <span className="w-5 h-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-slate-700"></span>
          <span className="w-5 h-3 rounded bg-emerald-200 dark:bg-emerald-800/70"></span>
          <span className="w-5 h-3 rounded bg-emerald-400"></span>
          <span className="w-5 h-3 rounded bg-emerald-600"></span>
          <span className="text-[10px]">100%</span>
        </div>
      </div>
    </div>
  );
};
