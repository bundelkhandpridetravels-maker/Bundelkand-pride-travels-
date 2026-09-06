/**
 * DMC commercial offers — what a Destination Management Company priced for BPT.
 *
 * A DMC sells a finished thing: "Delhi–Manali–Delhi, 4N/5D, hotels + sightseeing
 * + transport, ₹9,000 per person on double sharing, valid to 31 March". Today
 * that arrives by email and WhatsApp and has nowhere to land.
 *
 * WHY THIS IS NOT M4
 * M4 is a property-scoped room price book: `RateLine.roomType` is REQUIRED and
 * `RATE_UNITS` has only `night`. A finished package has no room type and is not
 * priced per night, so representing it in M4 would mean inventing a room type
 * and misdeclaring the unit — a wrong invoice waiting to happen.
 *
 * ⚠️ WHAT THIS IS NOT, AND MUST NEVER BECOME
 *   - NOT a reusable rate card. A DMC handing BPT per-room-per-night rates IS a
 *     `RateSheet` under that DMC's `vendorId`; M4 already accepts a sheet from
 *     "a hotel, DMC or transport partner". That path stays in M4.
 *   - NOT a pricing engine. Nothing here multiplies, marks up or taxes. M7 owns
 *     customer pricing. The only arithmetic in this module is a comparison that
 *     emits a warning.
 *   - NOT hotel supply. A hotel named inside an offer is DISCLOSURE — the DMC
 *     holds it, not BPT. No availability, capacity, allocation or commitment.
 *   - NOT transport partner management. A transport component inside an offer
 *     is part of the DMC's commercial offer; M10 owns transport partners.
 *
 * WHAT THIS MODULE DOES NOT CONTAIN — deliberately:
 *   no prices, no sharing-tier vocabulary, no pax-band values, no payment terms,
 *   no cancellation policy, no markup. Every one of those is real commercial
 *   data supplied by a supplier or the founder. This is the shape they arrive
 *   in, never the values.
 *
 * Reuse, not redefinition:
 *   - the partner is a `dmcs` row and a `vendors` row (opaque ids here)
 *   - component kinds are M7's `COMPONENT_KINDS`
 *   - offering states are M4's `RATE_OFFERINGS`
 *   - the original PDF is a Document (M5) — `documentRefs`
 *   - the agreement is an M3 contract — `contractId`
 *
 * ⚠️ NOT PERSISTED. `DMC_OFFER_PERSISTENCE` is "none" — see the repository.
 *
 * Pure types and pure functions. No I/O.
 */
import type { DocumentActor, DocumentActorRole } from "@/lib/documents/permissions";
import { COMPONENT_KINDS, type ComponentKind } from "@/lib/pricing/model";
import { RATE_OFFERINGS, rateLineOffering, type RateOffering } from "@/lib/rates/model";

/* ------------------------------------------------------------------ *
 * Classification — the two axes
 * ------------------------------------------------------------------ */

/**
 * May this offer price a future trip, or was it one answer to one question?
 *
 * ⚠️ REQUIRED, WITH NO DEFAULT, AND THAT IS THE POINT. A default would make an
 * uncaptured quotation look reusable — the same failure M4 refuses when it
 * declines to read an absent `rateUnit` as "night". Absent is UNKNOWN, and
 * unknown reusability is the one thing that must never be guessed.
 *
 * `contracted` a negotiated standing offer. Usable for any matching trip inside
 *              its validity, once activated.
 * `quoted`     one answer to one request. Usable ONLY against the request it is
 *              bound to, and never promoted to reusable — a later authorisation
 *              to reuse a price is a NEW instrument with its own capture and
 *              activation, not a reclassification of this record.
 */
export const OFFER_BASES = ["contracted", "quoted"] as const;
export type OfferBasis = (typeof OFFER_BASES)[number];

export const OFFER_BASIS_LABELS: Record<OfferBasis, string> = {
  contracted: "Contracted",
  quoted: "Request-specific quotation",
};

