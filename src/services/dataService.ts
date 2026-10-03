import {
  Transaction,
  Subscription,
  DetectionCandidate,
  NotificationItem,
  AiInsight,
  SavingsRecommendation,
  FinancialConnection,
  UserProfile,
  AuditLog,
  BudgetConfig,
  BudgetStatus
} from '../types';
import { generatePersonalizedDataset, DEMO_USER_PROFILE } from './demoData';
import { computeMonthlyCost, computeAnnualCost } from './savingsEngine';
import { calculateNextRenewalDate } from './recurringDetectionService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PdfReportService } from './pdfReportService';

const STORAGE_KEYS = {
  PROFILE: 'submate_profile',
  TRANSACTIONS: 'submate_transactions',
  SUBSCRIPTIONS: 'submate_subscriptions',
  CANDIDATES: 'submate_candidates',
  NOTIFICATIONS: 'submate_notifications',
  INSIGHTS: 'submate_insights',
  RECOMMENDATIONS: 'submate_recommendations',
  CONNECTIONS: 'submate_connections',
  AUDIT_LOGS: 'submate_audit_logs',
  DEMO_LOADED: 'submate_demo_loaded',
  BUDGET: 'velocity_budget_config'
};

// Event emitter helper for reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDataChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

export class DataService {
  // Initialize storage with demo data if empty
  static init() {
    const demoLoaded = localStorage.getItem(STORAGE_KEYS.DEMO_LOADED);
    if (!demoLoaded) {
      this.loadDemoData();
    }
  }

