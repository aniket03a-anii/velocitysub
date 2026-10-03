-- ====================================================================
-- SubMate AI — Supabase PostgreSQL Schema & Security Policies (RLS)
-- Tagline: "Discover first. Ask users to confirm."
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  currency TEXT DEFAULT 'INR',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- 3. FINANCIAL CONNECTIONS
CREATE TABLE IF NOT EXISTS financial_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'CSV', 'XLSX', 'PDF', 'Account Aggregator (Setu)', 'Gmail', 'UPI AutoPay Demo'
  connection_type TEXT NOT NULL, -- 'statement', 'aa_consent', 'email_receipt', 'mandate_center'
  status TEXT DEFAULT 'active', -- 'active', 'disconnected', 'pending_consent', 'demo'
  consent_reference TEXT,
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES financial_connections(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  merchant_original TEXT NOT NULL,
  merchant_normalized TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  category TEXT NOT NULL,
  mode TEXT DEFAULT 'UPI', -- 'UPI', 'Debit Card', 'Credit Card', 'NetBanking', 'ACH'
  reference TEXT,
  source TEXT DEFAULT 'statement',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_confidence NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  cycle TEXT DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'
  next_billing_date DATE,
  payment_method TEXT DEFAULT 'UPI AutoPay',
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled', 'trial', 'review'
  source TEXT DEFAULT 'manual', -- 'discovered_confirmed', 'manual', 'mandate'
  confidence NUMERIC DEFAULT 100,
  annual_cost NUMERIC NOT NULL,
  monthly_cost NUMERIC NOT NULL,
  last_payment_date DATE,
  price_change_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DETECTION CANDIDATES ("Discover First. Ask users to confirm.")
CREATE TABLE IF NOT EXISTS detection_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  estimated_amount NUMERIC NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  confidence NUMERIC NOT NULL, -- 0 to 100
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  candidate_type TEXT DEFAULT 'subscription', -- 'subscription', 'recurring_expense', 'hidden_expense', 'price_change', 'overlap'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'ignored'
  first_detected DATE,
  last_detected DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'renewal_alert', 'price_increase', 'new_candidate', 'hidden_expense', 'trial_ending'
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical', 'success'
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. AI INSIGHTS
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'price_increase', 'category_spike', 'overlap', 'dormant_pattern'
  severity TEXT DEFAULT 'info',
  evidence JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SAVINGS RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS savings_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  monthly_saving NUMERIC NOT NULL,
  annual_saving NUMERIC NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  evidence JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active', -- 'active', 'applied', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. MERCHANT ALIAS NORMALIZATION TABLE (Global reference)
CREATE TABLE IF NOT EXISTS merchant_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_pattern TEXT NOT NULL UNIQUE,
  normalized_name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_cycle TEXT DEFAULT 'monthly'
);

-- ====================================================================
-- INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_norm ON transactions(user_id, merchant_normalized);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_detection_candidates_user_status ON detection_candidates(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: users can only SELECT, INSERT, UPDATE, DELETE their own data
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own connections" ON financial_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own candidates" ON detection_candidates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own insights" ON ai_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own savings recommendations" ON savings_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own audit logs" ON audit_logs
  FOR ALL USING (auth.uid() = user_id);

-- Public read for merchant aliases dictionary
ALTER TABLE merchant_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read merchant aliases" ON merchant_aliases
  FOR SELECT USING (true);
