import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Repeat,
  DollarSign,
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { DataTable } from '../components/common/DataTable';
import type { ColumnDef } from '../components/common/DataTable';
import { CohortHeatmap } from '../components/common/CohortHeatmap';
import { EmptyDatasetState } from '../components/common/EmptyDatasetState';
import { useParams } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import {
  fetchCustomerKpis,
  fetchCustomerSegments,
  fetchChurnAnalytics,
  fetchClvDistribution,
  fetchCustomerRetentionTrend,
  fetchCustomersTable,
  fetchCohorts,
} from '../services/api';
import type {
  CustomerKpis,
  CustomerSegmentItem,
  ChurnAnalytics,
  ClvDistributionItem,
  CustomerRetentionItem,
  CustomerRecord,
  CohortResponse,
  FilterState,
} from '../types';

interface CustomerIntelligenceProps {
  filters: FilterState;
  companyId?: string;
}

export const CustomerIntelligence: React.FC<CustomerIntelligenceProps> = ({ filters, companyId: propCompanyId }) => {
  const params = useParams<{ companyId?: string }>();
  const activeCompanyId = propCompanyId || params.companyId || 'company-1';
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const [kpis, setKpis] = useState<CustomerKpis | null>(null);
  const [segments, setSegments] = useState<CustomerSegmentItem[]>([]);
  const [churn, setChurn] = useState<ChurnAnalytics | null>(null);
  const [clvData, setClvData] = useState<ClvDistributionItem[]>([]);
  const [retentionTrend, setRetentionTrend] = useState<CustomerRetentionItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortResponse | null>(null);

  // Table state
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('total_spent');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All');
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);

  // Load Overview Data
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [kpiRes, segRes, churnRes, clvRes, retRes, cohortRes] = await Promise.all([
          fetchCustomerKpis(activeCompanyId, filters),
          fetchCustomerSegments(activeCompanyId),
          fetchChurnAnalytics(activeCompanyId),
          fetchClvDistribution(activeCompanyId),
          fetchCustomerRetentionTrend(activeCompanyId),
          fetchCohorts(activeCompanyId),
        ]);
        setKpis(kpiRes);
        setSegments(segRes);
        setChurn(churnRes);
        setClvData(clvRes);
        setRetentionTrend(retRes);
        setCohorts(cohortRes);
      } catch (err) {
        console.error('Error loading Customer Intelligence:', err);
      }
    };
    loadOverview();
  }, [activeCompanyId, filters]);

  // Load Paginated Customer Table Data
  useEffect(() => {
    let isMounted = true;
    const loadTable = async () => {
      setIsTableLoading(true);
      try {
        const res = await fetchCustomersTable(
          activeCompanyId,
          currentPage,
          pageSize,
          searchValue,
          selectedSegmentFilter,
          selectedRiskFilter,
          sortBy,
          sortOrder
        );
        if (isMounted) {
          setCustomers(res.customers);
          setTotalRecords(res.total_records);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        console.error('Error loading Customer table:', err);
      } finally {
        if (isMounted) setIsTableLoading(false);
      }
    };

    loadTable();
    return () => {
      isMounted = false;
    };
  }, [activeCompanyId, currentPage, pageSize, searchValue, selectedSegmentFilter, selectedRiskFilter, sortBy, sortOrder]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };

  const columns: ColumnDef<CustomerRecord>[] = [
    {
      key: 'customer_id',
      header: 'ID',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-500 font-medium">#{row.customer_id}</span>,
    },
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.city}, {row.state}
        </span>
      ),
    },
    {
      key: 'orders_count',
      header: 'Orders',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.orders_count}
        </span>
      ),
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white font-mono">
          {formatCurrency(row.total_spent, { compact: false, decimals: 2 })}
        </span>
      ),
    },
    {
      key: 'aov',
      header: 'AOV',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrency(row.aov, { compact: false, decimals: 2 })}</span>,
    },
    {
      key: 'rfm_segment',
      header: 'RFM Segment',
      sortable: true,
      render: (row) => {
        const segColors: Record<string, string> = {
          Champions: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          'Loyal Customers': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
          'Potential Loyalists': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
          'New Customers': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
          'Need Attention': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          'At Risk': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300',
          "Can't Lose Them": 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300',
          'Lost Customers': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
        };
        return (
          <span
            className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
              segColors[row.rfm_segment] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {row.rfm_segment}
          </span>
        );
      },
    },
    {
      key: 'churn_probability',
      header: 'Churn Risk (ML)',
      sortable: true,
      align: 'center',
      render: (row) => {
        const probPct = (row.churn_probability * 100).toFixed(0);
        let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        if (row.risk_level === 'High Risk') {
          badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
        } else if (row.risk_level === 'Medium Risk') {
          badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
        }

        return (
          <div className="inline-flex items-center space-x-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${badgeColor}`}>
              {row.risk_level} ({probPct}%)
            </span>
          </div>
        );
      },
    },
    {
      key: 'last_order_date',
      header: 'Last Order',
      sortable: true,
      align: 'right',
      render: (row) => <span className="text-slate-500 font-mono text-[11px]">{row.last_order_date}</span>,
    },
  ];

  if (kpis && (!kpis.total_customers || (kpis as any).has_dataset === false)) {
    return <EmptyDatasetState companyId={activeCompanyId} />;
  }

  return (
    <div className="space-y-6">
      {/* 8 Customer Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Customers"
          value={kpis ? kpis.total_customers.toLocaleString() : '—'}
          icon={<Users size={18} />}
          tooltip="Total registered customer accounts across all channels."
        />

        <KpiCard
          title="Active Buyers"
          value={kpis ? kpis.active_customers.toLocaleString() : '—'}
          icon={<UserCheck size={18} />}
          tooltip="Customers with at least 1 completed transaction."
        />

        <KpiCard
          title="Customer Lifetime Value"
          value={kpis ? formatCurrency(kpis.avg_clv, { compact: false, decimals: 2 }) : '—'}
          icon={<DollarSign size={18} />}
          tooltip="Historical average revenue generated per customer."
        />

        <KpiCard
          title="Repeat Purchase Rate"
          value={kpis ? (kpis.repeat_purchase_rate * 100).toFixed(1) : '—'}
          suffix="%"
          icon={<Repeat size={18} />}
          tooltip="Percentage of buyers who made 2 or more purchases."
        />

        <KpiCard
          title="New Acquisition (90D)"
          value={kpis ? kpis.new_customers.toLocaleString() : '—'}
          icon={<UserPlus size={18} />}
          tooltip="Customers acquired within the last 90 calendar days."
        />

        <KpiCard
          title="Predicted Churn Rate"
          value={kpis ? (kpis.churn_rate * 100).toFixed(1) : '—'}
          suffix="%"
          invertColor={true}
          icon={<TrendingDown size={18} />}
          tooltip="Percentage of customers classified as High Churn Risk by ML model."
        />

        <KpiCard
          title="High-Risk Customers"
          value={kpis ? kpis.high_risk_customers.toLocaleString() : '—'}
          invertColor={true}
          icon={<AlertTriangle size={18} />}
          tooltip="Count of active accounts predicted >70% likelihood of churn."
        />

        <KpiCard
          title="Revenue at Risk"
          value={kpis ? formatCurrency(kpis.revenue_at_risk, { compact: true }) : '—'}
          invertColor={true}
          icon={<ShieldAlert size={18} />}
          tooltip="Prior cumulative revenue from high churn-risk customer cohort."
        />
      </div>

      {/* Chart Section 1: RFM Segments & Churn Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFM Customer Segments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                RFM Segmentation Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Recency, Frequency, and Monetary value clustering (K-Means & Scoring).
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`seg-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, _, item: any) => [
                    `${val.toLocaleString()} Users • $${(item.payload.total_revenue / 1000000).toFixed(2)}M`,
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Risk Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Machine Learning Churn Risk Levels
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Random Forest probability threshold classification (High &gt; 70%, Med 40-70%, Low &lt; 40%).
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn?.distribution || []} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="risk_level" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any, _, item: any) => [
                    `${Number(val).toLocaleString()} Customers (${item.payload.percentage}%) • $${(item.payload.revenue_at_risk / 1000000).toFixed(2)}M Revenue`,
                    item.payload.risk_level,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {churn?.distribution.map((entry, index) => (
                    <Cell key={`churn-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Section 2: CLV Distribution & Retention Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Lifetime Value Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              CLV Spend Brackets Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customer headcount and cumulative revenue share across spend tiers.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clvData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any, _, item: any) => [
                    `${val.toLocaleString()} Customers ($${(item.payload.revenue / 1000000).toFixed(2)}M)`,
                    'Customer Count',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="customers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Retention Rate Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Monthly Customer Retention Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Month-over-month active buyer retention percentage trajectory.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="month_label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Retention Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retention_rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Churn Prediction ML Model Evaluation Card */}
      {churn && churn.models && (
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <BrainCircuit size={16} />
                <span>Supervised Machine Learning Pipeline</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Churn Prediction Model Benchmarking & Evaluation
              </h3>
              <p className="text-xs text-slate-400">
                Comparing binary classification algorithms trained on customer recency, frequency, monetary spend, and session engagement.
              </p>
            </div>
            <span className="self-start md:self-auto text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
              Production Model: Random Forest (ROC-AUC 0.9412)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {churn.models.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  m.is_selected
                    ? 'bg-slate-900 border-blue-500/80 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {m.model}
                    {m.is_selected && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-mono text-blue-400 font-bold">
                    ROC-AUC: {(m.roc_auc * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-slate-950/60 rounded-lg mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    <span className="font-bold text-slate-200">{(m.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Precision</span>
                    <span className="font-bold text-slate-200">{(m.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Recall</span>
                    <span className="font-bold text-slate-200">{(m.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">F1-Score</span>
                    <span className="font-bold text-slate-200">{(m.f1_score * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{m.reason}</p>
              </div>
            ))}
          </div>

          {/* Feature Importances */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Top Predictive Churn Feature Weights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {churn.feature_importance.map((f, i) => (
                <div key={i} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-medium truncate" title={f.feature}>
                      {f.feature}
                    </span>
                    <span className="font-bold text-blue-400 font-mono">{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${f.importance * 100 * 2.2}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cohort Heatmap Section */}
      {cohorts && <CohortHeatmap cohorts={cohorts.cohorts} />}

      {/* Complete Customer Data Table with Filters */}
      <DataTable
        title="Customer Intelligence Explorer"
        subtitle="Individual customer profiling with RFM segment scores, machine learning churn risk, and historical revenue metrics."
        data={customers}
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
        exportFilename="customers_intelligence_export.csv"
        isLoading={isTableLoading}
        actions={
          <div className="flex items-center space-x-2">
            {/* Segment Filter */}
            <select
              value={selectedSegmentFilter}
              onChange={(e) => {
                setSelectedSegmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Segments</option>
              <option value="Champions">Champions</option>
              <option value="Loyal Customers">Loyal Customers</option>
              <option value="Potential Loyalists">Potential Loyalists</option>
              <option value="New Customers">New Customers</option>
              <option value="Promising">Promising</option>
              <option value="Need Attention">Need Attention</option>
              <option value="At Risk">At Risk</option>
              <option value="Can't Lose Them">Can't Lose Them</option>
              <option value="Lost Customers">Lost Customers</option>
            </select>

            {/* Churn Risk Filter */}
            <select
              value={selectedRiskFilter}
              onChange={(e) => {
                setSelectedRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Churn Risk</option>
              <option value="Low Risk">Low Risk (&lt;40%)</option>
              <option value="Medium Risk">Medium Risk (40-70%)</option>
              <option value="High Risk">High Risk (&gt;70%)</option>
            </select>
          </div>
        }
      />
    </div>
  );
};
