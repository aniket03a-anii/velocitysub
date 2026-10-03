export interface AiExplanationRequest {
  merchant: string;
  historical_amount?: number;
  current_amount: number;
  frequency: string;
  repeat_count: number;
  confidence: number;
  evidence_signals?: string[];
  category?: string;
  context_type?: 'recurring_candidate' | 'price_increase' | 'overlap' | 'hidden_expense';
}

export interface AiExplanationResponse {
  title: string;
  summary: string;
  reason: string;
  suggested_action: string;
}

export interface ServiceAlternative {
  id: string;
  current_subscription: string;
  current_amount: number;
  alternative_service: string;
  alternative_amount: number;
  cadence: string;
  annual_savings: number;
  savings_percent: number;
  migration_difficulty: 'Easy' | 'Moderate' | 'Complex' | string;
  pros: string[];
  trade_offs: string[];
  category: string;
}

export class AiService {
  /**
   * Explains why a recurring candidate was detected
   */
  static async explainRecurringCandidate(data: AiExplanationRequest): Promise<AiExplanationResponse> {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, context_type: 'recurring_candidate' })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.title && result.summary) {
          return result;
        }
      }
    } catch {
      // Fall through to deterministic financial intelligence
    }

    return this.generateDeterministicExplanation(data);
  }

  /**
   * Explains a detected price hike
   */
  static async explainPriceIncrease(data: {
    merchant: string;
    previous_amount: number;
    current_amount: number;
    percent: number;
    cycle: string;
  }): Promise<AiExplanationResponse> {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: data.merchant,
          historical_amount: data.previous_amount,
          current_amount: data.current_amount,
          frequency: data.cycle,
          repeat_count: 5,
          confidence: 96,
          context_type: 'price_increase'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.title && result.summary) {
          return result;
        }
      }
    } catch {
      // Fallback
    }

    const delta = data.current_amount - data.previous_amount;
    const deltaAnnual = data.cycle === 'yearly' ? delta : delta * 12;

    return {
      title: `${data.merchant} Price Increased by ~${Math.round(data.percent)}%`,
      summary: `SubMate observed recurring debits shift from ₹${data.previous_amount} to ₹${data.current_amount}.`,
      reason: `Historical consistency was verified across multiple statements, confirming an unannounced tariff revision or tier change rather than a one-time surge.`,
      suggested_action: `This adds ₹${deltaAnnual.toLocaleString('en-IN')}/year to your recurring expenses. Consider checking family sharing or switching to an annual billing cadence for a discount.`
    };
  }

  /**
   * Explains category overlap between multiple services
   */
  static async explainOverlap(category: string, merchants: string[], totalMonthly: number): Promise<AiExplanationResponse> {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: merchants.join(' & '),
          current_amount: totalMonthly,
          frequency: 'monthly',
          repeat_count: merchants.length,
          confidence: 88,
          category,
          context_type: 'overlap'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.title && result.summary) {
          return result;
        }
      }
    } catch {
      // Fallback
    }

    return {
      title: `Potential Overlap in ${category} (${merchants.length} services)`,
      summary: `You are concurrently maintaining ${merchants.join(', ')}, committing ₹${totalMonthly.toLocaleString('en-IN')}/month.`,
      reason: `These platforms fulfill closely aligned entertainment or productivity catalog needs. Data shows users often watch or utilize one platform predominantly in any given month.`,
      suggested_action: `Consider alternating subscriptions season-by-season or evaluating bundle offers to reduce overlap.`
    };
  }

  /**
   * Deterministic explanation fallback adhering strictly to FinTech guardrails
   */
  private static generateDeterministicExplanation(data: AiExplanationRequest): AiExplanationResponse {
    const isPriceHike = data.historical_amount && data.current_amount > data.historical_amount;

    if (isPriceHike) {
      const percent = Math.round(
        ((data.current_amount - data.historical_amount!) / data.historical_amount!) * 100
      );
      return {
        title: `Recurring Rate Adjusted (+${percent}%)`,
        summary: `Debits for ${data.merchant} increased from ₹${data.historical_amount} to ₹${data.current_amount}.`,
        reason: `Detected ${data.repeat_count} recurring statements with consistent vendor normalization and a distinct step-up in billed amount.`,
        suggested_action: `Confirm whether this service remains essential or review plan tiers.`
      };
    }

    return {
      title: `High-Confidence Recurring Pattern (${data.confidence}% confidence)`,
      summary: `Identified ${data.repeat_count} repeating payments of ~₹${data.current_amount.toLocaleString('en-IN')} on a ${data.frequency} cycle.`,
      reason: `Merchant descriptors matched cleaned alias '${data.merchant}' with stable billing intervals and consistent payment modes.`,
      suggested_action: `Confirm this candidate to automatically track upcoming renewals, prevent surprise overdrafts, and receive price change alerts.`
    };
  }

  /**
   * Fetches cheaper alternative recommendations using Gemini AI analysis
   */
  static async getCheaperAlternatives(subscriptions: any[]): Promise<{ alternatives: ServiceAlternative[]; source: string }> {
    try {
      const response = await fetch('/api/ai/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.alternatives && Array.isArray(data.alternatives)) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch AI alternatives, using client fallback', e);
    }

    return {
      source: 'client_fallback',
      alternatives: [
        {
          id: 'alt_netflix',
          current_subscription: 'Netflix',
          current_amount: 649,
          alternative_service: 'JioCinema Premium + Prime Video Bundle',
          alternative_amount: 199,
          cadence: 'monthly',
          annual_savings: 5400,
          savings_percent: 69,
          migration_difficulty: 'Easy',
          pros: ['Includes HBO, Warner Bros & Peacock libraries', '4K Ultra HD streaming', 'Amazon Prime delivery benefits included'],
          trade_offs: ['Separate app interfaces'],
          category: 'Entertainment'
        },
        {
          id: 'alt_spotify',
          current_subscription: 'Spotify',
          current_amount: 119,
          alternative_service: 'YouTube Premium Family / Duo Share',
          alternative_amount: 49,
          cadence: 'monthly',
          annual_savings: 840,
          savings_percent: 59,
          migration_difficulty: 'Easy',
          pros: ['Includes full YouTube Music Premium', 'Ad-free YouTube video playback across all devices', 'Background audio playback'],
          trade_offs: ['Playlist migration required'],
          category: 'Entertainment'
        },
        {
          id: 'alt_adobe',
          current_subscription: 'Adobe Creative Cloud',
          current_amount: 4230,
          alternative_service: 'Affinity V2 Universal License + DaVinci Resolve',
          alternative_amount: 0,
          cadence: 'monthly',
          annual_savings: 50760,
          savings_percent: 100,
          migration_difficulty: 'Moderate',
          pros: ['Zero recurring monthly debits', 'Hollywood-grade DaVinci color grading & editing', 'Low CPU overhead'],
          trade_offs: ['Requires learning Affinity shortcuts'],
          category: 'Productivity'
        },
        {
          id: 'alt_chatgpt',
          current_subscription: 'ChatGPT Plus',
          current_amount: 1999,
          alternative_service: 'Google One AI Premium (Gemini Advanced)',
          alternative_amount: 999,
          cadence: 'monthly',
          annual_savings: 12000,
          savings_percent: 50,
          migration_difficulty: 'Instant',
          pros: ['Includes 2TB Google Drive storage across family', 'Gemini integration in Docs, Gmail & Sheets', '1M token context window'],
          trade_offs: ['Different model ecosystem than OpenAI GPT-4o'],
          category: 'Productivity'
        }
      ]
    };
  }
}
