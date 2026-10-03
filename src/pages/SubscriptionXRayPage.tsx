import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  PieChart as PieChartIcon,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Subscription, DetectionCandidate } from '../types';
import { analyzeSavingsAndOverlaps, computeMonthlyCost } from '../services/savingsEngine';
import { BrandIcon } from '../components/common/BrandIcon';

interface SubscriptionXRayPageProps {
  onNavigate: (path: string) => void;
}

export const SubscriptionXRayPage: React.FC<SubscriptionXRayPageProps> = ({ onNavigate }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [candidates, setCandidates] = useState<DetectionCandidate[]>([]);

  const loadData = () => {
    setSubscriptions(DataService.getSubscriptions());
    setCandidates(DataService.getCandidates());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const savings = analyzeSavingsAndOverlaps(subscriptions, candidates);

  // Compute monthly & annual recurring spend
  const totalMonthlyRecurring = activeSubs.reduce(
    (sum, s) => sum + (s.monthly_cost || computeMonthlyCost(s.amount, s.cycle)),
    0
  );
  const totalAnnualRecurring = totalMonthlyRecurring * 12;

  // Category concentration
  const catSpending: Record<string, number> = {};
  for (const s of activeSubs) {
    const cat = s.category || 'Other';
    catSpending[cat] = (catSpending[cat] || 0) + (s.monthly_cost || computeMonthlyCost(s.amount, s.cycle));
  }

  const categoryBarData = Object.entries(catSpending)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percent: Math.round((amount / (totalMonthlyRecurring || 1)) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);

  // Highest cost subscriptions
  const topSubscriptions = [...activeSubs]
    .sort((a, b) => (b.monthly_cost || 0) - (a.monthly_cost || 0))
    .slice(0, 4);

  // Price hike alerts
  const priceHikedSubs = activeSubs.filter(
    (s) => s.price_change_percent && s.price_change_percent > 0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Subscription X-Ray
            </h1>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Advanced Financial Auditing
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Deep forensic breakdown of recurring commitments, category density, silent price increases, and duplicate feature sets.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/savings')}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Open Savings Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Recurring Commitment
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              ₹{totalMonthlyRecurring.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ₹{totalAnnualRecurring.toLocaleString('en-IN')} annualized run-rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
            Category Concentration
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-600 tabular-nums">
              {categoryBarData[0]?.percent || 0}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">in {categoryBarData[0]?.category || 'Tech'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Highest concentration across {activeSubs.length} services
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Price Hike Surcharge
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              +₹{(savings.priceIncreaseImpactAnnual).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">/yr</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Added by recent tariff updates across vendors
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Potential Annual Savings
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              ₹{savings.totalPotentialAnnualSavings.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across overlaps, hikes & unused tiers
          </p>
        </div>
      </div>

      {/* Category Concentration & Top Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Concentration Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Category Concentration</h2>
            <p className="text-xs text-slate-500">Distribution of monthly recurring capital</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBarData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}/mo`, 'Spend']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {categoryBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#4f46e5' : '#818cf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cost Drivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Highest-Cost Subscriptions</h2>
            <p className="text-xs text-slate-500">Subscriptions with the largest monthly outflow</p>
          </div>

          <div className="space-y-3">
            {topSubscriptions.map((sub, idx) => {
              const mCost = sub.monthly_cost || computeMonthlyCost(sub.amount, sub.cycle);
              const share = Math.round((mCost / (totalMonthlyRecurring || 1)) * 100);

              return (
                <div
                  key={sub.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <BrandIcon name={sub.merchant_name} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.merchant_name}</p>
                      <p className="text-[11px] text-slate-500">{sub.category} · {sub.cycle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 tabular-nums">
                      ₹{mCost.toLocaleString('en-IN')}/mo
                    </p>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">
                      {share}% of recurring spend
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlapping Services Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Detected Service Overlaps</h2>
          <p className="text-xs text-slate-500">Multiple active subscriptions with redundant or closely matched features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savings.overlapGroups.map((group, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{group.category} Overlap</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  {group.count} Active Services
                </span>
              </div>

              <div className="space-y-1.5">
                {group.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <BrandIcon name={it.name} size="sm" />
                      <span className="font-semibold text-slate-800">{it.name}</span>
                    </div>
                    <span className="font-mono text-slate-700">₹{it.amount}/{it.cycle}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{group.suggestedAction}</p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Committed:</span>
                <span className="font-bold text-slate-900">₹{group.totalMonthlySpend.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Increases Section */}
      {priceHikedSubs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Price Increases Observed</h2>
            <p className="text-xs text-slate-500">Historical billing variations detected in your transactions</p>
          </div>

          <div className="divide-y divide-slate-100">
            {priceHikedSubs.map((sub) => {
              const prev = sub.previous_amount || Math.round(sub.amount / (1 + (sub.price_change_percent || 20) / 100));
              const delta = sub.amount - prev;
              const deltaAnnual = sub.cycle === 'yearly' ? delta : delta * 12;

              return (
                <div key={sub.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BrandIcon name={sub.merchant_name} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.merchant_name}</p>
                      <p className="text-[11px] text-slate-400">
                        Shifted from ₹{prev} to ₹{sub.amount} (+{sub.price_change_percent}%)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      +₹{deltaAnnual.toLocaleString('en-IN')}/yr
                    </span>
                    <p className="text-[10px] text-slate-400">Added to annual budget</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