  static loadPersonalizedData(userId: string, email: string, fullName: string, customSeed?: number) {
    const data = generatePersonalizedDataset(userId, email, fullName, customSeed);

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data.subscriptions));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(data.candidates));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(data.insights));
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(data.recommendations));

    const initialConnections: FinancialConnection[] = [
      {
        id: `conn_${userId}_hdfc`,
        user_id: userId,
        provider: 'CSV',
        connection_type: 'statement',
        status: 'active',
        consent_reference: `STMT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        last_sync_at: new Date().toISOString(),
        metadata: { filename: 'Bank_Statement_AutoExport.csv', records_count: data.transactions.length },
        created_at: new Date().toISOString()
      },
      {
        id: `conn_${userId}_aa`,
        user_id: userId,
        provider: 'Account Aggregator (Setu)',
        connection_type: 'aa_consent',
        status: 'demo',
        consent_reference: `SETU-SANDBOX-${Math.floor(1000 + Math.random() * 9000)}`,
        last_sync_at: new Date().toISOString(),
        metadata: { fiu: 'SubMate Sandbox', purpose: '102 - Spending Analysis' },
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(initialConnections));
    localStorage.setItem(STORAGE_KEYS.DEMO_LOADED, 'true');

    this.logAudit('LOAD_PERSONALIZED_DATA', 'dataset', userId, {
      email,
      transactions_count: data.transactions.length,
      subscriptions_count: data.subscriptions.length
    });
    notifyListeners();
  }

  static loadDemoData(customSeed?: number) {
    const seed = customSeed !== undefined ? customSeed : Math.floor(Math.random() * 1000000);
    const demo = generatePersonalizedDataset(
      DEMO_USER_PROFILE.user_id,
      DEMO_USER_PROFILE.email,
      DEMO_USER_PROFILE.full_name,
      seed
    );

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(demo.profile));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demo.transactions));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(demo.subscriptions));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(demo.candidates));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(demo.notifications));
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(demo.insights));
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(demo.recommendations));
    
    // Initial connections list
    const initialConnections: FinancialConnection[] = [
      {
        id: 'conn_hdfc',
        user_id: DEMO_USER_PROFILE.user_id,
        provider: 'CSV',
        connection_type: 'statement',
        status: 'active',
        consent_reference: 'STMT-HDFC-2026-09',
        last_sync_at: '2026-09-20T10:00:00Z',
        metadata: { filename: 'HDFC_Bank_Statement.csv', records_count: demo.transactions.length },
        created_at: '2026-09-20T10:00:00Z'
      },
      {
        id: 'conn_aa',
        user_id: DEMO_USER_PROFILE.user_id,
        provider: 'Account Aggregator (Setu)',
        connection_type: 'aa_consent',
        status: 'demo',
        consent_reference: 'SETU-CONSENT-SANDBOX-8821',
        last_sync_at: '2026-09-18T14:30:00Z',
        metadata: { fiu: 'SubMate Sandbox', purpose: '102 - Spending Analysis' },
        created_at: '2026-09-18T14:30:00Z'
      },
      {
        id: 'conn_autopay',
        user_id: DEMO_USER_PROFILE.user_id,
        provider: 'UPI AutoPay Demo',
        connection_type: 'mandate_center',
        status: 'active',
        consent_reference: 'NPCI-AUTOPAY-MANDATE-DEMO',
        last_sync_at: '2026-09-22T08:00:00Z',
        metadata: { active_mandates: 4, bank: 'HDFC Bank' },
        created_at: '2026-09-22T08:00:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(initialConnections));
    localStorage.setItem(STORAGE_KEYS.DEMO_LOADED, 'true');

    this.logAudit('LOAD_DEMO_DATA', 'dataset', 'all', { count: demo.transactions.length });
    notifyListeners();
  }

  static getProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEMO_USER_PROFILE;
  }

  static updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    notifyListeners();
    return updated;
  }

  // TRANSACTIONS
  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static addTransactions(newTxs: Transaction[]): { added: number; duplicates: number } {
    const current = this.getTransactions();
    const existingKeys = new Set(
      current.map(
        (t) =>
          `${t.date}_${t.amount}_${t.merchant_normalized.toLowerCase()}_${t.reference || ''}`
      )
    );

    let addedCount = 0;
    let duplicateCount = 0;
    const toAppend: Transaction[] = [];

    for (const tx of newTxs) {
      const key = `${tx.date}_${tx.amount}_${tx.merchant_normalized.toLowerCase()}_${tx.reference || ''}`;
      if (existingKeys.has(key)) {
        duplicateCount++;
      } else {
        existingKeys.add(key);
        toAppend.push(tx);
        addedCount++;
      }
    }

    if (toAppend.length > 0) {
      const merged = [...toAppend, ...current];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(merged));
      this.logAudit('IMPORT_TRANSACTIONS', 'transactions', undefined, {
        added: addedCount,
        duplicates: duplicateCount
      });
      notifyListeners();
    }

    return { added: addedCount, duplicates: duplicateCount };
  }

  static deleteTransaction(id: string): boolean {
    const current = this.getTransactions();
    const filtered = current.filter((t) => t.id !== id);
    if (filtered.length !== current.length) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
      notifyListeners();
      return true;
    }
    return false;
  }

  // SUBSCRIPTIONS
  static getSubscriptions(): Subscription[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static addSubscription(subData: Omit<Subscription, 'id' | 'created_at' | 'updated_at' | 'monthly_cost' | 'annual_cost'>): Subscription {
    const monthly_cost = computeMonthlyCost(subData.amount, subData.cycle);
    const annual_cost = computeAnnualCost(subData.amount, subData.cycle);
    const now = new Date().toISOString();

    const newSub: Subscription = {
      ...subData,
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      monthly_cost,
      annual_cost,
      created_at: now,
      updated_at: now
    };

    const current = this.getSubscriptions();
    const updated = [newSub, ...current];
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));

    this.logAudit('CREATE_SUBSCRIPTION', 'subscription', newSub.id, {
      merchant: newSub.merchant_name,
      amount: newSub.amount
    });

    notifyListeners();
    return newSub;
  }

  static updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
    const current = this.getSubscriptions();
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const existing = current[idx];
    const amount = updates.amount !== undefined ? updates.amount : existing.amount;
    const cycle = updates.cycle || existing.cycle;
    const monthly_cost = computeMonthlyCost(amount, cycle);
    const annual_cost = computeAnnualCost(amount, cycle);

    const updated: Subscription = {
      ...existing,
      ...updates,
      monthly_cost,
      annual_cost,
      updated_at: new Date().toISOString()
    };

    current[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(current));
    this.logAudit('UPDATE_SUBSCRIPTION', 'subscription', id, updates);
    notifyListeners();
    return updated;
  }

  static deleteSubscription(id: string): boolean {
    const current = this.getSubscriptions();
    const filtered = current.filter((s) => s.id !== id);
    if (filtered.length !== current.length) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filtered));
      this.logAudit('DELETE_SUBSCRIPTION', 'subscription', id);
      notifyListeners();
      return true;
    }
    return false;
  }

  // DETECTION CANDIDATES & CONFIRMATION
  static getCandidates(): DetectionCandidate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveCandidates(candidates: DetectionCandidate[]) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    notifyListeners();
  }

  // Core Product Action: Confirm Candidate -> Creates Subscription
  static confirmCandidate(
    candidateId: string,
    overrides?: {
      category?: string;
      cycle?: Subscription['cycle'];
      amount?: number;
      payment_method?: string;
    }
  ): Subscription | null {
    const candidates = this.getCandidates();
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return null;

    // 1. Mark candidate as confirmed
    cand.status = 'confirmed';
    this.saveCandidates(candidates);

    // 2. Compute subscription parameters
    const amount = overrides?.amount || cand.estimated_amount;
    const cycle = overrides?.cycle || cand.frequency;
    const next_billing_date = calculateNextRenewalDate(
      cand.evidence.last_detected_date || cand.last_detected,
      cycle
    );

    // 3. Create Subscription record
    const newSub = this.addSubscription({
      user_id: cand.user_id,
      merchant_name: cand.normalized_merchant,
      category: overrides?.category || 'Entertainment',
      amount,
      cycle,
      next_billing_date,
      payment_method: overrides?.payment_method || 'UPI AutoPay (Auto-detected)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: cand.confidence,
      last_payment_date: cand.evidence.last_detected_date || cand.last_detected,
      price_change_percent: cand.evidence.price_change_percent || 0,
      previous_amount: cand.previous_amount
    });

    // 4. Create confirmation notification
    this.addNotification({
      title: `${cand.normalized_merchant} confirmed as active subscription`,
      message: `Added ₹${amount}/${cycle} to your subscription ledger. Next renewal estimated on ${next_billing_date}.`,
      type: 'new_candidate',
      severity: 'success'
    });

    this.logAudit('CONFIRM_CANDIDATE', 'candidate', candidateId, {
      merchant: cand.normalized_merchant,
      created_subscription_id: newSub.id
    });

    notifyListeners();
    return newSub;
  }

  static rejectCandidate(candidateId: string): boolean {
    const candidates = this.getCandidates();
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return false;

    cand.status = 'rejected';
    this.saveCandidates(candidates);
    this.logAudit('REJECT_CANDIDATE', 'candidate', candidateId, { merchant: cand.normalized_merchant });
    notifyListeners();
    return true;
  }

  static ignoreCandidate(candidateId: string): boolean {
    const candidates = this.getCandidates();
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return false;

    cand.status = 'ignored';
    this.saveCandidates(candidates);
    notifyListeners();
    return true;
  }

  // NOTIFICATIONS
  static getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static addNotification(item: Omit<NotificationItem, 'id' | 'user_id' | 'scheduled_at' | 'created_at'>): NotificationItem {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      user_id: DEMO_USER_PROFILE.user_id,
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const current = this.getNotifications();
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newItem, ...current]));
    notifyListeners();
    return newItem;
  }

  static markNotificationRead(id: string): void {
    const current = this.getNotifications();
    const item = current.find((n) => n.id === id);
    if (item) {
      item.read_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current));
      notifyListeners();
    }
  }

  static markAllNotificationsRead(): void {
    const current = this.getNotifications();
    const now = new Date().toISOString();
    current.forEach((n) => {
      n.read_at = now;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current));
    notifyListeners();
  }

  // INSIGHTS
  static getInsights(): AiInsight[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    return raw ? JSON.parse(raw) : [];
  }

  static addInsight(insight: Omit<AiInsight, 'id' | 'user_id' | 'created_at'>): AiInsight {
    const newInsight: AiInsight = {
      ...insight,
      id: `ins_${Math.random().toString(36).substr(2, 9)}`,
      user_id: DEMO_USER_PROFILE.user_id,
      created_at: new Date().toISOString()
    };
    const current = this.getInsights();
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify([newInsight, ...current]));
    notifyListeners();
    return newInsight;
  }

  // RECOMMENDATIONS
  static getRecommendations(): SavingsRecommendation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  // CONNECTIONS
  static getConnections(): FinancialConnection[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static addConnection(conn: Omit<FinancialConnection, 'id' | 'user_id' | 'created_at'>): FinancialConnection {
    const newConn: FinancialConnection = {
      ...conn,
      id: `conn_${Math.random().toString(36).substr(2, 9)}`,
      user_id: DEMO_USER_PROFILE.user_id,
      created_at: new Date().toISOString()
    };
    const current = this.getConnections();
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify([newConn, ...current]));
    notifyListeners();
    return newConn;
  }

  // AUDIT LOGS
  static getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  static logAudit(action: string, object_type: string, object_id?: string, metadata?: Record<string, any>) {
    const log: AuditLog = {
      id: `audit_${Math.random().toString(36).substr(2, 9)}`,
      user_id: DEMO_USER_PROFILE.user_id,
      action,
      object_type,
      object_id,
      metadata,
      created_at: new Date().toISOString()
    };
    const current = this.getAuditLogs();
    const updated = [log, ...current.slice(0, 99)]; // retain last 100 entries
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  }

  // ==========================================
  // CSV EXPORT ENGINE FOR PERSONAL RECORD KEEPING
  // ==========================================
  static downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all subscriptions history and parameters
   */
  static exportSubscriptionsCSV(): void {
    const subs = this.getSubscriptions();
    const headers = [
      'ID',
      'Merchant Name',
      'Category',
      'Amount',
      'Currency',
      'Billing Cycle',
      'Monthly Equivalent Cost',
      'Annual Projected Cost',
      'Next Billing Date',
      'Payment Method',
      'Status',
      'Source',
      'Confidence %',
      'Price Change %',
      'Previous Amount',
      'Created At'
    ];

    const rows = subs.map((s) => [
      s.id,
      `"${s.merchant_name.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      s.amount,
      'INR',
      s.cycle,
      s.monthly_cost,
      s.annual_cost,
      s.next_billing_date,
      `"${s.payment_method.replace(/"/g, '""')}"`,
      s.status,
      s.source,
      s.confidence,
      s.price_change_percent || 0,
      s.previous_amount || '',
      s.created_at
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    this.downloadCSV(csv, `submate_subscriptions_${dateStr}.csv`);
    this.logAudit('EXPORT_SUBSCRIPTIONS_CSV', 'subscriptions', undefined, { count: subs.length });
  }

  /**
   * Export all transaction records with normalization
   */
  static exportTransactionsCSV(): void {
    const txs = this.getTransactions();
    const headers = [
      'Transaction ID',
      'Date',
      'Original Merchant',
      'Normalized Merchant',
      'Category',
      'Amount',
      'Currency',
      'Payment Mode',
      'Reference / UTR',
      'Is Recurring',
      'Recurrence Confidence %',
      'Source Statement'
    ];

    const rows = txs.map((t) => [
      t.id,
      t.date,
      `"${t.merchant_original.replace(/"/g, '""')}"`,
      `"${t.merchant_normalized.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.mode,
      `"${(t.reference || '').replace(/"/g, '""')}"`,
      t.is_recurring ? 'TRUE' : 'FALSE',
      t.recurrence_confidence,
      `"${t.source.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    this.downloadCSV(csv, `submate_transactions_ledger_${dateStr}.csv`);
    this.logAudit('EXPORT_TRANSACTIONS_CSV', 'transactions', undefined, { count: txs.length });
  }

  /**
   * Export complete financial archive (all subscriptions, transactions, candidates, savings)
   */
  static exportFullArchiveCSV(): void {
    const profile = this.getProfile();
    const subs = this.getSubscriptions();
    const txs = this.getTransactions();
    const candidates = this.getCandidates();
    const recs = this.getRecommendations();
    const dateStr = new Date().toISOString().split('T')[0];

    let fullCSV = '';

    // HEADER & METADATA
    fullCSV += `### SUBMATE AI — COMPLETE FINANCIAL INTELLIGENCE ARCHIVE ###\n`;
    fullCSV += `Export Date,${new Date().toISOString()}\n`;
    fullCSV += `User,${profile.full_name} (${profile.email})\n`;
    fullCSV += `Default Currency,${profile.currency}\n`;
    fullCSV += `Total Transactions,${txs.length}\n`;
    fullCSV += `Active Subscriptions,${subs.length}\n`;
    fullCSV += `Pending Candidates,${candidates.filter((c) => c.status === 'pending').length}\n\n`;

    // SECTION 1: SUBSCRIPTIONS
    fullCSV += `=== SECTION 1: SUBSCRIPTIONS LEDGER ===\n`;
    fullCSV += `ID,Merchant Name,Category,Amount,Currency,Cycle,Monthly Cost,Annual Cost,Next Billing Date,Payment Method,Status,Confidence %\n`;
    subs.forEach((s) => {
      fullCSV += `${s.id},"${s.merchant_name}","${s.category}",${s.amount},INR,${s.cycle},${s.monthly_cost},${s.annual_cost},${s.next_billing_date},"${s.payment_method}",${s.status},${s.confidence}%\n`;
    });
    fullCSV += `\n`;

    // SECTION 2: DETECTION CANDIDATES
    fullCSV += `=== SECTION 2: DETECTION CANDIDATES ===\n`;
    fullCSV += `Candidate ID,Normalized Merchant,Estimated Amount,Frequency,Confidence %,Candidate Type,Status,Repeat Count,Avg Interval Days,Price Change Detected\n`;
    candidates.forEach((c) => {
      fullCSV += `${c.id},"${c.normalized_merchant}",${c.estimated_amount},${c.frequency},${c.confidence}%,${c.candidate_type},${c.status},${c.evidence.repeat_count},${c.evidence.average_interval_days},${c.evidence.price_change_detected ? 'YES' : 'NO'}\n`;
    });
    fullCSV += `\n`;

    // SECTION 3: SAVINGS RECOMMENDATIONS
    fullCSV += `=== SECTION 3: SAVINGS OPTIMIZATIONS ===\n`;
    fullCSV += `Recommendation ID,Merchant,Category,Potential Monthly Savings,Potential Annual Savings,Priority,Reason\n`;
    recs.forEach((r) => {
      fullCSV += `${r.id},"${r.merchant}","${r.category}",${r.monthly_saving},${r.annual_saving},${r.priority},"${r.reason.replace(/"/g, '""')}"\n`;
    });
    fullCSV += `\n`;

    // SECTION 4: TRANSACTIONS LEDGER
    fullCSV += `=== SECTION 4: TRANSACTION LEDGER ===\n`;
    fullCSV += `Date,Original Merchant,Normalized Merchant,Category,Amount,Currency,Payment Mode,Reference,Recurring\n`;
    txs.forEach((t) => {
      fullCSV += `${t.date},"${t.merchant_original.replace(/"/g, '""')}","${t.merchant_normalized.replace(/"/g, '""')}","${t.category}",${t.amount},${t.currency},${t.mode},"${t.reference || ''}",${t.is_recurring ? 'YES' : 'NO'}\n`;
    });

    this.downloadCSV(fullCSV, `submate_complete_financial_archive_${dateStr}.csv`);
    this.logAudit('EXPORT_FULL_ARCHIVE_CSV', 'all_data', undefined, {
      transactions: txs.length,
      subscriptions: subs.length,
      candidates: candidates.length
    });
  }

  /**
   * Export all subscription and financial data as a beautifully formatted PDF report
   */
  static exportPDFReport(): void {
    const profile = this.getProfile();
    const subs = this.getSubscriptions();
    const candidates = this.getCandidates();
    const recs = this.getRecommendations();

    PdfReportService.generateSubscriptionReport(profile, subs, candidates, recs);
    this.logAudit('EXPORT_PDF_REPORT', 'subscriptions_pdf', undefined, {
      subscriptions_count: subs.length,
      candidates_count: candidates.length
    });
  }

  // ==========================================
  // BUDGET & SPENDING ALERT SYSTEM
  // ==========================================
  static getBudgetConfig(): BudgetConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      monthly_budget: 5000,
      alerts_enabled: true,
      warning_threshold_percent: 80
    };
  }

  static updateBudgetConfig(updates: Partial<BudgetConfig>): BudgetConfig {
    const current = this.getBudgetConfig();
    const updated: BudgetConfig = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(updated));
    this.logAudit('UPDATE_BUDGET_CONFIG', 'budget', undefined, updated);
    this.checkAndTriggerBudgetAlert();
    notifyListeners();
    return updated;
  }

  static getBudgetStatus(): BudgetStatus {
    const config = this.getBudgetConfig();
    const subs = this.getSubscriptions().filter((s) => s.status === 'active');
    const current_monthly_spend = subs.reduce(
      (sum, s) => sum + (s.monthly_cost || computeMonthlyCost(s.amount, s.cycle)),
      0
    );

    const percentage_used =
      config.monthly_budget > 0
        ? Number(((current_monthly_spend / config.monthly_budget) * 100).toFixed(1))
        : 0;

    const remaining_budget = Math.max(0, config.monthly_budget - current_monthly_spend);

    let status: 'under' | 'warning' | 'exceeded' = 'under';
    let alert_message: string | undefined = undefined;

    if (current_monthly_spend > config.monthly_budget) {
      status = 'exceeded';
      alert_message = `Budget exceeded! You have committed ₹${current_monthly_spend.toLocaleString('en-IN')}, exceeding your ₹${config.monthly_budget.toLocaleString('en-IN')} limit by ₹${(current_monthly_spend - config.monthly_budget).toLocaleString('en-IN')}.`;
    } else if (percentage_used >= config.warning_threshold_percent) {
      status = 'warning';
      alert_message = `Budget warning: You have utilized ${percentage_used}% (₹${current_monthly_spend.toLocaleString('en-IN')}) of your ₹${config.monthly_budget.toLocaleString('en-IN')} monthly limit.`;
    }

    return {
      monthly_budget: config.monthly_budget,
      current_monthly_spend,
      percentage_used,
      remaining_budget,
      status,
      alert_message
    };
  }

  static checkAndTriggerBudgetAlert(): void {
    const config = this.getBudgetConfig();
    if (!config.alerts_enabled) return;

    const status = this.getBudgetStatus();
    if (status.status !== 'under' && status.alert_message) {
      const notifs = this.getNotifications();
      const existing = notifs.find(
        (n) => n.type === 'budget_alert' && new Date(n.created_at).toDateString() === new Date().toDateString()
      );
      if (!existing) {
        this.addNotification({
          title: status.status === 'exceeded' ? 'Monthly Budget Exceeded' : 'Approaching Budget Limit',
          message: status.alert_message,
          type: 'budget_alert',
          severity: status.status === 'exceeded' ? 'critical' : 'warning'
        });
      }
    }
  }
}
