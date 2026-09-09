/**
 * Direct transport commercial truth — what a transporter charges BPT.
 *
 * A transporter quotes differently from a hotel and differently from a DMC:
 * "₹4,500 per day for a Dzire, Srinagar local", "₹18 per kilometre, any sedan",
 * "₹6,000 for the Gulmarg sightseeing circuit". Today those live in WhatsApp
 * and email and have nowhere to land.
 *
 * WHY THIS IS NOT M4
 * M4 is a property-scoped ROOM price book: `RateLine.roomType` is REQUIRED and
 * `RATE_UNITS` has only `night`. A chartered vehicle has no room type and is
 * not priced per night, so representing it in M4 would mean inventing a room
 * type and misdeclaring the unit — a wrong invoice waiting to happen. This is
 * the identical argument M9 makes for a finished DMC package, and it is settled
 * the same way: a separate instrument that reuses M4's PATTERNS and never its
 * TYPES.
 *
 * ⚠️ WHAT THIS IS NOT, AND MUST NEVER BECOME
 *   - NOT a pricing engine. Nothing here multiplies, marks up, taxes or totals.
 *     M7 owns customer pricing. There is no arithmetic in this module at all.
 *   - NOT a second rate system. No type here is a `RateSheet`, and
 *     `resolveRate` reads `RateSheet[]` only — so transport cost CANNOT leak
 *     into M7's resolver. The guarantee is structural, not a rule to remember.
 *   - NOT a DMC commercial offer. Where a DMC bundles transport, M9 holds the
 *     commercial truth and M10 holds no rate for it at all. Nothing here is
 *     imported from `lib/dmc`, and an `OfferComponent` can never become a
 *     tariff because the types have no assignment path between them.
 *   - NOT a fleet registry. There is no `Vehicle` record and no `Driver`
 *     record. A registration and a driver name appear ONLY inside a
 *     `TransportAssignment`, as evidence a transporter supplied for ONE
 *     operation.
 *   - NOT an availability source. This module exports NO availability type.
 *     The absence is the safeguard: a caller cannot read availability off a
 *     tariff because the concept does not exist here.
 *   - NOT departure or occupancy. No seat count, no occupancy, no departure.
 *     How many travellers a group has is a departure fact; M10 says only what a
 *     vehicle costs and how many it seats.
 *
 * WHAT THIS MODULE DOES NOT CONTAIN — deliberately:
 *   no rates, no season dates, no commercial class values, no capacity figures,
 *   no union charge amounts, no minimum-kilometre defaults, no currency
 *   default. Every one of those is real commercial data supplied by a supplier
 *   or the founder. This module is the shape they arrive in, never the values.
 *
 * Reuse, not redefinition:
 *   - the transporter is a `vendors` row and a `transport-providers` row
 *     (opaque ids here — no import from those layers)
 *   - offering states are M4's `RATE_OFFERINGS`
 *   - the agreement is an M3 contract — `contractId`
 *   - the original quotation PDF is a Document (M5) — `documentRefs`
 *
 * ⚠️ NOT PERSISTED. Every `*_PERSISTENCE` constant below is "none".
 *
 * Pure types and pure functions. No I/O.
 */
import type { DocumentActor, DocumentActorRole } from "@/lib/documents/permissions";
import { RATE_OFFERINGS, rateLineOffering, type RateOffering } from "@/lib/rates/model";

/* ------------------------------------------------------------------ *
 * Fleet taxonomy — what the SUPPLIER owns
 * ------------------------------------------------------------------ */

/**
 * The supplier's own fleet vocabulary, MIRRORED from the applied migration.
 *
 * ⚠️ THIS LIST IS THE DATABASE, AND IT MUST NEVER BE WIDENED HERE.
 * `enum_transport_providers_vehicles_type` is a real PostgreSQL enum created in
 * `src/migrations/20260812_194805_initial.ts` and typing the
 * `transport_providers_vehicles.type` column. Adding a member in TypeScript
 * without an `ALTER TYPE` migration would produce a value the database refuses
 * to store — a failure that appears only once persistence is switched on.
 *
 * Mirrored rather than imported for the same reason `VENDOR_TYPES` mirrors
 * `Vendors.type`: the values live inside a Payload field definition, and
 * importing a collection config into a pure domain module would drag the CMS
 * into code that must stay free of it.
 */
export const FLEET_CATEGORIES = ["sedan", "suv", "tempo", "mini_bus", "coach"] as const;
export type FleetCategory = (typeof FLEET_CATEGORIES)[number];

export const FLEET_CATEGORY_LABELS: Record<FleetCategory, string> = {
  sedan: "Sedan",
  suv: "SUV",
  tempo: "Tempo Traveller",
  mini_bus: "Mini Bus",
  coach: "Volvo / Coach",
};

