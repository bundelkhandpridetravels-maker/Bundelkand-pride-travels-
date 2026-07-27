/**
 * Google review handoff. Deep-links a happy reviewer to leave a Google review.
 *
 * Requires the business's Google Place ID, which is real business data we don't
 * have yet — so this is null until configured. No invented link. Set
 * GOOGLE_PLACE_ID here (or later via SiteSettings) to enable the handoff.
 */

export const GOOGLE_PLACE_ID: string | null = null;

/** The canonical "write a review" deep link, or null when not configured. */
export function googleReviewUrl(): string | null {
  if (!GOOGLE_PLACE_ID) return null;
  return `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
}

export function isGoogleHandoffEnabled(): boolean {
  return googleReviewUrl() !== null;
}
