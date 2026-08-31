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
 * Age bands
 * ------------------------------------------------------------------ */

/**
 * A band the SUPPLIER prices a person under, declared on their own sheet.
 *
 * ⚠️ THIS IS NOT `party/model.ts` `AgeBand`, AND MUST NOT BE MERGED WITH IT.
 * That one maps an age to a `GuestType` — a fact about a traveller, held in a
 * global registry. This one identifies a priced ROW, and lives on the sheet
 * that declared it. Reusing the party type would drag `guestType` into the
 * supply-side price book and impose one global band set on every supplier.
 *
 * WHY IT IS SHEET-LOCAL, exactly like `RateSeason`
 * Real evidence: one consolidator's sheet carries "Child Between 06 years to
 * 12 years" for some properties and "Child Between 08 years to 12 years" for
 * others. Bands differ per property inside a single supplier, so no vendor-wide
 * or platform-wide registry can hold them. A line references a band by id and
 * validation refuses an id the sheet never declared — the same mechanism, and
 * the same refusal, as `seasonId` and `season_unknown`.
 *
 * `label` is the vendor's own wording, carried through untouched. The bounds
 * are OPTIONAL because a supplier may name a band without stating its ages, and
 * requiring them would force us to invent the numbers. `maxAgeInclusive` is
 * inclusive for the same reason M4 keeps season dates inclusive: it is how
 * suppliers write it, and an exclusive bound shifts every boundary by a year.
 *
 * ⚠️ NO BAND VALUES ARE DEFINED ANYWHERE IN THIS MODULE. Where a child stops
 * being an infant is supplier and founder data — see `MARKUP_RULES`,
 * `AGE_BANDS` and `CATEGORY_SUBSTITUTIONS` for the same deliberate emptiness.
 */
export type RateAgeBand = {
  id: string;
  /** The vendor's own wording, e.g. as printed in their column header. */
  label: string;
  minAgeInclusive?: number;
  maxAgeInclusive?: number;
};

/* ------------------------------------------------------------------ *
 * Rate lines
 * ------------------------------------------------------------------ */

/**
 * What a rate line prices.
 *
 * `room` — the room itself, at a stated occupancy. The original and default.
 * `person` — one additional person, identified by the supplier's age band.
 *
 * These COMPOSE rather than compete: a real sheet prices a double room AND a
 * child in that room, and a booking of two adults plus a child resolves to both
 * lines. Composition happens above M4; the resolver still answers exactly one
 * question at a time.
 */
export const RATE_LINE_SCOPES = ["room", "person"] as const;
export type RateLineScope = (typeof RATE_LINE_SCOPES)[number];

/** A line's scope, with the backward-compatible default applied once, here. */
export function rateLineScope(line: Pick<RateLine, "scope">): RateLineScope {
  return line.scope ?? "room";
}

/**
 * What the SUPPLIER said about this row, when they said something other than a
 * price.
 *
 * Real sheets answer a combination in more than one way: a number, "N/A", a
 * dash, "ON REQUEST", or "complimentary". Those are four different commercial
 * facts and only one of them is a price. Before this existed they all collapsed
 * into "no amount", which is also what "nobody has captured this yet" looks
 * like — so a supplier who answered clearly was indistinguishable from silence,
 * and recording their answer honestly made the whole sheet unactivatable.
 *
 * ⚠️ NONE OF THESE IS A NUMBER. `ON_REQUEST` is not zero, `COMPLIMENTARY` is not
 * zero, and `NOT_OFFERED` is not zero. A real captured 0 stays a real price of
 * zero and is `PRICED`. Sentinel amounts are forbidden — see `money.ts`, where a
 * money value carries no room for a special meaning.
 */
export const RATE_OFFERINGS = ["PRICED", "NOT_OFFERED", "ON_REQUEST", "COMPLIMENTARY"] as const;
export type RateOffering = (typeof RATE_OFFERINGS)[number];