export function isFleetCategory(value: unknown): value is FleetCategory {
  return typeof value === "string" && (FLEET_CATEGORIES as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ *
 * Commercial taxonomy — what BPT SELLS
 * ------------------------------------------------------------------ */

/**
 * BPT's commercial transport classes.
 *
 * ⚠️ EMPTY BY DESIGN, AND THAT IS THE DELIVERABLE.
 *
 * What BPT sells is not what a supplier owns. The founder's operating input
 * distinguishes an MUV from a premium MPV from an SUV — a distinction the
 * migrated fleet enum cannot make, because it has one `suv` member covering
 * both an Ertiga and an Innova Crysta. Coercing them together would put a
 * 6-seat MUV into SUV candidate sets, where it would eventually be offered
 * against a requirement someone sold as an SUV.
 *
 * That is precisely the hotel case, already decided: `enum_hotels_star_category`
 * carries `boutique` and `enum_packages_hotel_category` does not, and
 * `hotels/category.ts` surfaces the gap as UNMAPPABLE rather than quietly
 * calling a homestay premium. Founder decision of record there, and here:
 * SURFACE IT, DO NOT WIDEN THE ENUM.
 *
 * The class list itself is real commercial data. Shipping a plausible taxonomy
 * (Sedan? MUV? Premium MPV?) would invent BPT's commercial segmentation, and
 * every option filtered through it would be wrong in a way nobody would notice.
 * The same deliberate extension point as `MARKUP_RULES`, `AGE_BANDS`,
 * `TYPE_REQUIREMENTS` and `CATEGORY_SUBSTITUTIONS`.
 *
 * Populate it and `COMMERCIAL_TO_FLEET` together; every consumer below picks
 * them up with no code change.
 */
export const TRANSPORT_COMMERCIAL_CLASSES: readonly string[] = [];

/**
 * Which fleet categories can satisfy a commercial class.
 *
 * ⚠️ EMPTY, AND DIRECTIONAL. A commercial class maps DOWN to the fleet
 * categories that could supply it; the reverse is not modelled, because one
 * fleet category can serve several commercial classes and inverting a
 * many-to-one map silently invents a choice.
 *
 * Mirrors `CATEGORY_EQUIVALENCE` in `hotels/category.ts`, including its
 * emptiness discipline: which fleet category may stand in for which commercial
 * class is COMMERCIAL POLICY the founder has not supplied.
 */
export const COMMERCIAL_TO_FLEET: Record<string, readonly FleetCategory[]> = {};

/**
 * DECLARED commercial classes with no fleet category behind them.
 *
 * DERIVED from the two vocabularies rather than hand-listed — so if either is
 * legitimately extended, this set follows instead of silently going stale.
 * Exactly how `UNMAPPABLE_HOTEL_CATEGORIES` is computed.
 */
export function unmappableCommercialClasses(): readonly string[] {
  return TRANSPORT_COMMERCIAL_CLASSES.filter((cls) => {
    const fleet = COMMERCIAL_TO_FLEET[cls];
    return !fleet || fleet.length === 0;
  });
}

/**
 * Can a requirement naming this class be evaluated at all?
 *
 * ⚠️ TRUE FOR TWO DIFFERENT CAUSES, DELIBERATELY TREATED AS ONE.
 *   · the class is DECLARED but nobody has mapped it to a fleet category
 *   · the class was never declared — while `TRANSPORT_COMMERCIAL_CLASSES` is
 *     empty pending founder data, this is every class
 *
 * The causes differ and both are worth reporting to a human, but the
 * consequence is identical and it is the consequence that must not be guessed:
 * NOTHING CAN BE CHECKED AGAINST THIS CLASS. Splitting them here would tempt a
 * caller to treat one as recoverable and quietly approximate — which is the
 * boutique-into-premium failure, in transport.
 */
export function isUnmappableCommercialClass(cls: string): boolean {
  return fleetCategoriesFor(cls) === null;
}

/**
 * The fleet categories that could supply a commercial class.
 *
 * Returns `null` for UNMAPPABLE — deliberately not an empty array. An empty
 * array reads as "no candidates matched", which a caller may reasonably narrow
 * further; `null` reads as "this question cannot be answered", which a caller
 * must refuse on. Conflating the two is how a homestay ends up in a premium
 * candidate set.
 */
export function fleetCategoriesFor(cls: string): readonly FleetCategory[] | null {
  const fleet = COMMERCIAL_TO_FLEET[cls];
  if (!fleet || fleet.length === 0) return null;
  return fleet;
}

/* ------------------------------------------------------------------ *
 * Model identity — the third, independent axis
 * ------------------------------------------------------------------ */

/**
 * Normalise a supplier's model wording for comparison.
 *
 * ⚠️ THIS HANDLES FORMATTING AND NOTHING ELSE, BY FOUNDER RULING.
 * Case, surrounding whitespace, repeated spaces, and hyphens or underscores
 * used as separators are formatting. Everything else is IDENTITY.
 *
 *   "INNOVA CRYSTA" · "Innova Crysta" · "innova-crysta"   → all the same vehicle
 *   "Innova Crysta" vs "Innova Hycross"                   → DIFFERENT vehicles
 *   "Innova Crysta" vs "Innova"                           → DIFFERENT vehicles
 *   "Innova Crysta" vs "Crysta"                           → DIFFERENT vehicles
 *
 * NO stemming, NO substring containment, NO token-subset matching, NO edit
 * distance. Every one of those would let a cheaper vehicle satisfy a named
 * requirement — which is the silent substitution this rule exists to forbid.
 * A near miss is a REFUSAL, never an approximation.
 */
export function normalizeModel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Do two model strings name the same vehicle? Formatting-insensitive only. */
export function modelsMatch(a: string, b: string): boolean {
  const left = normalizeModel(a);
  const right = normalizeModel(b);
  // An empty model is not an identity, so it matches nothing — including
  // another empty one. "Unstated" must never satisfy "must be a Crysta".
  if (left === "" || right === "") return false;
  return left === right;
}

/* ------------------------------------------------------------------ *
 * Offering — what a transporter sells
 * ------------------------------------------------------------------ */

/**
 * One vehicle service a transporter offers.
 *
 * THREE INDEPENDENT AXES, NONE DERIVED FROM ANOTHER. A customer saying "two of
 * us, but specifically an Innova Crysta" is constraining the MODEL. A school
 * saying "45 seats" is constraining the CAPACITY. A package sold as "SUV or
 * equivalent" is constraining the CLASS. A shape that derived any of these from
 * another could not express all three requests.
 *
 * `fleetCategoryRef` keeps the supplier's own wording beside the resolved
 * `fleetCategory`, for the same reason M4 keeps `vendorPropertyRef` beside
 * `propertyId`: the resolved value is what code acts on, and the raw string is
 * the evidence it was resolved from, settled against in a later dispute. Never
 * overwritten by a resolution.
 */
export type TransportOffering = {
  id: string;
  /** Opaque `vendors.id`. No import from lib/vendor's records crosses here. */
  vendorId: string;
  /** Captured for the register; the vendor record stays canonical. */
  vendorName: string;
  /** Opaque `transport-providers.id`, when the offering came from one. */
  providerId?: string;

  /** The supplier's own wording for the category, exactly as received. */
  fleetCategoryRef: string;
  /** Resolved against the migrated enum. Absent means UNRESOLVED. */
  fleetCategory?: FleetCategory;
  /** BPT's commercial class, once a human has classified it. */
  commercialClass?: string;

  /**
   * The supplier's own model wording — "Innova Crysta", "Maharaja Tempo
   * Traveller", "Urbania". Free text for the same reason M4 keeps `roomType`
   * free text: a platform enum would silently rewrite what the supplier sent,
   * and the model vocabulary belongs to the market, not to BPT.
   */
  model?: string;

  /**
   * Seats the service provides.
   *
   * ⚠️ A NUMBER, NEVER AN ENUM. Seat counts run 4, 5, 6, 12, 16, 22, 26, 30,
   * 45, 55, 65 and beyond; a closed list breaks on the first 20-seater and
   * every value in it would be a guess at BPT's fleet reality.
   *
   * ABSENT MEANS UNKNOWN, never 0. A capacity requirement met by an offering
   * with no stated capacity is not met — it is unprovable, which is a different
   * and more dangerous thing.
   */
  capacity?: number;
};

/* ------------------------------------------------------------------ *
 * Pricing — basis versus scope
 * ------------------------------------------------------------------ */

/**
 * A measurable axis one amount is charged along.
 *
 * A basis price is MULTIPLIED by a quantity that comes from the operation, not
 * from the rate. M10 never performs that multiplication.
 *
 * ⚠️ TWO MEMBERS, both evidenced by how transporters actually quote in BPT's
 * markets. `night` is deliberately absent — a per-night price is a rate sheet
 * and belongs to M4, and listing it here would invite the one confusion this
 * module exists to prevent.
 */
export const TRANSPORT_RATE_BASES = ["day", "kilometre"] as const;
export type TransportRateBasis = (typeof TRANSPORT_RATE_BASES)[number];

export const TRANSPORT_RATE_BASIS_DESCRIPTIONS: Record<TransportRateBasis, string> = {
  day: "One amount covers one day of the vehicle service priced.",
  kilometre: "One amount covers one kilometre travelled by the vehicle priced.",
};

/**
 * A whole defined thing one amount buys outright.
 *
 * A scope price is NOT multiplied by anything. "₹6,000 for the Gulmarg circuit"
 * is one number for one named movement, however long it takes.
 */
export const TRANSPORT_SCOPE_KINDS = ["route", "sightseeing", "excursion", "trip"] as const;
export type TransportScopeKind = (typeof TRANSPORT_SCOPE_KINDS)[number];

export const TRANSPORT_SCOPE_KIND_DESCRIPTIONS: Record<TransportScopeKind, string> = {
  route: "A stated pickup-to-drop movement, priced whole.",
  sightseeing: "A named local sightseeing circuit, priced whole.",
  excursion: "A named excursion beyond the local circuit, priced whole.",
  trip: "The whole transport scope of a defined itinerary, priced whole.",
};

/**
 * How one line is priced.
 *
 * ⚠️ A DISCRIMINATED UNION, NOT OPTIONAL FIELDS, AND THAT IS THE POINT.
 * A per-day rate is multiplied by a quantity; a fixed circuit is not multiplied
 * at all. Modelling both as optional fields on one shape would permit a row
 * that is a per-day rate AND a fixed circuit — a contradiction with no rule to
 * settle it, and one nothing could later detect. This is the same reasoning M4
 * gives for keeping `scope` and `rateUnit` as two fields: a single combined
 * field lets two halves disagree.
 *
 * With a union, the contradictory row cannot be constructed at all.
 */
export type TransportPricing =
  | {
      kind: "basis";
      basis: TransportRateBasis;
      /**
       * A floor the supplier stated — "minimum 250 km per day". Their number,
       * carried as declared. M10 never applies it; applying a minimum is
       * arithmetic against an operation, which happens above this module.
       */
      minimum?: number;
    }
  | {
      kind: "scope";
      scopeKind: TransportScopeKind;
      /**
       * The supplier's own name for the scope — "Srinagar local sightseeing",
       * "Sonmarg day excursion". REQUIRED: a scope price with no scope named
       * prices nothing identifiable, and two such lines are indistinguishable.
       */
      scopeRef: string;
    };

/* ------------------------------------------------------------------ *
 * Seasons
 * ------------------------------------------------------------------ */

/**
 * A named date window a transporter prices differently.
 *
 * TARIFF-LOCAL, exactly like M4's `RateSeason` and M9's `OfferPaxBand`. Season
 * names and dates differ per supplier and per destination, so no platform-wide
 * registry can hold them. A line references a season by id and validation
 * refuses an id this tariff never declared.
 *
 * The label is the SUPPLIER'S own wording. BPT defines no season vocabulary.
 */
export type TariffSeason = {
  id: string;
  label: string;
  /** ISO calendar dates, inclusive. */
  startDate: string;
  endDate: string;
};

/* ------------------------------------------------------------------ *
 * Conditional charges
 * ------------------------------------------------------------------ */

/**
 * A charge that applies only when a stated condition holds.
 *
 * ⚠️ NOT A SURCHARGE FIELD, AND NOT A TAX. A union charge that applies on one
 * route is not a universal addition, and treating it as a flat field would make
 * a conditional cost look unconditionally applicable. Tax is M7's concern
 * (`pricing/tax.ts`); putting a supplier's operating levy into a customer's tax
 * breakdown would misstate both.
 */
export const CONDITIONAL_CHARGE_KINDS = [
  "union",
  "restricted_area",
  "destination",
  "other",
] as const;
export type ConditionalChargeKind = (typeof CONDITIONAL_CHARGE_KINDS)[number];

/**
 * ⚠️ THE APPLICATION RULE, AS A CONSTANT SO NO SURFACE CAN CONTRADICT IT.
 *
 * A conditional charge is surfaced as EVIDENCE beside an option. Nothing in
 * this module adds it to anything, because deciding when a trigger holds needs
 * a vocabulary derived from real supplier documents that nobody has supplied.
 * Automatic application would invent that vocabulary.
 */
export const CONDITIONAL_CHARGE_APPLICATION = "manual_only" as const;

export type ConditionalCharge = {
  id: string;
  kind: ConditionalChargeKind;
  /**
   * When this applies, in the SUPPLIER'S own words. REQUIRED and NEVER PARSED.
   *
   * The trigger is the whole content of a conditional charge — an amount with
   * no stated condition is indistinguishable from an unconditional one, which
   * is the exact misreading this type exists to prevent.
   */
  triggerText: string;
  /** What the supplier said when it was not a price. REUSES M4's vocabulary. */
  offering?: RateOffering;
  /** COMMERCIALLY SENSITIVE — founder-only. Absent until captured. */
  amount?: number;
};

/* ------------------------------------------------------------------ *
 * Tariff lines
 * ------------------------------------------------------------------ */

/**
 * One priced row.
 *
 * The applicability fields — class, model, capacity, season — are SELECTION
 * CONSTRAINTS, never prices. They answer "which rate applies", and a rate
 * quoted for a Crysta cannot be applied to a Tempo whatever it costs.
 *
 * ⚠️ NO `roomType`, NO `rateUnit`, NO `ageBandRef` ON THIS TYPE, EVER. Each of
 * those is M4's, and adding one here would be the first step towards a second
 * rate-sheet system.
 */
export type TariffLine = {
  id: string;

  /** Basis or scope. Never both — see `TransportPricing`. */
  pricing: TransportPricing;

  /** The supplier's own wording for the category this row prices. */
  fleetCategoryRef: string;
  /** Resolved against the migrated enum. Absent means UNRESOLVED. */
  fleetCategory?: FleetCategory;
  /** BPT's commercial class for this row, once classified. */
  commercialClass?: string;
  /** The supplier's own model wording, when the row prices a named model. */
  model?: string;
  /** Seats this row's service provides. Absent means UNKNOWN, never 0. */
  capacity?: number;

  /** Which season window this row prices; absent = the whole tariff. */
  seasonId?: string;

  /**
   * What the supplier said, when it was not a price. Absent means UNKNOWN, or
   * `PRICED` when an amount is present — see `tariffLineOffering`.
   *
   * REUSES M4's vocabulary rather than declaring a second one: "on request"
   * means the same thing on a cab as it does on a room rate. This is the one
   * vocabulary M10 imports rather than mirrors, because M4 is the platform's
   * authority on what a supplier's non-price answer means.
   */
  offering?: RateOffering;

  /** COMMERCIALLY SENSITIVE — founder-only. Absent until captured. */
  amount?: number;
  /** Free-text conditions as written by the supplier. Never parsed. */
  conditions?: string;
};

/**
 * A line's offering state, with M4's one inference applied — DELEGATED, not
 * copied. A number IS the evidence of a price; nothing else is inferred.
 */
export function tariffLineOffering(
  line: Pick<TariffLine, "offering" | "amount">,
): RateOffering | undefined {
  return rateLineOffering(line);
}

/** True when this line carries a usable price. Not a judgement about validity. */
export function isPricedLine(line: Pick<TariffLine, "offering" | "amount">): boolean {
  return tariffLineOffering(line) === "PRICED" && line.amount !== undefined;
}

/* ------------------------------------------------------------------ *
 * Tariff
 * ------------------------------------------------------------------ */

/**
 * May this tariff price a future operation, or was it one answer to one
 * question?
 *
 * ⚠️ REQUIRED, WITH NO DEFAULT. A default would make an uncaptured quotation
 * look reusable — the same failure M4 refuses when it declines to read an
 * absent `rateUnit` as "night", and the same discriminator M9 makes required on
 * an offer. Unknown reusability is the one thing that must never be guessed.
 *
 * COPIED from M9's `OFFER_BASES` rather than imported. M9 copied M4's statuses
 * for exactly this reason: an offer is not a tariff, and sharing the type would
 * let a future change to one silently redefine the other.
 */
export const TARIFF_BASES = ["contracted", "quoted"] as const;
export type TariffBasis = (typeof TARIFF_BASES)[number];

export const TARIFF_BASIS_DESCRIPTIONS: Record<TariffBasis, string> = {
  contracted:
    "A negotiated standing arrangement. Usable for any matching operation inside its validity, once activated.",
  quoted:
    "One answer to one request. It records what was quoted; it is not a standing price for future operations.",
};

export const TARIFF_STATUSES = ["draft", "active", "expired", "superseded"] as const;
export type TariffStatus = (typeof TARIFF_STATUSES)[number];

export const TARIFF_STATUS_LABELS: Record<TariffStatus, string> = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  superseded: "Superseded",
};

export const TARIFF_STATUS_DESCRIPTIONS: Record<TariffStatus, string> = {
  draft: "Captured from the transporter, not yet approved for use.",
  active: "Approved and in force — it may be offered as a commercial option.",
  expired: "Past its validity period. No longer offerable.",
  superseded: "Replaced by a newer tariff from the same transporter and operating area.",
};

/**
 * What a transporter charges, for what, where, and when.
 *
 * ⚠️ AN ACTIVE TARIFF IS NOT AVAILABILITY AND NOT A COMMITMENT. It says what a
 * vehicle would cost under agreed terms. Whether a vehicle exists on a date,
 * and whether the transporter will send one, are two further questions this
 * type cannot answer — see `TransportRequest`. Nothing here may be read as a
 * vehicle.
 */
export type TransportTariff = {
  id: string;
  /** Opaque `vendors.id`. */
  vendorId: string;
  /** Captured for the register; the vendor record stays canonical. */
  vendorName: string;

  basis: TariffBasis;
  status: TariffStatus;

  /**
   * WHERE these rates operate, in the supplier's own words. REQUIRED.
   *
   * ⚠️ THE DIMENSION THAT MUST NOT BE OMITTED. The same vehicle class from the
   * same supplier carries different rates for Jammu-to-Jammu and
   * Srinagar-to-Srinagar operations. A rate resolved without an operating area
   * returns a confident, well-formed, entirely wrong number — the right rate
   * for the wrong geography — which is exactly the property-mismatch defect
   * M8's audit found and fixed.
   *
   * M8's root cause on record: when a module gains a dimension that must not be
   * omitted, making it optional moves the failure silently to the caller. So
   * this is REQUIRED at capture, and its RESOLUTION is required at activation.
   */
  operatingAreaRef: string;
  /**
   * The resolved `destinations.id`, once a human has matched it.
   *
   * ⚠️ OPAQUE ON PURPOSE — a bare id, never a record. Kept separate from
   * `operatingAreaRef` so a later reader can ASSERT the two agree instead of
   * trusting that they do. Recording only one would look like proof while being
   * unable to distinguish a match from a mismatch — the lesson M7's
   * `requestedPropertyId`/`resolvedPropertyId` pair encodes.
   *
   * ABSENT means UNRESOLVED, never "applies everywhere".
   */
  operatingAreaId?: string;

  /** The transporter's own reference for this quotation, if they gave one. */
  reference?: string;
  /** ISO calendar dates the tariff is valid between. */
  validFrom?: string;
  validTo?: string;
  /** ISO 4217 code as quoted by the supplier — NEVER defaulted. */
  currency?: string;

  /** The agreement behind a contracted tariff. An opaque `contracts.id`. */
  contractId?: string;

  seasons: TariffSeason[];
  lines: TariffLine[];
  /** Charges that apply only under a stated condition. Never auto-applied. */
  charges: ConditionalCharge[];

  /**
   * A human has READ the supplier's free-text `conditions` on this tariff.
   *
   * It asserts nothing about what those conditions say — only that a person has
   * looked. Mirrors M4's `conditionsReviewed` in both shape and modesty.
   */
  conditionsReviewed?: boolean;

  /** Refs into the Documents layer (M5) — the quotation PDF. Never bytes. */
  documentRefs: string[];
};

export const TARIFF_PERSISTENCE = "none" as const;

/* ------------------------------------------------------------------ *
 * Rate outcomes — what happened when a supplier's answer met the tariff
 * ------------------------------------------------------------------ */

/**
 * MIRRORED from M8's `RATE_OUTCOMES`, deliberately not imported.
 *
 * The vocabulary is right and the reasoning behind it is right, but it lives in
 * `lib/hotels/supply.ts`, and importing a value from there would create the
 * first runtime dependency edge from another domain into `lib/hotels` in the
 * whole codebase. M9 sets the precedent for exactly this call: it IMPORTS M4's
 * `RATE_OFFERINGS` (a platform-wide authority on supplier answers) and COPIES
 * M4's statuses (a peer domain's local vocabulary), because "sharing the type
 * would let a future change to one silently redefine the other".
 *
 * A transport rate deviation and a hotel rate deviation are different
 * commercial events that happen to share three words.
 *
 * ⚠️ NO ESCALATION THRESHOLD IS DEFINED HERE. The point at which a deviation
 * stops being an employee's problem and becomes the founder's is business
 * policy that has not been set. A number here would invent it.
 */
export const TRANSPORT_RATE_OUTCOMES = [
  "RATE_MATCH",
  "RATE_DEVIATION",
  "COMMERCIAL_EXCEPTION",
] as const;
export type TransportRateOutcome = (typeof TRANSPORT_RATE_OUTCOMES)[number];

export const TRANSPORT_RATE_OUTCOME_DESCRIPTIONS: Record<TransportRateOutcome, string> = {
  RATE_MATCH: "The transporter accepts at the applicable tariff rate. The normal path.",
  RATE_DEVIATION:
    "The transporter accepts at a different rate. Never silently accepted, never passed to the customer — a human exception.",
  COMMERCIAL_EXCEPTION:
    "A deviation with commercial consequence. Founder judgement, because it changes what BPT pays or promises.",
};

/* ------------------------------------------------------------------ *
 * Hard requirements
 * ------------------------------------------------------------------ */

/**
 * Something an option MUST satisfy to be considered at all.
 *
 * ⚠️ A HARD REQUIREMENT ELIMINATES; IT NEVER RANKS. An option that fails one is
 * REMOVED from the candidate set, not scored lower — because a low-scoring
 * option is still bookable and a non-conforming one is not.
 *
 * This is the direct lesson of M8's substitution defect: an `EXACT` commitment
 * was read once and then dropped, leaving later checks comparing by RANK
 * POSITION rather than identity, which produced both silent substitution and
 * false refusal. So a hard requirement TRAVELS WITH THE PROPOSAL and is matched
 * by identity — see `TransportOptionProposal.hardRequirements`.
 */
export type HardRequirement =
  | { kind: "capacity"; minSeats: number }
  | { kind: "class"; commercialClass: string }
  | { kind: "model"; modelText: string }
  | { kind: "exclusive" };

export const HARD_REQUIREMENT_KINDS = ["capacity", "class", "model", "exclusive"] as const;
export type HardRequirementKind = (typeof HARD_REQUIREMENT_KINDS)[number];

/**
 * Something a customer would prefer, which does not eliminate anything.
 *
 * ⚠️ DELIBERATELY INERT. Nothing in M10 reads `note`. It is carried so a
 * request is recorded faithfully, and acting on it before quotes can be revised
 * would create an expectation with no way to disclose a change — the identical
 * discipline `InquiryRecord.preferredHotelIds` already documents.
 */
export type TransportPreference = {
  note: string;
};

/* ------------------------------------------------------------------ *
 * Request and acceptance
 * ------------------------------------------------------------------ */

/**
 * How far a request to a transporter has got.
 *
 * ⚠️ `lapsed` MEANS AN UNANSWERED REQUEST, NEVER AN AGED ACCEPTANCE.
 * A hotel's availability answer is evidence about the world and goes stale; a
 * transporter's acceptance is a PROMISE and stands until withdrawn. Expiring an
 * acceptance would silently release a vehicle BPT still expects.
 */
export const REQUEST_STATES = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "withdrawn",
  "lapsed",
] as const;
export type RequestState = (typeof REQUEST_STATES)[number];

