/**
 * Rate reference — the hotel layer's READ-ONLY boundary onto rate resolution.
 *
 * ⚠️ THIS IS NOT A RATE RESOLVER, AND MUST NEVER BECOME ONE.
 *
 * There are already two owners of money in this platform and neither is M8:
 *
 *   M4  owns contracted supplier rates — sheets, seasons, validity, currency,
 *       provenance and the validation that decides whether a number is
 *       trustworthy. Frozen and approved.
 *   M7  owns resolution and customer-facing pricing — `resolveRate` asks M4's
 *       own functions the questions a pricing engine needs, and refuses rather
 *       than guessing. Frozen and approved.
 *
 * M8 owns SUPPLY FACTS: which property, which room type, which supplier. Its
 * only job here is to turn a hotel and a requirement into the query M7 already
 * accepts, hand it over, and report readiness. A third implementation of season
 * maths or expiry rules would be a defect — it would eventually disagree with
 * M4 about a boundary day, and a rate that two modules describe differently is
 * worse than no rate at all.
 *
 * ⚠️ NO AMOUNT CROSSES THIS BOUNDARY.
 * `resolveRate` returns a supplier's net cost. Supplier net rates are
 * founder-only commercial data, and hotel allocation has no use for the number
 * — only for whether a valid contracted rate EXISTS and where it came from. So
 * this module keeps the provenance and discards the money, at the data layer,
 * by never copying the key. Nothing downstream can leak what it never received.
 *
 * A hotel confirmation is also not a pricing event: the customer's price was
 * fixed by M7 at booking and a supplier confirming at the contracted rate
 * changes nothing for them. Nothing here re-prices anything.
 */
import type { HotelRecord, RoomTypeRecord } from "@/lib/hotels/model";
import type { SupplyRequirement } from "@/lib/hotels/supply";
import type { RateProvenance } from "@/lib/pricing/model";
import {
  describeResolvability,
  resolveRate,
  type RateFailureCode,
  type RateQuery,
} from "@/lib/pricing/rate-resolver";
import type { RateSheet } from "@/lib/rates/model";

/* ------------------------------------------------------------------ *
 * Building the query
 * ------------------------------------------------------------------ */

export const RATE_QUERY_FAILURE_CODES = [
  "hotel_not_linked_to_supplier",
  "no_room_type",
  "no_travel_date",
  "invalid_travel_date",
] as const;
export type RateQueryFailureCode = (typeof RATE_QUERY_FAILURE_CODES)[number];

export type RateQueryBuild =
  | { ok: true; query: RateQuery }
  | { ok: false; code: RateQueryFailureCode; reason: string };

/**
 * Turn a property plus a requirement into M7's `RateQuery`.
 *
 * The room type is the supplier's own wording, carried through untouched, for
 * the same reason M4 keeps `roomType` free text: normalising it here would
 * silently rewrite what the supplier sent and stop the line matching.
 *
 * The date used is the FIRST NIGHT of the stay. A rate is resolved per travel
 * date, and a stay crossing a season boundary genuinely has more than one rate
 * — resolving that properly is per-night pricing, which is M7's job, not a
 * problem for the hotel layer to approximate.
 */
