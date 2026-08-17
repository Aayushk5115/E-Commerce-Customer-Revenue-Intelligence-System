import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, Megaphone, LineChart, Activity, Menu, X, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import axios from 'axios'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts'

// Create axios instance
const api = axios.create({ baseURL: 'http://localhost:8000/api' })

// Layout Component
const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  
  const navItems = [
    { name: 'Executive Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Customer Intelligence', path: '/customers', icon: <Users size={20} /> },
    { name: 'Product Intelligence', path: '/products', icon: <ShoppingBag size={20} /> },
    { name: 'Forecasting', path: '/forecast', icon: <LineChart size={20} /> },
    { name: 'Business Insights', path: '/insights', icon: <Activity size={20} /> },
  ]

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
      <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
        <span className="text-lg font-bold">E-Comm Intel</span>
        <button className="lg:hidden" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link key={item.name} to={item.path} className={`flex items-center px-6 py-3 transition-colors ${location.pathname === item.path ? 'bg-primary text-primary-foreground border-r-4 border-white' : 'hover:bg-slate-800'}`}>
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}

// Components
const KpiCard = ({ title, value, prefix = '', suffix = '' }) => (
  <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
    <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
    <div className="text-3xl font-bold">{prefix}{value}{suffix}</div>
  </div>
)

// Pages
const ExecutiveOverview = () => {
  const [kpis, setKpis] = useState(null)
  const [trend, setTrend] = useState([])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, trendRes] = await Promise.all([
          api.get('/kpis'),
          api.get('/revenue/trend')
        ])
        setKpis(kpiRes.data)
        setTrend(trendRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  if (!kpis) return <div className="p-8 flex items-center justify-center">Loading Data...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value={(kpis.total_revenue / 1000000).toFixed(2)} prefix="$" suffix="M" />
        <KpiCard title="Total Profit" value={(kpis.total_profit / 1000000).toFixed(2)} prefix="$" suffix="M" />
        <KpiCard title="Profit Margin" value={(kpis.profit_margin * 100).toFixed(1)} suffix="%" />
        <KpiCard title="Avg Order Value" value={kpis.aov.toFixed(2)} prefix="$" />
        <KpiCard title="Total Orders" value={(kpis.total_orders / 1000).toFixed(1)} suffix="k" />
        <KpiCard title="Total Customers" value={(kpis.total_customers / 1000).toFixed(1)} suffix="k" />
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-96">
        <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickFormatter={(v) => v.substring(0,7)} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} stroke="hsl(var(--muted-foreground))" />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const CustomerIntelligence = () => {
  const [segments, setSegments] = useState([])
  const [churn, setChurn] = useState([])
  
  useEffect(() => {
    const fetch = async () => {
      const [segRes, churnRes] = await Promise.all([
        api.get('/customers/segments'),
        api.get('/customers/churn')
      ])
      setSegments(segRes.data)
      setChurn(churnRes.data)
    }
    fetch()
  }, [])
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  const CHURN_COLORS = {'Low Risk': '#10b981', 'Medium Risk': '#f59e0b', 'High Risk': '#ef4444'}

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Customer Intelligence</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium mb-4">RFM Customer Segments</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segments} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {segments.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Customers']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium mb-4">Churn Risk Distribution (Machine Learning)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [value, 'Customers']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {churn.map((entry, index) => <Cell key={`cell-${index}`} fill={CHURN_COLORS[entry.name] || '#8884d8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

const Forecasting = () => {
  const [data, setData] = useState([])
  
  useEffect(() => {
    api.get('/forecast').then(res => setData(res.data))
  }, [])
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Revenue Forecasting (ARIMA)</h1>
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-[500px]">
        <h3 className="text-lg font-medium mb-4">6-Month Revenue Projection</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickFormatter={(v) => v.substring(0,7)} />
            <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Line type="monotone" dataKey="forecast_revenue" name="Forecast" stroke="#3b82f6" strokeWidth={3} />
            <Line type="monotone" dataKey="lower_bound_95" name="Lower 95%" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="upper_bound_95" name="Upper 95%" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const BusinessInsights = () => {
  const [insights, setInsights] = useState([])
  
  useEffect(() => {
    api.get('/insights').then(res => setInsights(res.data))
  }, [])
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Business Insights Engine</h1>
      <div className="grid gap-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-card p-6 rounded-lg shadow-sm border border-l-4 border-l-primary">
            <h3 className="text-xl font-semibold mb-2">{insight.finding}</h3>
            <p className="text-muted-foreground mb-4">{insight.why_it_matters}</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <strong className="block text-sm uppercase text-slate-500 mb-1">Recommendation</strong>
              <p className="mb-2">{insight.recommendation}</p>
              <strong className="block text-sm uppercase text-slate-500 mb-1">Expected Impact</strong>
              <p className="text-green-600 dark:text-green-400 font-medium">{insight.expected_impact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-border flex items-center px-4 lg:px-8 justify-between lg:justify-end">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Data Analyst Portfolio</span>
            </div>
          </header>
          
          <main className="flex-1 p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<ExecutiveOverview />} />
              <Route path="/customers" element={<CustomerIntelligence />} />
              <Route path="/forecast" element={<Forecasting />} />
              <Route path="/insights" element={<BusinessInsights />} />
              <Route path="*" element={<div className="text-center p-12"><h1>Coming Soon</h1><p>This page is part of the extensive analytics platform.</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
