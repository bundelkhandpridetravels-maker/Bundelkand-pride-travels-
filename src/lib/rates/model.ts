/**
 * Vendor rate sheets — the supply-side price book.
 *
 * A rate sheet is what a hotel, DMC or transport partner actually sends: a list
 * of prices per room type, per meal plan, per occupancy, for a stated validity
 * period, often split by season. Today those live in email attachments and
 * WhatsApp. This gives them a structure the Package Pricing Engine (M7) can
 * compute against instead of a human reading a PDF.
 *
 * WHAT THIS MODULE DOES NOT CONTAIN — deliberately:
 *   no rates, no season dates, no meal-plan codes, no room-type names, no
 *   markup, margin or commission rules. Every one of those is real commercial
 *   data supplied by the founder or the vendor. This module is the shape they
 *   arrive in, never the values.
 *
 * Reuse, not redefinition:
 *   - the vendor is a `VendorRecord` (src/lib/vendor/model.ts)
 *   - the original PDF/spreadsheet is a Document (src/lib/documents) — kind
 *     `vend_rate_sheet` sits alongside the existing vendor document kinds
 *   - validity normally tracks the vendor's contract (src/lib/contracts), so a
 *     sheet may reference one
 */
import type { DocumentActor, DocumentActorRole } from "@/lib/documents/permissions";

/* ------------------------------------------------------------------ *
 * Seasons
 * ------------------------------------------------------------------ */

/**
 * A named date window a vendor prices differently.
 *
 * The label is the VENDOR'S own wording ("Peak", "Diwali", "Shoulder") — the
 * platform does not define a season vocabulary, because season names and dates
 * differ per supplier and per destination and are genuine business data.
 */
export type RateSeason = {
  id: string;
  label: string;
  /** ISO calendar dates, inclusive. */
  startDate: string;
  endDate: string;
};

/* ------------------------------------------------------------------ *
 * Rate lines
 * ------------------------------------------------------------------ */

/**
 * One priced row. Mirrors how suppliers actually quote: a room type, on a meal
 * plan, at an occupancy, for a season.
 *
 * `roomType` and `mealPlan` are free text on purpose — they carry the vendor's
 * own naming (matching `hotels.roomTypes` when the hotel is in the system).
 * Forcing them into a platform enum would silently rewrite what the supplier
 * sent, which is exactly the kind of invention this project forbids.
 */
export type RateLine = {
  id: string;
  roomType: string;
  mealPlan?: string;
  /** People the price covers. */
  occupancy?: number;
  /** Which season window this row prices; absent = applies to the whole sheet. */
  seasonId?: string;
  /** COMMERCIALLY SENSITIVE — founder-only. Absent until captured. */
  amount?: number;
  /** Free-text conditions as written by the vendor (min nights, blackout…). */
  conditions?: string;
};

/* ------------------------------------------------------------------ *
 * Rate sheets
 * ------------------------------------------------------------------ */

export const RATE_SHEET_STATUSES = ["draft", "active", "expired", "superseded"] as const;
export type RateSheetStatus = (typeof RATE_SHEET_STATUSES)[number];

export const RATE_SHEET_STATUS_LABELS: Record<RateSheetStatus, string> = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  superseded: "Superseded",
};

export const RATE_SHEET_STATUS_DESCRIPTIONS: Record<RateSheetStatus, string> = {
  draft: "Captured from the supplier, not yet approved for pricing use.",
  active: "Approved and in force — the Pricing Engine may quote from it.",
  expired: "Past its validity period. No longer quotable.",
  superseded: "Replaced by a newer sheet from the same supplier.",
};

export type RateSheet = {
  id: string;
  vendorId: string;
  /** Captured for the register; the vendor record stays canonical. */
  vendorName: string;
  /** Vendor's own reference for the sheet, if they gave one. */
  reference?: string;
  status: RateSheetStatus;
  /** ISO calendar dates the sheet is valid between. */
  validFrom?: string;
  validTo?: string;
  /** ISO 4217 code as quoted by the supplier — never defaulted. */
  currency?: string;
  seasons: RateSeason[];
  lines: RateLine[];
  /** Refs into the Documents layer — the original PDF/spreadsheet. */
  documentRefs: string[];
  /** The M3 contract this pricing sits under, when one exists. */
  contractId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ *
 * Commercial sensitivity
 * ------------------------------------------------------------------ */

/**
 * Rate amounts are supplier commercial terms — the same class of data as M3's
 * contract values, and restricted the same way: founder-only.
 *
 * This mirrors `canViewContractValue` rather than importing it, because rates
 * must not depend on the contracts module for access control. Both read from
 * the ONE platform role vocabulary (documents/permissions), so there is a single
 * source of truth for who is who.
 */
export const RATE_AMOUNT_VISIBILITY = "founder_only" as const;

const AMOUNT_ROLES: DocumentActorRole[] = ["founder"];

export function canViewRateAmounts(actor: DocumentActor): boolean {
  return AMOUNT_ROLES.includes(actor.role);
}

/** A rate line as a given actor may see it — `amount` present only if permitted. */
export type RateLineView = Omit<RateLine, "amount"> & {
  amount?: number;
  amountRedacted: boolean;
};

export type RateSheetView = Omit<RateSheet, "lines"> & {
  lines: RateLineView[];
  /** True when any amount on the sheet was withheld from this actor. */
  amountsRedacted: boolean;
};

/**
 * Redact in the DATA layer, not the template. The `amount` key is physically
 * removed for unauthorised actors, so it cannot survive JSON serialisation or
 * be leaked by a surface that forgets to hide a column.
 */
export function redactRateSheet(sheet: RateSheet, actor: DocumentActor): RateSheetView {
  const allowed = canViewRateAmounts(actor);
  let withheld = false;

  const lines: RateLineView[] = sheet.lines.map((line) => {
    const { amount, ...rest } = line;
    if (allowed) {
      return amount === undefined
        ? { ...rest, amountRedacted: false }
        : { ...rest, amount, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, amountRedacted: amount !== undefined };
  });

  return { ...sheet, lines, amountsRedacted: withheld };
}

export function redactRateSheets(sheets: RateSheet[], actor: DocumentActor): RateSheetView[] {
  return sheets.map((s) => redactRateSheet(s, actor));
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type RateSheetSummary = {
  live: boolean;
  total: number;
  counts: Record<RateSheetStatus, number>;
  /** Active sheets inside the expiry-warning window. */
  expiringSoon: number;
  /** Active sheets already past their validity but still marked active. */
  lapsed: number;
  /** Sheets with at least one blocking validation error. */
  withErrors: number;
};

export function emptyRateSheetSummary(live = false): RateSheetSummary {
  return {
    live,
    total: 0,
    counts: { draft: 0, active: 0, expired: 0, superseded: 0 },
    expiringSoon: 0,
    lapsed: 0,
    withErrors: 0,
  };
}
