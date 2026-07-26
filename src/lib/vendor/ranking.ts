/**
 * Vendor Ranking Engine (ARCHITECTURE_V2 §3). Pure, deterministic, advisory.
 *
 * Computes a 0–100 quality score from weighted factors. Returns `null` when
 * there is not enough data — it never fabricates a score. Weights live here as
 * the single tuning point (later configurable via SiteSettings). The engine only
 * ranks; assignment is human-confirmed (security §12).
 */

export type VendorScoreInputs = {
  /** Average customer review 0–5. */
  reviewAvg?: number;
  /** Complaint rate 0–1 (lower is better). */
  complaintRate?: number;
  /** Average response time in minutes (lower is better). */
  avgResponseMins?: number;
  /** Service quality 0–5. */
  serviceQuality?: number;
  /** Pricing competitiveness 0–5. */
  pricingCompetitiveness?: number;
  /** Professionalism 0–5. */
  professionalism?: number;
};

export const RANKING_WEIGHTS = {
  reviews: 0.3,
  complaints: 0.2,
  response: 0.15,
  service: 0.15,
  pricing: 0.1,
  professionalism: 0.1,
} as const;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Map response minutes to 0–1 (≤15 min → 1, ≥240 min → 0). */
function responseScore(mins: number): number {
  if (mins <= 15) return 1;
  if (mins >= 240) return 0;
  return clamp01(1 - (mins - 15) / (240 - 15));
}

/**
 * Weighted score over whichever factors are present. Missing factors are dropped
 * and the remaining weights renormalized, so a partial profile still scores
 * honestly. Returns null if no factor is available.
 */
export function computeQualityScore(inputs: VendorScoreInputs): number | null {
  const parts: { weight: number; value: number }[] = [];

  if (typeof inputs.reviewAvg === "number")
    parts.push({ weight: RANKING_WEIGHTS.reviews, value: clamp01(inputs.reviewAvg / 5) });
  if (typeof inputs.complaintRate === "number")
    parts.push({ weight: RANKING_WEIGHTS.complaints, value: clamp01(1 - inputs.complaintRate) });
  if (typeof inputs.avgResponseMins === "number")
    parts.push({ weight: RANKING_WEIGHTS.response, value: responseScore(inputs.avgResponseMins) });
  if (typeof inputs.serviceQuality === "number")
    parts.push({ weight: RANKING_WEIGHTS.service, value: clamp01(inputs.serviceQuality / 5) });
  if (typeof inputs.pricingCompetitiveness === "number")
    parts.push({ weight: RANKING_WEIGHTS.pricing, value: clamp01(inputs.pricingCompetitiveness / 5) });
  if (typeof inputs.professionalism === "number")
    parts.push({ weight: RANKING_WEIGHTS.professionalism, value: clamp01(inputs.professionalism / 5) });

  if (parts.length === 0) return null;

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const weighted = parts.reduce((s, p) => s + p.weight * p.value, 0);
  return Math.round((weighted / totalWeight) * 100);
}