export const OFFER_BASIS_DESCRIPTIONS: Record<OfferBasis, string> = {
  contracted:
    "A negotiated standing offer. Once activated it may price any matching trip inside its validity.",
  quoted:
    "One answer to one request. Usable only for that request, and never reusable for another.",
};

/**
 * Does this offer apply whenever, or only on the dates the operator states?
 *
 * A SECOND AXIS, not a second type. A fixed departure and a standard package are
 * both `contracted`; only one is date-bound. Folding recurrence into `basis`
 * would produce four fused values that cannot express a contracted ad-hoc offer.
 *
 * ⚠️ `recurrenceRef` IS THE OPERATOR'S OWN WORDING AND IS NEVER EXPANDED HERE.
 * Turning "every Friday" into dates is a recurrence engine, and a departure
 * calendar is capacity — which is M8-shaped supply semantics belonging to a
 * later Product & Departure milestone, not to a commercial offer.
 */
export const OFFER_RECURRENCES = ["adhoc", "recurring"] as const;
export type OfferRecurrence = (typeof OFFER_RECURRENCES)[number];

export const OFFER_RECURRENCE_LABELS: Record<OfferRecurrence, string> = {
  adhoc: "Any dates in validity",
  recurring: "Stated dates or cadence",
};

/* ------------------------------------------------------------------ *
 * Price unit
 * ------------------------------------------------------------------ */

/**
 * What ONE amount on this offer buys.
 *
 * ⚠️ TWO MEMBERS ON PURPOSE, both evidenced by how DMCs actually quote: a
 * per-person package rate ("₹9,000 pp double sharing") and a lump sum for the
 * whole group. `night` is deliberately ABSENT — a per-night price is a rate
 * sheet and belongs to M4, and listing it here would invite the one confusion
 * this module exists to prevent.
 *
 * ABSENT MEANS UNKNOWN, never "person". This mirrors M4's `rateUnit` exactly and
 * for the same reason: an amount whose unit nobody declared cannot be multiplied
 * by a head count, and an unread offer must not look like a per-person one.
 */
export const OFFER_PRICE_UNITS = ["person", "package"] as const;
export type OfferPriceUnit = (typeof OFFER_PRICE_UNITS)[number];

export const OFFER_PRICE_UNIT_DESCRIPTIONS: Record<OfferPriceUnit, string> = {
  person: "One amount covers one traveller for the whole package.",
  package: "One amount covers the whole package for the whole group.",
};

/* ------------------------------------------------------------------ *
 * Claimed coverage
 * ------------------------------------------------------------------ */

/**
 * What this OFFER says it operationally includes.
 *
 * MIRRORS `Dmcs.services` (src/payload/collections/Dmcs.ts), which is the source
 * of truth for the vocabulary. Mirrored rather than imported, exactly as
 * `VENDOR_TYPES` mirrors `Vendors.type` and `CONTRACT_TYPES` mirrors
 * `Contracts.contractType` — the values live inside a Payload field definition,
 * and importing a collection config into a pure domain module would drag the CMS
 * into code that must stay free of it.
 *
 * ⚠️ A CLAIM, NEVER AN ASSIGNMENT. It records what the offer says it covers. Who
 * is actually responsible for operating a given trip is a booking fact chosen by
 * a human at assignment, and it can change after this offer was written.
 *
 * Offer-level rather than partner-level because one DMC's Manali package and
 * their Ladakh package genuinely cover different things.
 */
export const OFFER_COVERAGE = [
  "hotels",
  "transport",
  "guides",
  "activities",
  "permits",
  "full",
] as const;
export type OfferCoverage = (typeof OFFER_COVERAGE)[number];

export const OFFER_COVERAGE_LABELS: Record<OfferCoverage, string> = {
  hotels: "Hotels",
  transport: "Transport",
  guides: "Guides",
  activities: "Activities",
  permits: "Permits",
  full: "Full package",
};

/* ------------------------------------------------------------------ *
 * Requested commercial terms
 * ------------------------------------------------------------------ */

