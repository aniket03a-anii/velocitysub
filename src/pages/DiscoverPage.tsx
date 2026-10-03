import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Info,
  ChevronRight,
  Bot,
  RefreshCw,
  PiggyBank,
  ArrowUpRight,
  Check,
  X,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { DetectionCandidate, Subscription } from '../types';
import { BrandIcon } from '../components/common/BrandIcon';
import { AiService, AiExplanationResponse, ServiceAlternative } from '../services/aiService';

interface DiscoverPageProps {
  onNavigate: (path: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onNavigate }) => {
  const [candidates, setCandidates] = useState<DetectionCandidate[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [mainView, setMainView] = useState<'candidates' | 'alternatives'>('candidates');
  const [candidateTab, setCandidateTab] = useState<'pending' | 'confirmed' | 'rejected'>('pending');

  // AI Modal state for candidate explanation
  const [aiModalCandidate, setAiModalCandidate] = useState<DetectionCandidate | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AiExplanationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [confirmedCandidateName, setConfirmedCandidateName] = useState<string | null>(null);

  // Gemini AI Cheaper Alternatives Discovery Feed state
  const [alternatives, setAlternatives] = useState<ServiceAlternative[]>([]);
  const [aiAlternativesLoading, setAiAlternativesLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [adoptedAlternatives, setAdoptedAlternatives] = useState<string[]>([]);
  const [compareModalAlt, setCompareModalAlt] = useState<ServiceAlternative | null>(null);

  const loadData = () => {
    setCandidates(DataService.getCandidates());
    setSubscriptions(DataService.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  // Fetch AI Alternatives on first load or when switching to alternatives view
  const fetchAlternatives = async () => {
    setAiAlternativesLoading(true);
    const result = await AiService.getCheaperAlternatives(subscriptions);
    setAlternatives(result.alternatives);
    setAiSource(result.source);
    setAiAlternativesLoading(false);
  };

  useEffect(() => {
    fetchAlternatives();
  }, [subscriptions.length]);

  const pendingList = candidates.filter((c) => c.status === 'pending');
  const confirmedList = candidates.filter((c) => c.status === 'confirmed');
  const rejectedList = candidates.filter((c) => c.status === 'rejected');

  const filteredCandidates =
    candidateTab === 'pending'
      ? pendingList
      : candidateTab === 'confirmed'
      ? confirmedList
      : rejectedList;

  const handleConfirmCandidate = (candidate: DetectionCandidate) => {
    const createdSub = DataService.confirmCandidate(candidate.id);
    if (createdSub) {
      setConfirmedCandidateName(candidate.normalized_merchant);
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 }
        });
      } catch {}
      setTimeout(() => setConfirmedCandidateName(null), 4000);
    }
  };

  const handleRejectCandidate = (candidateId: string) => {
    DataService.rejectCandidate(candidateId);
  };

  const handleAdoptAlternative = (alt: ServiceAlternative) => {
    setAdoptedAlternatives((prev) => [...prev, alt.id]);
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const openAiExplainModal = async (candidate: DetectionCandidate) => {
    setAiModalCandidate(candidate);
    setAiLoading(true);
    setAiExplanation(null);

    const explanation = await AiService.explainRecurringCandidate({
      merchant: candidate.normalized_merchant,
      historical_amount: candidate.previous_amount,
      current_amount: candidate.estimated_amount,
      frequency: candidate.frequency,
      repeat_count: candidate.evidence.repeat_count,
      confidence: candidate.confidence,
      category: candidate.evidence.category_guardrail_applied ? 'Fixed Financial Obligation' : 'Entertainment'
    });

    setAiExplanation(explanation);
    setAiLoading(false);
  };

  const filteredAlternatives = alternatives.filter(
    (alt) => selectedCategory === 'all' || alt.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const totalPotentialAlternativeSavings = alternatives.reduce(
    (sum, a) => sum + a.annual_savings,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="bg-[#FBF9F3] p-6 rounded-[12px] border border-[#D8D5CA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526064] font-mono">
            DISCOVERY & COST INTELLIGENCE
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#092326] tracking-tight">
              {mainView === 'candidates'
                ? 'Candidate Confirmation Center'
                : 'Cheaper Alternative Discovery Feed'}
            </h1>
            <span className="text-[10px] font-bold text-[#092326] bg-[#E4EBD8] px-2 py-0.5 rounded-[4px] border border-[#D8D5CA] font-mono">
              {mainView === 'candidates' ? 'Confirm First' : '✨ Gemini 3.8 Flash'}
            </span>
          </div>
          <p className="text-xs text-[#526064] mt-1 max-w-2xl font-sans">
            {mainView === 'candidates'
              ? 'Autonomous recurring pattern detector. Review objective transaction evidence before adding to subscriptions.'
              : 'Gemini AI evaluates your currently held plans against market rivals, open-source alternatives, and bundles to slash recurring fees.'}
          </p>
        </div>

        {/* Primary View Toggle (Candidate Review vs AI Alternative Feed) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] shrink-0 self-start md:self-auto">
          <button
            onClick={() => setMainView('candidates')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
              mainView === 'candidates'
                ? 'bg-[#092326] text-[#FBF9F3] font-semibold shadow-xs'
                : 'text-[#526064] hover:text-[#092326]'
            }`}
          >
            Candidate Queue ({pendingList.length})
          </button>
          <button
            onClick={() => setMainView('alternatives')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              mainView === 'alternatives'
                ? 'bg-[#092326] text-[#FBF9F3] font-semibold shadow-xs'
                : 'text-[#526064] hover:text-[#092326]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E4EBD8]" />
            <span>AI Alternatives ({alternatives.length})</span>
          </button>
        </div>
      </div>

      {/* Confirmation Success Toast */}
      {confirmedCandidateName && (
        <div className="p-4 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[10px] flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#092326] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#092326]">
                {confirmedCandidateName} is now tracked in your active subscriptions!
              </p>
              <p className="text-[11px] text-[#526064]">
                Renewal calendar forecasts and price hike monitoring are now enabled.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/subscriptions')}
            className="text-xs font-semibold text-[#092326] bg-[#FBF9F3] px-3 py-1.5 rounded-[6px] border border-[#D8D5CA] hover:bg-white"
          >
            View Subscriptions →
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: GEMINI AI CHEAPER ALTERNATIVE DISCOVERY FEED */}
      {/* ========================================================= */}
      {mainView === 'alternatives' && (
        <div className="space-y-6">
          {/* Executive Savings Callout */}
          <div className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                POTENTIAL SAVINGS DISCOVERY
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-bold text-[#092326] tabular-nums">
                  ₹{totalPotentialAlternativeSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#526064]">per year across {alternatives.length} services</span>
              </div>
              <p className="text-xs text-[#526064]">
                Analyzed via <strong className="text-[#092326]">Gemini 3.8 Flash</strong> against active subscriptions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAlternatives}
                disabled={aiAlternativesLoading}
                className="px-3.5 py-2 bg-[#092326] hover:bg-[#14393d] text-[#FBF9F3] rounded-[8px] text-xs font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiAlternativesLoading ? 'animate-spin' : ''}`} />
                <span>{aiAlternativesLoading ? 'Analyzing via Gemini...' : 'Re-run Gemini Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['all', 'Entertainment', 'Productivity', 'Health & Fitness'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-[6px] border font-medium uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#092326] text-[#FBF9F3] border-[#092326]'
                    : 'bg-[#FBF9F3] text-[#526064] border-[#D8D5CA] hover:bg-[#F2F0E7]'
                }`}
              >
                {cat === 'all' ? 'All Alternatives' : cat}
              </button>
            ))}
          </div>

          {/* Alternatives Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredAlternatives.map((alt) => {
              const isAdopted = adoptedAlternatives.includes(alt.id);

              return (
                <div
                  key={alt.id}
                  className="bg-[#FBF9F3] p-5 rounded-[12px] border border-[#D8D5CA] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#092326]/50 transition-colors"
                >
                  <div>
                    {/* Header comparison row */}
                    <div className="flex items-center justify-between border-b border-[#D8D5CA]/70 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                        {alt.category}
                      </span>
                      <span className="text-[10px] font-semibold text-[#092326] bg-[#E4EBD8] px-2 py-0.5 rounded-[4px] border border-[#D8D5CA]">
                        Save ₹{alt.annual_savings.toLocaleString('en-IN')}/yr (-{alt.savings_percent}%)
                      </span>
                    </div>

                    {/* From Current -> To Alternative */}
                    <div className="flex items-center justify-between gap-3 pt-3">
                      {/* Current Service */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BrandIcon name={alt.current_subscription} size="md" />
                        <div>
                          <p className="text-xs font-semibold text-[#092326] truncate">
                            {alt.current_subscription}
                          </p>
                          <p className="text-[11px] text-[#526064] font-mono">
                            ₹{alt.current_amount}/{alt.cadence}
                          </p>
                        </div>
                      </div>

                      {/* Direction Arrow */}
                      <div className="flex flex-col items-center justify-center text-[#526064] shrink-0">
                        <ArrowRight className="w-4 h-4 text-[#092326]" />
                        <span className="text-[9px] font-mono mt-0.5 uppercase tracking-wider">Replace</span>
                      </div>

                      {/* Cheaper Alternative */}
                      <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
                        <div>
                          <p className="text-xs font-bold text-[#092326] truncate">
                            {alt.alternative_service}
                          </p>
                          <p className="text-[11px] font-bold text-emerald-800 font-mono">
                            {alt.alternative_amount === 0 ? 'FREE' : `₹${alt.alternative_amount}/${alt.cadence}`}
                          </p>
                        </div>
                        <BrandIcon name={alt.alternative_service} size="md" />
                      </div>
                    </div>

                    {/* Pros & Benefits */}
                    <div className="mt-4 p-3 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] space-y-2 text-xs">
                      <p className="font-semibold text-[#092326] text-[11px]">Why switch with Gemini analysis:</p>
                      <ul className="space-y-1">
                        {alt.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-[#092326]">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>

                      {alt.trade_offs.length > 0 && (
                        <div className="pt-2 border-t border-[#D8D5CA]/60">
                          <p className="text-[10px] text-[#526064] font-medium">Trade-off note: {alt.trade_offs.join(' · ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#D8D5CA]/70 text-xs">
                    <button
                      onClick={() => setCompareModalAlt(alt)}
                      className="text-xs text-[#092326] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Compare Features</span>
                    </button>

                    <button
                      onClick={() => handleAdoptAlternative(alt)}
                      disabled={isAdopted}
                      className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdopted
                          ? 'bg-[#E4EBD8] text-[#092326] border border-[#D8D5CA]'
                          : 'bg-[#092326] hover:bg-[#14393d] text-[#FBF9F3]'
                      }`}
                    >
                      {isAdopted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Alternative Adopted</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#E4EBD8]" />
                          <span>Switch & Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: CANDIDATE CONFIRMATION QUEUE (DISCOVER FIRST) */}
      {/* ========================================================= */}
      {mainView === 'candidates' && (
        <div className="space-y-6">
          {/* Sub-tab pills for candidates */}
          <div className="flex items-center gap-1 p-1 bg-[#FBF9F3] border border-[#D8D5CA] rounded-[8px] w-fit text-xs">
            <button
              onClick={() => setCandidateTab('pending')}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all ${
                candidateTab === 'pending'
                  ? 'bg-[#092326] text-[#FBF9F3] shadow-xs'
                  : 'text-[#526064] hover:text-[#092326]'
              }`}
            >
              Pending ({pendingList.length})
            </button>
            <button
              onClick={() => setCandidateTab('confirmed')}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all ${
                candidateTab === 'confirmed'
                  ? 'bg-[#092326] text-[#FBF9F3] shadow-xs'
                  : 'text-[#526064] hover:text-[#092326]'
              }`}
            >
              Confirmed ({confirmedList.length})
            </button>
            <button
              onClick={() => setCandidateTab('rejected')}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-all ${
                candidateTab === 'rejected'
                  ? 'bg-[#092326] text-[#FBF9F3] shadow-xs'
                  : 'text-[#526064] hover:text-[#092326]'
              }`}
            >
              Rejected ({rejectedList.length})
            </button>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-[#FBF9F3] p-12 rounded-[12px] border border-[#D8D5CA] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E4EBD8] text-[#092326] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#092326]">
                No {candidateTab} detection candidates
              </h3>
              <p className="text-xs text-[#526064] max-w-sm mx-auto font-sans">
                All identified recurring patterns have been triaged. Import additional statements or check the AI Alternatives feed!
              </p>
              <button
                onClick={() => setMainView('alternatives')}
                className="px-4 py-2 text-xs font-semibold text-[#FBF9F3] bg-[#092326] hover:bg-[#14393d] rounded-[8px] shadow-xs cursor-pointer"
              >
                Browse AI Alternatives Feed →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCandidates.map((cand) => {
                const hasHike = cand.evidence.price_change_detected;
                const isGuardrail = cand.evidence.category_guardrail_applied;

                return (
                  <div
                    key={cand.id}
                    className="bg-[#FBF9F3] rounded-[12px] border border-[#D8D5CA] shadow-xs p-5 flex flex-col justify-between hover:border-[#092326]/50 transition-all space-y-4"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <BrandIcon name={cand.normalized_merchant} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-[#092326]">
                                {cand.normalized_merchant}
                              </h3>
                              {hasHike && (
                                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-[4px] border border-rose-200 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Hike +{cand.evidence.price_change_percent}%
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#526064]">
                              {cand.frequency.toUpperCase()} · Discovered via {cand.evidence.repeat_count} statement debits
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif text-lg font-bold text-[#092326] tabular-nums">
                            ₹{cand.estimated_amount.toLocaleString('en-IN')}
                          </span>
                          <p className="text-[10px] text-[#526064]">est. {cand.frequency}</p>
                        </div>
                      </div>

                      {/* Evidence Card */}
                      <div className="mt-3 p-3 bg-[#F2F0E7] border border-[#D8D5CA] rounded-[8px] text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#526064]">Pattern Confidence:</span>
                          <span className="font-bold text-[#092326] font-mono">{cand.confidence}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#526064]">Avg Interval:</span>
                          <span className="font-mono text-[#092326]">
                            {cand.evidence.average_interval_days ? `${cand.evidence.average_interval_days} days` : '30 days'}
                          </span>
                        </div>
                        {cand.previous_amount && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#526064]">Previous Rate:</span>
                            <span className="font-mono text-[#092326]">₹{cand.previous_amount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#D8D5CA]/70 text-xs">
                      <button
                        onClick={() => openAiExplainModal(cand)}
                        className="text-xs text-[#092326] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Gemini Evidence</span>
                      </button>

                      {candidateTab === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectCandidate(cand.id)}
                            className="px-2.5 py-1.5 text-xs text-[#526064] hover:text-rose-700 bg-[#F2F0E7] hover:bg-rose-50 border border-[#D8D5CA] rounded-[6px] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleConfirmCandidate(cand)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#FBF9F3] bg-[#092326] hover:bg-[#14393d] rounded-[6px] transition-all cursor-pointer shadow-xs"
                          >
                            Confirm Subscription
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Feature Comparison Modal */}
      {compareModalAlt && (
        <div className="fixed inset-0 z-50 bg-[#092326]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FBF9F3] border border-[#D8D5CA] rounded-[12px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D5CA] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526064] font-mono">
                  GEMINI FEATURE BREAKDOWN
                </span>
                <h3 className="font-serif text-lg font-bold text-[#092326] mt-0.5">
                  {compareModalAlt.current_subscription} vs {compareModalAlt.alternative_service}
                </h3>
              </div>
              <button
                onClick={() => setCompareModalAlt(null)}
                className="p-1 text-[#526064] hover:text-[#092326] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F2F0E7] rounded-[8px] border border-[#D8D5CA] space-y-1">
                <p className="font-bold text-[#092326]">{compareModalAlt.current_subscription}</p>
                <p className="text-[11px] text-[#526064]">₹{compareModalAlt.current_amount} / mo</p>
                <p className="text-[10px] text-[#526064] mt-2">Currently active in your bank debit ledger.</p>
              </div>

              <div className="p-3 bg-[#E4EBD8] rounded-[8px] border border-[#D8D5CA] space-y-1">
                <p className="font-bold text-[#092326]">{compareModalAlt.alternative_service}</p>
                <p className="text-[11px] font-bold text-emerald-800">
                  {compareModalAlt.alternative_amount === 0 ? 'FREE' : `₹${compareModalAlt.alternative_amount} / mo`}
                </p>
                <p className="text-[10px] text-[#092326] mt-2 font-semibold">
                  Saves ₹{compareModalAlt.annual_savings.toLocaleString('en-IN')}/year
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#092326]">Key Feature Advantages:</p>
              <ul className="space-y-1">
                {compareModalAlt.pros.map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-[#092326]">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#D8D5CA]">
              <button
                onClick={() => setCompareModalAlt(null)}
                className="px-3 py-1.5 bg-[#F2F0E7] text-[#092326] border border-[#D8D5CA] rounded-[6px] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAdoptAlternative(compareModalAlt);
                  setCompareModalAlt(null);
                }}
                className="px-4 py-1.5 bg-[#092326] text-[#FBF9F3] hover:bg-[#14393d] rounded-[6px] text-xs font-semibold cursor-pointer"
              >
                Adopt Alternative Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Candidate Explanation Modal */}
      {aiModalCandidate && (
        <div className="fixed inset-0 z-50 bg-[#092326]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FBF9F3] border border-[#D8D5CA] rounded-[12px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D5CA] pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#092326]" />
                <h3 className="font-serif text-lg font-bold text-[#092326]">
                  Gemini Detection Analysis
                </h3>
              </div>
              <button
                onClick={() => setAiModalCandidate(null)}
                className="p-1 text-[#526064] hover:text-[#092326] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {aiLoading ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#092326] mx-auto" />
                <p className="text-xs text-[#526064]">Querying Gemini 3.8 Flash intelligence...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#E4EBD8] border border-[#D8D5CA] rounded-[8px]">
                  <p className="font-bold text-[#092326]">{aiExplanation.title}</p>
                  <p className="text-[11px] text-[#092326] mt-1">{aiExplanation.summary}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#092326]">Algorithmic Evidence:</p>
                  <p className="text-[11px] text-[#526064] leading-relaxed">{aiExplanation.reason}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#092326]">Recommended Action:</p>
                  <p className="text-[11px] text-[#526064] leading-relaxed">{aiExplanation.suggested_action}</p>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAiModalCandidate(null)}
                className="px-4 py-1.5 bg-[#092326] text-[#FBF9F3] rounded-[6px] text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
