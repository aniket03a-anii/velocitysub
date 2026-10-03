-- ====================================================================
-- SubMate AI — Supabase SQL Seed Reference (Merchant Aliases & Categories)
-- ====================================================================

INSERT INTO merchant_aliases (raw_pattern, normalized_name, category, default_cycle) VALUES
  ('NETFLIX.COM', 'Netflix', 'Entertainment', 'monthly'),
  ('Netflix India', 'Netflix', 'Entertainment', 'monthly'),
  ('NETFLIX*1234', 'Netflix', 'Entertainment', 'monthly'),
  ('AMZN Mktp IN', 'Amazon Prime', 'Entertainment', 'yearly'),
  ('AMAZON PAY PRIME', 'Amazon Prime', 'Entertainment', 'yearly'),
  ('AMZN*PRIME', 'Amazon Prime', 'Entertainment', 'yearly'),
  ('SPOTIFY PYMTS', 'Spotify', 'Entertainment', 'monthly'),
  ('Spotify India', 'Spotify', 'Entertainment', 'monthly'),
  ('SPOTIFY*PREMIUM', 'Spotify', 'Entertainment', 'monthly'),
  ('ADOBE*CREATIVE CLOUD', 'Adobe Creative Cloud', 'Productivity', 'monthly'),
  ('ADOBE SYSTEMS', 'Adobe Creative Cloud', 'Productivity', 'monthly'),
  ('GOOGLE*STORAGE', 'Google One', 'Productivity', 'monthly'),
  ('GOOGLE*ONE', 'Google One', 'Productivity', 'monthly'),
  ('YOUTUBE PREMIUM', 'YouTube Premium', 'Entertainment', 'monthly'),
  ('GOOGLE*YOUTUBE', 'YouTube Premium', 'Entertainment', 'monthly'),
  ('CANVA*PRO', 'Canva Pro', 'Productivity', 'yearly'),
  ('DISNEY+ HOTSTAR', 'JioCinema / Hotstar', 'Entertainment', 'yearly'),
  ('NOVI DIGITAL', 'JioCinema / Hotstar', 'Entertainment', 'yearly'),
  ('CHATGPT SUBSCRIPTION', 'OpenAI ChatGPT Plus', 'Productivity', 'monthly'),
  ('OPENAI*CHATGPT', 'OpenAI ChatGPT Plus', 'Productivity', 'monthly'),
  ('CULTFIT HEALTHCARE', 'Cult.fit Pass', 'Health & Fitness', 'quarterly'),
  ('CULT.FIT*MEMBERSHIP', 'Cult.fit Pass', 'Health & Fitness', 'quarterly'),
  ('ICICI LOMBARD HEALTH', 'ICICI Health Insurance', 'Insurance', 'yearly'),
  ('HDFC LIFE INS', 'HDFC Life Insurance', 'Insurance', 'yearly'),
  ('AIRTEL POSTPAID', 'Airtel Broadband & Postpaid', 'Utilities', 'monthly'),
  ('JIO FIBER BROADBAND', 'JioFiber', 'Utilities', 'monthly'),
  ('BESCOM ELECTRICITY', 'BESCOM Electricity', 'Utilities', 'monthly'),
  ('ZERODHA SIP COIN', 'Zerodha Coin SIP', 'Investments', 'monthly'),
  ('GROWW MUTUAL FUND', 'Groww SIP', 'Investments', 'monthly'),
  ('HDFC HOME LOAN EMI', 'HDFC Home Loan EMI', 'EMI & Loans', 'monthly'),
  ('CRED CLUB RENTPAY', 'Apartment Rent', 'Rent & Housing', 'monthly')
ON CONFLICT (raw_pattern) DO NOTHING;