export const REQUEST_STATE_DESCRIPTIONS: Record<RequestState, string> = {
  draft: "Prepared, not yet put to the transporter.",
  sent: "Put to the transporter. No answer yet.",
  accepted: "The transporter committed to perform this operation.",
  declined: "The transporter will not perform this operation.",
  withdrawn: "BPT withdrew the request before it was answered.",
  lapsed: "The request was never answered. NOT an acceptance that aged.",
};

/**
 * How BPT could reach a transporter.
 *
 * ⚠️ NONE IS ENABLED. M10 sends nothing and receives nothing;
 * `ACCEPTANCE_CHANNELS_ENABLED` is empty and the verification suite asserts it.
 * The vocabulary exists so a future integration adapts to this shape rather
 * than becoming it.
 */
export const ACCEPTANCE_CHANNELS = ["email", "portal", "messaging", "voice", "manual"] as const;
export type AcceptanceChannel = (typeof ACCEPTANCE_CHANNELS)[number];

export const ACCEPTANCE_CHANNELS_ENABLED: readonly AcceptanceChannel[] = [];

/**
 * What was actually put to the transporter.
 *
 * ⚠️ RECONSTRUCTABLE ON PURPOSE. A request that cannot be reproduced cannot be
 * the thing that was accepted — six months later, "they agreed" means nothing
 * without what they agreed to. So the asked scope is captured whole, including
 * the hard requirements, and never recomputed from a tariff that may have moved.
 */
