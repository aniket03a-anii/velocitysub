import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  User,
  Bell,
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  Database,
  RefreshCw,
  CheckCircle,
  FileText,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  PieChart,
  Sliders,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSecurity, AutoLockDuration } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { AuditLog, Subscription, Transaction, BudgetConfig, BudgetStatus } from '../types';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, refreshPersona } = useAuth();
  const {
    isLockEnabled,
    isBiometricsEnabled,
    autoLockDuration,
    setLockEnabled,
    setBiometricsEnabled,
    setAutoLockDuration,
    setPinCode,
    lockNow
  } = useSecurity();

  const { theme, setTheme, isEditorial } = useTheme();
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  const [profileName, setProfileName] = useState(user?.full_name || 'Anaghraj S. Thakur');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // PIN code change state
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeNotice, setPinChangeNotice] = useState<string | null>(null);

  // Budget configuration state
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(DataService.getBudgetConfig());
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>(DataService.getBudgetStatus());
  const [budgetInput, setBudgetInput] = useState<string>(budgetConfig.monthly_budget.toString());
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState<boolean>(budgetConfig.alerts_enabled);
  const [budgetThresholdInput, setBudgetThresholdInput] = useState<number>(budgetConfig.warning_threshold_percent);
  const [budgetSavedNotice, setBudgetSavedNotice] = useState<string | null>(null);

  const loadData = () => {
    setAuditLogs(DataService.getAuditLogs());
    setSubscriptions(DataService.getSubscriptions());
    setTransactions(DataService.getTransactions());
    const bConfig = DataService.getBudgetConfig();
    setBudgetConfig(bConfig);
    setBudgetStatus(DataService.getBudgetStatus());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateProfile({
      full_name: profileName,
      currency,
      timezone
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setPinChangeNotice('PIN must be exactly 4 digits.');
      return;
    }
    setPinCode(newPinInput);
    setPinChangeNotice(`Security PIN updated to: ${newPinInput}`);
    setNewPinInput('');
    setTimeout(() => setPinChangeNotice(null), 4000);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.max(500, parseFloat(budgetInput) || 5000);
    const updated = DataService.updateBudgetConfig({
      monthly_budget: parsedAmount,
      alerts_enabled: budgetAlertsEnabled,
      warning_threshold_percent: budgetThresholdInput
    });
    setBudgetConfig(updated);
    setBudgetStatus(DataService.getBudgetStatus());
    setBudgetSavedNotice('Monthly budget limit and alert thresholds updated!');
    setTimeout(() => setBudgetSavedNotice(null), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Generate a fresh, distinct financial profile and transaction dataset?')) {
      refreshPersona();
      setExportNotice('Generated fresh personalized spending profile with new transactions & subscriptions!');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // PDF REPORT EXPORT (USER REQUIREMENT)
  const handleExportPDF = () => {
    DataService.exportPDFReport();
    setExportNotice('Beautifully formatted Subscription PDF report generated and downloaded!');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const handleExportFullArchive = () => {
    DataService.exportFullArchiveCSV();
    setExportNotice('Complete financial archive exported as CSV file.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportSubscriptions = () => {
    DataService.exportSubscriptionsCSV();
    setExportNotice('Subscription history exported as CSV file.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportTransactions = () => {
    DataService.exportTransactionsCSV();
    setExportNotice('Transactions ledger exported as CSV file.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="border-b border-[#D8D5CA]/70 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#092326]">
            Settings & Security
          </h1>
          <p className="text-xs text-[#526064] mt-1 font-sans">
            Personal PDF report archives, budget overspend alerts, biometric lock, and audit traceability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={lockNow}
            className="px-3 py-1.5 bg-[#E4EBD8] text-[#092326] border border-[#D8D5CA] rounded-[8px] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#d8e4c7] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock App</span>
          </button>
          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#FBF9F3] bg-[#092326] hover:bg-[#14393d] rounded-[8px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E4EBD8]" />
            <span>Switch Persona</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[8px] text-xs text-[#092326] font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#092326] shrink-0" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {exportNotice && (
        <div className="p-3.5 bg-[#092326] text-[#FBF9F3] rounded-[8px] text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#E4EBD8] shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[10px] text-[#E4EBD8] uppercase tracking-wider font-mono">READY</span>
        </div>
      )}

      {/* THEME & RESTORE PREVIOUS UI OPTION (USER REQUIREMENT) */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CA]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5 text-[#E4EBD8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#092326] font-serif tracking-tight text-base">
                Dashboard UI Style & Restore Options
              </h2>
              <p className="text-xs text-[#526064]">
                Choose between the calm editorial command center or restore the previous high-contrast dark aesthetic.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-[#092326] bg-[#E4EBD8] px-2.5 py-1 rounded-[6px] border border-[#D8D5CA] font-semibold self-start sm:self-auto">
            Active: {isEditorial ? 'Velocity Editorial' : 'Classic SubMate'}
          </span>
        </div>

        {themeNotice && (
          <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[8px] text-xs text-[#092326] font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#092326]" />
            <span>{themeNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Velocity Editorial */}
          <div
            onClick={() => {
              setTheme('editorial');
              setThemeNotice('Velocity Editorial Command Center theme applied.');
              setTimeout(() => setThemeNotice(null), 3500);
            }}
            className={`p-4 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              isEditorial
                ? 'border-[#092326] bg-[#F2F0E7] ring-1 ring-[#092326]'
                : 'border-[#D8D5CA] bg-white hover:border-[#092326]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#092326] font-serif text-sm">
                  ✦ Velocity Editorial (Current)
                </span>
                {isEditorial && (
                  <span className="text-[10px] font-bold text-[#092326] bg-[#E4EBD8] px-2 py-0.5 rounded border border-[#D8D5CA]">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#526064] mt-1 leading-relaxed">
                Warm paper-like ivory canvas, dark ink typography, thin 1px dividers, restrained sage badges, Cormorant Garamond display serif, and 240px command rail.
              </p>
            </div>
            <button
              type="button"
              className={`w-full py-2 rounded-[6px] text-xs font-semibold transition-colors ${
                isEditorial ? 'bg-[#092326] text-[#FBF9F3]' : 'bg-[#F2F0E7] text-[#092326] hover:bg-[#E4EBD8]'
              }`}
            >
              {isEditorial ? 'Current Active UI' : 'Apply Editorial UI'}
            </button>
          </div>

          {/* Option 2: Classic SubMate (Restore Option) */}
          <div
            onClick={() => {
              setTheme('classic');
              setThemeNotice('Previous Classic SubMate UI restored.');
              setTimeout(() => setThemeNotice(null), 3500);
            }}
            className={`p-4 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              !isEditorial
                ? 'border-[#092326] bg-slate-100 ring-1 ring-[#092326]'
                : 'border-[#D8D5CA] bg-white hover:border-[#092326]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-sans">
                  ↺ Classic SubMate (Restore Option)
                </span>
                {!isEditorial && (
                  <span className="text-[10px] font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                    RESTORED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Restore the previous obsidian high-contrast design with pure black pills, floating mobile dock, indigo metric accents, and bold modern typography.
              </p>
            </div>
            <button
              type="button"
              className={`w-full py-2 rounded-[6px] text-xs font-semibold transition-colors ${
                !isEditorial ? 'bg-[#092326] text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {!isEditorial ? 'Current Restored UI' : 'Restore Previous UI'}
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 1: BEAUTIFULLY FORMATTED SUBSCRIPTION PDF REPORT & ARCHIVES */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CA]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5 text-[#E4EBD8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#092326] font-serif tracking-tight text-base">
                Subscription Archiving & Export Center
              </h2>
              <p className="text-xs text-[#526064]">
                Export beautifully formatted PDF dossiers or spreadsheets for personal bookkeeping and tax audits.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-[#526064] self-start sm:self-auto bg-[#F2F0E7] px-2.5 py-1 rounded-[6px] border border-[#D8D5CA]">
            {subscriptions.length} Subscriptions · {transactions.length} Records
          </span>
        </div>

        {/* Highlighted Vector PDF Banner */}
        <div className="p-4 bg-gradient-to-r from-[#F2F0E7] to-[#E4EBD8]/60 border border-[#D8D5CA] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#092326] text-[#FBF9F3] px-2 py-0.5 rounded-[4px] font-mono">
                PDF REPORT
              </span>
              <h3 className="text-sm font-bold text-[#092326] font-serif">
                Velocity Executive Subscription Dossier (PDF)
              </h3>
            </div>
            <p className="text-xs text-[#526064] max-w-xl leading-relaxed">
              Generates a beautifully styled, multi-table vector PDF including active subscriptions, autonomous candidate detections with price hike audits, and personalized savings roadmaps.
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-[#092326] hover:bg-[#14393d] text-[#FBF9F3] rounded-[8px] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#E4EBD8]" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* CSV Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-[8px] border border-[#D8D5CA] bg-[#F2F0E7]/60 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                Unified CSV
              </span>
              <h4 className="text-xs font-bold text-[#092326] mt-0.5">Complete Archive (CSV)</h4>
              <p className="text-[11px] text-[#526064] mt-0.5">
                Full statement ledger, subscriptions, candidates & savings recommendations.
              </p>
            </div>
            <button
              onClick={handleExportFullArchive}
              className="w-full py-1.5 text-xs font-medium text-[#092326] bg-[#FBF9F3] hover:bg-[#E4EBD8] border border-[#D8D5CA] rounded-[6px] transition-all cursor-pointer"
            >
              Export Archive CSV
            </button>
          </div>

          <div className="p-3.5 rounded-[8px] border border-[#D8D5CA] bg-[#F2F0E7]/60 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                Subscriptions CSV
              </span>
              <h4 className="text-xs font-bold text-[#092326] mt-0.5">Subscriptions History</h4>
              <p className="text-[11px] text-[#526064] mt-0.5">
                Active & past commitments, renewal schedules, and price increase tracking.
              </p>
            </div>
            <button
              onClick={handleExportSubscriptions}
              className="w-full py-1.5 text-xs font-medium text-[#092326] bg-[#FBF9F3] hover:bg-[#E4EBD8] border border-[#D8D5CA] rounded-[6px] transition-all cursor-pointer"
            >
              Export Subs CSV
            </button>
          </div>

          <div className="p-3.5 rounded-[8px] border border-[#D8D5CA] bg-[#F2F0E7]/60 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                Ledger CSV
              </span>
              <h4 className="text-xs font-bold text-[#092326] mt-0.5">Transactions Ledger</h4>
              <p className="text-[11px] text-[#526064] mt-0.5">
                Cleaned vendor names, UTR numbers, recurring tags, and confidence scores.
              </p>
            </div>
            <button
              onClick={handleExportTransactions}
              className="w-full py-1.5 text-xs font-medium text-[#092326] bg-[#FBF9F3] hover:bg-[#E4EBD8] border border-[#D8D5CA] rounded-[6px] transition-all cursor-pointer"
            >
              Export Ledger CSV
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 2: BUDGET & OVERSPEND ALERT SETTINGS */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CA]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold shrink-0">
              <PieChart className="w-5 h-5 text-[#E4EBD8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#092326] font-serif tracking-tight text-base">
                Recurring Budget & Spending Alerts
              </h2>
              <p className="text-xs text-[#526064]">
                Set proactive spending boundaries and trigger automated warnings before auto-debits overextend your balance.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-[6px] border self-start sm:self-auto ${
              budgetStatus.status === 'exceeded'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : budgetStatus.status === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-[#E4EBD8] text-[#092326] border-[#D8D5CA]'
            }`}
          >
            {budgetStatus.status === 'exceeded'
              ? 'Exceeded Budget'
              : budgetStatus.status === 'warning'
              ? `Warning (${budgetStatus.percentage_used}%)`
              : `Within Limit (${budgetStatus.percentage_used}%)`}
          </span>
        </div>

        {budgetSavedNotice && (
          <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[8px] text-xs text-[#092326] font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#092326]" />
            <span>{budgetSavedNotice}</span>
          </div>
        )}

        {/* Visual Budget Utilization Bar */}
        <div className="p-4 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[10px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#092326]">
              Monthly Committed Spend: <strong className="font-mono text-sm">₹{budgetStatus.current_monthly_spend.toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-[#526064] font-mono">
              Budget: ₹{budgetStatus.monthly_budget.toLocaleString('en-IN')} / mo
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#D8D5CA]/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                budgetStatus.status === 'exceeded'
                  ? 'bg-rose-600'
                  : budgetStatus.status === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-[#092326]'
              }`}
              style={{ width: `${Math.min(100, budgetStatus.percentage_used)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#526064]">
            <span>{budgetStatus.percentage_used}% budget utilized</span>
            <span>
              {budgetStatus.remaining_budget > 0
                ? `₹${budgetStatus.remaining_budget.toLocaleString('en-IN')} remaining capacity`
                : '0 capacity remaining'}
            </span>
          </div>
        </div>

        {/* Budget Form */}
        <form onSubmit={handleSaveBudget} className="space-y-4 pt-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-medium text-[#092326]">
                Monthly Subscription Budget ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326] font-mono text-xs"
                />
              </div>
              <p className="text-[10px] text-[#526064]">Cap for all active recurring plans</p>
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-[#092326]">
                Warning Threshold Alert
              </label>
              <select
                value={budgetThresholdInput}
                onChange={(e) => setBudgetThresholdInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326] text-xs"
              >
                <option value={70}>Alert at 70% threshold</option>
                <option value={80}>Alert at 80% threshold (Default)</option>
                <option value={90}>Alert at 90% threshold</option>
                <option value={100}>Alert only when exceeded (100%)</option>
              </select>
              <p className="text-[10px] text-[#526064]">Sends notification when reached</p>
            </div>

            <div className="space-y-1 flex flex-col justify-between">
              <label className="block font-medium text-[#092326]">
                Budget Alerts Toggle
              </label>
              <div className="p-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] flex items-center justify-between">
                <span className="text-[11px] text-[#526064]">Enable in-app alerts</span>
                <input
                  type="checkbox"
                  checked={budgetAlertsEnabled}
                  onChange={(e) => setBudgetAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#092326] rounded cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-[#526064]">Creates notification alerts</p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-[#092326] hover:bg-[#14393d] text-[#FBF9F3] rounded-[8px] font-semibold text-xs transition-colors cursor-pointer"
            >
              Save Budget Settings
            </button>
          </div>
        </form>
      </div>

      {/* BIOMETRIC & PIN CODE SECURITY LOCK */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8D5CA]/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#092326] text-[#FBF9F3] flex items-center justify-center font-bold shrink-0">
              <Lock className="w-5 h-5 text-[#E4EBD8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#092326] font-serif tracking-tight text-base">
                Velocity Security & Biometric Lock
              </h2>
              <p className="text-xs text-[#526064]">
                Enhance confidentiality of bank statements, recurring debits, and personal financial data.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-[6px] border ${
              isLockEnabled
                ? 'bg-[#E4EBD8] text-[#092326] border-[#D8D5CA]'
                : 'bg-zinc-100 text-[#526064] border-zinc-200'
            }`}
          >
            {isLockEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        {pinChangeNotice && (
          <div className="p-2.5 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[6px] text-xs text-[#092326] font-medium">
            {pinChangeNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#092326]">PIN Code Lock</p>
              <p className="text-[11px] text-[#526064] mt-0.5">
                Require 4-digit code to view financial data.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isLockEnabled}
              onChange={(e) => setLockEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#092326] rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#092326]" />
              <div>
                <p className="font-semibold text-[#092326]">Touch ID / Face ID</p>
                <p className="text-[11px] text-[#526064] mt-0.5">
                  Unlock using biometric hardware sensor.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              disabled={!isLockEnabled}
              checked={isBiometricsEnabled}
              onChange={(e) => setBiometricsEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#092326] rounded cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <form onSubmit={handleUpdatePin} className="space-y-1.5 text-xs">
            <label className="block font-medium text-[#092326]">
              Change 4-Digit Security PIN (Default: 1234)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="New 4-digit PIN"
                className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326] font-mono tracking-widest text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#092326] text-[#FBF9F3] hover:bg-[#14393d] rounded-[8px] font-medium shrink-0 cursor-pointer"
              >
                Set PIN
              </button>
            </div>
          </form>

          <div className="space-y-1.5 text-xs">
            <label className="block font-medium text-[#092326]">
              Auto-Lock Inactivity Interval
            </label>
            <select
              value={autoLockDuration}
              onChange={(e) => setAutoLockDuration(e.target.value as AutoLockDuration)}
              className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326] text-xs"
            >
              <option value="immediate">Immediately upon switching tabs</option>
              <option value="1min">After 1 minute of inactivity</option>
              <option value="5min">After 5 minutes of inactivity (Recommended)</option>
              <option value="never">Never (Manual lock only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROFILE DETAILS */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#092326] flex items-center gap-2 font-serif text-base">
          <User className="w-4 h-4 text-[#092326]" />
          <span>Profile & Workspace Details</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#092326] mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#092326] mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'aniket03a@gmail.com'}
                className="w-full px-3 py-2 bg-[#F2F0E7]/60 border border-[#D8D5CA] rounded-[8px] text-[#526064] cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#092326] mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326]"
              >
                <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#092326] mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-[#092326] focus:outline-none focus:ring-1 focus:ring-[#092326]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-[#FBF9F3] bg-[#092326] hover:bg-[#14393d] rounded-[8px] transition-all cursor-pointer"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* AUDIT LOGS TRAIL */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8D5CA]/70 pb-3">
          <h2 className="text-sm font-bold text-[#092326] flex items-center gap-2 font-serif text-base">
            <Database className="w-4 h-4 text-[#092326]" />
            <span>Audit Trail & Security Logs</span>
          </h2>
          <span className="text-[11px] font-mono text-[#526064]">Last 100 immutable events</span>
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-[#D8D5CA]/60 border border-[#D8D5CA] rounded-[8px] bg-[#F2F0E7]">
          {auditLogs.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#526064]">No events recorded yet.</div>
          ) : (
            auditLogs.slice(0, 15).map((log) => (
              <div key={log.id} className="p-2 text-xs flex items-center justify-between hover:bg-[#FBF9F3]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#526064]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-semibold text-[#092326] bg-[#E4EBD8] px-1.5 py-0.2 rounded font-mono text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-[#526064]">[{log.object_type}]</span>
                </div>
                <span className="text-[10px] font-mono text-[#526064] truncate max-w-xs">
                  {JSON.stringify(log.metadata || {})}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
