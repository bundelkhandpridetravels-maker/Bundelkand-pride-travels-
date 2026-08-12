/**
 * Contract expiry & renewal maths. Pure and deterministic — every function takes
 * an explicit `now`, so results are testable and never depend on when the page
 * happened to render.
 *
 * NOTE ON BUSINESS RULES: the warning window below is an operational alerting
 * preference (founder decision, Phase 3 M3 — 60 days), NOT a contract duration.
 * The platform never assumes how long an agreement runs; every expiry date comes
 * from the real contract.
 */
import { isInForce } from "@/lib/contracts/lifecycle";
import type { ContractRecord, ContractStatus } from "@/lib/contracts/model";

/**
 * How far ahead an expiring contract is flagged. Founder decision: 60 days —
 * enough runway to renegotiate before season planning without constant noise.
 * Single constant; change here and every surface follows.
 */
export const EXPIRY_WARNING_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days from `now` until the contract expires. Negative when already past.
 * Null when the contract carries no expiry date.
 *
 * Both sides are floored to UTC midnight so the answer is a calendar-day count,
 * not an artefact of the time of day the dashboard was opened.
 */
export function daysUntilExpiry(contract: ContractRecord, now: Date = new Date()): number | null {
  if (!contract.expiryDate) return null;
  const expiry = new Date(contract.expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;

  const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(expiry) - startOfDay(now)) / MS_PER_DAY);
}

/**
 * In force, and expiring within the warning window (inclusive of today).
 * A contract already past expiry is `lapsed`, not `expiringSoon`.
 */
export function isExpiringSoon(
  contract: ContractRecord,
  now: Date = new Date(),
  windowDays: number = EXPIRY_WARNING_DAYS,
): boolean {
  if (contract.status !== "signed") return false;
  const days = daysUntilExpiry(contract, now);
  if (days === null) return false;
  return days >= 0 && days <= windowDays;
}

/**
 * Signed, past its expiry date, but still sitting as `signed` in the register —
 * the case that quietly costs money, because allocation still treats it as
 * valid. Surfaced separately from `expired` (which someone has already actioned).
 */
export function isLapsed(contract: ContractRecord, now: Date = new Date()): boolean {
  if (contract.status !== "signed") return false;
  const days = daysUntilExpiry(contract, now);
  return days !== null && days < 0;
}

/** Issued for signature but not yet returned. */
export function isAwaitingSignature(contract: ContractRecord): boolean {
  return contract.status === "sent";
}

export type RenewalUrgency = "lapsed" | "critical" | "warning" | "ok" | "none";

/**
 * Bucket a contract for the watchlist. `critical` is the final third of the
 * warning window — a presentation refinement of the same 60-day decision, not a
 * second business rule.
 */
export function renewalUrgency(
  contract: ContractRecord,
  now: Date = new Date(),
  windowDays: number = EXPIRY_WARNING_DAYS,
): RenewalUrgency {
  if (contract.status !== "signed") return "none";
  const days = daysUntilExpiry(contract, now);
  if (days === null) return "none";
  if (days < 0) return "lapsed";
  if (days <= Math.round(windowDays / 3)) return "critical";
  if (days <= windowDays) return "warning";
  return "ok";
}

export type RenewalItem = {
  contract: ContractRecord;
  daysUntilExpiry: number | null;
  urgency: RenewalUrgency;
};

/**
 * The renewal watchlist: everything lapsed or inside the window, most urgent
 * first. Contracts with no expiry date are excluded — there is nothing to renew
 * against, and inventing a date would be inventing a business rule.
 */
export function buildRenewalWatchlist(
  contracts: ContractRecord[],
  now: Date = new Date(),
  windowDays: number = EXPIRY_WARNING_DAYS,
): RenewalItem[] {
  return contracts
    .filter((c) => isLapsed(c, now) || isExpiringSoon(c, now, windowDays))
    .map((contract) => ({
      contract,
      daysUntilExpiry: daysUntilExpiry(contract, now),
      urgency: renewalUrgency(contract, now, windowDays),
    }))
    .sort((a, b) => (a.daysUntilExpiry ?? 0) - (b.daysUntilExpiry ?? 0));
}

/** Fold contracts into the register summary. */
export function summarizeContracts(
  contracts: ContractRecord[],
  live: boolean,
  now: Date = new Date(),
  windowDays: number = EXPIRY_WARNING_DAYS,
): {
  live: boolean;
  total: number;
  counts: Record<ContractStatus, number>;
  expiringSoon: number;
  lapsed: number;
} {
  const counts: Record<ContractStatus, number> = {
    draft: 0,
    sent: 0,
    signed: 0,
    expired: 0,
    terminated: 0,
  };
  let expiringSoon = 0;
  let lapsed = 0;

  for (const contract of contracts) {
    counts[contract.status] += 1;
    if (isExpiringSoon(contract, now, windowDays)) expiringSoon += 1;
    if (isLapsed(contract, now)) lapsed += 1;
  }

  return { live, total: contracts.length, counts, expiringSoon, lapsed };
}

/** Re-exported so callers get the in-force test from the renewal vocabulary too. */
export { isInForce };
