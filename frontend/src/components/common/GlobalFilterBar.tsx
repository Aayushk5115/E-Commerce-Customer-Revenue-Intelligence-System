import React from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Layers, Radio, UserCheck } from 'lucide-react';
import type { FilterOptions, FilterState } from '../../types';

interface GlobalFilterBarProps {
  options: FilterOptions | null;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  options,
  filters,
  onFilterChange,
  onReset,
}) => {
  const handlePresetChange = (preset: string) => {
    if (!options) return;
    const maxDate = new Date(options.max_date);

    let start: string | undefined = undefined;
    let end: string | undefined = options.max_date;

    if (preset === '30d') {
      const d = new Date(maxDate);
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (preset === '90d') {
      const d = new Date(maxDate);
      d.setDate(d.getDate() - 90);
      start = d.toISOString().split('T')[0];
    } else if (preset === '1y') {
      const d = new Date(maxDate);
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString().split('T')[0];
    } else if (preset === '2023') {
      start = '2023-01-01';
      end = '2023-12-31';
    } else if (preset === '2022') {
      start = '2022-01-01';
      end = '2022-12-31';
    } else if (preset === '2021') {
      start = '2021-01-01';
      end = '2021-12-31';
    } else if (preset === 'all') {
      start = options.min_date;
      end = options.max_date;
    }

    onFilterChange({
      ...filters,
      datePreset: preset,
      startDate: start,
      endDate: end,
    });
  };

  const isFiltered =
    (filters.datePreset && filters.datePreset !== 'all') ||
    (filters.category && filters.category !== 'All') ||
    (filters.region && filters.region !== 'All') ||
    (filters.channel && filters.channel !== 'All') ||
    (filters.segment && filters.segment !== 'All');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
          <Filter size={15} className="text-blue-600 dark:text-blue-400" />
          <span>Global Dimension Filters</span>
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Date Range Preset Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Calendar size={12} className="text-blue-500" />
            Time Horizon
          </label>
          <select
            value={filters.datePreset || 'all'}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Time (2021 - 2023)</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 1 Year</option>
            <option value="2023">Year 2023</option>
            <option value="2022">Year 2022</option>
            <option value="2021">Year 2021</option>
          </select>
        </div>

        {/* Product Category Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Layers size={12} className="text-indigo-500" />
            Product Category
          </label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All">All Categories</option>
            {options?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Geographic State/Region Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin size={12} className="text-emerald-500" />
            Shipping Region
          </label>
          <select
            value={filters.region || 'All'}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All">All States (10 Regions)</option>
            {options?.regions.map((r) => (
              <option key={r} value={r}>
                {r} State
              </option>
            ))}
          </select>
        </div>

        {/* Acquisition Channel Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Radio size={12} className="text-amber-500" />
            Acquisition Channel
          </label>
          <select
            value={filters.channel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, channel: e.target.value })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All">All Channels</option>
            {options?.channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Segment Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <UserCheck size={12} className="text-purple-500" />
            Customer Segment
          </label>
          <select
            value={filters.segment || 'All'}
            onChange={(e) => onFilterChange({ ...filters, segment: e.target.value })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All">All RFM Segments</option>
            {options?.segments.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
