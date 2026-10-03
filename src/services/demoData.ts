import { Transaction, Subscription, DetectionCandidate, NotificationItem, AiInsight, SavingsRecommendation, UserProfile } from '../types';
import { normalizeMerchant } from './merchantNormalizer';

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'usr_demo_863038',
  user_id: 'usr_demo_863038',
  full_name: 'Aniket Sharma',
  email: 'aniket03a@gmail.com',
  avatar_url: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  created_at: '2026-04-01T08:00:00Z'
};

// Deterministic seed generator from string
function getSeedHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pseudo-random number generator from seed
function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generatePersonalizedDataset(
  userId: string = DEMO_USER_PROFILE.user_id,
  email: string = DEMO_USER_PROFILE.email,
  fullName: string = DEMO_USER_PROFILE.full_name,
  customSeed?: number
): {
  profile: UserProfile;
  transactions: Transaction[];
  subscriptions: Subscription[];
  candidates: DetectionCandidate[];
  insights: AiInsight[];
  notifications: NotificationItem[];
  recommendations: SavingsRecommendation[];
} {
  const seedVal = customSeed !== undefined ? customSeed : getSeedHash(`${userId}_${email}_${fullName}_${Date.now()}`);
  const rand = createPrng(seedVal);

  const profile: UserProfile = {
    id: userId,
    user_id: userId,
    full_name: fullName,
    email: email,
    avatar_url: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  };

  const transactions: Transaction[] = [];

  const addTx = (
    date: string,
    merchant_raw: string,
    amount: number,
    mode: string = 'UPI AutoPay',
    refPrefix: string = 'UPI'
  ) => {
    const norm = normalizeMerchant(merchant_raw);
    transactions.push({
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      date,
      merchant_original: merchant_raw,
      merchant_normalized: norm.normalized,
      amount: Math.round(amount),
      currency: 'INR',
      category: norm.category,
      mode,
      reference: `${refPrefix}/${Math.floor(100000000000 + rand() * 900000000000)}`,
      source: 'HDFC_Passbook_Statement.csv',
      is_recurring: norm.isSubscriptionCandidate || norm.isCategoryExclusion,
      recurrence_confidence: norm.isSubscriptionCandidate ? 94 : norm.isCategoryExclusion ? 65 : 10,
      created_at: new Date(date).toISOString()
    });
  };

  // 6 Distinct Indian Personas for rich variety on every login
  const personaType = Math.floor(rand() * 6);

  // Indian base recurring commitments (Rent & EMI guardrails)
  const rentOptions = [28500, 34000, 22500, 39000, 26000, 31000];
  const emiOptions = [24800, 18500, 14200, 29000, 19500, 21500];
  const rentBase = rentOptions[personaType];
  const emiBase = emiOptions[personaType];

  // 1. Netflix India (detecting price revision or tier change)
  const netflixOld = personaType % 2 === 0 ? 499 : 199;
  const netflixNew = personaType % 2 === 0 ? 649 : 249;
  const netflixHikePercent = Number((((netflixNew - netflixOld) / netflixOld) * 100).toFixed(1));

  addTx('2026-05-05', 'NETFLIX ENTERTAINMENT IN', netflixOld, 'Credit Card (HDFC Regalia)');
  addTx('2026-06-07', 'Netflix India Pvt Ltd', netflixOld, 'Credit Card (HDFC Regalia)');
  addTx('2026-07-06', 'NETFLIX*MUMBAI BRANCH', netflixOld, 'Credit Card (HDFC Regalia)');
  addTx('2026-08-09', 'NETFLIX.COM BENGALURU', netflixNew, 'Credit Card (HDFC Regalia)');
  addTx('2026-09-08', 'Netflix India AutoDebit', netflixNew, 'Credit Card (HDFC Regalia)');

  // 2. Audio Streaming: Spotify Premium vs Apple Music India
  const musicMerchant = personaType % 2 === 1 ? 'APPLE.COM/BILL MUSIC INDIA' : 'SPOTIFY PYMTS INDIA';
  const musicNorm = personaType % 2 === 1 ? 'Apple Music' : 'Spotify';
  const musicPrice = personaType % 2 === 1 ? 149 : 119;
  ['2026-04-12', '2026-05-12', '2026-06-13', '2026-07-12', '2026-08-12', '2026-09-12'].forEach((d) => {
    addTx(d, musicMerchant, musicPrice, 'UPI AutoPay (Google Pay)');
  });

  // 3. AI & Tech Workflows
  const chatGptPrice = 1999;
  addTx('2026-06-20', 'OPENAI*CHATGPT SUBSCRIPTION', chatGptPrice, 'Credit Card (ICICI Coral)');
  addTx('2026-07-20', 'OPENAI CHATGPT PLUS IN', chatGptPrice, 'Credit Card (ICICI Coral)');
  addTx('2026-08-20', 'OPENAI*CHATGPT BANGALORE', chatGptPrice, 'Credit Card (ICICI Coral)');
  addTx('2026-09-20', 'OPENAI*CHATGPT MONTHLY', chatGptPrice, 'Credit Card (ICICI Coral)');

  // 4. Cloud Storage (Google One / iCloud)
  const gOnePrice = personaType === 3 ? 650 : 130;
  ['2026-05-22', '2026-06-22', '2026-07-22', '2026-08-22', '2026-09-22'].forEach((d) => {
    addTx(d, 'GOOGLE*STORAGE INDIA', gOnePrice, 'UPI AutoPay (PhonePe)');
  });

  // 5. YouTube Premium India
  const ytOld = 149;
  const ytNew = 179;
  ['2026-05-15', '2026-06-15', '2026-07-15'].forEach((d) => addTx(d, 'GOOGLE*YOUTUBE INDIA', ytOld, 'UPI AutoPay'));
  ['2026-08-15', '2026-09-15'].forEach((d) => addTx(d, 'YOUTUBE PREMIUM AUTO-DEBIT', ytNew, 'UPI AutoPay'));

  // 6. Professional Suite (Adobe or Canva Pro or Figma)
  if (personaType === 1 || personaType === 3 || personaType === 5) {
    const adobeOld = 4230;
    const adobeNew = 4890;
    addTx('2026-05-18', 'ADOBE*CREATIVE CLOUD IN', adobeOld, 'Debit Card (HDFC Millennia)');
    addTx('2026-06-18', 'ADOBE SYSTEMS INDIA PVT', adobeOld, 'Debit Card (HDFC Millennia)');
    addTx('2026-07-19', 'ADOBE*CREATIVE CLOUD IN', adobeOld, 'Debit Card (HDFC Millennia)');
    addTx('2026-08-18', 'ADOBE*CREATIVE CLOUD IN', adobeNew, 'Debit Card (HDFC Millennia)');
    addTx('2026-09-18', 'ADOBE SYSTEMS INDIA PVT', adobeNew, 'Debit Card (HDFC Millennia)');
  } else {
    ['2026-06-03', '2026-07-03', '2026-08-04', '2026-09-03'].forEach((d) => {
      addTx(d, 'CANVA*PRO SUBSCRIPTION IN', 499, 'Credit Card');
    });
  }

  // 7. Cult.fit Gym Pass (Quarterly Health & Fitness)
  const fitnessPrice = 3490 + (personaType % 2 === 0 ? 500 : 0);
  addTx('2026-04-10', 'CULTFIT HEALTHCARE PVT', fitnessPrice, 'UPI');
  addTx('2026-07-10', 'CULT.FIT*MEMBERSHIP BLR', fitnessPrice, 'UPI');

  // 8. Swiggy One & Zomato Gold Dining Mandates
  addTx('2026-04-01', 'SWIGGY ONE MEMBERSHIP IN', 299, 'UPI');
  addTx('2026-07-01', 'SWIGGY ONE QUARTERLY RENEW', 399, 'UPI');

  // 9. Hotstar / JioCinema / Amazon Prime Annual Packs
  addTx('2026-08-14', 'DISNEY+ HOTSTAR ANNUAL VIP', 1499, 'UPI AutoPay');
  addTx('2026-07-28', 'AMAZON PRIME VIDEO ANNUAL', 1499, 'Credit Card');

  // 10. CATEGORY GUARDRAILS: Rent, Home Loan EMI, SIP, Broadband
  ['2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'].forEach((d) => {
    addTx(d, `CRED CLUB RENTPAY APARTMENT #${100 + personaType}`, rentBase, 'UPI');
    addTx(d, 'HDFC BANK HOME LOAN EMI 99812', emiBase, 'NACH AutoDebit');
    addTx(d, 'AIRTEL XSTREAM BROADBAND BILL', 1179, 'UPI AutoPay');
    addTx(d, 'ZERODHA COIN SIP MUTUAL FUND', 8000 + personaType * 1500, 'UPI AutoPay');
  });

  // Randomize variable shopping, quick commerce (Snitch, Blinkit, Zepto, Zomato)
  const targetCount = 320 + Math.floor(rand() * 40);
  const randomMerchants = [
    { name: 'Snitch Menswear D2C', cat: 'Shopping', min: 1199, max: 3499 },
    { name: 'Zomato Food Delivery', cat: 'Food & Dining', min: 220, max: 890 },
    { name: 'Swiggy Instamart Order', cat: 'Groceries', min: 180, max: 950 },
    { name: 'Blinkit Instant Commerce', cat: 'Groceries', min: 140, max: 780 },
    { name: 'Zepto 10-Min Groceries', cat: 'Groceries', min: 120, max: 620 },
    { name: 'Uber India Systems Rides', cat: 'Transportation', min: 140, max: 640 },
    { name: 'Ola Cabs Auto/Ride', cat: 'Transportation', min: 110, max: 480 },
    { name: 'Blue Tokai Coffee Roasters', cat: 'Food & Dining', min: 240, max: 590 },
    { name: 'Tata 1mg Pharmacy Order', cat: 'Health & Fitness', min: 380, max: 1400 },
    { name: 'Amazon India Shopping', cat: 'Shopping', min: 499, max: 2899 }
  ];

  const needed = targetCount - transactions.length;
  for (let i = 0; i < needed; i++) {
    const m = randomMerchants[i % randomMerchants.length];
    const month = (5 + Math.floor((i * 7) % 5)).toString().padStart(2, '0');
    const day = (((i * 13) % 28) + 1).toString().padStart(2, '0');
    const amt = Math.floor(m.min + rand() * (m.max - m.min));
    addTx(`2026-${month}-${day}`, `${m.name}*REF${1000 + i}`, amt, i % 2 === 0 ? 'UPI' : 'Debit Card');
  }

  // Active Subscriptions
  const subscriptions: Subscription[] = [
    {
      id: `sub_${userId}_music`,
      user_id: userId,
      merchant_name: musicNorm,
      category: 'Entertainment',
      amount: musicPrice,
      cycle: 'monthly',
      next_billing_date: '2026-10-12',
      payment_method: 'UPI AutoPay (Google Pay)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 96,
      annual_cost: musicPrice * 12,
      monthly_cost: musicPrice,
      last_payment_date: '2026-09-12',
      price_change_percent: 0,
      created_at: '2026-04-12T00:00:00Z',
      updated_at: '2026-09-12T00:00:00Z'
    },
    {
      id: `sub_${userId}_chatgpt`,
      user_id: userId,
      merchant_name: 'OpenAI ChatGPT Plus',
      category: 'Productivity',
      amount: chatGptPrice,
      cycle: 'monthly',
      next_billing_date: '2026-10-20',
      payment_method: 'Credit Card (ICICI Coral)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 98,
      annual_cost: chatGptPrice * 12,
      monthly_cost: chatGptPrice,
      last_payment_date: '2026-09-20',
      price_change_percent: 0,
      created_at: '2026-06-20T00:00:00Z',
      updated_at: '2026-09-20T00:00:00Z'
    },
    {
      id: `sub_${userId}_googleone`,
      user_id: userId,
      merchant_name: 'Google One Cloud',
      category: 'Productivity',
      amount: gOnePrice,
      cycle: 'monthly',
      next_billing_date: '2026-10-22',
      payment_method: 'UPI AutoPay (PhonePe)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 94,
      annual_cost: gOnePrice * 12,
      monthly_cost: gOnePrice,
      last_payment_date: '2026-09-22',
      price_change_percent: 0,
      created_at: '2026-04-22T00:00:00Z',
      updated_at: '2026-09-22T00:00:00Z'
    },
    {
      id: `sub_${userId}_youtube`,
      user_id: userId,
      merchant_name: 'YouTube Premium',
      category: 'Entertainment',
      amount: ytNew,
      cycle: 'monthly',
      next_billing_date: '2026-10-15',
      payment_method: 'UPI AutoPay',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 92,
      annual_cost: ytNew * 12,
      monthly_cost: ytNew,
      last_payment_date: '2026-09-15',
      price_change_percent: 20.1,
      previous_amount: ytOld,
      created_at: '2026-05-15T00:00:00Z',
      updated_at: '2026-09-15T00:00:00Z'
    },
    {
      id: `sub_${userId}_prime`,
      user_id: userId,
      merchant_name: 'Amazon Prime Video',
      category: 'Entertainment',
      amount: 1499,
      cycle: 'yearly',
      next_billing_date: '2027-07-28',
      payment_method: 'Credit Card (HDFC Regalia)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 95,
      annual_cost: 1499,
      monthly_cost: 125,
      last_payment_date: '2026-07-28',
      price_change_percent: 0,
      created_at: '2026-07-28T00:00:00Z',
      updated_at: '2026-07-28T00:00:00Z'
    },
    {
      id: `sub_${userId}_hotstar`,
      user_id: userId,
      merchant_name: 'JioHotstar Premium',
      category: 'Entertainment',
      amount: 1499,
      cycle: 'yearly',
      next_billing_date: '2027-08-14',
      payment_method: 'UPI AutoPay',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 91,
      annual_cost: 1499,
      monthly_cost: 125,
      last_payment_date: '2026-08-14',
      price_change_percent: 0,
      created_at: '2026-08-14T00:00:00Z',
      updated_at: '2026-08-14T00:00:00Z'
    }
  ];

  if (personaType === 1 || personaType === 3 || personaType === 5) {
    subscriptions.push({
      id: `sub_${userId}_adobe`,
      user_id: userId,
      merchant_name: 'Adobe Creative Cloud',
      category: 'Productivity',
      amount: 4890,
      cycle: 'monthly',
      next_billing_date: '2026-10-18',
      payment_method: 'Debit Card (HDFC Millennia)',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 96,
      annual_cost: 58680,
      monthly_cost: 4890,
      last_payment_date: '2026-09-18',
      price_change_percent: 15.6,
      previous_amount: 4230,
      created_at: '2026-05-18T00:00:00Z',
      updated_at: '2026-09-18T00:00:00Z'
    });
  } else {
    subscriptions.push({
      id: `sub_${userId}_canva`,
      user_id: userId,
      merchant_name: 'Canva Pro',
      category: 'Productivity',
      amount: 499,
      cycle: 'monthly',
      next_billing_date: '2026-10-03',
      payment_method: 'Credit Card',
      status: 'active',
      source: 'discovered_confirmed',
      confidence: 88,
      annual_cost: 5988,
      monthly_cost: 499,
      last_payment_date: '2026-09-03',
      price_change_percent: 0,
      created_at: '2026-06-03T00:00:00Z',
      updated_at: '2026-09-03T00:00:00Z'
    });
  }

  // Candidates Queue (Section 17: "Discover first. Ask users to confirm.")
  const candidates: DetectionCandidate[] = [
    {
      id: `cand_${userId}_netflix`,
      user_id: userId,
      merchant: 'NETFLIX.COM BENGALURU',
      normalized_merchant: 'Netflix India',
      estimated_amount: netflixNew,
      previous_amount: netflixOld,
      frequency: 'monthly',
      confidence: 94,
      evidence: {
        repeat_count: 5,
        average_interval_days: 30,
        interval_variance_days: 2,
        amount_stability_percent: 78,
        price_change_detected: true,
        price_change_percent: netflixHikePercent,
        last_detected_date: '2026-09-08',
        sample_transaction_dates: ['2026-05-05', '2026-06-07', '2026-07-06', '2026-08-09', '2026-09-08'],
        sample_amounts: [netflixOld, netflixOld, netflixOld, netflixNew, netflixNew],
        merchant_match_score: 95
      },
      candidate_type: 'subscription',
      status: 'pending',
      first_detected: '2026-05-05',
      last_detected: '2026-09-08',
      created_at: '2026-09-09T00:00:00Z'
    },
    {
      id: `cand_${userId}_cultfit`,
      user_id: userId,
      merchant: 'CULTFIT HEALTHCARE PVT',
      normalized_merchant: 'Cult.fit Gym Pass',
      estimated_amount: fitnessPrice,
      frequency: 'quarterly',
      confidence: 86,
      evidence: {
        repeat_count: 2,
        average_interval_days: 91,
        interval_variance_days: 1,
        amount_stability_percent: 100,
        price_change_detected: false,
        last_detected_date: '2026-07-10',
        sample_transaction_dates: ['2026-04-10', '2026-07-10'],
        sample_amounts: [fitnessPrice, fitnessPrice],
        merchant_match_score: 90
      },
      candidate_type: 'subscription',
      status: 'pending',
      first_detected: '2026-04-10',
      last_detected: '2026-07-10',
      created_at: '2026-07-11T00:00:00Z'
    },
    {
      id: `cand_${userId}_swiggy`,
      user_id: userId,
      merchant: 'SWIGGY ONE MEMBERSHIP IN',
      normalized_merchant: 'Swiggy One Plan',
      estimated_amount: 399,
      previous_amount: 299,
      frequency: 'quarterly',
      confidence: 82,
      evidence: {
        repeat_count: 2,
        average_interval_days: 91,
        interval_variance_days: 1,
        amount_stability_percent: 75,
        price_change_detected: true,
        price_change_percent: 33.4,
        last_detected_date: '2026-07-01',
        sample_transaction_dates: ['2026-04-01', '2026-07-01'],
        sample_amounts: [299, 399],
        merchant_match_score: 88
      },
      candidate_type: 'subscription',
      status: 'pending',
      first_detected: '2026-04-01',
      last_detected: '2026-07-01',
      created_at: '2026-07-02T00:00:00Z'
    },
    {
      id: `cand_${userId}_guardrail_rent`,
      user_id: userId,
      merchant: `CRED CLUB RENTPAY APARTMENT #${100 + personaType}`,
      normalized_merchant: 'Flat Rent & Maintenance',
      estimated_amount: rentBase,
      frequency: 'monthly',
      confidence: 65,
      evidence: {
        repeat_count: 5,
        average_interval_days: 30,
        interval_variance_days: 1,
        amount_stability_percent: 100,
        price_change_detected: false,
        last_detected_date: '2026-09-01',
        sample_transaction_dates: ['2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'],
        sample_amounts: [rentBase, rentBase, rentBase, rentBase, rentBase],
        category_guardrail_applied: true,
        guardrail_note: 'Rent & Housing is an essential fixed expense, not a recurring digital subscription.',
        merchant_match_score: 80
      },
      candidate_type: 'recurring_expense',
      status: 'ignored',
      first_detected: '2026-05-01',
      last_detected: '2026-09-01',
      created_at: '2026-09-02T00:00:00Z'
    }
  ];

  // AI Insights in Authentic Indian English
  const insights: AiInsight[] = [
    {
      id: `ins_${userId}_1`,
      user_id: userId,
      title: `Netflix subscription tariff hiked by ~${netflixHikePercent}%`,
      summary: `Your recurring auto-debit shifted from ₹${netflixOld}/- to ₹${netflixNew}/- starting August 2026. This adds ₹${(netflixNew - netflixOld) * 12}/- extra to your annual entertainment kharcha.`,
      insight_type: 'price_increase',
      severity: 'warning',
      evidence: { previous_amount: netflixOld, current_amount: netflixNew, delta_annual: (netflixNew - netflixOld) * 12, percent: netflixHikePercent },
      suggested_action: 'Kindly review whether a standard mobile plan or family account sharing suffices.',
      created_at: '2026-09-09T00:00:00Z'
    },
    {
      id: `ins_${userId}_2`,
      user_id: userId,
      title: 'OTT Overlap Alert: 3 concurrent streaming subscriptions',
      summary: 'You are actively paying for Amazon Prime, JioHotstar, and YouTube Premium simultaneously, totaling ₹4,846/- p.a. Watch-time overlap detected.',
      insight_type: 'overlap',
      severity: 'info',
      evidence: { count: 3, merchants: ['Amazon Prime Video', 'JioHotstar Premium', 'YouTube Premium'], annual_spend: 4846 },
      suggested_action: 'Doing the needful: Rotate OTT packs month-to-month to save up to ₹2,500/- p.a.',
      created_at: '2026-09-15T00:00:00Z'
    },
    {
      id: `ins_${userId}_3`,
      user_id: userId,
      title: 'Pre-debit notice: T-48 hour RBI mandate alert',
      summary: 'A scheduled auto-debit of ₹1,999/- for OpenAI ChatGPT Plus is due on 20th Oct via ICICI Coral Credit Card. Sufficient balance ensured.',
      insight_type: 'savings_opportunity',
      severity: 'info',
      evidence: { due_date: '2026-10-20', amount: 1999 },
      suggested_action: 'Revert back or pause mandate before 19th Oct if not in regular use.',
      created_at: '2026-09-19T00:00:00Z'
    }
  ];

  // Notifications in Authentic Indian English
  const notifications: NotificationItem[] = [
    {
      id: `notif_${userId}_1`,
      user_id: userId,
      title: 'Pre-debit Alert: Netflix auto-debit of ₹649/- due soon',
      message: 'As per RBI e-mandate guidelines, ₹649/- will be debited from your HDFC card on 8th Oct. Kindly confirm your plan status.',
      type: 'new_candidate',
      severity: 'warning',
      scheduled_at: '2026-09-09T09:00:00Z',
      read_at: null,
      created_at: '2026-09-09T09:00:00Z'
    },
    {
      id: `notif_${userId}_2`,
      user_id: userId,
      title: `${musicNorm} UPI AutoPay renewal in 10 days — ₹${musicPrice}/-`,
      message: 'Mandate ID: UPI-AUTOPAY-HDFC-9921 scheduled for debit on 12th October 2026.',
      type: 'renewal_alert',
      severity: 'info',
      scheduled_at: '2026-10-02T08:00:00Z',
      read_at: null,
      created_at: '2026-10-02T08:00:00Z'
    },
    {
      id: `notif_${userId}_3`,
      user_id: userId,
      title: 'Shifted billing date detected: Bank holiday adjustment',
      message: 'YouTube Premium renewal was postponed by 1 day due to 2nd Saturday bank holiday. Debit executed successfully on Monday.',
      type: 'renewal_alert',
      severity: 'info',
      scheduled_at: '2026-09-20T08:00:00Z',
      read_at: null,
      created_at: '2026-09-20T08:00:00Z'
    }
  ];

  // Bachat (Savings) Recommendations
  const recommendations: SavingsRecommendation[] = [
    {
      id: `rec_${userId}_netflix`,
      user_id: userId,
      merchant: 'Netflix India',
      category: 'Entertainment',
      title: 'Optimize Netflix Streaming Tier',
      reason: `Tariff hiked from ₹${netflixOld}/- to ₹${netflixNew}/- per month (+${netflixHikePercent}%).`,
      recommendation: `Switching to Standard Plan (₹${netflixOld}/-) or pausing during exam/travel months unlocks ₹${(netflixNew - netflixOld) * 12}/- annual bachat.`,
      monthly_saving: netflixNew - netflixOld,
      annual_saving: (netflixNew - netflixOld) * 12,
      priority: 'high',
      evidence: { current: netflixNew, previous: netflixOld, change: `${netflixHikePercent}%` },
      status: 'active',
      created_at: '2026-09-09T00:00:00Z'
    },
    {
      id: `rec_${userId}_cultfit`,
      user_id: userId,
      merchant: 'Cult.fit Pass',
      category: 'Health & Fitness',
      title: 'Cult.fit Quarterly to Annual Pass Upgrade',
      reason: `Paying quarterly at ₹${fitnessPrice}/- results in higher effective monthly fee.`,
      recommendation: 'Annual pass prepay unlocks approx. ₹4,800/- yearly bachat and includes 45-day pause facility.',
      monthly_saving: 400,
      annual_saving: 4800,
      priority: 'medium',
      evidence: { quarterly: fitnessPrice, annual_potential: 4800 },
      status: 'active',
      created_at: '2026-07-10T00:00:00Z'
    },
    {
      id: `rec_${userId}_ott_overlap`,
      user_id: userId,
      merchant: 'OTT Bundle Consolidation',
      category: 'Entertainment',
      title: 'Consolidate Hotstar & Prime via Telecom Pack',
      reason: 'Paying separate retail prices for JioHotstar (₹1,499) & Prime (₹1,499).',
      recommendation: 'JioFiber / Airtel Broadband annual plan includes free bundled subscriptions, saving ₹2,998/- p.a.',
      monthly_saving: 250,
      annual_saving: 2998,
      priority: 'high',
      evidence: { bundled_savings: 2998 },
      status: 'active',
      created_at: '2026-09-15T00:00:00Z'
    }
  ];

  return {
    profile,
    transactions,
    subscriptions,
    candidates,
    insights,
    notifications,
    recommendations
  };
}

export function generateDemoDataset() {
  const result = generatePersonalizedDataset(
    DEMO_USER_PROFILE.user_id,
    DEMO_USER_PROFILE.email,
    DEMO_USER_PROFILE.full_name
  );
  return {
    transactions: result.transactions,
    subscriptions: result.subscriptions,
    candidates: result.candidates,
    insights: result.insights,
    notifications: result.notifications,
    recommendations: result.recommendations
  };
}