/**
 * What the DMC ASKED FOR. Never what BPT agreed.
 *
 * ⚠️ THE MARKER IS STRUCTURAL, NOT DECORATIVE. M3's `ContractRecord` can hold one
 * amount and free-text notes and nothing else, so a supplier's requested terms
 * captured here would otherwise be the most structured version of payment or
 * cancellation terms anywhere in the platform — and the most structured version
 * is the one people read as policy. `TERM_STATUS` exists so a request can never
 * be mistaken for an agreement.
 *
 * The text is the supplier's own wording, carried through untouched and never
 * parsed. Turning "50% advance, balance 7 days before arrival" into a payment
 * schedule is contract work (M3) and, later, payment work — not this module's.
 */
export const TERM_STATUS = "REQUESTED_NOT_AGREED" as const;

export const OFFER_TERM_KINDS = [
  "payment",
  "cancellation",
  "amendment",
  "child_policy",
  "confirmation",
  "other",
] as const;
export type OfferTermKind = (typeof OFFER_TERM_KINDS)[number];

export type RequestedTerm = {
  id: string;
  kind: OfferTermKind;
  /** The supplier's own wording, exactly as received. Never parsed. */
  text: string;
  /** Always `REQUESTED_NOT_AGREED`. Present so no reader has to remember. */
  status: typeof TERM_STATUS;
};

/* ------------------------------------------------------------------ *
 * Pax bands
 * ------------------------------------------------------------------ */

/**
 * A group-size band the SUPPLIER prices under, declared on THIS offer.
 *
 * ⚠️ THIS IS NOT AN AGE BAND AND MUST NOT BE CONFUSED WITH ONE. M4's
 * `RateAgeBand` identifies a person by age; this identifies a whole party by
 * head count. A DMC quotes ₹X per head at 2 travellers and less at 20 — that is
 * a volume tier, not a child rate.
 *
 * ⚠️ OFFER-LOCAL, exactly like M4's `RateSeason` and `RateAgeBand`. Bands differ
 * per supplier and per package, so no platform-wide registry can hold them. A
 * price line references a band by id and validation refuses an id this offer
 * never declared — the same mechanism and the same refusal as `seasonId`.
 *
 * `label` is the supplier's own wording. The bounds are OPTIONAL because a
 * supplier may name a tier without stating its numbers, and requiring them would
 * force us to invent the figures. `maxPax` is inclusive because that is how
 * suppliers write it.
 *
 * ⚠️ NO BAND VALUES ARE DEFINED ANYWHERE IN THIS MODULE.
 */
export type OfferPaxBand = {
  id: string;
  label: string;
  minPax?: number;
  maxPax?: number;
};

/* ------------------------------------------------------------------ *
 * Price lines
 * ------------------------------------------------------------------ */

/**
 * One price the supplier quoted, for a stated group size and room sharing.
 *
 * TWO INDEPENDENT AXES. Four travellers in twin rooms and four in a quad are
 * different prices, so group size and sharing cannot be one field.
 *
 * `sharingTierLabel` is free text carrying the supplier's own wording, for the
 * same reason M4 keeps `roomType` and `mealPlan` free text: a platform enum
 * silently rewrites what the supplier sent.
 *
 * ⚠️ NO `roomType`, NO `rateUnit`, NO `ageBandRef` ON THIS TYPE, EVER. Each of
 * those is M4's, and adding one here would be the first step towards a second
 * rate-sheet system.
 *
 * `amount` is COMMERCIALLY SENSITIVE — founder-only, redacted at the data layer.
 * It is a plain number with the offer's `currency`, mirroring M4 rather than
 * `Money`: `Money` carries a CLOSED currency enum and minor units, and forcing a
 * supplier's quote through it at capture time would either reject a currency the
 * enum does not list or invent precision their document does not have.
 */
export type OfferPriceLine = {
  id: string;
  /** Which band on THIS offer. An undeclared id refuses — see validation. */
  paxBandRef: string;
  /** The supplier's own wording for the sharing arrangement. */
  sharingTierLabel: string;
  /**
   * What the supplier said when it was not a price. REUSES M4's vocabulary
   * rather than declaring a second one — "on request" means the same thing on a
   * DMC package as it does on a room rate.
   */
  offering?: RateOffering;
  /** COMMERCIALLY SENSITIVE — founder-only. Absent until captured. */
  amount?: number;
  /** Free-text conditions as written by the supplier. Never parsed. */
  conditions?: string;
};