export type RequestedScope = {
  dateFrom: string;
  dateTo: string;
  operatingAreaRef: string;
  fleetCategoryRef?: string;
  commercialClass?: string;
  model?: string;
  capacity?: number;
  /** When the tariff line priced a scope rather than a basis. */
  scopeRef?: string;
  /** Carried with the request, exactly as they travel with a proposal. */
  hardRequirements: HardRequirement[];
};

export type RequestResponse = {
  outcome: "accepted" | "declined";
  /** ISO timestamp of the transporter's answer. */
  at: string;
  /**
   * What they actually said — a message id, a call note reference, a WhatsApp
   * timestamp. The evidence a later dispute is settled against.
   */
  reference?: string;
  note?: string;
  /**
   * Whether they accepted at the tariff rate or at a different one.
   * Absent means UNSTATED — never assumed to be a match.
   */
  rateOutcome?: TransportRateOutcome;
};

export type TransportRequest = {
  id: string;
  /** The requirement this answers. An opaque id — M10 owns no requirement. */
  requirementId: string;
  vendorId: string;
  offeringId?: string;
  tariffId?: string;
  tariffLineId?: string;
  state: RequestState;
  requested: RequestedScope;
  response?: RequestResponse;
};

export const REQUEST_PERSISTENCE = "none" as const;

