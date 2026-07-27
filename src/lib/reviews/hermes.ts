/**
 * Review ← Hermes seam. Sentiment analysis + summarisation of reviews later, on
 * the shared HermesContext contract. Advisory; a human curates what publishes.
 */
import { HERMES_ENABLED, type HermesContext } from "@/lib/hermes";
import type { ReviewRecord, ReviewSentiment } from "@/lib/reviews/model";

export function buildReviewContext(review: ReviewRecord): HermesContext {
  return {
    kind: "booking",
    facts: {
      rating: review.rating,
      source: review.source,
      status: review.status,
      hasBooking: Boolean(review.bookingReference),
    },
  };
}

/** Sentiment classification. Returns null while Hermes is disabled. */
export function analyzeSentiment(review: ReviewRecord): ReviewSentiment | null {
  void review;
  if (!HERMES_ENABLED) return null;
  return null;
}
