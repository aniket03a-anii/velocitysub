import { Transaction, DetectionCandidate, BillingCycle, Subscription } from '../types';
import { normalizeMerchant } from './merchantNormalizer';

export interface DetectionResult {
  candidates: DetectionCandidate[];
  normalizedCount: number;
  totalTransactionsAnalyzed: number;
  priceChangesCount: number;
  hiddenExpensesCount: number;
  guardrailsTriggeredCount: number;
}

export function detectRecurringPatterns(
  transactions: Transaction[],
  existingSubscriptions: Subscription[] = []
): DetectionResult {
  if (!transactions || transactions.length === 0) {
    return {
      candidates: [],
      normalizedCount: 0,
      totalTransactionsAnalyzed: 0,
      priceChangesCount: 0,
      hiddenExpensesCount: 0,
      guardrailsTriggeredCount: 0
    };
  }

  // Group transactions by normalized merchant
  const merchantGroups = new Map<string, Transaction[]>();
  const normalizedMerchantsSet = new Set<string>();

  for (const tx of transactions) {
    const norm = tx.merchant_normalized || normalizeMerchant(tx.merchant_original).normalized;
    normalizedMerchantsSet.add(norm);

    if (!merchantGroups.has(norm)) {
      merchantGroups.set(norm, []);
    }
    merchantGroups.get(norm)!.push(tx);
  }

  const candidates: DetectionCandidate[] = [];
  let priceChangesCount = 0;
  let hiddenExpensesCount = 0;
  let guardrailsTriggeredCount = 0;

  for (const [normMerchant, txList] of merchantGroups.entries()) {
    // Only analyze groups with at least 2 transactions (ideally 3+)
    if (txList.length < 2) continue;

    // Sort chronologically ascending
    const sorted = [...txList].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate intervals between consecutive transactions in days
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1].date).getTime();
      const d2 = new Date(sorted[i].date).getTime();
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        intervals.push(diffDays);
      }
    }

    if (intervals.length === 0) continue;

    const avgInterval = intervals.reduce((acc, v) => acc + v, 0) / intervals.length;
    const variance =
      intervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Detect frequency from average interval
    let frequency: BillingCycle = 'monthly';
    let freqMatch = false;

    if (avgInterval >= 5 && avgInterval <= 9) {
      frequency = 'weekly';
      freqMatch = true;
    } else if (avgInterval >= 11 && avgInterval <= 18) {
      frequency = 'biweekly';
      freqMatch = true;
    } else if (avgInterval >= 25 && avgInterval <= 36) {
      frequency = 'monthly';
      freqMatch = true;
    } else if (avgInterval >= 75 && avgInterval <= 105) {
      frequency = 'quarterly';
      freqMatch = true;
    } else if (avgInterval >= 160 && avgInterval <= 200) {
      frequency = 'half-yearly';
      freqMatch = true;
    } else if (avgInterval >= 340 && avgInterval <= 390) {
      frequency = 'yearly';
      freqMatch = true;
    }

    // Amount analysis & Price Change Detection
    const amounts = sorted.map((t) => Number(t.amount));
    const latestAmount = amounts[amounts.length - 1];
    const previousAmount = amounts.length >= 2 ? amounts[amounts.length - 2] : latestAmount;
    const oldestAmount = amounts[0];

    // Detect price change
    let priceChangeDetected = false;
    let priceChangePercent = 0;
    if (amounts.length >= 2 && Math.abs(latestAmount - previousAmount) > 5) {
      priceChangePercent = Number(
        (((latestAmount - previousAmount) / previousAmount) * 100).toFixed(1)
      );
      if (Math.abs(priceChangePercent) >= 5) {
        priceChangeDetected = true;
        priceChangesCount++;
      }
    }

    // Amount stability
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxAmountDiff = Math.max(...amounts.map((a) => Math.abs(a - avgAmount)));
    const amountStabilityPercent = Math.max(
      0,
      Math.min(100, Math.round(100 - (maxAmountDiff / (avgAmount || 1)) * 100))
    );

    // Normalization meta info
    const meta = normalizeMerchant(sorted[0].merchant_original);

    // Evaluate confidence score based on explicit signals (Section 12):
    // 1. Merchant match: 25
    // 2. Frequency consistency: 25
    // 3. Amount similarity: 15
    // 4. Repeat count: 15
    // 5. Transaction mode: 5
    // 6. User history / existence: 5
    // 7. Category / Context: 10
    let score = 0;

    // 1. Merchant match
    score += meta.isSubscriptionCandidate ? 25 : 20;

    // 2. Frequency consistency
    if (freqMatch) {
      if (stdDev <= 4) score += 25;
      else if (stdDev <= 8) score += 20;
      else score += 14;
    } else if (avgInterval >= 20 && avgInterval <= 45) {
      score += 10;
    }

    // 3. Amount similarity (or valid price hike pattern)
    if (amountStabilityPercent >= 90) {
      score += 15;
    } else if (priceChangeDetected && (amountStabilityPercent >= 70 || sorted.length >= 3)) {
      // Intentional price change still reflects high recurring confidence
      score += 13;
    } else if (amountStabilityPercent >= 70) {
      score += 9;
    } else {
      score += 4;
    }

    // 4. Repeat count
    if (sorted.length >= 5) score += 15;
    else if (sorted.length >= 4) score += 13;
    else if (sorted.length >= 3) score += 10;
    else if (sorted.length >= 2) score += 6;

    // 5. Transaction mode (UPI AutoPay, Direct Debit, Mandate, or Card)
    const hasAutoPayMode = sorted.some(
      (s) =>
        s.mode?.toLowerCase().includes('auto') ||
        s.mode?.toLowerCase().includes('upi') ||
        s.mode?.toLowerCase().includes('ach')
    );
    if (hasAutoPayMode) score += 5;
    else score += 3;

    // 6. User history: does user already track or confirm this?
    const alreadySubscribed = existingSubscriptions.some(
      (sub) => sub.merchant_name.toLowerCase() === normMerchant.toLowerCase()
    );
    if (!alreadySubscribed) {
      score += 5;
    } else {
      score += 4;
    }

    // 7. Category context & guardrails
    if (meta.isCategoryExclusion) {
      // Guardrail applied: Rent, EMI, Insurance, Utilities, SIP
      guardrailsTriggeredCount++;
      score = Math.min(score, 68); // Cap so user review is strictly enforced
    } else if (meta.isSubscriptionCandidate) {
      score += 10;
    } else {
      score += 5;
    }

    const finalConfidence = Math.min(98, Math.max(35, Math.round(score)));

    // Only qualify as candidate if confidence >= 50 or repeat count >= 3
    if (finalConfidence >= 50 || sorted.length >= 3) {
      // Determine candidate type
      let candidateType: DetectionCandidate['candidate_type'] = 'subscription';
      if (meta.isCategoryExclusion) {
        candidateType = 'recurring_expense';
      } else if (priceChangeDetected) {
        candidateType = 'price_change';
      } else if (!alreadySubscribed && sorted.length >= 3) {
        candidateType = 'hidden_expense';
        hiddenExpensesCount++;
      }

      const candidate: DetectionCandidate = {
        id: `cand_${Math.random().toString(36).substring(2, 10)}`,
        user_id: sorted[0].user_id,
        merchant: sorted[sorted.length - 1].merchant_original,
        normalized_merchant: normMerchant,
        estimated_amount: latestAmount,
        previous_amount: priceChangeDetected ? previousAmount : undefined,
        frequency,
        confidence: finalConfidence,
        evidence: {
          repeat_count: sorted.length,
          average_interval_days: Math.round(avgInterval),
          interval_variance_days: Math.round(stdDev),
          amount_stability_percent: amountStabilityPercent,
          price_change_detected: priceChangeDetected,
          price_change_percent: priceChangeDetected ? priceChangePercent : undefined,
          last_detected_date: sorted[sorted.length - 1].date,
          sample_transaction_dates: sorted.slice(-4).map((t) => t.date),
          sample_amounts: sorted.slice(-4).map((t) => Number(t.amount)),
          category_guardrail_applied: meta.isCategoryExclusion,
          guardrail_note: meta.isCategoryExclusion
            ? `${meta.category} is a recurring financial commitment, not a leisure subscription.`
            : undefined,
          merchant_match_score: meta.isSubscriptionCandidate ? 95 : 75
        },
        candidate_type: candidateType,
        status: alreadySubscribed ? 'confirmed' : 'pending',
        first_detected: sorted[0].date,
        last_detected: sorted[sorted.length - 1].date,
        created_at: new Date().toISOString()
      };

      candidates.push(candidate);
    }
  }

  // Sort candidates by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates,
    normalizedCount: normalizedMerchantsSet.size,
    totalTransactionsAnalyzed: transactions.length,
    priceChangesCount,
    hiddenExpensesCount,
    guardrailsTriggeredCount
  };
}

// Predict next estimated renewal date given last date & frequency
export function calculateNextRenewalDate(lastDateStr: string, cycle: BillingCycle): string {
  const d = new Date(lastDateStr);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

  switch (cycle) {
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'half-yearly':
      d.setMonth(d.getMonth() + 6);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }

  return d.toISOString().split('T')[0];
}
