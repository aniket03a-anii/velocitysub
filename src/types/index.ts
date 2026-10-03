export type BillingCycle = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial' | 'review';

export type CandidateStatus = 'pending' | 'confirmed' | 'rejected' | 'ignored';

export type CandidateType = 'subscription' | 'recurring_expense' | 'hidden_expense' | 'price_change' | 'overlap';

export type NotificationType = 'renewal_alert' | 'price_increase' | 'new_candidate' | 'hidden_expense' | 'trial_ending' | 'connection_status' | 'budget_alert';

export type Severity = 'info' | 'warning' | 'critical' | 'success';

export interface BudgetConfig {
  monthly_budget: number;
  alerts_enabled: boolean;
  warning_threshold_percent: number;
}

export interface BudgetStatus {
  monthly_budget: number;
  current_monthly_spend: number;
  percentage_used: number;
  remaining_budget: number;
  status: 'under' | 'warning' | 'exceeded';
  alert_message?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  currency: string;
  timezone: string;
  created_at: string;
}

export interface FinancialConnection {
  id: string;
  user_id: string;
  provider: 'CSV' | 'XLSX' | 'PDF' | 'Account Aggregator (Setu)' | 'Gmail' | 'UPI AutoPay Demo';
  connection_type: 'statement' | 'aa_consent' | 'email_receipt' | 'mandate_center';
  status: 'active' | 'disconnected' | 'pending_consent' | 'demo';
  consent_reference?: string;
  last_sync_at: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  connection_id?: string;
  date: string; // YYYY-MM-DD
  merchant_original: string;
  merchant_normalized: string;
  amount: number;
  currency: string;
  category: string;
  mode: string; // UPI, Debit Card, Credit Card, NetBanking, ACH
  reference?: string;
  source: string;
  is_recurring: boolean;
  recurrence_confidence: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  merchant_name: string;
  category: string;
  amount: number;
  cycle: BillingCycle;
  next_billing_date: string; // YYYY-MM-DD
  payment_method: string;
  status: SubscriptionStatus;
  source: string;
  confidence: number;
  annual_cost: number;
  monthly_cost: number;
  last_payment_date?: string;
  price_change_percent?: number;
  previous_amount?: number;
  trial_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DetectionCandidate {
  id: string;
  user_id: string;
  merchant: string;
  normalized_merchant: string;
  estimated_amount: number;
  previous_amount?: number;
  frequency: BillingCycle;
  confidence: number; // 0 - 100
  evidence: {
    repeat_count: number;
    average_interval_days: number;
    interval_variance_days: number;
    amount_stability_percent: number;
    price_change_detected?: boolean;
    price_change_percent?: number;
    last_detected_date: string;
    sample_transaction_dates: string[];
    sample_amounts: number[];
    category_guardrail_applied?: boolean;
    guardrail_note?: string;
    merchant_match_score: number;
  };
  candidate_type: CandidateType;
  status: CandidateStatus;
  first_detected: string;
  last_detected: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: Severity;
  scheduled_at: string;
  read_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AiInsight {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  insight_type: 'price_increase' | 'category_spike' | 'overlap' | 'hidden_expense' | 'savings_opportunity';
  severity: Severity;
  evidence: Record<string, any>;
  created_at: string;
  suggested_action?: string;
}

export interface SavingsRecommendation {
  id: string;
  user_id: string;
  subscription_id?: string;
  candidate_id?: string;
  title: string;
  merchant: string;
  category: string;
  reason: string;
  recommendation: string;
  monthly_saving: number;
  annual_saving: number;
  priority: 'high' | 'medium' | 'low';
  evidence: Record<string, any>;
  status: 'active' | 'applied' | 'dismissed';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  object_type: string;
  object_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MerchantAlias {
  raw_pattern: string;
  normalized_name: string;
  category: string;
  default_cycle: BillingCycle;
}
