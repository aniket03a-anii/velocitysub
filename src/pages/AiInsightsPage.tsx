import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { AiInsight, Subscription } from '../types';
import { AiService } from '../services/aiService';

interface AiInsightsPageProps {
  onNavigate: (path: string) => void;
}

export const AiInsightsPage: React.FC<AiInsightsPageProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [generating, setGenerating] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  const loadData = () => {
    setInsights(DataService.getInsights());
    setSubscriptions(DataService.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const handleAuditSubscription = async (sub: Subscription) => {
    setGenerating(true);
    const explanation = await AiService.explainRecurringCandidate({
      merchant: sub.merchant_name,
      historical_amount: sub.previous_amount,
      current_amount: sub.amount,
      frequency: sub.cycle,
      repeat_count: 5,
      confidence: sub.confidence || 95,
      category: sub.category
    });

    DataService.addInsight({
      title: explanation.title,
      summary: explanation.summary,
      insight_type: sub.price_change_percent ? 'price_increase' : 'savings_opportunity',
      severity: sub.price_change_percent ? 'warning' : 'info',
      evidence: { merchant: sub.merchant_name, amount: sub.amount, cycle: sub.cycle },
      suggested_action: explanation.suggested_action
    });

    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              AI Financial Insights
            </h1>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              Gemini & Recurrence Reasoning
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Plain-language explanations of recurring trends, tariff spikes, duplicate software tooling, and cash-flow anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('/discover')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            Review Discovery Queue →
          </button>
        </div>
      </div>

      {/* Quick Audit Bar */}
      <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-slate-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Run On-Demand Gemini Intelligence Audit</h2>
            <p className="text-[11px] text-slate-500">
              Select any tracked subscription to synthesize instant contract and pricing insights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {subscriptions.slice(0, 3).map((sub) => (
            <button
              key={sub.id}
              disabled={generating}
              onClick={() => handleAuditSubscription(sub)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              Analyze {sub.merchant_name}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      ins.severity === 'warning'
                        ? 'bg-rose-50 text-rose-600'
                        : ins.severity === 'critical'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {ins.severity === 'warning' || ins.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ins.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ins.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    ins.severity === 'warning'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {ins.insight_type.replace('_', ' ')}
                </span>
              </div>

              {/* What happened */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    What Happened
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed mt-0.5">
                    {ins.summary}
                  </p>
                </div>

                {/* Suggested Action */}
                {ins.suggested_action && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Suggested Action
                    </span>
                    <p className="text-slate-900 font-semibold mt-0.5">
                      {ins.suggested_action}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Deterministic Evidence Verified</span>
              <button
                onClick={() => onNavigate('/savings')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Simulate Impact</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