/**
 * The commitment question a proposal cannot answer.
 *
 * A proposal has a SLOT where a transporter's commitment belongs, and in M10
 * that slot is always empty, because no channel can carry a request or return
 * an answer. Modelling it as an explicit hole is what stops a later milestone
 * from quietly treating "no answer" as "yes". `filled` is a discriminant, so a
 * caller cannot read the acceptance without first proving it exists.
 *
 * ⚠️ NO `expiresAt`, AND THAT IS DELIBERATE. M8's `AvailabilityResult` carries
 * an expiry because availability confirmed six days ago is not availability
 * today. An acceptance is not evidence about the world — it is a promise, and
 * a promise does not decay on a timer. It ends when it is withdrawn, which is a
 * governance event somebody records, not a clock.
 */
export type AcceptanceSlot =
  | { filled: false; reason: string }
  | {
      filled: true;
      requestId: string;
      acceptedAt: string;
      /** Non-empty by construction — a slot cannot be filled without evidence. */
      reference: string;
    };

/** The only way a slot becomes filled: an accepted request carrying a reference. */
export function toAcceptanceSlot(request: TransportRequest): AcceptanceSlot {
  if (request.state !== "accepted") {
    return {
      filled: false,
      reason: `The request is ${request.state}. Only an accepted request is a commitment.`,
    };
  }
  const reference = request.response?.reference?.trim();
  if (!request.response || request.response.outcome !== "accepted" || !reference) {
    return {
      filled: false,
      reason:
        "The request is marked accepted but records no supplier reference. An acceptance nobody can produce is not evidence of one.",
    };
  }
  return {
    filled: true,
    requestId: request.id,
    acceptedAt: request.response.at,
    reference,
  };
}

