import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Transaction, Subscription } from '../types';
import { computeMonthlyCost } from '../services/savingsEngine';

interface AnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '3m' | '6m' | '12m'>('6m');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadData = () => {
    setTransactions(DataService.getTransactions());
    setSubscriptions(DataService.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyRecurringTotal = activeSubs.reduce(
    (sum, s) => sum + (s.monthly_cost || computeMonthlyCost(s.amount, s.cycle)),
    0
  );

  // Spending Trend Data
  const trendData = [
    { period: 'May 2026', total: 38400, recurring: 3850, oneTime: 34550 },
    { period: 'Jun 2026', total: 41200, recurring: 3950, oneTime: 37250 },
    { period: 'Jul 2026', total: 39800, recurring: 4100, oneTime: 35700 },
    { period: 'Aug 2026', total: 44100, recurring: 4350, oneTime: 39750 },
    { period: 'Sep 2026', total: 42580, recurring: monthlyRecurringTotal || 4475, oneTime: 38105 },
    { period: 'Oct 2026', total: 43200, recurring: monthlyRecurringTotal || 4475, oneTime: 38725 }
  ];

  // Category shares
  const categoryBreakdown = [
    { name: 'Rent & Housing', amount: 24000, percent: 56.4, color: '#6366f1' },
    { name: 'Investments & SIP', amount: 5000, percent: 11.7, color: '#0ea5e9' },
    { name: 'Food & Dining', amount: 4850, percent: 11.4, color: '#ec4899' },
    { name: 'Productivity & Software', amount: 2628, percent: 6.2, color: '#8b5cf6' },
    { name: 'Utilities & Telecom', amount: 3029, percent: 7.1, color: '#f59e0b' },
    { name: 'Entertainment', amount: 1446, percent: 3.4, color: '#10b981' },
    { name: 'Transportation', amount: 1627, percent: 3.8, color: '#14b8a6' }
  ];

  // Largest purchases
  const largestExpenses = [
    { merchant: 'CRED Apartment Rent #401', category: 'Rent & Housing', date: '2026-09-01', amount: 24000 },
    { merchant: 'HDFC Home Loan EMI', category: 'EMI & Loans', date: '2026-09-05', amount: 18500 },
    { merchant: 'ICICI Lombard Health Policy', category: 'Insurance', date: '2026-06-15', amount: 14200 },
    { merchant: 'Zerodha SIP Coin Mutual', category: 'Investments', date: '2026-09-10', amount: 5000 },
    { merchant: 'Adobe Creative Cloud', category: 'Productivity', date: '2026-09-18', amount: 4890 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Financial & Recurring Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Historical outflow distributions, subscription vs one-time proportions, and predictive run rates.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto">
          {(['30d', '3m', '6m', '12m'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '30d' ? '30 Days' : r === '3m' ? '3 Months' : r === '6m' ? '6 Months' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Monthly Outflow</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">₹41,476</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 recorded months</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase">Recurring Share</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-600 tabular-nums">10.5%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">₹4,475/mo leisure + software</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Fixed Obligations</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">71.8%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rent, EMI, SIP & Utilities</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Discretionary Spend</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">17.7%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dining, shopping, and transit</p>
        </div>
      </div>

      {/* Main Charts: Area Spend Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outflow Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Historical Spending Trend</h2>
              <p className="text-xs text-slate-500">Recurring commitments vs one-time variable purchases</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Recurring Commitments</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>One-Time Purchases</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="recurring" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRecurring)" />
                <Area type="monotone" dataKey="oneTime" stroke="#94a3b8" fillOpacity={1} fill="url(#colorOneTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Category Allocation (matching reference screenshot 3 & 5) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Total Spend Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution across major living categories</p>
          </div>

          <div className="h-52 w-full my-auto relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Total</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">₹42,580</span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px]">
            {categoryBreakdown.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-800 tabular-nums">{c.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Largest Expenses Table (matching reference screenshot 5) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Largest Expenses Analyzed</h2>
          <p className="text-xs text-slate-500">Major debits discovered in your uploaded bank records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-2.5 px-4">Merchant / Narration</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {largestExpenses.map((exp, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{exp.merchant}</td>
                  <td className="py-3 px-4 text-slate-500">{exp.category}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">{exp.date}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900 text-right tabular-nums">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