/** A line's offering state, with M4's one inference applied — delegated, not copied. */
export function offerLineOffering(
  line: Pick<OfferPriceLine, "offering" | "amount">,
): RateOffering | undefined {
  return rateLineOffering(line);
}

/* ------------------------------------------------------------------ *
 * Components — the breakdown
 * ------------------------------------------------------------------ */

/**
 * One line of a DMC's breakdown: "hotel ₹X, transport ₹Y, sightseeing ₹Z".
 *
 * ⚠️ A DECOMPOSITION OF ONE OFFER, NEVER N REUSABLE RATES. This is the most
 * dangerous data in the module, because it LOOKS like a rate card — a hotel
 * named, rupees, itemised. Six months later nobody remembers it came from a
 * middleman.
 *
 * Extracting a component and reusing it does not merely lose provenance, it
 * produces a WRONG NUMBER: a per-head hotel share drawn from a 20-pax package
 * reflects that group size, those dates and a bundle discount that does not
 * apply to a couple.
 *
 * The protection is mechanical rather than a rule anyone must remember:
 * `resolveRate` reads `RateSheet[]` only, and nothing here is a `RateSheet`.
 *
 * `kind` REUSES M7's `COMPONENT_KINDS` so a future assembly layer can hand these
 * straight to `priceComponents` without a translation table.
 */
export type OfferComponent = {
  id: string;
  kind: ComponentKind;
  label: string;
  /**
   * WHO WILL ACTUALLY DELIVER THIS — the supplier's own reference, always.
   *
   * ⚠️ THE QUOTER IS NOT THE PERFORMER. The DMC quoted the whole offer; a hotel
   * performs the room, a transporter the vehicle. Recording both is what stops
   * an intermediary's price being read later as the performer's own rate, and
   * it is why "how many commercial layers are in this number" is answerable at
   * all. See `isComponentIntermediated`.
   */
  performerRef: string;
  /** Optional resolutions. Human calibration; never matched automatically. */
  resolvedPerformerVendorId?: string;
  /** An opaque `hotels.id`. NOT a HotelRecord — M9 imports nothing from M8. */
  resolvedHotelId?: string;
  /** COMMERCIALLY SENSITIVE — founder-only. */
  amount?: number;
};

/* ------------------------------------------------------------------ *
 * Named inclusions
 * ------------------------------------------------------------------ */

/**
 * A property the offer says it includes.
 *
 * ⚠️ DISCLOSURE, NOT SUPPLY. The DMC holds this hotel; BPT does not. This
 * creates NO availability, NO capacity, NO allocation and NO commitment type,
 * and nothing in M8 may read it. `resolvedHotelId` is a bare id string so that
 * no `HotelRecord` can cross this boundary.
 *
 * `supplierRef` is kept whatever happens, for the same reason M4 keeps
 * `vendorPropertyRef` beside `propertyId`: the resolved id answers "which
 * property", and this answers "what did the supplier actually write". It is the
 * evidence a later dispute is settled against, and it is never overwritten.
 */
export type NamedInclusion = {
  id: string;
  supplierRef: string;
  resolvedHotelId?: string;
};

/* ------------------------------------------------------------------ *
 * Status
 * ------------------------------------------------------------------ */

/**
 * Mirrors `RATE_SHEET_STATUSES` in shape and meaning. Copied rather than
 * imported: an offer is not a sheet, and sharing the type would let a future
 * change to one silently redefine the other.
 */
export const OFFER_STATUSES = ["draft", "active", "expired", "superseded"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  superseded: "Superseded",
};

export const OFFER_STATUS_DESCRIPTIONS: Record<OfferStatus, string> = {
  draft: "Captured from the supplier, not yet approved for use.",
  active: "Approved by a named human. Usable within the scope its basis allows.",
  expired: "Past its validity. Readable forever, quotable never.",
  // Quoter AND basis AND scope: a revision from one DMC never replaces another
  // DMC's competing offer, and a contracted offer never supersedes a quotation.
  superseded: "Replaced by a newer offer from the same supplier, for the same basis and scope.",
};