/**
 * ⚠️ WHAT AN ACCEPTANCE DOES NOT PROVE — held as data so a console renders the
 * boundary rather than restating it in prose that could drift.
 */
export const ACCEPTANCE_DOES_NOT_PROVE: readonly string[] = [
  "That a vehicle is available — M10 holds no availability of any kind",
  "That the operation is confirmed to the customer",
  "That anyone at BPT approved it — no approval history is stored",
  "That it is still current — nothing here expires a commitment automatically",
];

/* ------------------------------------------------------------------ *
 * Assignment
 * ------------------------------------------------------------------ */

export const ASSIGNMENT_STATES = ["proposed", "committed", "superseded", "cancelled"] as const;
export type AssignmentState = (typeof ASSIGNMENT_STATES)[number];

/** Which states occupy a vehicle. Only these can conflict with one another. */
export const LIVE_ASSIGNMENT_STATES: readonly AssignmentState[] = ["proposed", "committed"];

/**
 * A vehicle a transporter supplied for ONE operation.
 *
 * ⚠️ EVIDENCE, NOT A REGISTRY ENTRY. There is no `Vehicle` record in this
 * module and there must never be one. BPT does not own the fleet, does not
 * maintain vehicle master data, and holds no odometer, service history,
 * maintenance schedule or utilisation figure. A registration exists here
 * because a conflict cannot be detected without one, and because a customer
 * eventually needs to know which vehicle is coming.
 */
