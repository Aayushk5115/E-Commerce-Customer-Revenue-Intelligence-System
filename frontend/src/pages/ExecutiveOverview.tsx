import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingCart,
  Users,
  Repeat,
  Package,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { useParams } from 'react-router-dom';
import {
  fetchExecutiveKpis,
  fetchRevenueTrend,
  fetchRevenueByCategory,
  fetchRevenueByRegion,
  fetchTopProducts,
  fetchCustomerSegments,
} from '../services/api';
import type {
  ExecutiveKpis,
  RevenueTrendItem,
  CategoryRevenueItem,
  RegionRevenueItem,
  TopProductItem,
  CustomerSegmentItem,
  FilterState,
  FilterOptions,
} from '../types';

interface ExecutiveOverviewProps {
  filterOptions: FilterOptions | null;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  companyId?: string;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  filterOptions,
  filters,
  onFilterChange,
  onResetFilters,
  companyId: propCompanyId,
}) => {
  const params = useParams<{ companyId?: string }>();
  const activeCompanyId = propCompanyId || params.companyId || 'company-1';

  const [kpis, setKpis] = useState<ExecutiveKpis | null>(null);
  const [trend, setTrend] = useState<RevenueTrendItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenueItem[]>([]);
  const [regionData, setRegionData] = useState<RegionRevenueItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [segments, setSegments] = useState<CustomerSegmentItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      try {
        const [kpiRes, trendRes, catRes, regRes, topProdRes, segRes] = await Promise.all([
          fetchExecutiveKpis(activeCompanyId, filters),
          fetchRevenueTrend(activeCompanyId, filters),
          fetchRevenueByCategory(activeCompanyId, filters),
          fetchRevenueByRegion(activeCompanyId, filters, 8),
          fetchTopProducts(activeCompanyId, filters, 8),
          fetchCustomerSegments(activeCompanyId),
        ]);
        if (isMounted) {
          setKpis(kpiRes);
          setTrend(trendRes);
          setCategoryData(catRes);
          setRegionData(regRes);
          setTopProducts(topProdRes);
          setSegments(segRes);
        }
      } catch (err) {
        console.error('Error fetching Executive Overview:', err);
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, [activeCompanyId, filters]);

  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Global Dimension Filters */}
      <GlobalFilterBar
        options={filterOptions}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
      />

      {/* 8 Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Revenue"
          value={kpis ? (kpis.total_revenue / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          changePct={kpis?.revenue_change_pct}
          prevValue={kpis ? (kpis.prev_revenue / 1000000).toFixed(2) : undefined}
          icon={<DollarSign size={18} />}
          tooltip="Gross revenue from all completed and returned orders in selected slice."
        />

        <KpiCard
          title="Total Net Profit"
          value={kpis ? (kpis.total_profit / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          changePct={kpis?.profit_change_pct}
          prevValue={kpis ? (kpis.prev_profit / 1000000).toFixed(2) : undefined}
          icon={<TrendingUp size={18} />}
          tooltip="Item revenue minus cost of goods sold (COGS)."
        />

        <KpiCard
          title="Blended Gross Margin"
          value={kpis ? (kpis.profit_margin * 100).toFixed(1) : '—'}
          suffix="%"
          changePct={kpis?.margin_change_pct}
          prevValue={kpis ? (kpis.prev_profit_margin * 100).toFixed(1) : undefined}
          icon={<Percent size={18} />}
          tooltip="Net profit as a percentage of total revenue."
        />

        <KpiCard
          title="Avg Order Value (AOV)"
          value={kpis ? kpis.aov.toFixed(2) : '—'}
          prefix="$"
          changePct={kpis?.aov_change_pct}
          prevValue={kpis ? kpis.prev_aov.toFixed(2) : undefined}
          icon={<ShoppingCart size={18} />}
          tooltip="Average monetary amount per completed transaction."
        />

        <KpiCard
          title="Total Orders"
          value={kpis ? (kpis.total_orders / 1000).toFixed(1) : '—'}
          suffix="k"
          changePct={kpis?.orders_change_pct}
          prevValue={kpis ? (kpis.prev_orders / 1000).toFixed(1) : undefined}
          icon={<Package size={18} />}
          tooltip="Total count of non-cancelled order transactions."
        />

        <KpiCard
          title="Active Customers"
          value={kpis ? (kpis.total_customers / 1000).toFixed(1) : '—'}
          suffix="k"
          changePct={kpis?.customers_change_pct}
          prevValue={kpis ? (kpis.prev_customers / 1000).toFixed(1) : undefined}
          icon={<Users size={18} />}
          tooltip="Unique customers with purchasing activity in this period."
        />

        <KpiCard
          title="Customer Retention Rate"
          value={kpis ? (kpis.retention_rate * 100).toFixed(1) : '—'}
          suffix="%"
          changePct={kpis?.retention_change_pct}
          prevValue={kpis ? (kpis.prev_retention_rate * 100).toFixed(1) : undefined}
          icon={<Repeat size={18} />}
          tooltip="Percentage of customers with more than 1 completed purchase."
        />

        <KpiCard
          title="Revenue Growth Rate"
          value={kpis ? kpis.revenue_growth.toFixed(1) : '—'}
          prefix={kpis && kpis.revenue_growth >= 0 ? '+' : ''}
          suffix="%"
          changePct={kpis?.revenue_growth}
          icon={<Activity size={18} />}
          periodLabel="vs baseline"
          tooltip="Top-line annualized percentage revenue trajectory."
        />
      </div>

      {/* Chart Section 1: Revenue & Profit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Profit Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Monthly Revenue & Profit Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Historical monthly revenue vs profit with gross margin progression.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 font-semibold text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Revenue</span>
              </span>
              <span className="flex items-center space-x-1 font-semibold text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Profit</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="month_label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    name === 'revenue' ? 'Revenue' : 'Profit',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Customer Segment Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              RFM distribution across 8 high-value customer clusters.
            </p>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, _, item: any) => [
                    `${val.toLocaleString()} Customers (${item.payload.percentage}%)`,
                    item.payload.segment,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Segment Legend Pills */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {segments.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section 2: Category, Region & Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Revenue by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Category sales contribution and margin.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${(Number(val) / 1000000).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Top Regions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top Geographic Regions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Revenue distribution across top shipping states.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis type="category" dataKey="state" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${(Number(val) / 1000000).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 8 Products Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top Selling Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Highest revenue generating items in catalogue.
            </p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
            {topProducts.map((p, idx) => (
              <div
                key={p.product_id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {p.product_name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">{p.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    ${(p.revenue / 1000).toFixed(1)}k
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {(p.margin * 100).toFixed(0)}% margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