/* ------------------------------------------------------------------ *
 * The record
 * ------------------------------------------------------------------ */

export type DmcOffer = {
  id: string;

  /* ---- who quoted it ---- */
  /** The `dmcs` row. Opaque id — no collection config crosses this boundary. */
  dmcId: string;
  /**
   * The `vendors` row that QUOTED this offer.
   *
   * ⚠️ AN ORGANISATION, NEVER A PERSON. People leave; offers outlive them, and
   * an offer attributed to a departed employee becomes unattributable evidence.
   */
  quoterVendorId: string;
  /** Captured for the register; the vendor record stays canonical. */
  quoterName: string;
  /** The supplier's own reference for this offer, if they gave one. */
  reference?: string;
  title: string;

  /* ---- classification: both required, neither defaulted ---- */
  basis: OfferBasis;
  recurrence: OfferRecurrence;

  /* ---- what it is ---- */
  /** Opaque `destinations.id`. */
  destinationId?: string;
  nights?: number;
  days?: number;
  /** The supplier's own day-wise outline. Free text; never parsed. */
  itineraryOutline?: string;
  inclusions: string[];
  exclusions: string[];
  claimedCoverage: OfferCoverage[];
  namedInclusions: NamedInclusion[];

  /* ---- when ---- */
  /** ISO calendar dates, inclusive. */
  validFrom?: string;
  validTo?: string;
  /** The operator's own wording for the cadence. NEVER expanded into dates. */
  recurrenceRef?: string;

  /* ---- money ---- */
  /** ISO 4217 as quoted by the supplier — never defaulted. */
  currency?: string;
  /** ABSENT MEANS UNKNOWN, never "person". */
  priceUnit?: OfferPriceUnit;
  paxBands: OfferPaxBand[];
  priceLines: OfferPriceLine[];
  /** Optional breakdown. Empty is normal — many DMCs quote a total only. */
  components: OfferComponent[];
  /**
   * The single figure the supplier stated for the whole offer, when they gave
   * one alongside a breakdown. COMMERCIALLY SENSITIVE — founder-only.
   */
  statedTotal?: number;

  /* ---- evidence and links ---- */
  requestedTerms: RequestedTerm[];
  /** Refs into the Documents layer — the original PDF or message. */
  documentRefs: string[];
  /** The M3 contract this sits under, when one exists. Opaque id. */
  contractId?: string;
  /**
   * The request this quotation answers. OPAQUE BY DESIGN.
   *
   * ⚠️ A BARE STRING, NOT A TYPED REFERENCE, AND NOT AN IMPORT. The inquiry
   * layer is not part of this milestone and must not become a dependency of it;
   * this holds an id the same way M4's `propertyId` holds a bare `hotels.id`.
   *
   * On a `quoted` offer its ABSENCE is decisive: an unbound quotation is
   * readable evidence that can never be activated, because nothing can prove
   * which trip it was created for.
   */
  inquiryId?: string;

  /* ---- state ---- */
  status: OfferStatus;
  /**
   * A human has READ this offer's supplier conditions.
   *
   * It asserts nothing about what they say. Same claim, and same deliberate
   * narrowness, as M4's `conditionsReviewed`: without it an offer carrying the
   * supplier's own exclusion activates and prices the excluded case at full
   * confidence.
   */
  conditionsReviewed?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** ⚠️ Nothing here is stored. No table, no migration, no database contact. */
export const DMC_OFFER_PERSISTENCE = "none" as const;

/**
 * DECLARATION ONLY — there is no code path that exercises this today.
 *
 * When a future assembly layer prices a DMC offer through M7, the resulting
 * component must carry a `dmc_offer` provenance naming the quoter, the offer and
 * its validity — never M7's `manual`, whose only fields are a free-text
 * reference and a note.
 *
 * ⚠️ M7 IS DELIBERATELY NOT MODIFIED BY THIS MILESTONE. `priceComponents` has no
 * consumers anywhere in the repository, so adding a union member now would
 * change a frozen module for a path nothing walks. The requirement is recorded
 * here and lands with its first consumer — the same treatment M8 gives
 * `AI_PREREQUISITES` for things that do not yet exist.
 */
export const DMC_OFFER_PROVENANCE_SOURCE = "dmc_offer" as const;
export const DMC_OFFER_PROVENANCE_STATUS = "declared_not_implemented" as const;

/* ------------------------------------------------------------------ *
 * Derivations — computed, never stored
 * ------------------------------------------------------------------ */

/**
 * Did somebody other than the performer quote this component?
 *
 * ⚠️ DERIVED, NEVER STORED. A stored "is intermediary" flag could disagree with
 * the ids it claims to describe, and a flag that can be wrong about this is
 * worse than no flag: it would let a middleman's price be filed as a direct
 * supplier rate with a field asserting otherwise.
 *
 * Returns `null` when the performer has not been resolved — UNKNOWN is not
 * "direct". Silence must never render as an absence of commercial layers.
 */
export function isComponentIntermediated(
  offer: Pick<DmcOffer, "quoterVendorId">,
  component: Pick<OfferComponent, "resolvedPerformerVendorId">,
): boolean | null {
  if (!component.resolvedPerformerVendorId) return null;
  return component.resolvedPerformerVendorId !== offer.quoterVendorId;
}

/** Bands declared on this offer, as a set of ids. */
export function declaredPaxBandIds(offer: Pick<DmcOffer, "paxBands">): Set<string> {
  return new Set(offer.paxBands.map((b) => b.id));
}

/** True when the offer states no request it answers. Only meaningful for `quoted`. */
export function isUnboundQuotation(
  offer: Pick<DmcOffer, "basis" | "inquiryId">,
): boolean {
  return offer.basis === "quoted" && !offer.inquiryId?.trim();
}

/** Inclusive ISO-date containment, computed in UTC so a timezone cannot shift a day. */
function withinWindow(from: string | undefined, to: string | undefined, at: Date): boolean {
  if (!from || !to) return false;
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  const day = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  return day >= start && day <= end;
}

/** Has the offer's validity window passed as of `now`? */
export function isOfferLapsed(
  offer: Pick<DmcOffer, "validTo">,
  now: Date = new Date(),
): boolean {
  if (!offer.validTo) return false;
  const end = Date.parse(`${offer.validTo}T00:00:00.000Z`);
  if (Number.isNaN(end)) return false;
  const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return day > end;
}

export const OFFER_USE_REFUSAL_CODES = [
  "not_active",
  "outside_validity",
  "unbound_quotation",
  "request_required",
  "request_mismatch",
] as const;
export type OfferUseRefusalCode = (typeof OFFER_USE_REFUSAL_CODES)[number];

export type OfferUsability =
  | { ok: true }
  | { ok: false; code: OfferUseRefusalCode; reason: string };

/**
 * May this offer be used for THIS trip, right now?
 *
 * ⚠️ USABILITY IS A FUNCTION, NEVER A FIELD, AND `status` ALONE MUST NEVER
 * ANSWER IT. With both bases in one record, `active` means "usable for any
 * matching trip" on a contracted offer and "usable for exactly one request" on a
 * quotation. A caller reading `status === "active"` would treat a bound
 * quotation as generally usable, which is how one school group's price ends up
 * quoting somebody else's holiday.
 *
 * ⚠️ IT ALSO RE-CHECKS THE PRECONDITIONS RATHER THAN TRUSTING THAT THE GATE RAN.
 * Nothing is persisted here, so nothing enforces the order in which a record was
 * constructed; a hand-built object could carry `status: "active"` having passed
 * through no gate at all. M7's `resolveRate` defends the same way — it re-checks
 * that a sheet is active, in validity and valid at the moment of use — and this
 * follows it deliberately.
 */
export function offerUsability(
  offer: Pick<DmcOffer, "basis" | "status" | "validFrom" | "validTo" | "inquiryId">,
  context: { date: Date; requestId?: string },
): OfferUsability {
  if (offer.status !== "active") {
    return {
      ok: false,
      code: "not_active",
      reason: `The offer is "${OFFER_STATUS_LABELS[offer.status]}". Only an activated offer may be used.`,
    };
  }

  if (!withinWindow(offer.validFrom, offer.validTo, context.date)) {
    return {
      ok: false,
      code: "outside_validity",
      reason:
        "The travel date falls outside the offer's validity window. Using it would quote a withdrawn price.",
    };
  }

  if (offer.basis === "contracted") return { ok: true };

  // From here the offer is `quoted`, and scope is everything.
  if (isUnboundQuotation(offer)) {
    return {
      ok: false,
      code: "unbound_quotation",
      reason:
        "This quotation records no request, so nothing can prove which trip it was created for. It is readable evidence and cannot price anything.",
    };
  }

  const requested = context.requestId?.trim();
  if (!requested) {
    return {
      ok: false,
      code: "request_required",
      reason:
        "This is a request-specific quotation. Naming the request is required — a quotation has no meaning apart from the request it answers.",
    };
  }

  if (requested !== offer.inquiryId) {
    return {
      ok: false,
      code: "request_mismatch",
      reason:
        "This quotation was given for a different request. A price quoted for one trip is not a price for another.",
    };
  }

  return { ok: true };
}

/**
 * Do the stated components add up to the stated total?
 *
 * ⚠️ THIS IS A COMPARISON, NOT A CALCULATION, AND IT IS THE ONLY ARITHMETIC IN
 * THE MILESTONE. It computes no price, applies no markup and produces no money —
 * M7 is the pricing authority and this module does not encroach on it.
 *
 * ⚠️ THE GAP IS NEVER RETURNED. Real breakdowns often fail to sum, through
 * rounding or undisclosed operational margin. Silently reconciling them would
 * invent a number; refusing to record the offer would lose real evidence. So
 * both figures are kept, disagreement is reported, and the SIZE of the
 * disagreement is withheld — reporting it would leak a founder-only amount
 * through a channel redaction does not cover.
 *
 * `agrees` is null when there is nothing to compare, which is not the same as
 * agreement.
 */
export type ComponentReconciliation = {
  hasComponents: boolean;
  hasStatedTotal: boolean;
  /** null when either side is absent, or when any figure is uncaptured. */
  agrees: boolean | null;
};

export function reconcileComponents(
  offer: Pick<DmcOffer, "components" | "statedTotal">,
): ComponentReconciliation {
  const hasComponents = offer.components.length > 0;
  const hasStatedTotal = offer.statedTotal !== undefined;

  if (!hasComponents || !hasStatedTotal) {
    return { hasComponents, hasStatedTotal, agrees: null };
  }

  // A component with no amount is uncaptured, not zero. Summing around it would
  // manufacture a disagreement that says more about data entry than about money.
  const anyMissing = offer.components.some((c) => c.amount === undefined);
  if (anyMissing) return { hasComponents, hasStatedTotal, agrees: null };

  const sum = offer.components.reduce((total, c) => total + (c.amount ?? 0), 0);
  return { hasComponents, hasStatedTotal, agrees: sum === offer.statedTotal };
}

/* ------------------------------------------------------------------ *
 * Commercial sensitivity
 * ------------------------------------------------------------------ */

/**
 * Offer amounts are supplier commercial terms — the same class of data as M3's
 * contract values and M4's rate amounts, and restricted the same way.
 *
 * This mirrors `canViewRateAmounts` rather than importing it, so M9 does not
 * depend on M4 for access control. Both read the ONE platform role vocabulary
 * from the documents layer, so there is a single source of truth for who is who.
 */
export const OFFER_AMOUNT_VISIBILITY = "founder_only" as const;

const AMOUNT_ROLES: DocumentActorRole[] = ["founder"];

export function canViewOfferAmounts(actor: DocumentActor): boolean {
  return AMOUNT_ROLES.includes(actor.role);
}

export type OfferPriceLineView = Omit<OfferPriceLine, "amount"> & {
  amount?: number;
  amountRedacted: boolean;
};

export type OfferComponentView = Omit<OfferComponent, "amount"> & {
  amount?: number;
  amountRedacted: boolean;
};

export type DmcOfferView = Omit<DmcOffer, "priceLines" | "components" | "statedTotal"> & {
  priceLines: OfferPriceLineView[];
  components: OfferComponentView[];
  statedTotal?: number;
  /** True when any amount on the offer was withheld from this actor. */
  amountsRedacted: boolean;
};

/**
 * Redact in the DATA layer, not the template.
 *
 * The `amount` key is physically REMOVED for unauthorised actors rather than
 * blanked, so it cannot survive JSON serialisation or be leaked by a surface
 * that forgets to hide a column. Same mechanism as `redactRateSheet` and
 * `redactContract`, for the same reason: a template must never be the only thing
 * standing between a staff member and what BPT pays a supplier.
 */
export function redactOffer(offer: DmcOffer, actor: DocumentActor): DmcOfferView {
  const allowed = canViewOfferAmounts(actor);
  let withheld = false;

  const priceLines: OfferPriceLineView[] = offer.priceLines.map((line) => {
    const { amount, ...rest } = line;
    if (allowed) {
      return amount === undefined
        ? { ...rest, amountRedacted: false }
        : { ...rest, amount, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, amountRedacted: amount !== undefined };
  });

  const components: OfferComponentView[] = offer.components.map((component) => {
    const { amount, ...rest } = component;
    if (allowed) {
      return amount === undefined
        ? { ...rest, amountRedacted: false }
        : { ...rest, amount, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, amountRedacted: amount !== undefined };
  });

  const { statedTotal, ...offerRest } = offer;
  const base = { ...offerRest, priceLines, components };

  if (allowed) {
    return statedTotal === undefined
      ? { ...base, amountsRedacted: withheld }
      : { ...base, statedTotal, amountsRedacted: withheld };
  }

  if (statedTotal !== undefined) withheld = true;
  return { ...base, amountsRedacted: withheld };
}

export function redactOffers(offers: DmcOffer[], actor: DocumentActor): DmcOfferView[] {
  return offers.map((o) => redactOffer(o, actor));
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type DmcOfferSummary = {
  live: boolean;
  total: number;
  counts: Record<OfferStatus, number>;
  byBasis: Record<OfferBasis, number>;
  /** Active offers already past their validity but still marked active. */
  lapsed: number;
  /** Quotations recording no request — evidence only, never activatable. */
  unboundQuotations: number;
  /** Offers with at least one blocking validation error. */
  withErrors: number;
};

export function emptyDmcOfferSummary(live = false): DmcOfferSummary {
  return {
    live,
    total: 0,
    counts: { draft: 0, active: 0, expired: 0, superseded: 0 },
    byBasis: { contracted: 0, quoted: 0 },
    lapsed: 0,
    unboundQuotations: 0,
    withErrors: 0,
  };
}

/* ------------------------------------------------------------------ *
 * Vocabulary guards — for data arriving from outside TypeScript
 * ------------------------------------------------------------------ */

export function isOfferBasis(value: unknown): value is OfferBasis {
  return typeof value === "string" && (OFFER_BASES as readonly string[]).includes(value);
}

export function isOfferRecurrence(value: unknown): value is OfferRecurrence {
  return typeof value === "string" && (OFFER_RECURRENCES as readonly string[]).includes(value);
}

export function isOfferPriceUnit(value: unknown): value is OfferPriceUnit {
  return typeof value === "string" && (OFFER_PRICE_UNITS as readonly string[]).includes(value);
}

export function isOfferCoverage(value: unknown): value is OfferCoverage {
  return typeof value === "string" && (OFFER_COVERAGE as readonly string[]).includes(value);
}

export function isComponentKindValue(value: unknown): value is ComponentKind {
  return typeof value === "string" && (COMPONENT_KINDS as readonly string[]).includes(value);
}

export function isRateOfferingValue(value: unknown): value is RateOffering {
  return typeof value === "string" && (RATE_OFFERINGS as readonly string[]).includes(value);
}
