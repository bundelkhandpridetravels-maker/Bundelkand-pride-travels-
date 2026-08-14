/**
 * Document lifecycle — pure and deterministic. Every function takes an explicit
 * `now`, so a result never depends on when a page happened to render.
 *
 * Nothing here writes a status. Expiry is DERIVED from `expiresAt` and the date,
 * and `derivedStatus()` reports what a record's status ought to be — it does not
 * change it. A document moving to `expired` on the record is a decision with
 * consequences (a vendor's permit lapsing can block operations), so it stays a
 * deliberate act, exactly as M3 and M4 treat contract and rate-sheet expiry.
 */
import type { DocumentRecord, DocumentStatus } from "@/lib/documents/model";

/**
 * How far ahead an expiring document is flagged.
 *
 * 60 days, matching the contract (M3) and rate-sheet (M4) renewal horizons so
 * operations sees ONE consistent window across every register. Declared locally
 * rather than imported: documents sit BELOW contracts and rates in the
 * dependency order (both already import this module's permissions), and reaching
 * upward for the constant would invert that and create a cycle.
 */
export const DOCUMENT_EXPIRY_WARNING_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Statuses in which a document is actually relied upon. */
export const IN_FORCE_STATUSES: readonly DocumentStatus[] = ["uploaded", "verified"];

/** Floor an ISO timestamp to UTC midnight so comparisons are calendar-day accurate. */
function dayStart(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function today(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/**
 * Whole days until expiry — negative once past, null when the document has no
 * expiry date at all. Takes only the field it reads, so it works on a full
 * record and on any narrower projection.
 */
export function daysUntilDocumentExpiry(
  document: Pick<DocumentRecord, "expiresAt">,
  now: Date = new Date(),
): number | null {
  if (!document.expiresAt) return null;
  const end = dayStart(document.expiresAt);
  if (end === null) return null;
  return Math.round((end - today(now)) / MS_PER_DAY);
}

/** In force and not past its expiry date. A document with no expiry stays valid. */
export function isDocumentValid(document: DocumentRecord, now: Date = new Date()): boolean {
  if (!IN_FORCE_STATUSES.includes(document.status)) return false;
  const days = daysUntilDocumentExpiry(document, now);
  return days === null || days >= 0;
}

/** In force and inside the warning window (inclusive of today and of the bound). */
export function isDocumentExpiringSoon(
  document: DocumentRecord,
  now: Date = new Date(),
  windowDays: number = DOCUMENT_EXPIRY_WARNING_DAYS,
): boolean {
  if (!IN_FORCE_STATUSES.includes(document.status)) return false;
  const days = daysUntilDocumentExpiry(document, now);
  return days !== null && days >= 0 && days <= windowDays;
}

/**
 * Past its expiry date by the calendar, whatever the record says. Status is not
 * consulted: this is the date's answer, not the register's.
 */
export function isDocumentExpired(document: DocumentRecord, now: Date = new Date()): boolean {
  const days = daysUntilDocumentExpiry(document, now);
  return days !== null && days < 0;
}

/**
 * The expensive case: the date says expired, the record still says in force.
 *
 * This is the document-layer twin of M4's lapsed rate sheet. It is the state
 * that quietly causes harm — a vendor operating on a permit that ran out, an
 * agreement relied upon after it lapsed — because every surface still shows the
 * document as good.
 */
export function isDocumentExpiredButActive(
  document: DocumentRecord,
  now: Date = new Date(),
): boolean {
  return IN_FORCE_STATUSES.includes(document.status) && isDocumentExpired(document, now);
}

/**
 * What the status WOULD be if expiry were applied. Returns the record's own
 * status when nothing has changed. Never mutates, never persists — a caller
 * decides whether to act on the difference.
 */
export function derivedStatus(document: DocumentRecord, now: Date = new Date()): DocumentStatus {
  return isDocumentExpiredButActive(document, now) ? "expired" : document.status;
}

/** True when the record disagrees with the calendar and needs a human decision. */
export function needsStatusReview(document: DocumentRecord, now: Date = new Date()): boolean {
  return derivedStatus(document, now) !== document.status;
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type DocumentLifecycleTally = {
  valid: number;
  expiringSoon: number;
  expired: number;
  expiredButActive: number;
  noExpiry: number;
};

/** Fold a set of documents into lifecycle counts. Pure; used by the register. */
export function tallyLifecycle(
  documents: DocumentRecord[],
  now: Date = new Date(),
): DocumentLifecycleTally {
  const tally: DocumentLifecycleTally = {
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    expiredButActive: 0,
    noExpiry: 0,
  };

  for (const document of documents) {
    if (isDocumentValid(document, now)) tally.valid += 1;
    if (isDocumentExpiringSoon(document, now)) tally.expiringSoon += 1;
    if (isDocumentExpired(document, now)) tally.expired += 1;
    if (isDocumentExpiredButActive(document, now)) tally.expiredButActive += 1;
    if (!document.expiresAt) tally.noExpiry += 1;
  }

  return tally;
}
