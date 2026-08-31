/**
 * Rate resolution — a READ-ONLY adapter over M4. Pure, no I/O.
 *
 * M4 (frozen, approved) owns rate sheets: their model, season maths, validation
 * and expiry rules. This module does not re-implement any of it. It asks M4's
 * own functions the questions a pricing engine needs answered:
 *
 *   "for this vendor, on this travel date, for this room type / meal plan /
 *    rated occupancy — what does the supplier charge, and can I trust that
 *    number?"
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
import {
  rateLineOffering,
  rateLineScope,
  type RateLine,
  type RateLineScope,
  type RateSeason,
  type RateSheet,
} from "@/lib/rates/model";
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
  /**
   * Which property to price. A SELECTION CONSTRAINT, and an opaque id — no
   * hotel object crosses this boundary.
   *
   * Unlike every other optional dimension here, omitting this does NOT widen
   * the match. One supplier can sell fifty properties, and picking among them
   * by array order would return a confident price for the wrong hotel — so an
   * omitted property is allowed only when the vendor has exactly one property
   * scope on record, and refuses otherwise. See `resolveRate`.
   */
  propertyId?: string;
  /** The travel date the rate must be valid for. */
  date: Date;
  /**
   * Which kind of rate is being asked for. Absent means `room`, which is what
   * every caller written before person rates existed intends.
   *
   * It is not optional-as-in-widening: a room query must not match person rows,
   * and a person query must not match the room row. Defaulting rather than
   * matching-all is what preserves the existing behaviour exactly.
   */
  scope?: RateLineScope;
  roomType: string;
  mealPlan?: string;
  /**
   * What the rate must COVER — a property of the room being priced, not a count
   * of the party. Never populate this from a guest count.
   */
  ratedOccupancy?: number;
  /**
   * PERSON SCOPE ONLY. Which band on the supplier's sheet is being asked for.
   *
   * Required for a person query, because it is that scope's whole identity —
   * asking for "a child rate" without saying which band is asking for two rates
   * at once. Raw age is deliberately NOT accepted here: mapping an age to a
   * band needs band bounds a supplier may never have stated, and guessing it
   * would put a BPT age rule inside a supplier lookup.
   */
  ageBandRef?: string;
};

