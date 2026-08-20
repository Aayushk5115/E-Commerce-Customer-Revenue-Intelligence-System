import React from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  LineChart,
  Lightbulb,
  Megaphone,
  X,
  TrendingUp,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentCompanyId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentCompanyId }) => {
  const params = useParams<{ companyId?: string }>();
  const activeCompanyId = currentCompanyId || params.companyId || 'company-1';

  const navItems = [
    {
      name: 'Executive Overview',
      path: `/company/${activeCompanyId}`,
      icon: <LayoutDashboard size={20} />,
      badge: 'Core KPIs',
      exact: true,
    },
    {
      name: 'Customer Intelligence',
      path: `/company/${activeCompanyId}/customers`,
      icon: <Users size={20} />,
      badge: 'RFM & Churn',
    },
    {
      name: 'Product Intelligence',
      path: `/company/${activeCompanyId}/products`,
      icon: <ShoppingBag size={20} />,
      badge: 'Matrix & Return',
    },
    {
      name: 'Marketing Analytics',
      path: `/company/${activeCompanyId}/marketing`,
      icon: <Megaphone size={20} />,
      badge: 'ROAS & CAC',
    },
    {
      name: 'Forecasting',
      path: `/company/${activeCompanyId}/forecast`,
      icon: <LineChart size={20} />,
      badge: 'ARIMA 95%',
    },
    {
      name: 'Business Insights',
      path: `/company/${activeCompanyId}/insights`,
      icon: <Lightbulb size={20} />,
      badge: 'Rule Engine',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-slate-950 border-b border-slate-800/80">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block group-hover:text-blue-400 transition-colors">
                E-Comm Intel
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Multi-Tenant BI
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Analytics Modules
            </span>
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Building2 size={11} />
              <span>All Companies</span>
            </Link>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-blue-500/40 text-blue-100'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700/80 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Info / System Status */}
        <div className="p-4 m-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200">Tenant Scoped</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {activeCompanyId}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Strict isolation & schema normalization active.
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
