import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  changePct?: number;
  prevValue?: string | number;
  periodLabel?: string;
  icon?: React.ReactNode;
  invertColor?: boolean; // For metrics like churn where down is good
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  changePct,
  prevValue,
  periodLabel = 'vs prev period',
  icon,
  invertColor = false,
  tooltip,
}) => {
  const isPositive = (changePct ?? 0) > 0;
  const isNeutral = changePct === 0 || changePct === undefined || isNaN(changePct);

  // Determine indicator color
  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let badgeIcon = <Minus size={12} />;

  if (!isNeutral) {
    const isGood = invertColor ? !isPositive : isPositive;
    if (isGood) {
      badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60';
      badgeIcon = <ArrowUpRight size={13} className="stroke-[2.5]" />;
    } else {
      badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60';
      badgeIcon = <ArrowDownRight size={13} className="stroke-[2.5]" />;
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      {/* Header with Title & Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          {tooltip && (
            <div className="group relative cursor-pointer" title={tooltip}>
              <HelpCircle size={13} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
            </div>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline space-x-1 mb-3">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>

      {/* Footer: % Change Badge & Previous Period Reference */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {changePct !== undefined && !isNaN(changePct) ? (
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}
            >
              {badgeIcon}
              <span>{Math.abs(changePct).toFixed(1)}%</span>
            </span>
            <span className="text-slate-400 dark:text-slate-400 text-[11px] font-medium truncate">
              {periodLabel}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-400 text-[11px]">Calculated Metric</span>
        )}

        {prevValue !== undefined && (
          <span className="text-slate-400 dark:text-slate-400 text-[11px] font-medium">
            Prior: {prefix}
            {prevValue}
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
