import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Lock,
  Database,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { DataService } from '../services/dataService';

interface ConnectionsPageProps {
  onNavigate: (path: string) => void;
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ onNavigate }) => {
  const [aaSimulating, setAaSimulating] = useState(false);
  const [aaConsentId, setAaConsentId] = useState<string | null>('SETU-CONSENT-SANDBOX-8821');
  const [aaStatus, setAaStatus] = useState<'PENDING' | 'ACTIVE'>('ACTIVE');
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleLaunchAaConsent = async () => {
    setAaSimulating(true);
    setShowConsentModal(true);

    try {
      const res = await fetch('/api/setu-sandbox/consent', { method: 'POST' });
      const data = await res.json();
      setAaConsentId(data.consent_id);
    } catch {}

    setTimeout(() => {
      setAaStatus('ACTIVE');
      setAaSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Data Sources & Integration Adapters
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              DPDP & RBI Consent Compliant
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            SubMate utilizes a source-agnostic architecture. Statement import serves as the privacy-first working source, with Account Aggregator and UPI AutoPay adapters architected for production scale.
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-xs shrink-0 self-start md:self-auto">
          <p className="font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Integrity Guardrail
          </p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            SubMate never asks for bank passwords, UPI PINs, or OTPs. All ingestion occurs via explicit consent.
          </p>
        </div>
      </div>

      {/* Integration Adapter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. CSV / XLSX Statement Ingestion (Working Primary Source) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Connected & Active
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-3">
              Bank Statement CSV / XLSX Ingestion
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Lowest-dependency ingestion path. Supports statements from HDFC, ICICI, SBI, Axis, Kotak, and mobile payment export sheets with column auto-mapping.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Deduplication key:</span>
                <span className="font-mono text-[11px]">user + date + amt + ref</span>
              </div>
              <div className="flex justify-between">
                <span>Active records:</span>
                <span className="font-bold text-slate-900">347 transactions</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/import')}
            className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
          >
            Open Import Wizard →
          </button>
        </div>

        {/* 2. Password-Protected PDF Ingestion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Client-Side Ready
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-3">
              Password-Protected Bank PDF Parser
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Decrypted directly in-browser using PDF.js. Your DOB/PAN statement password never leaves the device.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Execution sandbox:</span>
                <span className="font-semibold text-purple-700">In-Browser PDF.js</span>
              </div>
              <div className="flex justify-between">
                <span>Password retention:</span>
                <span className="font-semibold text-emerald-700">Zero (Never Stored)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/import')}
            className="w-full py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
          >
            Upload Protected PDF Statement →
          </button>
        </div>

        {/* 3. Account Aggregator (Setu Sandbox) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                Sandbox Simulator Active
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-3">
              Account Aggregator (Setu AA Framework)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              India's RBI-regulated financial information framework. Automates deposit statement fetching upon customer consent (Purpose 102: Spending Analysis).
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Consent Handle:</span>
                <span className="font-mono text-[10px] text-sky-800">{aaConsentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Consent Status:</span>
                <span className="font-bold text-emerald-600">{aaStatus}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchAaConsent}
            className="w-full py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors text-center"
          >
            Test Setu Consent Flow →
          </button>
        </div>

        {/* 4. UPI AutoPay Mandate Center */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Demo Mandate Center
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-3">
              UPI AutoPay Mandate Tracking
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              In accordance with NPCI's Oct 2025 interoperability circular, users monitor authorized mandates here while mandate modifications take place securely in your UPI app.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Active mandates:</span>
                <span className="font-bold text-slate-800">4 Mandates Monitored</span>
              </div>
              <div className="flex justify-between">
                <span>Mandate Portability:</span>
                <span className="text-emerald-700 font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg text-center text-[11px] text-slate-500">
            Mandate details reconciled automatically against bank debits.
          </div>
        </div>
      </div>

      {/* Consent Modal for AA Simulation */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Setu Account Aggregator Consent
                </h3>
                <p className="text-xs text-slate-500">Sandbox Consent Artifact Simulation</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">FIU Entity:</span>
                <span className="font-semibold text-slate-900">SubMate Financial Intelligence</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="font-semibold text-slate-900">102 - Customer Spending Pattern</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested FI Types:</span>
                <span className="font-semibold text-slate-900">DEPOSIT (Bank Transactions)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-semibold text-slate-900">MONTHLY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Life:</span>
                <span className="font-semibold text-slate-900">90 Days</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Consent Approved (Simulated)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
