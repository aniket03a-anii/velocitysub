export interface NormalizationResult {
  original: string;
  normalized: string;
  category: string;
  isSubscriptionCandidate: boolean;
  isCategoryExclusion: boolean; // e.g. Rent, EMI, Insurance, SIP, Utilities
  suggestedCycle: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
}

// Built-in rule catalog for messy bank and UPI descriptors
const KNOWN_MERCHANT_PATTERNS: Array<{
  pattern: RegExp;
  normalized: string;
  category: string;
  isSubscriptionCandidate: boolean;
  isCategoryExclusion: boolean;
  cycle: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
}> = [
  // Subscriptions - Entertainment
  { pattern: /netflix/i, normalized: 'Netflix', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /spotify/i, normalized: 'Spotify', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /youtube\s*premium|google\*youtube/i, normalized: 'YouTube Premium', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /hotstar|novi\s*digital|jiocinema/i, normalized: 'JioHotstar / Cinema', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },
  { pattern: /sony\s*liv/i, normalized: 'SonyLIV', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },
  { pattern: /zee5/i, normalized: 'ZEE5', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },
  { pattern: /apple\.com\/bill|itunes/i, normalized: 'Apple Services (iCloud/Music)', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },

  // Subscriptions - Productivity & Dev
  { pattern: /amzn\s*mktp.*prime|amazon\s*prime|prime\s*video/i, normalized: 'Amazon Prime', category: 'Entertainment', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },
  { pattern: /adobe/i, normalized: 'Adobe Creative Cloud', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /openai|chatgpt/i, normalized: 'OpenAI ChatGPT Plus', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /google\s*(storage|one)/i, normalized: 'Google One', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /canva/i, normalized: 'Canva Pro', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },
  { pattern: /notion/i, normalized: 'Notion Team', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /github/i, normalized: 'GitHub Pro', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /vercel/i, normalized: 'Vercel Pro', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /zoom\.us|zoom\s*video/i, normalized: 'Zoom Pro', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /dropbox/i, normalized: 'Dropbox Plus', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /grammarly/i, normalized: 'Grammarly Premium', category: 'Productivity', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'yearly' },

  // Fitness / Memberships
  { pattern: /cult\.?fit|curefit/i, normalized: 'Cult.fit Pass', category: 'Health & Fitness', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'quarterly' },
  { pattern: /gold'?s\s*gym/i, normalized: "Gold's Gym", category: 'Health & Fitness', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'quarterly' },

  // Food Membership / Perks
  { pattern: /swiggy\s*one/i, normalized: 'Swiggy One', category: 'Food & Dining', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'quarterly' },
  { pattern: /zomato\s*gold/i, normalized: 'Zomato Gold', category: 'Food & Dining', isSubscriptionCandidate: true, isCategoryExclusion: false, cycle: 'quarterly' },

  // CATEGORY GUARDRAILS — Recurring non-subscription commitments
  // Rent
  { pattern: /cred.*rent|nobroker.*rent|rent.*apartment|society\s*maintenance/i, normalized: 'Apartment Rent & Maintenance', category: 'Rent & Housing', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },
  // EMI & Loans
  { pattern: /hdfc.*emi|bajaj\s*finance|home\s*loan.*emi|auto\s*loan|car\s*emi/i, normalized: 'Bank Loan / EMI', category: 'EMI & Loans', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },
  // Insurance
  { pattern: /hdfc\s*life|icici\s*(lombard|prudential)|max\s*life|star\s*health|tata\s*aig/i, normalized: 'Insurance Premium', category: 'Insurance', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'yearly' },
  // Utilities
  { pattern: /bescom|tata\s*power|adani\s*electricity|mahavitaran/i, normalized: 'Electricity Utility', category: 'Utilities', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },
  { pattern: /airtel\s*(broadband|fiber|postpaid)/i, normalized: 'Airtel Broadband & Postpaid', category: 'Utilities', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },
  { pattern: /jio\s*(fiber|broadband|postpaid)/i, normalized: 'JioFiber Broadband', category: 'Utilities', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },
  // Investments / SIP
  { pattern: /zerodha|groww.*sip|mutual\s*fund|uti\s*mf|nippon\s*india/i, normalized: 'SIP & Mutual Funds', category: 'Investments', isSubscriptionCandidate: false, isCategoryExclusion: true, cycle: 'monthly' },

  // General shopping / one-time
  { pattern: /amzn|amazon/i, normalized: 'Amazon Marketplace', category: 'Shopping', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /flipkart/i, normalized: 'Flipkart', category: 'Shopping', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /swiggy/i, normalized: 'Swiggy', category: 'Food & Dining', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /zomato/i, normalized: 'Zomato', category: 'Food & Dining', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /uber/i, normalized: 'Uber', category: 'Transportation', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /ola/i, normalized: 'Ola Cabs', category: 'Transportation', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' },
  { pattern: /blinkit|zepto|instamart/i, normalized: 'Quick Commerce Grocery', category: 'Groceries', isSubscriptionCandidate: false, isCategoryExclusion: false, cycle: 'monthly' }
];

export function cleanRawMerchantString(raw: string): string {
  if (!raw) return 'Unknown Merchant';
  let cleaned = raw.trim();

  // Strip common bank prefixes and UPI transaction noise:
  // e.g. "UPI/NETFLIX/42314/Pymt", "POS 4321 NETFLIX BANGALORE", "NEFT-OPENAI", "BIL/ONL/NETFLIX"
  cleaned = cleaned.replace(/^(UPI\/|POS\s*\d+|NEFT[-/]|IMPS[-/]|RTGS[-/]|BIL\/ONL\/|ACH\/|NACH\/)/i, '');
  cleaned = cleaned.replace(/\b(PVT LTD|PRIVATE LIMITED|LTD|LLP|INDIA|PAYMENTS|PYMTS|BILLDESK|RAZORPAY|PAYTM PG|GATEWAY)\b/gi, '');
  cleaned = cleaned.replace(/[\*#\/\\_-]+/g, ' ');
  cleaned = cleaned.replace(/\s+\d{6,}\b/g, ''); // strip transaction IDs or pin codes
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || raw;
}

export function normalizeMerchant(raw: string): NormalizationResult {
  const cleaned = cleanRawMerchantString(raw);

  for (const known of KNOWN_MERCHANT_PATTERNS) {
    if (known.pattern.test(raw) || known.pattern.test(cleaned)) {
      return {
        original: raw,
        normalized: known.normalized,
        category: known.category,
        isSubscriptionCandidate: known.isSubscriptionCandidate,
        isCategoryExclusion: known.isCategoryExclusion,
        suggestedCycle: known.cycle
      };
    }
  }

  // Fallback: title-case the cleaned string
  const titleCased = cleaned.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  return {
    original: raw,
    normalized: titleCased || 'General Expense',
    category: 'Other',
    isSubscriptionCandidate: false,
    isCategoryExclusion: false,
    suggestedCycle: 'monthly'
  };
}
