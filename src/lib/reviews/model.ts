/**
 * Review model — the trust engine. Mirrors the stable Payload Reviews schema
 * (rating/title/body/source/sentiment/published + relations to booking/package/
 * destination/vendor). Feeds the CRM lifecycle "review" stage and vendor scores.
 * One model, no duplicate.
 */

export const REVIEW_SOURCES = ["onsite", "google", "instagram"] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

/** Moderation lifecycle. */
export const REVIEW_STATUSES = ["pending", "approved", "rejected", "published"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

export const REVIEW_SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type ReviewSentiment = (typeof REVIEW_SENTIMENTS)[number];

export type ReviewRecord = {
  id: string;
  rating: number; // 1..5
  title?: string;
  body: string;
  authorName: string;
  authorCity?: string;
  packageSlug?: string;
  destination?: string;
  bookingReference?: string;
  source: ReviewSource;
  /** Advisory, Hermes-derived. */
  sentiment?: ReviewSentiment;
  status: ReviewStatus;
  published: boolean;
  createdAt: string;
};

export type ReviewDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type ReviewSummary = {
  live: boolean;
  total: number;
  average: number;
  distribution: ReviewDistribution;
  pending: number;
  published: number;
};

export function emptyReviewSummary(live = false): ReviewSummary {
  return {
    live,
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    pending: 0,
    published: 0,
  };
}