export const RATE_OFFERING_DESCRIPTIONS: Record<RateOffering, string> = {
  PRICED: "The supplier gave a price for this combination.",
  NOT_OFFERED: "The supplier said they do not offer this combination.",
  ON_REQUEST: "The supplier will quote on request — no standing price exists.",
  COMPLIMENTARY: "The supplier provides this at no charge as a concession, not at a price of zero.",
};

/**
 * A line's offering state, with the one backward-compatible inference applied
 * once, here — the same shape as `rateLineScope`.
 *
 * Returns `undefined` for UNKNOWN. That is deliberate: absence of an answer is
 * NOT a fifth state to be stored, it is the absence of capture, and giving it an
 * enum member would let it be written down as though someone had established it.
 *
 * An amount with no declared offering reads as `PRICED` because a number IS the
 * evidence of a price — that is reading what was captured, not inventing it.
 * Nothing else is inferred: no amount and no declaration stays UNKNOWN.
 */
export function rateLineOffering(
  line: Pick<RateLine, "offering" | "amount">,
): RateOffering | undefined {
  if (line.offering) return line.offering;
  return line.amount !== undefined ? "PRICED" : undefined;
}

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

  /**
   * What this row prices. Absent means `room` — every line written before this
   * field existed is a room line, and saying so by default keeps them valid.
   *
   * It is not merely a label. A room line whose occupancy could not be read and
   * a person line whose band is missing are otherwise the SAME key, and without
   * a declared scope neither the collision nor the malformed line is detectable.
   */
  scope?: RateLineScope;

  roomType: string;
  mealPlan?: string;
  /**
   * People the price covers — a property of the ROOM being priced, never of the
   * party staying in it. See `SupplyRequirement.guestCount` for the party count.
   */
  ratedOccupancy?: number;
  /**
   * PERSON SCOPE ONLY. Which band on THIS sheet the person falls under.
   *
   * Required on a person line and forbidden on a room line — both are checked,
   * because a stray band on a room line is a silent capture error and a missing
   * band on a person line makes the row unidentifiable.
   */
  ageBandRef?: string;

  /** Which season window this row prices; absent = applies to the whole sheet. */
  seasonId?: string;

  /**
   * What the supplier said, when it was not a price. Absent means UNKNOWN, or
   * `PRICED` when an amount is present — see `rateLineOffering`.
   *
   * This is a STATE, never an identity: two rows differing only by offering are
   * still the same row priced twice, and `duplicate_lines` must still catch them.
   */
  offering?: RateOffering;

  /** COMMERCIALLY SENSITIVE — founder-only. Absent until captured. */
  amount?: number;
  /** Free-text conditions as written by the vendor (min nights, blackout…). */
  conditions?: string;
};

/* ------------------------------------------------------------------ *
 * Rate sheets
 * ------------------------------------------------------------------ */

/**
 * What ONE unit of a rate amount buys, on the time axis.
 *
 * ⚠️ THIS IS NOT `RateLineScope` AND MUST NOT DUPLICATE IT. Scope says whether a
 * row prices a ROOM or a PERSON; this says what one unit of it covers. The
 * supplier's basis is COMPOSED from the two — `scope × rateUnit` — so BPT's
 * normal convention, "per room per night", is `scope: "room"` with
 * `rateUnit: "night"`, and a child rate is `scope: "person"` with the same unit.
 * A single combined field would allow `scope: "room"` beside a basis saying
 * "per person", two fields contradicting each other with no rule to settle it.
 *
 * WHY THE SHEET AND NOT THE LINE: suppliers state this once, in a header, for
 * the whole sheet — exactly like `currency`, which this mirrors in every
 * respect: one declaration per sheet, required before anything can be priced,
 * and absent is a refusal (`rate_unit_unknown`), never a default. Copying the
 * same declaration onto every row would let rows silently disagree.
 *
 * ⚠️ ONE MEMBER ON PURPOSE. `night` is the only unit the business has confirmed
 * and the only one the pricing arithmetic can act on today. Values such as
 * `stay`, `meal`, `seat` or `unit` are NOT listed: no supplier document on
 * record declares them, nothing consumes them, and adding them now would invent
 * supplier vocabulary. Extending this list later is purely additive.
 *
 * ABSENT MEANS UNKNOWN, never "night". An unread sheet and a per-night sheet
 * must not look the same, because the difference is a wrong invoice.
 */
