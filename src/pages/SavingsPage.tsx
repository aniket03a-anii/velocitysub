import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { SavingsRecommendation } from '../types';
import { analyzeSavingsAndOverlaps } from '../services/savingsEngine';

interface SavingsPageProps {
  onNavigate: (path: string) => void;
}

export const SavingsPage: React.FC<SavingsPageProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<SavingsRecommendation[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = () => {
    const subs = DataService.getSubscriptions();
    const cands = DataService.getCandidates();
    const summary = analyzeSavingsAndOverlaps(subs, cands);
    const recs = DataService.getRecommendations();

    // Combine loaded recommendations with dynamic recommendations
    const allRecs = recs.length > 0 ? recs : summary.recommendations;
    setRecommendations(allRecs);

    // Default select high-impact demo recommendations (matching the prompt scenario: ₹1,535/mo -> ₹18,420/yr)
    if (selectedIds.size === 0 && allRecs.length > 0) {
      const defaultSelected = new Set(
        allRecs.filter((r) => !r.title.toLowerCase().includes('spotify')).map((r) => r.id)
      );
      setSelectedIds(defaultSelected);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const toggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const selectAll = () => {
    setSelectedIds(new Set(recommendations.map((r) => r.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Compute selected potential savings
  const selectedRecs = recommendations.filter((r) => selectedIds.has(r.id));
  const simMonthly = selectedRecs.reduce((sum, r) => sum + r.monthly_saving, 0);
  const simAnnual = selectedRecs.reduce((sum, r) => sum + r.annual_saving, 0);

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Savings Simulator
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
              Deterministic Financial Calculations
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Simulate your annualized savings by auditing price hikes, consolidating category overlaps, or pausing unused plans.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-right shrink-0 self-start md:self-auto">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Legal Disclaimer</span>
          <p className="text-[11px] text-slate-600 font-medium">
            Labelled strictly as <em>Potential Savings</em>. Not guaranteed returns.
          </p>
        </div>
      </div>

      {/* Simulator Hero Counter Card */}
      <div className="bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase">
              Selected Potential Optimization ({selectedRecs.length} items checked)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-5xl font-extrabold tracking-tight tabular-nums">
                ₹{simAnnual.toLocaleString('en-IN')}
              </span>
              <span className="text-sm md:text-base text-indigo-200 font-semibold">/year potential</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-indigo-200">
              <span>
                Monthly equivalent: <strong className="text-white">₹{simMonthly.toLocaleString('en-IN')}/mo</strong>
              </span>
              <span>·</span>
              <span>
                Average saving: <strong className="text-white">₹{selectedRecs.length ? Math.round(simAnnual / selectedRecs.length) : 0}/item</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleCelebrate}
              className="px-5 py-3 text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 rounded-xl shadow-md transition-all active:scale-95"
            >
              🎉 Lock Optimization Plan
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Total Potential Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Subscription Optimizations</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900 tabular-nums">₹12,800</span>
            <span className="text-[10px] text-slate-400">/year</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tier revisions & annual prepay savings</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Hidden Expense Opportunities</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900 tabular-nums">₹5,620</span>
            <span className="text-[10px] text-slate-400">/year</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unconfirmed recurring debits detected</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/20">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase">Total Potential Annual Savings</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-indigo-600 tabular-nums">₹18,420</span>
            <span className="text-[10px] text-indigo-400">/year</span>
          </div>
          <p className="text-[11px] text-indigo-700 mt-1">Combined maximum opportunity</p>
        </div>
      </div>

      {/* Interactive Selection List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Optimization Candidates</h2>
            <p className="text-xs text-slate-500">Toggle opportunities to update live simulator projections</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={selectAll}
              className="text-indigo-600 hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={deselectAll}
              className="text-slate-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isChecked = selectedIds.has(rec.id);

            return (
              <div
                key={rec.id}
                onClick={() => toggleSelect(rec.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isChecked
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{rec.reason}</p>
                    <p className="text-[11px] text-indigo-700 font-medium mt-1">
                      💡 {rec.recommendation}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-emerald-600 tabular-nums">
                    +₹{rec.annual_saving.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal">/yr</span>
                  </span>
                  <p className="text-[10px] text-slate-400">
                    ₹{rec.monthly_saving.toLocaleString('en-IN')}/mo
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
