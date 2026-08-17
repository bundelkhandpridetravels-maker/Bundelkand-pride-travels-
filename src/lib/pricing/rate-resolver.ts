/**
 * Rate resolution — a READ-ONLY adapter over M4. Pure, no I/O.
 *
 * M4 (frozen, approved) owns rate sheets: their model, season maths, validation
 * and expiry rules. This module does not re-implement any of it. It asks M4's
 * own functions the questions a pricing engine needs answered:
 *
 *   "for this vendor, on this travel date, for this room type / meal plan /
 *    occupancy — what does the supplier charge, and can I trust that number?"
 *
 * The second half of that question is the important half. A rate that has
 * lapsed, sits on an unvalidated sheet, falls in a date covered by two
 * overlapping seasons, or carries an amount with no currency is NOT a usable
 * price, and every one of those cases returns an explicit refusal rather than a
 * best guess. Quoting from a withdrawn rate is precisely the failure M4's
 * "lapsed but still active" detection exists to prevent.
 *
 * ⚠️ M4 IS NOT MODIFIED AND IS NOT PERSISTED. Its repository remains
 * `live:false`, so in practice this resolver is handed an empty set of sheets
 * and correctly reports that no rate exists.
 */
import type { RateLine, RateSeason, RateSheet } from "@/lib/rates/model";
import { findSeasonOverlaps, isDateInSeason, seasonForDate } from "@/lib/rates/seasons";
import {
  daysUntilRateExpiry,
  isRateSheetLapsed,
  validateRateSheet,
} from "@/lib/rates/validation";
import { fromRateLineAmount, type Money } from "@/lib/pricing/money";
import type { RateProvenance } from "@/lib/pricing/model";

/* ------------------------------------------------------------------ *
 * Query
 * ------------------------------------------------------------------ */

/** Exactly the dimensions M4 rate lines actually carry. Nothing invented. */
export type RateQuery = {
  vendorId: string;
  /** The travel date the rate must be valid for. */
  date: Date;
  roomType: string;
  mealPlan?: string;
  occupancy?: number;
};

export type RateFailureCode =
  | "no_sheet_for_vendor"
  | "sheet_not_active"
  | "sheet_invalid"
  | "sheet_lapsed"
  | "date_outside_validity"
  | "season_ambiguous"
  | "no_matching_line"
  | "ambiguous_line_match"
  | "amount_missing"
  | "currency_missing";

export type RateResolution =
  | {
      ok: true;
      unitCost: Money;
      sheet: RateSheet;
      line: RateLine;
      season: RateSeason | null;
      provenance: RateProvenance;
      /** Days until the sheet expires. Negative means already past. */
      daysUntilExpiry: number | null;
    }
  | { ok: false; code: RateFailureCode; error: string };

const refuse = (code: RateFailureCode, error: string): RateResolution => ({ ok: false, code, error });

/* ------------------------------------------------------------------ *
 * Matching helpers
 * ------------------------------------------------------------------ */

const norm = (value?: string): string => (value ?? "").trim().toLowerCase();

/**
 * Does the travel date fall inside the sheet's validity window?
 *
 * Reuses M4's own inclusive day comparison by shaping the validity period as a
 * season, rather than writing a second date implementation that could disagree
 * with M4 about a boundary day.
 */
function dateWithinValidity(sheet: RateSheet, date: Date): boolean {
  if (!sheet.validFrom || !sheet.validTo) return false;
  const window: RateSeason = {
    id: `${sheet.id}__validity`,
    label: "validity",
    startDate: sheet.validFrom,
    endDate: sheet.validTo,
  };
  return isDateInSeason(window, date);
}

/**
 * Lines matching the query. A line with no `seasonId` prices the whole sheet,
 * so it matches whichever season the date resolved to — including none.
 */
function matchingLines(sheet: RateSheet, query: RateQuery, season: RateSeason | null): RateLine[] {
  return sheet.lines.filter((line) => {
    if (norm(line.roomType) !== norm(query.roomType)) return false;
    if (query.mealPlan !== undefined && norm(line.mealPlan) !== norm(query.mealPlan)) return false;
    if (query.occupancy !== undefined && line.occupancy !== query.occupancy) return false;
    if (line.seasonId === undefined) return true;
    return season !== null && line.seasonId === season.id;
  });
}

/* ------------------------------------------------------------------ *
 * Resolution
 * ------------------------------------------------------------------ */

/**
 * Resolve a supplier rate, or refuse with a reason.
 *
 * The gates, in order — each one a way a price could be wrong:
 *   1. a sheet exists for the vendor
 *   2. it is ACTIVE (draft, expired and superseded sheets never price a trip)
 *   3. it passes M4's own validation (delegated, never re-implemented)
 *   4. it has not lapsed as of `now`
 *   5. the TRAVEL date sits inside its validity window
 *   6. the travel date is not covered by overlapping seasons
 *   7. exactly one line matches the requested dimensions
 *   8. that line has an amount, and the sheet has a currency
 */