export type AssignedVehicle = {
  /** As supplied by the transporter. The identity a conflict is detected on. */
  registration: string;
  fleetCategoryRef?: string;
  model?: string;
  capacity?: number;
};

/**
 * The driver for one operation.
 *
 * ⚠️ ASSIGNMENT-LEVEL ONLY. No HR record, no payroll, no attendance, no
 * employment relationship — BPT does not employ these people. Name and contact
 * are what a customer needs on the day and what an escalation needs to name.
 * Nothing more is collected, because nothing more is needed.
 *
 * Normally supplied LATER than the vehicle, which is why it is separately
 * optional rather than part of `AssignedVehicle`.
 */
export type AssignedDriver = {
  name: string;
  phone?: string;
};

/**
 * Which vehicle and driver are performing an operation.
 *
 * ⚠️ A SHAPE, NOT A WORKFLOW. Nothing dispatches, notifies, transitions or
 * schedules. `ASSIGNMENT_PERSISTENCE` is "none".
 */
export type TransportAssignment = {
  id: string;
  /** The request that produced it, when one did. */
  requestId?: string;
  /** The requirement being served. An opaque id. */
  requirementId: string;
  vendorId: string;

  /** The operational window. The date half of conflict detection. */
  window: { from: string; to: string };
  state: AssignmentState;

  vehicle?: AssignedVehicle;
  driver?: AssignedDriver;

  /**
   * Whether an intermediary sits between BPT and the performer.
   *
   *   direct         BPT → transporter → service
   *   intermediated  BPT → DMC → local transporter → service
   *
   * ⚠️ OPERATIONAL CONTEXT ONLY, AND CALLER-SUPPLIED — NEVER DERIVED.
   * Deriving it would mean reading M9, which this module must not do, and which
   * would create a second path to a fact M9 already owns.
   * `isComponentIntermediated()` in `lib/dmc` remains the ONLY authority on
   * commercial intermediation. This field says who is PERFORMING, and asserts
   * nothing about who priced the work or on what terms.
   *
   * It exists because an assignment is the one M10 record that may legitimately
   * exist with no M10 tariff behind it: when a DMC arranges the vehicle, BPT
   * may still need to know who is driving, for the passenger's sake.
   *
   * ABSENT MEANS UNSTATED, never "direct" — mirroring M9, which returns null
   * for unresolved rather than defaulting.
   */
  intermediated?: boolean;

  /** The assignment this one replaces. Replacement history is never overwritten. */
  supersedes?: string;
};

export const ASSIGNMENT_PERSISTENCE = "none" as const;

/**
 * ⚠️ THE LIMIT OF WHAT CONFLICT DETECTION CAN CLAIM.
 *
 * BPT sees only the operations BPT booked. A transporter who commits the same
 * vehicle to a BPT trip and to a non-BPT trip creates a conflict that NO amount
 * of data BPT stores can detect — that would require the transporter's whole
 * order book, which BPT does not have and should not ask for.
 *
 * So this constant exists to stop any surface describing the capability as
 * "prevents double-booking". It detects one thing: the same registration
 * committed to two overlapping BPT operations.
 */
export const CONFLICT_SCOPE = "bpt_internal_only" as const;

/* ------------------------------------------------------------------ *
 * Commercial sensitivity
 * ------------------------------------------------------------------ */

/**
 * Supplier amounts are commercial secrets. Founder-only, redacted HERE in the
 * data layer rather than in a template — the same mechanism M3, M4, M5, M7, M8
 * and M9 use, and for the same reason: a surface that forgets to hide a column
 * must not be the thing standing between a customer and a supplier's price.
 */
export const TARIFF_AMOUNT_VISIBILITY = "founder_only" as const;

const AMOUNT_ROLES: DocumentActorRole[] = ["founder"];

export function canViewTariffAmounts(actor: DocumentActor): boolean {
  return AMOUNT_ROLES.includes(actor.role);
}