export function buildRateQuery(
  hotel: HotelRecord,
  // `guestCount` is deliberately NOT picked: a party count must not be able to
  // reach a rate query, and the narrowest way to guarantee that is to make it
  // unreachable from this signature rather than to rely on nobody reading it.
  requirement: Pick<SupplyRequirement, "dateFrom" | "roomType" | "mealPlan">,
  roomType?: RoomTypeRecord,
): RateQueryBuild {
  if (!hotel.vendorId) {
    return {
      ok: false,
      code: "hotel_not_linked_to_supplier",
      reason:
        "This property has no supplier relation, so there is no rate sheet to look under. An orphan property cannot be rated, asked or allocated.",
    };
  }

  const roomTypeName = requirement.roomType ?? roomType?.name;
  if (!roomTypeName || roomTypeName.trim() === "") {
    return {
      ok: false,
      code: "no_room_type",
      reason:
        "No room type was supplied by the requirement or the property, and rates are quoted per room type.",
    };
  }

  if (!requirement.dateFrom) {
    return {
      ok: false,
      code: "no_travel_date",
      reason: "The requirement carries no travel date, and a rate is only valid for a date.",
    };
  }

  const date = new Date(`${requirement.dateFrom}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      code: "invalid_travel_date",
      reason: `"${requirement.dateFrom}" is not a usable calendar date.`,
    };
  }

  const mealPlan = requirement.mealPlan ?? roomType?.mealPlan;

  // ⚠️ RATED OCCUPANCY COMES FROM THE ROOM, NEVER FROM THE PARTY.
  //
  // This previously fell back through `requirement.guestCount` first, which
  // merged three different quantities into one number: a party count ("guests
  // or passengers"), a room fact ("people the room sleeps") and a rate
  // dimension ("people the price covers"). They coincide only when the party
  // exactly fills the room, so the error stayed invisible for the common case
  // and produced a refusal for a solo traveller in a double — 1 !== 2 — rather
  // than the double's rate.
  //
  // Deriving a rated occupancy from a guest count needs a ROOM PLAN, which does
  // not exist in any milestone yet. So this reads the only legitimate source
  // available today and, when the caller supplied no room type record, leaves
  // it undefined — which resolves to M7's existing refusal path rather than an
  // invented number.
  const ratedOccupancy = roomType?.occupancy;

  // ⚠️ THE PROPERTY IS ALWAYS NAMED, AND IT IS NOT AN OPTIONAL DIMENSION.
  //
  // M7 treats an omitted `propertyId` as "the caller has nothing to choose
  // between", and only refuses when two or more property scopes cover the
  // travel date. A supplier who sells ONE property therefore answered a
  // question about Hotel X with Hotel Y's sheet — `ok: true`, full confidence,
  // and provenance that named no property, so nothing downstream could detect
  // it. This function has always held the hotel; it simply never passed it.
  //
  // Naming it also settles the legacy case by construction rather than by a new
  // gate: `resolveRate` matches on `s.propertyId === query.propertyId`, so a
  // sheet with no resolved property no longer stands in for a named one and
  // refuses with `no_sheet_for_property`. That is the intended direction — a
  // sheet nobody scoped cannot prove which hotel it prices.
  return {
    ok: true,
    query: {
      vendorId: hotel.vendorId,
      propertyId: hotel.id,
      date,
      roomType: roomTypeName,
      ...(mealPlan !== undefined ? { mealPlan } : {}),
      ...(ratedOccupancy !== undefined ? { ratedOccupancy } : {}),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Referencing a rate — provenance only, never an amount
 * ------------------------------------------------------------------ */

/**
 * The answer the hotel layer is allowed to have: whether a valid contracted
 * rate exists for this property and requirement, and where it came from.
 *
 * ⚠️ THERE IS NO AMOUNT KEY ON THIS TYPE, AND THERE MUST NEVER BE ONE. The
 * absence is the control. `RateProvenance` carries identifiers and validity
 * dates only — sheet, line, season, window — and no money, so it can safely
 * travel with an allocation into an audit record.
 */
export type RateReference =
  | {
      ok: true;
      /** Where the rate came from. Identifiers and dates only — no money. */
      provenance: RateProvenance;
      /** Days until the underlying sheet expires. Negative means already past. */
      daysUntilExpiry: number | null;
      /** Always true — stated so a consumer can assert it rather than trust it. */
      amountWithheld: true;
    }
  | {
      ok: false;
      code: RateFailureCode | RateQueryFailureCode;
      reason: string;
    };

/**
 * Ask M7 whether a contracted rate covers this property and requirement.
 *
 * Delegates entirely: `resolveRate` runs M4's validation, lapse detection,
 * season-overlap detection and line matching. This function adds no gate of its
 * own — adding one would be the second resolver this module exists to prevent —
 * and then DISCARDS `unitCost`, `line` and `sheet` from the result, keeping
 * only provenance.
 */
export function referenceRate(
  sheets: RateSheet[],
  hotel: HotelRecord,
  // `guestCount` is deliberately NOT picked: a party count must not be able to
  // reach a rate query, and the narrowest way to guarantee that is to make it
  // unreachable from this signature rather than to rely on nobody reading it.
  requirement: Pick<SupplyRequirement, "dateFrom" | "roomType" | "mealPlan">,
  options: { roomType?: RoomTypeRecord; now?: Date } = {},
): RateReference {
  const build = buildRateQuery(hotel, requirement, options.roomType);
  if (!build.ok) return { ok: false, code: build.code, reason: build.reason };

  const resolution = resolveRate(sheets, build.query, options.now ?? new Date());
  if (!resolution.ok) {
    return { ok: false, code: resolution.code, reason: resolution.error };
  }

  return {
    ok: true,
    provenance: resolution.provenance,
    daysUntilExpiry: resolution.daysUntilExpiry,
    amountWithheld: true,
  };
}

/**
 * ⚠️ NO RATE-OUTCOME CLASSIFIER LIVES HERE, DELIBERATELY.
 *
 * Deciding RATE_MATCH versus RATE_DEVIATION requires a rate the supplier has
 * actually stated, and no supplier response exists to compare against — those
 * records arrive with a later milestone. A classifier written now could only
 * assume RATE_MATCH, and a silent assumption there is exactly how a supplier
 * quietly re-prices a booking. The vocabulary is declared in `supply.ts`; the
 * comparison is written when there is something to compare.
 */

/* ------------------------------------------------------------------ *
 * Readiness reporting
 * ------------------------------------------------------------------ */

export type HotelRateReadiness = {
  hotelId: string;
  /** Absent when the property has no supplier — the first blocker. */
  vendorId: string | null;
  sheetsOnRecord: number;
  activeSheets: number;
  /** Why nothing is rateable yet, in plain language. Carries no amounts. */
  blockers: string[];
};

/**
 * Explain a property's pricing readiness WITHOUT attempting a resolution.
 *
 * Delegates to M7's `describeResolvability`, which reports blockers and no
 * amounts — safe on any staff surface. The hotel layer only adds the one
 * blocker M7 cannot see, because it is a hotel fact rather than a rate fact:
 * a property with no supplier behind it.
 */
export function describeHotelRateReadiness(
  sheets: RateSheet[],
  hotel: HotelRecord,
  now: Date = new Date(),
): HotelRateReadiness {
  if (!hotel.vendorId) {
    return {
      hotelId: hotel.id,
      vendorId: null,
      sheetsOnRecord: 0,
      activeSheets: 0,
      blockers: ["Property has no supplier relation, so no rate sheet can apply to it."],
    };
  }

  // Narrowed to THIS property. Without the fourth argument a consolidator
  // reported every property it sells against one hotel — accurate about the
  // supplier, and wrong about the property the caller asked about.
  const report = describeResolvability(sheets, hotel.vendorId, now, hotel.id);

  // ⚠️ ONE SIGNAL SURVIVES THE NARROWING ONLY IF IT IS ASKED FOR SEPARATELY.
  //
  // An UNRESOLVED sheet — one where the supplier named a property nobody has
  // matched to a BPT property yet — carries no `propertyId`, so narrowing to
  // this hotel excludes it by construction and the narrowed report can never
  // count it. That would leave an operator reading "no rate sheet scoped to
  // this property" while an unmatched sheet for that very hotel sat one desk
  // away, and the actionable blocker ("go match it") would be invisible.
  //
  // So the unresolved count is taken across the SUPPLIER, deliberately un-
  // narrowed. It is reported as what it is: sheets that cannot yet be attached
  // to any property, this one included or not.
  const unresolved = sheets.filter(
    (s) => s.vendorId === hotel.vendorId && !s.propertyId && s.vendorPropertyRef,
  ).length;

  const blockers = [...report.blockers];
  if (unresolved > 0) {
    blockers.push(
      `${unresolved} sheet(s) from this supplier name a property that has not been matched to a BPT property yet — one of them may be this one.`,
    );
  }

  return {
    hotelId: hotel.id,
    vendorId: hotel.vendorId,
    sheetsOnRecord: report.sheetsOnRecord,
    activeSheets: report.activeSheets,
    blockers,
  };
}

/** Fleet-wide readiness. Counts only — no property is named, no amount appears. */
export function summariseRateReadiness(
  sheets: RateSheet[],
  hotels: HotelRecord[],
  now: Date = new Date(),
): { hotels: number; withoutSupplier: number; withActiveSheet: number; blocked: number } {
  const reports = hotels.map((h) => describeHotelRateReadiness(sheets, h, now));
  return {
    hotels: hotels.length,
    withoutSupplier: reports.filter((r) => r.vendorId === null).length,
    withActiveSheet: reports.filter((r) => r.activeSheets > 0).length,
    blocked: reports.filter((r) => r.blockers.length > 0).length,
  };
}