export function resolveRate(
  sheets: RateSheet[],
  query: RateQuery,
  now: Date = new Date(),
): RateResolution {
  const vendorSheets = sheets.filter((s) => s.vendorId === query.vendorId);
  if (vendorSheets.length === 0) {
    return refuse("no_sheet_for_vendor", "No rate sheet is on record for this supplier.");
  }

  const active = vendorSheets.filter((s) => s.status === "active");
  if (active.length === 0) {
    return refuse(
      "sheet_not_active",
      "The supplier has rate sheets, but none is active. Only an approved, active sheet may price a trip.",
    );
  }

  // Prefer a sheet whose validity actually covers the travel date.
  const covering = active.filter((s) => dateWithinValidity(s, query.date));
  if (covering.length === 0) {
    return refuse(
      "date_outside_validity",
      "No active rate sheet covers the travel date. Quoting from a sheet outside its validity would use a withdrawn price.",
    );
  }

  // Newest validity wins when several cover the date — a renewal supersedes the
  // sheet it replaces, and nothing is deleted.
  const sheet = [...covering].sort((a, b) => (b.validFrom ?? "").localeCompare(a.validFrom ?? ""))[0];

  const validation = validateRateSheet(sheet, now);
  if (!validation.ok) {
    return refuse(
      "sheet_invalid",
      `The rate sheet has ${validation.errors.length} validation error(s) and cannot price a trip: ${validation.errors
        .map((e) => e.code)
        .join(", ")}.`,
    );
  }

  if (isRateSheetLapsed(sheet, now)) {
    return refuse(
      "sheet_lapsed",
      "The rate sheet is marked active but is past its validity — the supplier has withdrawn it.",
    );
  }

  if (findSeasonOverlaps(sheet.seasons).length > 0) {
    return refuse(
      "season_ambiguous",
      "The sheet has overlapping seasons, so the travel date has more than one price. Resolve the overlap before quoting.",
    );
  }

  const season = seasonForDate(sheet.seasons, query.date);
  const candidates = matchingLines(sheet, query, season);

  if (candidates.length === 0) {
    return refuse(
      "no_matching_line",
      "No rate line matches the requested room type, meal plan and occupancy for that date.",
    );
  }
  if (candidates.length > 1) {
    return refuse(
      "ambiguous_line_match",
      `${candidates.length} rate lines match the same request — the price would depend on ordering.`,
    );
  }

  const line = candidates[0];
  const unitCost = fromRateLineAmount(line.amount, sheet.currency);
  if (!unitCost.ok) {
    return refuse(
      unitCost.code === "missing_currency" ? "currency_missing" : "amount_missing",
      unitCost.error,
    );
  }

  const provenance: RateProvenance = {
    source: "rate_sheet",
    vendorId: sheet.vendorId,
    vendorName: sheet.vendorName,
    rateSheetId: sheet.id,
    rateLineId: line.id,
    ...(season ? { seasonId: season.id, seasonLabel: season.label } : {}),
    ...(sheet.validFrom ? { validFrom: sheet.validFrom } : {}),
    ...(sheet.validTo ? { validTo: sheet.validTo } : {}),
    resolvedFor: {
      date: query.date.toISOString().slice(0, 10),
      roomType: query.roomType,
      ...(query.mealPlan !== undefined ? { mealPlan: query.mealPlan } : {}),
      ...(query.occupancy !== undefined ? { occupancy: query.occupancy } : {}),
    },
  };

  return {
    ok: true,
    unitCost: unitCost.value,
    sheet,
    line,
    season,
    provenance,
    daysUntilExpiry: daysUntilRateExpiry(sheet, now),
  };
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export type ResolvabilityReport = {
  vendorId: string;
  sheetsOnRecord: number;
  activeSheets: number;
  /** Why a quote cannot be priced right now, in plain language. */
  blockers: string[];
};

/**
 * Explain a supplier's pricing readiness WITHOUT attempting a resolution — used
 * by the console so an operator can see why nothing is quotable yet. Reports no
 * amounts, so it is safe on any staff surface.
 */
export function describeResolvability(
  sheets: RateSheet[],
  vendorId: string,
  now: Date = new Date(),
): ResolvabilityReport {
  const mine = sheets.filter((s) => s.vendorId === vendorId);
  const active = mine.filter((s) => s.status === "active");
  const blockers: string[] = [];

  if (mine.length === 0) blockers.push("No rate sheet on record.");
  else if (active.length === 0) blockers.push("No active rate sheet.");

  for (const sheet of active) {
    if (!validateRateSheet(sheet, now).ok) blockers.push(`Sheet ${sheet.id} has validation errors.`);
    if (isRateSheetLapsed(sheet, now)) blockers.push(`Sheet ${sheet.id} has lapsed.`);
    if (findSeasonOverlaps(sheet.seasons).length > 0) blockers.push(`Sheet ${sheet.id} has overlapping seasons.`);
    if (!sheet.currency) blockers.push(`Sheet ${sheet.id} has no currency.`);
  }

  return { vendorId, sheetsOnRecord: mine.length, activeSheets: active.length, blockers };
}
