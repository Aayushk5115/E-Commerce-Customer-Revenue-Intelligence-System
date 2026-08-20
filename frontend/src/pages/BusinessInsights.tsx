import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchInsights } from '../services/api';
import type { BusinessInsight, FilterState } from '../types';

interface BusinessInsightsProps {
  filters: FilterState;
  companyId?: string;
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({
  filters,
  companyId: propCompanyId,
}) => {
  const params = useParams<{ companyId?: string }>();
  const activeCompanyId = propCompanyId || params.companyId || 'company-1';

  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    const loadInsights = async () => {
      try {
        const res = await fetchInsights(activeCompanyId, filters);
        if (isMounted) {
          setInsights(res);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      }
    };

    loadInsights();
    return () => {
      isMounted = false;
    };
  }, [activeCompanyId, filters]);

  const categories = ['All', 'Revenue & Growth', 'Customer Retention', 'Product & Margins', 'Marketing Efficiency', 'Operational Efficiency'];

  const filteredInsights =
    selectedCategory === 'All'
      ? insights
      : insights.filter((i) => i.category === selectedCategory);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <AlertOctagon size={13} />
            <span>High Priority</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Zap size={13} />
            <span>Medium Priority</span>
          </span>
        );
      case 'positive':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={13} />
            <span>Growth Opportunity</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <Sparkles size={13} />
            <span>Insight</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Lightbulb size={16} />
            <span>Automated Analytics Intelligence Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Real-Time Prescriptive Business Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Rules-driven prescriptive intelligence generated dynamically from live transaction thresholds, customer RFM distributions, and marketing ROAS data.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 self-start md:self-auto text-xs text-slate-300">
          <Target size={16} className="text-emerald-400 shrink-0" />
          <span>
            <strong>{insights.length}</strong> Actionable Insights Identified
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Insights Cards Grid */}
      <div className="grid gap-5">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4"
          >
            {/* Header: Category & Priority */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {insight.category}
              </span>
              {getSeverityBadge(insight.severity)}
            </div>

            {/* Finding */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {insight.finding}
              </h3>
            </div>

            {/* Why It Matters */}
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              <strong className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Why It Matters
              </strong>
              <p className="leading-relaxed">{insight.why_it_matters}</p>
            </div>

            {/* Recommendation & Business Impact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Strategic Recommendation */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
                    <Sparkles size={13} />
                    <span>Prescriptive Action</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>
              </div>

              {/* Quantified Business Impact */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    <TrendingUp size={13} />
                    <span>Expected Financial Impact</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 leading-relaxed">
                    {insight.expected_impact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