export const RATE_UNITS = ["night"] as const;
export type RateUnit = (typeof RATE_UNITS)[number];

export const RATE_UNIT_DESCRIPTIONS: Record<RateUnit, string> = {
  night: "One amount covers one night of the scope priced (a room, or a person).",
};

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
  // Supplier AND property: with property-scoped sheets, a renewal for one
  // property leaves every other property's sheet untouched.
  superseded: "Replaced by a newer sheet from the same supplier and property.",
};

export type RateSheet = {
  id: string;
  vendorId: string;
  /** Captured for the register; the vendor record stays canonical. */
  vendorName: string;

  /**
   * The property this sheet prices, once a human has resolved it.
   *
   * ⚠️ OPAQUE ON PURPOSE. This is a bare `hotels.id`, not a `HotelRecord`, and
   * it must stay that way: `lib/hotels` already imports `lib/rates`, so a typed
   * hotel reference here would close the loop into `rates → hotels → rates`.
   * The same reasoning is why `vendorId` is a string and this module does not
   * import `lib/vendor` — M8 stays the canonical property authority and M4
   * merely points at it.
   *
   * ABSENT means UNRESOLVED, never "applies to every property". A sheet whose
   * supplier named a property that nobody has matched yet cannot be activated;
   * see `activateRateSheet`.
   */
  propertyId?: string;

  /**
   * The supplier's own name or code for that property, exactly as received.
   *
   * Kept beside `propertyId` for the same reason `vendorName` sits beside
   * `vendorId`: the resolved id answers "which property", and this answers
   * "what did the supplier actually write". It is the evidence a later dispute
   * is settled against, the string a human is shown during matching, and what
   * next month's sheet is re-matched on when a supplier renames something.
   * Never overwritten by a resolution.
   */
  vendorPropertyRef?: string;
  /** Vendor's own reference for the sheet, if they gave one. */
  reference?: string;
  status: RateSheetStatus;
  /** ISO calendar dates the sheet is valid between. */
  validFrom?: string;
  validTo?: string;
  /** ISO 4217 code as quoted by the supplier — never defaulted. */
  currency?: string;

  /**
   * What one unit of every amount on this sheet buys. ABSENT MEANS UNKNOWN.
   *
   * Mirrors `currency` exactly, and for the same reason: a number whose unit
   * nobody declared cannot be multiplied. The pricing engine multiplies a unit
   * cost by a quantity of nights without being able to check what the unit was,
   * so an undeclared unit is a silent-miscalculation path, not a cosmetic gap.
   */
  rateUnit?: RateUnit;

  /**
   * The supplier's own wording for that basis, exactly as received — e.g. the
   * text of their header row.
   *
   * Stands beside `rateUnit` for the same reason `vendorPropertyRef` stands
   * beside `propertyId`: the resolved value is what the engine uses, and this is
   * the evidence it was resolved from. Never overwritten by a resolution, and
   * never parsed here — mapping wording to a unit is human calibration.
   */
  vendorRateUnitRef?: string;

  seasons: RateSeason[];
  /**
   * Age bands this supplier declared on this sheet. Empty is normal and valid —
   * a room-only sheet declares none, and that is a true statement about the
   * supplier rather than missing data. Never populated by BPT.
   */
  ageBands: RateAgeBand[];
  lines: RateLine[];

  /**
   * A human has READ the supplier's free-text `conditions` on this sheet.
   *
   * It asserts nothing about what those conditions say. It does not mean the
   * dates are clear, that no blackout applies, or that anything was parsed —
   * only that a person has looked. That is the entire claim, and it must not be
   * read as more.
   *
   * WHY IT EXISTS: `conditions` carries text like "not valid during festive
   * holidays", and nothing reads it. Without this gate a sheet carrying a
   * supplier's own exclusion activates and prices the excluded date at full
   * confidence. Interpreting the text into dates is calibration work and does
   * not belong in this module; refusing to activate an unread exclusion does.
   */
  conditionsReviewed?: boolean;

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
