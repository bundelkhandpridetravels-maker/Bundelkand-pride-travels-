/**
 * Rate sheet validation. Pure — no I/O, no storage, explicit `now`.
 *
 * These checks are about the INTEGRITY of what the supplier sent, never about
 * whether a price is "reasonable". The platform has no opinion on what a room
 * should cost; judging that is the operations team's job, and encoding a rule
 * here would be inventing commercial policy.
 */
import { rateLineScope, type RateSheet, type RateSheetStatus } from "@/lib/rates/model";
import { findSeasonOverlaps, findUncoveredDates, isValidWindow } from "@/lib/rates/seasons";

/** How far ahead an expiring rate sheet is flagged. Mirrors M3's contract
 *  window (60 days) so operations sees one consistent renewal horizon. */
export const RATE_EXPIRY_WARNING_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dayStart(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export type RateIssueSeverity = "error" | "warning";

export type RateIssue = {
  severity: RateIssueSeverity;
  /** Stable key so a surface can group or filter without parsing text. */
  code: string;
  message: string;
};

export type RateValidationResult = {
  ok: boolean;
  errors: RateIssue[];
  warnings: RateIssue[];
  /** 0–100 completeness across priceable rows. */
  completeness: number;
};

/**
 * Validate one sheet.
 *
 * ERRORS block a sheet from going active — they make pricing ambiguous or
 * impossible. WARNINGS are things an operator should look at but which do not
 * make the sheet unusable.
 */
export function validateRateSheet(sheet: RateSheet, now: Date = new Date()): RateValidationResult {
  const errors: RateIssue[] = [];
  const warnings: RateIssue[] = [];

  // ── Validity period ────────────────────────────────────────────────
  if (!sheet.validFrom || !sheet.validTo) {
    errors.push({
      severity: "error",
      code: "validity_missing",
      message: "Validity period is missing — the sheet cannot be expired or renewed without it.",
    });
  } else if (!isValidWindow(sheet.validFrom, sheet.validTo)) {
    errors.push({
      severity: "error",
      code: "validity_invalid",
      message: "Validity period ends before it starts.",
    });
  }

  // ── Currency ───────────────────────────────────────────────────────
  if (!sheet.currency) {
    errors.push({
      severity: "error",
      code: "currency_missing",
      message: "No currency recorded — an amount without a currency cannot be quoted.",
    });
  }

  // ── Lines ──────────────────────────────────────────────────────────
  if (sheet.lines.length === 0) {
    errors.push({
      severity: "error",
      code: "no_lines",
      message: "The sheet has no rate lines.",
    });
  }

  const missingAmount = sheet.lines.filter((l) => l.amount === undefined);
  if (missingAmount.length > 0) {
    errors.push({
      severity: "error",
      code: "amount_missing",
      message: `${missingAmount.length} rate line(s) have no amount.`,
    });
  }

  const negative = sheet.lines.filter((l) => typeof l.amount === "number" && l.amount < 0);
  if (negative.length > 0) {
    errors.push({
      severity: "error",
      code: "amount_negative",
      message: `${negative.length} rate line(s) have a negative amount.`,
    });
  }

  const missingRoomType = sheet.lines.filter((l) => !l.roomType?.trim());
  if (missingRoomType.length > 0) {
    errors.push({
      severity: "error",
      code: "room_type_missing",
      message: `${missingRoomType.length} rate line(s) have no room type.`,
    });
  }

  // ── Scope integrity ────────────────────────────────────────────────
  // A room line and a person line are different kinds of row and carry
  // different identity. Each is checked for the field the other one owns,
  // because a stray field is a capture error that would otherwise be silently
  // ignored — and a missing one makes the row unidentifiable.
  const strayBand = sheet.lines.filter(
    (l) => rateLineScope(l) === "room" && l.ageBandRef !== undefined,
  );
  if (strayBand.length > 0) {
    errors.push({
      severity: "error",
      code: "room_line_has_age_band",
      message: `${strayBand.length} room rate line(s) carry an age band. A room rate prices the room, not a person — the band belongs on a person line.`,
    });
  }

  const strayOccupancy = sheet.lines.filter(
    (l) => rateLineScope(l) === "person" && l.ratedOccupancy !== undefined,
  );
  if (strayOccupancy.length > 0) {
    errors.push({
      severity: "error",
      code: "person_line_has_occupancy",
      message: `${strayOccupancy.length} person rate line(s) carry a rated occupancy. A person rate covers one person; an occupancy here would be invented.`,
    });
  }

  const bandless = sheet.lines.filter(
    (l) => rateLineScope(l) === "person" && !l.ageBandRef?.trim(),
  );
  if (bandless.length > 0) {
    errors.push({
      severity: "error",
      code: "age_band_missing",
      message: `${bandless.length} person rate line(s) name no age band. Without one the row cannot be told apart from any other person rate on the same room and season.`,
    });
  }

  // Lines referencing a band the sheet never declared — the same refusal, for
  // the same reason, as `season_unknown` below.
  const bandIds = new Set(sheet.ageBands.map((b) => b.id));
  const orphanBands = sheet.lines.filter((l) => l.ageBandRef && !bandIds.has(l.ageBandRef));
  if (orphanBands.length > 0) {
    errors.push({
      severity: "error",
      code: "age_band_unknown",
      message: `${orphanBands.length} rate line(s) reference an age band not declared on this sheet.`,
    });
  }

  for (const band of sheet.ageBands) {
    const { minAgeInclusive: lo, maxAgeInclusive: hi } = band;
    if (lo !== undefined && hi !== undefined && hi < lo) {
      errors.push({
        severity: "error",
        code: "age_band_invalid",
        message: `Age band "${band.label}" ends before it starts.`,
      });
    }
  }

  // Duplicate rows: the same row priced twice is ambiguous — the engine would
  // have two answers for one query. The key is PER SCOPE, because a room line
  // and a person line identify themselves by different dimensions: a room by
  // its occupancy, a person by their age band.
  const seen = new Map<string, number>();
  for (const line of sheet.lines) {
    const scope = rateLineScope(line);
    const key = [
      scope,
      line.roomType?.trim().toLowerCase() ?? "",
      line.mealPlan?.trim().toLowerCase() ?? "",
      scope === "room" ? (line.ratedOccupancy ?? "") : (line.ageBandRef ?? ""),
      line.seasonId ?? "",
    ].join("|");
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const duplicates = [...seen.values()].filter((n) => n > 1).length;
  if (duplicates > 0) {
    errors.push({
      severity: "error",
      code: "duplicate_lines",
      message: `${duplicates} duplicate rate line group(s) — same scope, room, meal plan, season and (rated occupancy or age band) priced more than once.`,
    });
  }

  // ── Seasons ────────────────────────────────────────────────────────
  for (const season of sheet.seasons) {
    if (!isValidWindow(season.startDate, season.endDate)) {
      errors.push({
        severity: "error",
        code: "season_invalid",
        message: `Season "${season.label}" ends before it starts.`,
      });
    }
  }

  const overlaps = findSeasonOverlaps(sheet.seasons);
  if (overlaps.length > 0) {
    errors.push({
      severity: "error",
      code: "season_overlap",
      message: `${overlaps.length} overlapping season pair(s) — a date covered twice has two prices.`,
    });
  }

  // Lines referencing a season that isn't on the sheet.
  const seasonIds = new Set(sheet.seasons.map((s) => s.id));
  const orphanLines = sheet.lines.filter((l) => l.seasonId && !seasonIds.has(l.seasonId));
  if (orphanLines.length > 0) {
    errors.push({
      severity: "error",
      code: "season_unknown",
      message: `${orphanLines.length} rate line(s) reference a season not defined on this sheet.`,
    });
  }

  // ── Warnings ───────────────────────────────────────────────────────
  const gaps = findUncoveredDates(sheet);
  if (gaps.length > 0) {
    const days = gaps.reduce((n, g) => n + g.days, 0);
    warnings.push({
      severity: "warning",
      code: "season_gap",
      message: `${days} day(s) inside the validity period are not covered by any season.`,
    });
  }

  if (sheet.documentRefs.length === 0) {
    warnings.push({
      severity: "warning",
      code: "source_missing",
      message: "No original rate sheet document attached — the source cannot be audited.",
    });
  }

  if (!sheet.contractId) {
    warnings.push({
      severity: "warning",
      code: "contract_unlinked",
      message: "Not linked to a contract — validity is not tied to an agreement.",
    });
  }

  if (sheet.lines.some((l) => !l.mealPlan?.trim())) {
    warnings.push({
      severity: "warning",
      code: "meal_plan_missing",
      message: "Some rate lines have no meal plan recorded.",
    });
  }

  // ── Completeness ───────────────────────────────────────────────────
  const priced = sheet.lines.filter((l) => l.amount !== undefined).length;
  const completeness =
    sheet.lines.length === 0 ? 0 : Math.round((priced / sheet.lines.length) * 100);

  void now; // reserved: date-relative checks live in expiry helpers below
  return { ok: errors.length === 0, errors, warnings, completeness };
}

/* ------------------------------------------------------------------ *
 * Expiry
 * ------------------------------------------------------------------ */

/**
 * Takes only the fields it reads, so it works equally on a full RateSheet and
 * on a redacted RateSheetView. Narrowing the parameter avoids forcing callers
 * into a cast — a cast here would suppress exactly the kind of type error worth
 * hearing about.
 */
export function daysUntilRateExpiry(
  sheet: Pick<RateSheet, "validTo">,
  now: Date = new Date(),
): number | null {
  if (!sheet.validTo) return null;
  const end = dayStart(sheet.validTo);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (end === null) return null;
  return Math.round((end - today) / MS_PER_DAY);
}

/** Active and inside the warning window (inclusive of today). */
export function isRateSheetExpiringSoon(
  sheet: RateSheet,
  now: Date = new Date(),
  windowDays: number = RATE_EXPIRY_WARNING_DAYS,
): boolean {
  if (sheet.status !== "active") return false;
  const days = daysUntilRateExpiry(sheet, now);
  return days !== null && days >= 0 && days <= windowDays;
}

/**
 * Active, past its validity, still marked active — the case that quietly costs
 * money, because pricing would keep quoting from a sheet the supplier has
 * already withdrawn.
 */
export function isRateSheetLapsed(sheet: RateSheet, now: Date = new Date()): boolean {
  if (sheet.status !== "active") return false;
  const days = daysUntilRateExpiry(sheet, now);
  return days !== null && days < 0;
}

/* ------------------------------------------------------------------ *
 * Activation gate
 * ------------------------------------------------------------------ */

export type ActivationResult =
  | { ok: true; status: RateSheetStatus; humanApproval: true }
  | { ok: false; error: string };

/**
 * Approving a sheet for pricing use is a commercial decision — it determines
 * what customers are quoted — so it requires a human approver and a clean
 * validation pass (security-architecture §12, the same gate M2 and M3 apply).
 */
export function activateRateSheet(
  sheet: RateSheet,
  options: {
    approvedBy?: string;
    now?: Date;
    /**
     * Force the property gate on for a sheet that names no property at all.
     * Self-determining otherwise — see below.
     */
    requirePropertyScope?: boolean;
  } = {},
): ActivationResult {
  if (sheet.status === "active") return { ok: false, error: "Sheet is already active." };
  if (sheet.status === "superseded") {
    return { ok: false, error: "A superseded sheet cannot be reactivated." };
  }

  // PROPERTY GATE. A sheet that carries the supplier's own property reference
  // is, by that fact, about one specific property — and activating it before a
  // human has said WHICH property would put a price against a hotel nobody
  // confirmed. So the gate determines itself from the sheet: naming a property
  // without resolving it blocks. A sheet with no property claim at all is a
  // single-property supplier under the older assumption and is unaffected
  // unless the caller, which can see whether the vendor sells more than one,
  // asks for the gate explicitly.
  //
  // Matching is deliberately NOT attempted here: no name comparison, no alias,
  // no created property. Resolution is a human calibration step and M8 owns
  // creating a property.
  if (!sheet.propertyId && (sheet.vendorPropertyRef || options.requirePropertyScope)) {
    return {
      ok: false,
      error: sheet.vendorPropertyRef
        ? `The supplier's property "${sheet.vendorPropertyRef}" has not been matched to a BPT property. Resolve it before activating.`
        : "This sheet has no property scope. Resolve which property it prices before activating.",
    };
  }

  const approver = options.approvedBy?.trim();
  if (!approver) {
    return {
      ok: false,
      error: "Activating a rate sheet sets customer pricing and requires human approval.",
    };
  }

  const { ok, errors } = validateRateSheet(sheet, options.now ?? new Date());
  if (!ok) {
    return { ok: false, error: `Resolve ${errors.length} validation error(s) first.` };
  }

  return { ok: true, status: "active", humanApproval: true };
}