export type RateFailureCode =
  | "no_sheet_for_vendor"
  | "no_sheet_for_property"
  | "property_required"
  | "ambiguous_sheet_match"
  | "age_band_required"
  | "rate_unit_unknown"
  | "not_offered"
  | "on_request"
  | "complimentary_unpriced"
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
  const wanted = query.scope ?? "room";
  return sheet.lines.filter((line) => {
    // Scope first, and unconditionally. A room query reaching a person row (or
    // the reverse) is not a near-miss to be narrowed later — it is a different
    // kind of price, and letting the two share a candidate set is how a room
    // rate ends up answering a question about a child.
    if (rateLineScope(line) !== wanted) return false;
    if (norm(line.roomType) !== norm(query.roomType)) return false;
    if (query.mealPlan !== undefined && norm(line.mealPlan) !== norm(query.mealPlan)) return false;
    if (query.ratedOccupancy !== undefined && line.ratedOccupancy !== query.ratedOccupancy) return false;
    if (query.ageBandRef !== undefined && line.ageBandRef !== query.ageBandRef) return false;
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
 *   0. the QUERY is answerable — a person rate names its age band
 *   1. a sheet exists for the vendor
 *   2. a sheet is scoped to the requested PROPERTY
 *   3. it is ACTIVE (draft, expired and superseded sheets never price a trip)
 *   4. the TRAVEL date sits inside its validity window
 *   5. exactly one PROPERTY is in play — an omitted property may not pick one
 *   6. exactly one SHEET wins — same-day validity starts are a conflict, not a race
 *   7. the sheet declares what one amount COVERS — an undeclared unit refuses
 *   8. it passes M4's own validation (delegated, never re-implemented)
 *   9. it has not lapsed as of `now`
 *  10. the travel date is not covered by overlapping seasons
 *  11. exactly one line matches the requested dimensions
 *  12. the supplier actually PRICED that line, rather than declining it
 *  13. that line has an amount, and the sheet has a currency
 *
 * Gates 5 and 6 are the sheet-level counterpart of gate 11. Before property
 * scope existed, one vendor meant one sheet and sheet ambiguity could not
 * arise; with a consolidator selling fifty properties it can, so it refuses
 * here for the same reason an ambiguous line refuses there.
 */
export function resolveRate(
  sheets: RateSheet[],
  query: RateQuery,
  now: Date = new Date(),
): RateResolution {
  // A person rate IS its age band. Asking for one without naming a band is
  // asking for every person rate on that room and season at once, so it is
  // refused here rather than allowed to surface later as an ambiguous match —
  // the cause is the question, not the data.
  if ((query.scope ?? "room") === "person" && !query.ageBandRef?.trim()) {
    return refuse(
      "age_band_required",
      "A person rate must name the supplier's age band. Without one there is no way to say which person rate is wanted.",
    );
  }

  const vendorSheets = sheets.filter((s) => s.vendorId === query.vendorId);
  if (vendorSheets.length === 0) {
    return refuse("no_sheet_for_vendor", "No rate sheet is on record for this supplier.");
  }

  // PROPERTY comes before validity, and that order is load-bearing. One
  // supplier can sell fifty properties; narrowing by validity first and then
  // picking the newest would compare sheets for DIFFERENT hotels against each
  // other and silently return the wrong one.
  const propertyScoped =
    query.propertyId === undefined
      ? vendorSheets
      : vendorSheets.filter((s) => s.propertyId === query.propertyId);

  if (propertyScoped.length === 0) {
    return refuse(
      "no_sheet_for_property",
      "The supplier has rate sheets, but none is scoped to this property. A sheet with no resolved property cannot stand in for one.",
    );
  }

  const active = propertyScoped.filter((s) => s.status === "active");
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

  // An omitted property is safe only when there is nothing to choose between.
  // With more than one property scope still in play, "undefined matches all"
  // would mean "pick one" — the one convention this dimension must not follow.
  if (query.propertyId === undefined) {
    const scopes = new Set(covering.map((s) => s.propertyId ?? ""));
    if (scopes.size > 1) {
      return refuse(
        "property_required",
        `The travel date is covered by sheets for ${scopes.size} different properties. Naming the property is required — choosing one here would price a hotel nobody asked for.`,
      );
    }
  }

  // Newest validity wins when several cover the date — a renewal supersedes the
  // sheet it replaces, and nothing is deleted. That is only a renewal when the
  // windows actually differ; two sheets starting on the same day for the same
  // property are a data conflict, and ordering must not decide a price.
  const ranked = [...covering].sort((a, b) => (b.validFrom ?? "").localeCompare(a.validFrom ?? ""));
  if (ranked.length > 1 && (ranked[0].validFrom ?? "") === (ranked[1].validFrom ?? "")) {
    return refuse(
      "ambiguous_sheet_match",
      `${ranked.length} active sheets cover this property and travel date with the same validity start — the price would depend on ordering.`,
    );
  }
  const sheet = ranked[0];

  // RATE UNIT, checked BEFORE the validation gate below. Validation also reports
  // this, but gate 7 collapses every validation error into one `sheet_invalid`
  // code — and "nobody declared what this number means" is the one cause a
  // caller must be able to read precisely, because the fix is a human decision
  // rather than a data repair.
  if (!sheet.rateUnit) {
    return refuse(
      "rate_unit_unknown",
      "The sheet does not say what one amount covers, so it cannot be priced. A rate with no declared unit cannot be multiplied by nights.",
    );
  }

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
      "No rate line matches the requested room type, meal plan and rated occupancy for that date.",
    );
  }
  if (candidates.length > 1) {
    return refuse(
      "ambiguous_line_match",
      `${candidates.length} rate lines match the same request — the price would depend on ordering.`,
    );
  }

  const line = candidates[0];

  // The supplier answered this combination, but not with a price. Each state
  // refuses with its own reason: "they told us no" and "we never asked" are
  // different answers to a customer, and only one of them is worth a phone call.
  const offering = rateLineOffering(line);
  if (offering === "NOT_OFFERED") {
    return refuse("not_offered", "The supplier does not offer this combination.");
  }
  if (offering === "ON_REQUEST") {
    return refuse(
      "on_request",
      "The supplier quotes this on request — there is no standing price to use.",
    );
  }
  if (offering === "COMPLIMENTARY") {
    return refuse(
      "complimentary_unpriced",
      "The supplier provides this at no charge. That is a concession, not a price of zero, so it carries no amount to quote.",
    );
  }

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
      ...(query.ratedOccupancy !== undefined ? { ratedOccupancy: query.ratedOccupancy } : {}),
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
  /** The property this report was narrowed to, when one was asked for. */
  propertyId?: string;
  sheetsOnRecord: number;
  activeSheets: number;
  /** Distinct resolved property scopes among the reported sheets. */
  propertyScopes: number;
  /** Sheets the supplier named a property for that nobody has matched yet. */
  unresolvedProperties: number;
  /**
   * True when a property-less query could not be answered — more than one
   * property scope is in play and naming one is required.
   */
  propertyRequired: boolean;
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
  /**
   * Narrow to one property. Without it a consolidator reports every property
   * it sells at once, which is accurate but not actionable for one booking.
   */
  propertyId?: string,
): ResolvabilityReport {
  const forVendor = sheets.filter((s) => s.vendorId === vendorId);
  const mine =
    propertyId === undefined ? forVendor : forVendor.filter((s) => s.propertyId === propertyId);
  const active = mine.filter((s) => s.status === "active");
  const blockers: string[] = [];

  const scopes = new Set(mine.filter((s) => s.propertyId).map((s) => s.propertyId as string));
  const unresolved = mine.filter((s) => !s.propertyId && s.vendorPropertyRef).length;
  // Only meaningful for an un-narrowed report: with a property named, the
  // caller has already answered the question this flag asks.
  const propertyRequired = propertyId === undefined && scopes.size > 1;

  if (mine.length === 0) {
    blockers.push(
      propertyId === undefined ? "No rate sheet on record." : "No rate sheet scoped to this property.",
    );
  } else if (active.length === 0) blockers.push("No active rate sheet.");

  if (propertyRequired) {
    blockers.push(
      `${scopes.size} properties are on record for this supplier — a quote must name which one.`,
    );
  }
  if (unresolved > 0) {
    blockers.push(
      `${unresolved} sheet(s) name a supplier property that has not been matched to a BPT property yet.`,
    );
  }

  for (const sheet of active) {
    if (!validateRateSheet(sheet, now).ok) blockers.push(`Sheet ${sheet.id} has validation errors.`);
    if (isRateSheetLapsed(sheet, now)) blockers.push(`Sheet ${sheet.id} has lapsed.`);
    if (findSeasonOverlaps(sheet.seasons).length > 0) blockers.push(`Sheet ${sheet.id} has overlapping seasons.`);
    if (!sheet.currency) blockers.push(`Sheet ${sheet.id} has no currency.`);
  }

  return {
    vendorId,
    ...(propertyId !== undefined ? { propertyId } : {}),
    sheetsOnRecord: mine.length,
    activeSheets: active.length,
    propertyScopes: scopes.size,
    unresolvedProperties: unresolved,
    propertyRequired,
    blockers,
  };
}