export type TariffLineView = Omit<TariffLine, "amount"> & {
  amount?: number;
  amountRedacted: boolean;
};

export type ConditionalChargeView = Omit<ConditionalCharge, "amount"> & {
  amount?: number;
  amountRedacted: boolean;
};

export type TransportTariffView = Omit<TransportTariff, "lines" | "charges"> & {
  lines: TariffLineView[];
  charges: ConditionalChargeView[];
  /** True when any amount was withheld from this actor. */
  amountsRedacted: boolean;
};

/**
 * A tariff as a given actor may see it.
 *
 * The `amount` KEY is physically ABSENT for unauthorised actors — not blanked,
 * not zeroed — so it cannot survive JSON serialisation into a response body.
 */
export function redactTariff(tariff: TransportTariff, actor: DocumentActor): TransportTariffView {
  const allowed = canViewTariffAmounts(actor);
  let withheld = false;

  const lines: TariffLineView[] = tariff.lines.map((line) => {
    const { amount, ...rest } = line;
    if (allowed) {
      return amount === undefined
        ? { ...rest, amountRedacted: false }
        : { ...rest, amount, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, amountRedacted: amount !== undefined };
  });

  const charges: ConditionalChargeView[] = tariff.charges.map((charge) => {
    const { amount, ...rest } = charge;
    if (allowed) {
      return amount === undefined
        ? { ...rest, amountRedacted: false }
        : { ...rest, amount, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, amountRedacted: amount !== undefined };
  });

  return { ...tariff, lines, charges, amountsRedacted: withheld };
}

export function redactTariffs(
  tariffs: TransportTariff[],
  actor: DocumentActor,
): TransportTariffView[] {
  return tariffs.map((t) => redactTariff(t, actor));
}

/* ------------------------------------------------------------------ *
 * Derivations
 * ------------------------------------------------------------------ */

/** ISO date → time, or NaN. Kept local so nothing depends on a date library. */
function timeOf(iso?: string): number {
  if (!iso) return Number.NaN;
  return new Date(iso).getTime();
}

/**
 * Has an ACTIVE tariff passed its validity without anyone changing its status?
 *
 * Reported rather than corrected. A status is a human decision; this is the
 * observation that one is overdue. Mirrors M4's `isRateSheetLapsed` and M9's
 * `isOfferLapsed`.
 */
export function isTariffLapsed(
  tariff: Pick<TransportTariff, "status" | "validTo">,
  now: Date = new Date(),
): boolean {
  if (tariff.status !== "active") return false;
  const end = timeOf(tariff.validTo);
  if (Number.isNaN(end)) return false;
  return end < now.getTime();
}

/** Is a date inside a season window? Inclusive at both ends, as suppliers write them. */
export function isDateInSeason(season: TariffSeason, date: Date): boolean {
  const start = timeOf(season.startDate);
  const end = timeOf(season.endDate);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  const at = date.getTime();
  return at >= start && at <= end;
}

/** Season ids this tariff declared. Validation refuses a line referencing any other. */
export function declaredSeasonIds(tariff: Pick<TransportTariff, "seasons">): Set<string> {
  return new Set(tariff.seasons.map((s) => s.id));
}

/** Is a date inside the tariff's own validity window? Absent bounds do not constrain. */
export function isDateInValidity(
  tariff: Pick<TransportTariff, "validFrom" | "validTo">,
  date: Date,
): boolean {
  const at = date.getTime();
  const from = timeOf(tariff.validFrom);
  const to = timeOf(tariff.validTo);
  if (!Number.isNaN(from) && at < from) return false;
  if (!Number.isNaN(to) && at > to) return false;
  return true;
}

/* ------------------------------------------------------------------ *
 * Register summary
 * ------------------------------------------------------------------ */

export type TransportSummary = {
  live: boolean;
  total: number;
  counts: Record<TariffStatus, number>;
  byBasis: Record<TariffBasis, number>;
  /** Active tariffs whose validity has passed. */
  lapsed: number;
  /** Tariffs whose operating area nobody has resolved. */
  areaUnresolved: number;
  withErrors: number;
};

export function emptyTransportSummary(live = false): TransportSummary {
  return {
    live,
    total: 0,
    counts: { draft: 0, active: 0, expired: 0, superseded: 0 },
    byBasis: { contracted: 0, quoted: 0 },
    lapsed: 0,
    areaUnresolved: 0,
    withErrors: 0,
  };
}

/* ------------------------------------------------------------------ *
 * Type guards
 * ------------------------------------------------------------------ */

export function isTariffBasis(value: unknown): value is TariffBasis {
  return typeof value === "string" && (TARIFF_BASES as readonly string[]).includes(value);
}

export function isTariffStatus(value: unknown): value is TariffStatus {
  return typeof value === "string" && (TARIFF_STATUSES as readonly string[]).includes(value);
}

export function isTransportRateBasis(value: unknown): value is TransportRateBasis {
  return (
    typeof value === "string" && (TRANSPORT_RATE_BASES as readonly string[]).includes(value)
  );
}

export function isTransportScopeKind(value: unknown): value is TransportScopeKind {
  return (
    typeof value === "string" && (TRANSPORT_SCOPE_KINDS as readonly string[]).includes(value)
  );
}

export function isRateOfferingValue(value: unknown): value is RateOffering {
  return typeof value === "string" && (RATE_OFFERINGS as readonly string[]).includes(value);
}

export function isRequestState(value: unknown): value is RequestState {
  return typeof value === "string" && (REQUEST_STATES as readonly string[]).includes(value);
}

export function isAssignmentState(value: unknown): value is AssignmentState {
  return typeof value === "string" && (ASSIGNMENT_STATES as readonly string[]).includes(value);
}
