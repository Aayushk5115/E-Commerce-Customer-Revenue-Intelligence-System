import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Percent,
  RotateCcw,
  Trophy,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { DataTable } from '../components/common/DataTable';
import type { ColumnDef } from '../components/common/DataTable';
import { PerformanceMatrix } from '../components/common/PerformanceMatrix';
import { useParams } from 'react-router-dom';
import {
  fetchProductKpis,
  fetchProductPerformance,
  fetchProductsTable,
} from '../services/api';
import type {
  ProductKpis,
  ProductPerformance,
  ProductRecord,
  FilterState,
  FilterOptions,
} from '../types';

interface ProductIntelligenceProps {
  filterOptions: FilterOptions | null;
  filters: FilterState;
  companyId?: string;
}

export const ProductIntelligence: React.FC<ProductIntelligenceProps> = ({
  filterOptions,
  filters,
  companyId: propCompanyId,
}) => {
  const params = useParams<{ companyId?: string }>();
  const activeCompanyId = propCompanyId || params.companyId || 'company-1';

  const [kpis, setKpis] = useState<ProductKpis | null>(null);
  const [perf, setPerf] = useState<ProductPerformance | null>(null);

  // Table state
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);

  // Load Overview Data
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [kpiRes, perfRes] = await Promise.all([
          fetchProductKpis(activeCompanyId, filters, selectedBrand),
          fetchProductPerformance(activeCompanyId, filters, selectedBrand),
        ]);
        setKpis(kpiRes);
        setPerf(perfRes);
      } catch (err) {
        console.error('Error fetching Product Intelligence:', err);
      }
    };

    loadOverview();
  }, [activeCompanyId, filters, selectedBrand]);

  // Load Paginated Product Table
  useEffect(() => {
    let isMounted = true;
    const loadTable = async () => {
      setIsTableLoading(true);
      try {
        const res = await fetchProductsTable(
          activeCompanyId,
          currentPage,
          pageSize,
          searchValue,
          selectedCategory,
          selectedBrand,
          sortBy,
          sortOrder
        );
        if (isMounted) {
          setProducts(res.products);
          setTotalRecords(res.total_records);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        console.error('Error fetching products table:', err);
      } finally {
        if (isMounted) setIsTableLoading(false);
      }
    };

    loadTable();
    return () => {
      isMounted = false;
    };
  }, [
    activeCompanyId,
    currentPage,
    pageSize,
    searchValue,
    selectedCategory,
    selectedBrand,
    sortBy,
    sortOrder,
  ]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };

  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const columns: ColumnDef<ProductRecord>[] = [
    {
      key: 'product_id',
      header: 'SKU ID',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-500 font-medium">#{row.product_id}</span>,
    },
    {
      key: 'product_name',
      header: 'Product Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{row.product_name}</span>
          <span className="text-[11px] text-slate-400">
            {row.category} • {row.brand}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price / Cost',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div className="font-mono">
          <span className="font-bold text-slate-900 dark:text-white block">${row.price.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400">${row.cost.toFixed(2)} cost</span>
        </div>
      ),
    },
    {
      key: 'units_sold',
      header: 'Units Sold',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.units_sold.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Total Revenue',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white font-mono">
          ${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'profit',
      header: 'Net Profit',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          ${row.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'margin',
      header: 'Gross Margin',
      sortable: true,
      align: 'center',
      render: (row) => {
        const marginPct = row.margin * 100;
        let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        if (marginPct < 15) {
          badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
        } else if (marginPct < 25) {
          badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
        }
        return <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${badgeColor}`}>{marginPct.toFixed(1)}%</span>;
      },
    },
    {
      key: 'return_rate',
      header: 'Return Rate',
      sortable: true,
      align: 'center',
      render: (row) => {
        const retPct = row.return_rate * 100;
        return (
          <span
            className={`font-semibold text-xs ${
              retPct > 10 ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {retPct.toFixed(1)}% ({row.return_count})
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 8 Product Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Catalog SKUs"
          value={kpis ? kpis.total_products.toLocaleString() : '—'}
          icon={<Package size={18} />}
          tooltip="Total active product items in catalogue."
        />

        <KpiCard
          title="Total Units Sold"
          value={kpis ? (kpis.units_sold / 1000).toFixed(1) : '—'}
          suffix="k"
          icon={<ShoppingBag size={18} />}
          tooltip="Total item volume sold across completed transactions."
        />

        <KpiCard
          title="Product Revenue"
          value={kpis ? (kpis.revenue / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          icon={<DollarSign size={18} />}
          tooltip="Cumulative merchandise gross revenue."
        />

        <KpiCard
          title="Product Net Profit"
          value={kpis ? (kpis.profit / 1000000).toFixed(2) : '—'}
          prefix="$"
          suffix="M"
          icon={<TrendingUp size={18} />}
          tooltip="Merchandise gross profit generated across all items."
        />

        <KpiCard
          title="Average SKU Margin"
          value={kpis ? (kpis.avg_margin * 100).toFixed(1) : '—'}
          suffix="%"
          icon={<Percent size={18} />}
          tooltip="Average profit margin realized across product sales."
        />

        <KpiCard
          title="Product Return Rate"
          value={kpis ? (kpis.avg_return_rate * 100).toFixed(1) : '—'}
          suffix="%"
          invertColor={true}
          icon={<RotateCcw size={18} />}
          tooltip="Average percentage of sold items returned by customers."
        />

        <KpiCard
          title="Best-Selling SKU"
          value={kpis?.best_selling_product || '—'}
          icon={<Trophy size={18} />}
          tooltip="Product with the highest cumulative units sold."
        />

        <KpiCard
          title="Top Profit Generator"
          value={kpis?.most_profitable_product || '—'}
          icon={<Award size={18} />}
          tooltip="Product delivering the highest cumulative net dollar profit."
        />
      </div>

      {/* Chart Section 1: Revenue by Category & Profit by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Revenue by Product Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Category sales contribution and units volume sold.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perf?.category_performance || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  {perf?.category_performance.map((_, index) => (
                    <Cell key={`cat-rev-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Profit & Margin by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Net margin comparison across all core departments.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perf?.category_performance || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any, _, item: any) => [
                    `$${(Number(val) / 1000000).toFixed(2)}M Profit (${(item.payload.margin * 100).toFixed(1)}% margin)`,
                    'Net Profit',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Section 2: Top Products by Revenue & Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Products by Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top 10 Products by Revenue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Highest grossing catalogue items.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={perf?.top_by_revenue || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Products by Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top 10 Products by Net Profit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Most profitable SKUs factoring COGS deductions.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={perf?.top_by_profit || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Profit']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Section 3: Revenue vs Profit Scatter Plot */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Revenue vs. Profit SKU Scatter Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Correlation analysis plotting gross revenue against bottom-line net profit per SKU.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                type="number"
                dataKey="revenue"
                name="Revenue"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Revenue ($)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="profit"
                name="Profit"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Profit ($)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="units_sold" range={[40, 200]} name="Units Sold" />
              <Tooltip
                formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name]}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-lg space-y-1">
                        <p className="font-bold text-sm text-blue-400">{data.product_name}</p>
                        <p className="text-slate-300">Category: {data.category}</p>
                        <p className="text-slate-300">Revenue: ${data.revenue.toLocaleString()}</p>
                        <p className="text-emerald-400">Profit: ${data.profit.toLocaleString()}</p>
                        <p className="text-slate-300">Margin: {(data.margin * 100).toFixed(1)}%</p>
                        <p className="text-slate-300">Units Sold: {data.units_sold.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={perf?.scatter_data || []} fill="#6366f1" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2x2 BCG Product Matrix */}
      {perf?.matrix && <PerformanceMatrix matrix={perf.matrix} />}

      {/* Comprehensive Product Performance Explorer Table */}
      <DataTable
        title="Product Performance Explorer"
        subtitle="Searchable product catalogue with margin health, returns tracking, and profit metrics."
        data={products}
        columns={columns}
        totalRecords={totalRecords}
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
        exportFilename="products_performance_export.csv"
        isLoading={isTableLoading}
        actions={
          <div className="flex items-center space-x-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Categories</option>
              {filterOptions?.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
};
