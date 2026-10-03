import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Clock,
  Lock,
  Layers,
  Activity,
  Users,
  DollarSign,
  Percent,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Subscription, DetectionCandidate, Transaction, AiInsight } from '../types';
import { analyzeSavingsAndOverlaps, computeMonthlyCost } from '../services/savingsEngine';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { lockNow } = useSecurity();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [candidates, setCandidates] = useState<DetectionCandidate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any>(DataService.getBudgetStatus());

  const loadData = () => {
    setSubscriptions(DataService.getSubscriptions());
    setCandidates(DataService.getCandidates());
    setTransactions(DataService.getTransactions());
    setInsights(DataService.getInsights());
    setBudgetStatus(DataService.getBudgetStatus());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const pendingCandidates = candidates.filter((c) => c.status === 'pending');
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const savingsSummary = analyzeSavingsAndOverlaps(subscriptions, candidates);

  // Compute monthly recurring total
  const monthlyRecurringSpend = activeSubs.reduce(
    (sum, sub) => sum + (sub.monthly_cost || computeMonthlyCost(sub.amount, sub.cycle)),
    0
  );

  const totalMonthlySpend =
    transactions.length > 0
      ? transactions.slice(0, 42).reduce((sum, t) => sum + t.amount, 0)
      : 42580;

  // Chart data: 10-month / 6-month historical curve matching PDF Page 1 screenshot
  const revenueTrendData = [
    { month: 'Jan', value: 14200 },
    { month: 'Feb', value: 16800 },
    { month: 'Mar', value: 15400 },
    { month: 'Apr', value: 18900 },
    { month: 'May', value: 21400 },
    { month: 'Jun', value: 20200 },
    { month: 'Jul', value: 22800 },
    { month: 'Aug', value: 25100 },
    { month: 'Sep', value: 24300 },
    { month: 'Oct', value: 26400 }
  ];

  // Activities matching PDF Page 1 screenshot ("RECENT ACTIVITY") + SubMate intelligence events
  const recentActivities = [
    {
      title: 'Payment received — Meridian Labs',
      meta: 'Invoice #1142 · $280.00',
      time: '13 min ago',
      icon: DollarSign
    },
    {
      title: 'Netflix price increase flagged',
      meta: 'Tariff shifted from ₹499 to ₹649 (+30%)',
      time: '45 min ago',
      icon: AlertTriangle,
      badge: 'Alert'
    },
    {
      title: 'New subscriber — Harbour & Co.',
      meta: 'Studio plan · annual billing',
      time: '1 hr ago',
      icon: Users
    },
    {
      title: 'Spotify AutoPay scheduled',
      meta: 'Renews on 12 Oct · ₹119.00 via UPI',
      time: '2 hrs ago',
      icon: CalendarIcon
    },
    {
      title: 'Two-factor & biometric lock enabled',
      meta: 'Security policy updated across devices',
      time: 'Yesterday',
      icon: ShieldCheck
    },
    {
      title: 'Plan upgraded — Atlas Studio',
      meta: 'Starter → Studio · $49/mo',
      time: 'Yesterday',
      icon: TrendingUp
    }
  ];

  const currentDateDisplay = 'Saturday, October 3 — here’s how the workspace is doing.';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER (Matching PDF Page 1, 3, 4: Greeting left, Sync right) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#D8D5CA]/60 pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-[#092326]">
            Good morning, {user?.full_name ? user.full_name.split(' ')[0] : 'Anaghraj'}
          </h1>
          <p className="text-xs text-[#526064] mt-1 font-sans">
            {currentDateDisplay}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#526064] self-start sm:self-auto">
          <span className="flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#092326]" />
            <span>Last synced 2 minutes ago</span>
          </span>

          <button
            onClick={lockNow}
            title="Lock Vault"
            className="flex items-center gap-1 text-[11px] font-medium text-[#092326] bg-[#E4EBD8] hover:bg-[#d8e4c7] px-2.5 py-1 rounded-[6px] border border-[#D8D5CA] transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* 4 EQUAL KPI CARDS (Matching PDF Page 1, 3, 4: Shared equal height, aligned baselines, delta badges in sage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue this month / Spend */}
        <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#526064] text-xs">
            <span className="font-sans text-[11px]">Revenue this month</span>
            <DollarSign className="w-4 h-4 text-[#526064]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium tracking-tight text-[#092326] tabular-nums">
              $24,300
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="bg-[#E4EBD8] text-[#092326] px-1.5 py-0.5 rounded-[4px] font-semibold text-[10px]">
              +12.4%
            </span>
            <span className="text-[#526064]">vs last month</span>
          </div>
        </div>

        {/* KPI 2: Active subscribers / Subscriptions */}
        <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#526064] text-xs">
            <span className="font-sans text-[11px]">Active subscribers</span>
            <Users className="w-4 h-4 text-[#526064]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium tracking-tight text-[#092326] tabular-nums">
              1,284
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="bg-[#E4EBD8] text-[#092326] px-1.5 py-0.5 rounded-[4px] font-semibold text-[10px]">
              +38
            </span>
            <span className="text-[#526064]">this month</span>
          </div>
        </div>

        {/* KPI 3: API requests / Processed statements */}
        <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#526064] text-xs">
            <span className="font-sans text-[11px]">API requests</span>
            <Activity className="w-4 h-4 text-[#526064]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium tracking-tight text-[#092326] tabular-nums">
              86.2K
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="bg-[#E4EBD8] text-[#092326] px-1.5 py-0.5 rounded-[4px] font-semibold text-[10px]">
              86.2%
            </span>
            <span className="text-[#526064]">of 100K quota</span>
          </div>
        </div>

        {/* KPI 4: Churn rate / Savings Potential */}
        <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#526064] text-xs">
            <span className="font-sans text-[11px]">Churn rate</span>
            <Percent className="w-4 h-4 text-[#526064]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium tracking-tight text-[#092326] tabular-nums">
              2.1%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="bg-[#E4EBD8] text-[#092326] px-1.5 py-0.5 rounded-[4px] font-semibold text-[10px]">
              -0.4%
            </span>
            <span className="text-[#526064]">vs last month</span>
          </div>
        </div>
      </div>

      {/* PROACTIVE BUDGET ALERT BANNER */}
      <div
        className={`p-4 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs transition-colors ${
          budgetStatus.status === 'exceeded'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : budgetStatus.status === 'warning'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-[#FBF9F3] border-[#D8D5CA] text-[#092326]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-[8px] flex items-center justify-center font-bold shrink-0 ${
              budgetStatus.status === 'exceeded'
                ? 'bg-rose-200 text-rose-900'
                : budgetStatus.status === 'warning'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-[#E4EBD8] text-[#092326]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider font-mono">
                {budgetStatus.status === 'exceeded'
                  ? 'Budget Limit Exceeded'
                  : budgetStatus.status === 'warning'
                  ? 'Budget Warning Alert'
                  : 'Monthly Recurring Budget'}
              </span>
              <span className="text-[10px] bg-white/70 px-1.5 py-0.2 rounded border border-current/20 font-mono">
                {budgetStatus.percentage_used}% Utilized
              </span>
            </div>
            <p className="text-[11px] text-[#526064] mt-0.5">
              Committed: <strong className="text-[#092326]">₹{budgetStatus.current_monthly_spend.toLocaleString('en-IN')}</strong> of ₹{budgetStatus.monthly_budget.toLocaleString('en-IN')} cap. {budgetStatus.remaining_budget > 0 ? `(₹${budgetStatus.remaining_budget.toLocaleString('en-IN')} headroom)` : '(Cap exceeded)'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/settings')}
          className="text-xs font-semibold underline text-[#092326] hover:opacity-80 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          Manage Budget Limits →
        </button>
      </div>

      {/* DISCOVERY CANDIDATES BANNER (Core SubMate Feature) */}
      {pendingCandidates.length > 0 && (
        <div
          onClick={() => onNavigate('/discover')}
          className="bg-[#FBF9F3] border border-[#D8D5CA] p-4 rounded-[12px] flex items-center justify-between cursor-pointer hover:border-[#092326] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#E4EBD8] text-[#092326] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#092326]">
                {pendingCandidates.length} Recurring Candidates Awaiting Confirmation
              </p>
              <p className="text-[11px] text-[#526064]">
                "Discover first. Ask users to confirm." Tap to review transparent billing evidence.
              </p>
            </div>
          </div>
          <button className="px-3 py-1 bg-[#092326] text-[#FBF9F3] rounded-[6px] text-xs font-medium flex items-center gap-1">
            <span>Review</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PRIMARY GRID (~2/3 WIDTH REVENUE TREND + ~1/3 RECENT ACTIVITY as in Page 1, 3, 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE TREND CARD (~2/3 width) */}
        <div className="lg:col-span-2 bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-[#526064] tracking-[0.12em] uppercase font-mono">
                REVENUE TREND
              </h2>
            </div>
            <div className="text-xs text-[#526064]">
              <span>10 months · <strong className="text-[#092326]">$193,000 total</strong></span>
            </div>
          </div>

          {/* Calm monochrome area chart */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="vaultRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#092326" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#092326" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#526064' }}
                  axisLine={{ stroke: '#D8D5CA' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#526064' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FBF9F3',
                    border: '1px solid #D8D5CA',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#092326'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#092326"
                  strokeWidth={1.75}
                  fillOpacity={1}
                  fill="url(#vaultRevenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY CARD (~1/3 width, matching Page 1 screenshot) */}
        <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D8D5CA]">
            <h2 className="text-xs font-bold text-[#526064] tracking-[0.12em] uppercase font-mono">
              RECENT ACTIVITY
            </h2>
          </div>

          <div className="divide-y divide-[#D8D5CA]/70 flex-1 flex flex-col justify-around">
            {recentActivities.map((act, index) => {
              const Icon = act.icon;
              return (
                <div key={index} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#F2F0E7] text-[#092326] flex items-center justify-center shrink-0 mt-0.5 border border-[#D8D5CA]">
                      <Icon className="w-3 h-3 text-[#092326]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#092326] truncate">{act.title}</p>
                      <p className="text-[11px] text-[#526064] truncate">{act.meta}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#526064] shrink-0 font-mono">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
