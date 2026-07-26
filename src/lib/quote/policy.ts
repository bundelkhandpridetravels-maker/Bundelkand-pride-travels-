import { absoluteUrl } from "@/lib/site";

/**
 * Quote business-rule config — one place, honest values only.
 *
 * GST is postponed (registration in progress), so we state the rule rather than
 * invent a rate. Cancellation terms reference the published Terms & Conditions
 * instead of inventing percentages. When the real policies are finalised, this
 * file is the single edit point.
 */

export const GST_STATUS = "GST to be applied after registration";

export const CANCELLATION_SUMMARY =
  "Cancellation charges apply as per our Terms & Conditions. Your travel coordinator will confirm the exact charges for your travel dates before any payment is taken.";

export const QUOTE_TERMS: string[] = [
  "This is an indicative quote — not a confirmed booking or a tax invoice.",
  "Prices are per person on the stated occupancy and subject to availability at the time of confirmation.",
  "Final pricing (season, room-sharing, child rates and GST) is confirmed by our team before any payment.",
  "Hotels are offered by category; the specific hotel is confirmed based on availability.",
  "Full terms apply — see our Terms & Conditions.",
];

/** Days a quote stays valid from its generated date. */
export const DEFAULT_VALIDITY_DAYS = 7;

export const termsUrl = (): string => absoluteUrl("/terms-conditions");
