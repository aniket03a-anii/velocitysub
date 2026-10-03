import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Table as TableIcon,
  Pause,
  Play,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Subscription, BillingCycle, SubscriptionStatus } from '../types';
import { BrandIcon } from '../components/common/BrandIcon';
import { computeMonthlyCost, computeAnnualCost } from '../services/savingsEngine';

interface SubscriptionsPageProps {
  onNavigate: (path: string) => void;
  initialAddOpen?: boolean;
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  onNavigate,
  initialAddOpen = false
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'list'>('table');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(initialAddOpen);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formMerchant, setFormMerchant] = useState('');
  const [formCategory, setFormCategory] = useState('Entertainment');
  const [formAmount, setFormAmount] = useState('499');
  const [formCycle, setFormCycle] = useState<BillingCycle>('monthly');
  const [formNextBilling, setFormNextBilling] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI AutoPay');
  const [formStatus, setFormStatus] = useState<SubscriptionStatus>('active');

  const loadData = () => {
    setSubscriptions(DataService.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const openAddModal = () => {
    setEditingSub(null);
    setFormMerchant('');
    setFormCategory('Entertainment');
    setFormAmount('499');
    setFormCycle('monthly');
    setFormNextBilling(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormPaymentMethod('UPI AutoPay');
    setFormStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setFormMerchant(sub.merchant_name);
    setFormCategory(sub.category);
    setFormAmount(sub.amount.toString());
    setFormCycle(sub.cycle);
    setFormNextBilling(sub.next_billing_date);
    setFormPaymentMethod(sub.payment_method);
    setFormStatus(sub.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount) || 0;
    if (!formMerchant.trim()) return;

    if (editingSub) {
      DataService.updateSubscription(editingSub.id, {
        merchant_name: formMerchant.trim(),
        category: formCategory,
        amount: amountNum,
        cycle: formCycle,
        next_billing_date: formNextBilling,
        payment_method: formPaymentMethod,
        status: formStatus
      });
    } else {
      DataService.addSubscription({
        user_id: 'usr_demo_863038',
        merchant_name: formMerchant.trim(),
        category: formCategory,
        amount: amountNum,
        cycle: formCycle,
        next_billing_date: formNextBilling,
        payment_method: formPaymentMethod,
        status: formStatus,
        source: 'manual',
        confidence: 100,
        price_change_percent: 0
      });
    }

    setModalOpen(false);
  };

  const handleTogglePause = (sub: Subscription) => {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    DataService.updateSubscription(sub.id, { status: nextStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this subscription from your active ledger?')) {
      DataService.deleteSubscription(id);
    }
  };

  // KPIs
  const totalCount = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialCount = subscriptions.filter((s) => s.status === 'trial').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const monthlyTotal = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthly_cost || computeMonthlyCost(s.amount, s.cycle)), 0);

  // Filter & Sort
  const filtered = subscriptions.filter((sub) => {
    const matchSearch =
      sub.merchant_name.toLowerCase().includes(search.toLowerCase()) ||
      sub.category.toLowerCase().includes(search.toLowerCase()) ||
      sub.payment_method.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'date') {
      comp = new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime();
    } else if (sortBy === 'amount') {
      comp = a.monthly_cost - b.monthly_cost;
    } else if (sortBy === 'name') {
      comp = a.merchant_name.localeCompare(b.merchant_name);
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  const categories = Array.from(new Set(subscriptions.map((s) => s.category)));

  return (
    <div className="space-y-6">
      {/* Top Header (Snitch Aesthetic) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            CONFIRMED RECURRING LEDGER
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
            Subscription Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Confirmed recurring commitments, renewals, and annualized expense ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => DataService.exportSubscriptionsCSV()}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-zinc-100 rounded-xl transition-all border border-zinc-200 shadow-2xs flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('/discover')}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all border border-zinc-200/80 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>Review Candidates</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-black text-white bg-slate-950 hover:bg-zinc-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (matching Reference Screenshot 1 & 4) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">TOTAL</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tabular-nums">{totalCount}</span>
            <span className="text-[10px] text-slate-400">All registered</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">ACTIVE</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tabular-nums">{activeCount}</span>
            <span className="text-[10px] text-slate-400">Currently in use</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">PAUSED / REVIEW</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tabular-nums">{pausedCount}</span>
            <span className="text-[10px] text-slate-400">On hold</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">MONTHLY COMMITMENT</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-indigo-600 tabular-nums">
              ₹{monthlyTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">/mo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ANNUAL PROJECTION</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              ₹{(monthlyTotal * 12).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">/yr</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="trial">Trial</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table / Cards / List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No subscriptions match your search</h3>
          <p className="text-xs text-slate-400">Clear filters or add a new subscription manually.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 border-b border-slate-100 font-semibold">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Billing Cycle</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => {
                  const today = new Date('2026-10-02');
                  const dueDate = new Date(sub.next_billing_date);
                  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const daysBadge =
                    diffDays < 0 ? `${Math.abs(diffDays)}d ago` : diffDays === 0 ? 'Today' : `${diffDays}d`;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <BrandIcon name={sub.merchant_name} size="md" />
                          <div>
                            <span className="font-bold text-slate-900">{sub.merchant_name}</span>
                            <p className="text-[11px] text-slate-400">{sub.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                        ₹{sub.amount.toLocaleString('en-IN')}
                        <p className="text-[10px] text-slate-400 font-normal">
                          ₹{sub.monthly_cost.toLocaleString('en-IN')}/mo
                        </p>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">{sub.cycle}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-indigo-600">{daysBadge}</span>
                        <p className="text-[10px] text-slate-400">{sub.next_billing_date}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{sub.payment_method}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : sub.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button
                            onClick={() => handleTogglePause(sub)}
                            title={sub.status === 'paused' ? 'Resume' : 'Pause'}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            {sub.status === 'paused' ? (
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Pause className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(sub)}
                            title="Edit"
                            className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            title="Delete"
                            className="p-1 hover:text-rose-600 hover:bg-slate-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BrandIcon name={sub.merchant_name} size="lg" />
                  <div>
                    <h3 className="font-bold text-slate-900">{sub.merchant_name}</h3>
                    <p className="text-[11px] text-slate-400">{sub.category}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    sub.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Amount</span>
                  <p className="font-bold text-slate-900 tabular-nums">
                    ₹{sub.amount.toLocaleString('en-IN')}/{sub.cycle}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Next Renewal</span>
                  <p className="font-semibold text-indigo-600">{sub.next_billing_date}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="text-[11px] truncate max-w-[150px]">{sub.payment_method}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePause(sub)}
                    className="p-1 hover:text-slate-900 text-slate-400"
                  >
                    {sub.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1 hover:text-indigo-600 text-slate-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1 hover:text-rose-600 text-slate-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Subscription Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSub ? 'Edit Subscription' : 'Add New Subscription'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Merchant / Service Name</label>
                <input
                  type="text"
                  required
                  value={formMerchant}
                  onChange={(e) => setFormMerchant(e.target.value)}
                  placeholder="e.g. Netflix, Spotify, OpenAI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Cadence</label>
                  <select
                    value={formCycle}
                    onChange={(e) => setFormCycle(e.target.value as BillingCycle)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half-yearly">Half-Yearly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Billing Date</label>
                  <input
                    type="date"
                    required
                    value={formNextBilling}
                    onChange={(e) => setFormNextBilling(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="UPI AutoPay">UPI AutoPay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="NetBanking">NetBanking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SubscriptionStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingSub ? 'Save Changes' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
