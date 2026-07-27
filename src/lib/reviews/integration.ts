// Server-only: wires the Review module into CRM, Hermes, email, Google and
// booking completion — REUSING existing seams. No duplicate review model.
import type { CrmActivity } from "@/lib/crm/model";
import type { BookingRecord } from "@/lib/booking/booking";
import type { EmailSendResult } from "@/lib/email/model";
import { sendReviewRequest } from "@/lib/email/workflow";
import type { ReviewRecord } from "@/lib/reviews/model";
import { buildReviewContext } from "@/lib/reviews/hermes";
import { googleReviewUrl } from "@/lib/reviews/google";
import type { HermesContext } from "@/lib/hermes";

/**
 * Booking completion → review request. Reuses the email workflow's
 * `sendReviewRequest` (which renders the existing `review_request` template).
 * Called when a trip completes; no new email or template.
 */
export async function requestReviewOnBookingComplete(booking: BookingRecord): Promise<EmailSendResult> {
  return sendReviewRequest({
    name: booking.name,
    email: booking.email || undefined,
    packageTitle: booking.packageTitle,
    reference: booking.reference,
  });
}

/**
 * Review → CRM activity. Folds a received review into the unified CRM timeline
 * using the existing CrmActivity model (the "review" lifecycle stage).
 */
export function crmActivityFromReview(review: ReviewRecord): CrmActivity {
  return {
    id: `act_review_${review.id}`,
    leadRef: review.bookingReference,
    type: "note",
    subject: `Review received — ${review.rating}★${review.title ? ` · ${review.title}` : ""}`,
    body: review.body,
    at: review.createdAt,
    source: "review",
  };
}

/** Review → Hermes context (reuses reviews/hermes). */
export function reviewToHermes(review: ReviewRecord): HermesContext {
  return buildReviewContext(review);
}

/** Google-review handoff for a published review, or null when not configured. */
export function googleHandoffForReview(review: ReviewRecord): string | null {
  if (!review.published) return null;
  return googleReviewUrl();
}
