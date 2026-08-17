import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  MousePointer,
  Target,
  Award,
  AlertTriangle,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { DataTable } from '../components/common/DataTable';
import type { ColumnDef } from '../components/common/DataTable';
import { fetchMarketing } from '../services/api';
import type { MarketingResponse, MarketingCampaignItem } from '../types';

export const MarketingAnalytics: React.FC = () => {
  const [data, setData] = useState<MarketingResponse | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadMarketing = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMarketing();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching marketing analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMarketing();
    return () => {
      isMounted = false;
    };
  }, []);

  const campaigns = data?.campaigns || [];
  const filteredCampaigns = campaigns.filter((c) => {
    if (!searchValue) return true;
    const s = searchValue.toLowerCase();
    return (
      c.campaign_name.toLowerCase().includes(s) ||
      c.channel.toLowerCase().includes(s) ||
      c.campaign_id.toString().includes(s)
    );
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const valA = a[sortBy as keyof MarketingCampaignItem];
    const valB = b[sortBy as keyof MarketingCampaignItem];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.max(1, Math.ceil(sortedCampaigns.length / pageSize));
  const paginatedCampaigns = sortedCampaigns.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const columns: ColumnDef<MarketingCampaignItem>[] = [
    {
      key: 'campaign_name',
      header: 'Campaign Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{row.campaign_name}</span>
          <span className="text-[11px] text-slate-400">
            {row.channel} • #{row.campaign_id}
          </span>
        </div>
      ),
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">${row.spend.toLocaleString()}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue Generated',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          ${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'roas',
      header: 'ROAS',
      sortable: true,
      align: 'center',
      render: (row) => {
        let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        if (row.roas < 5) badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
        else if (row.roas < 15) badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
        return <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${badgeColor}`}>{row.roas}x</span>;
      },
    },
    {
      key: 'cac',
      header: 'CAC',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">${row.cac.toFixed(2)}</span>,
    },
    {
      key: 'conversions',
      header: 'Conversions',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.conversions.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'clicks',
      header: 'Clicks',
      sortable: true,
      align: 'right',
      render: (row) => <span className="text-slate-500 font-mono">{row.clicks.toLocaleString()}</span>,
    },
  ];

  const CHANNEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* 6 Marketing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Ad Spend"
          value={data ? (data.kpis.total_spend / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          icon={<DollarSign size={16} />}
          tooltip="Cumulative marketing budget deployed across all campaigns."
        />

        <KpiCard
          title="Attributed Revenue"
          value={data ? (data.kpis.total_revenue / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          icon={<TrendingUp size={16} />}
          tooltip="Direct revenue generated from ad conversions."
        />

        <KpiCard
          title="Blended ROAS"
          value={data ? data.kpis.overall_roas.toFixed(2) : '—'}
          suffix="x"
          icon={<Target size={16} />}
          tooltip="Return on Ad Spend (Attributed Revenue / Total Spend)."
        />

        <KpiCard
          title="Blended CAC"
          value={data ? data.kpis.overall_cac.toFixed(2) : '—'}
          prefix="$"
          invertColor={true}
          icon={<Zap size={16} />}
          tooltip="Customer Acquisition Cost (Ad Spend / Conversions)."
        />

        <KpiCard
          title="Click-Through Rate"
          value={data ? data.kpis.ctr.toFixed(2) : '—'}
          suffix="%"
          icon={<MousePointer size={16} />}
          tooltip="Percentage of impressions that resulted in clicks."
        />

        <KpiCard
          title="Conversion Rate"
          value={data ? data.kpis.conversion_rate.toFixed(2) : '—'}
          suffix="%"
          icon={<Percent size={16} />}
          tooltip="Percentage of clicks that converted to completed orders."
        />
      </div>

      {/* Channel Highlights Banner */}
      {data?.highlights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Highest ROAS Channel
              </span>
              <div className="text-lg font-black text-emerald-950 dark:text-white mt-0.5">
                {data.highlights.best_channel_by_roas}
              </div>
              <span className="text-xs font-extrabold text-emerald-600 font-mono">
                {data.highlights.best_roas}x ROAS
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Award size={20} />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
                Top Revenue Channel
              </span>
              <div className="text-lg font-black text-blue-950 dark:text-white mt-0.5">
                {data.highlights.highest_revenue_channel}
              </div>
              <span className="text-xs font-extrabold text-blue-600 font-mono">
                ${(data.highlights.highest_revenue / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Highest CAC (Needs Review)
              </span>
              <div className="text-lg font-black text-amber-950 dark:text-white mt-0.5">
                {data.highlights.highest_cac_channel}
              </div>
              <span className="text-xs font-extrabold text-amber-600 font-mono">
                ${data.highlights.highest_cac.toFixed(2)} / acquisition
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">
                Lowest ROAS Channel
              </span>
              <div className="text-lg font-black text-purple-950 dark:text-white mt-0.5">
                {data.highlights.worst_channel_by_roas}
              </div>
              <span className="text-xs font-extrabold text-purple-600 font-mono">
                {data.highlights.worst_roas}x ROAS
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
              <Target size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Chart Section: ROAS & Spend vs Revenue by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel ROAS Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              ROAS Efficiency by Acquisition Channel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attributed revenue multiplier per dollar spent across channels.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.channels || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="channel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}x`} />
                <Tooltip
                  formatter={(val: any) => [`${val}x`, 'ROAS']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="roas" radius={[6, 6, 0, 0]}>
                  {data?.channels.map((_, index) => (
                    <Cell key={`chan-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend vs Attributed Revenue by Channel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Marketing Spend vs. Attributed Revenue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Capital expenditure allocation alongside generated sales.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.channels || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="channel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `$${(Number(val) / 1000000).toFixed(2)}M`,
                    name === 'revenue' ? 'Revenue Generated' : 'Ad Spend',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="spend" name="Ad Spend" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue Generated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Performance Leaderboard */}
      <DataTable
        title="Marketing Campaign Performance Leaderboard"
        subtitle="Granular campaign ROAS, CAC, and conversion metrics."
        data={paginatedCampaigns}
        columns={columns}
        totalRecords={sortedCampaigns.length}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        exportFilename="marketing_campaigns_export.csv"
        isLoading={isLoading}
      />
    </div>
  );
};
