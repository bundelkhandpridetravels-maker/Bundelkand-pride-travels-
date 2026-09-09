/**
 * Commercial option evidence, transporter requests, and assignment conflicts.
 * Pure. No I/O.
 *
 * WHAT THIS PRODUCES, AND WHAT IT REFUSES TO PRODUCE
 *
 * Given a transport requirement, this assembles the OPTIONS a human could
 * consider, the ones that were eliminated and why, and an explicit refusal when
 * nothing survives. It does not choose. It does not book. It does not
 * recommend. `proposable` says a person may now look at this; it never says
 * anything may be taken.
 *
 * SELECTION IS ELIMINATION FIRST, RANKING SECOND
 *   1. HARD REQUIREMENTS   eliminate — capacity, class, model, exclusivity
 *   2. ELIGIBILITY         eliminate — active, verified, destination-matched
 *   3. COMMERCIAL          eliminate — active tariff, in validity, area, PRICED
 *   4. RANK                tie-break only, via the EXISTING quality engine
 *
 * Steps 1–3 are eliminations. An option that fails one is REMOVED from the set,
 * not scored lower — so no ordering applied afterwards can reintroduce it. That
 * is the mechanism that makes the founder's rule structural rather than
 * remembered: a cheaper Tempo cannot replace a required Innova Crysta because,
 * by the time anything is ordered, no Tempo remains in the array.
 *
 * ⚠️ THERE IS NO COST ORDERING IN THIS MODULE, AT ALL.
 * Amounts are carried as EVIDENCE beside each option and nothing sorts on them.
 * A cost-based order would be the one thing capable of overriding a hard
 * requirement if the elimination above were ever weakened, so the absence is a
 * second, independent safeguard rather than an oversight.
 *
 * REUSE, NOT REBUILD
 * `proposeVendors` and `computeQualityScore` already exist, are pure, and
 * already refuse to fabricate a score when data is missing. This module calls
 * them. A second ranking engine would be a defect, not an alternative — M8
 * states exactly this, and M10 is bound by the same rule.
 *
 * ⚠️ NOTHING HERE READS lib/hotels, lib/dmc, lib/pricing OR lib/inquiry.
 */
import type { DocumentActor } from "@/lib/documents/permissions";
import { proposeVendors } from "@/lib/vendor/assignment";
import { computeQualityScore } from "@/lib/vendor/ranking";
import type { VendorRecord } from "@/lib/vendor/model";
import {
  canViewTariffAmounts,
  isDateInValidity,
  isPricedLine,
  isTariffLapsed,
  isUnmappableCommercialClass,
  LIVE_ASSIGNMENT_STATES,
  modelsMatch,
  type AcceptanceSlot,
  type ConditionalCharge,
  type HardRequirement,
  type RequestedScope,
  type TariffLine,
  type TransportAssignment,
  type TransportOffering,
  type TransportPricing,
  type TransportRateOutcome,
  type TransportRequest,
  type TransportTariff,
} from "@/lib/transport/model";

/* ------------------------------------------------------------------ *
 * The requirement, as a QUERY rather than an entity
 * ------------------------------------------------------------------ */

/**
 * What this module needs to know about a transport requirement.
 *
 * ⚠️ M10 DECLARES NO REQUIREMENT ENTITY, AND THAT IS THE DESIGN.
 *
 * A transport need can originate from a customer booking, from a BPT-owned
 * group departure, or from a school or corporate operation. M8's
 * `SupplyRequirement` already models a requirement and already names a
 * `transport` kind — but its `bookingId` is REQUIRED, which a departure origin
 * cannot satisfy, and relaxing that field to optional would recreate the exact
 * M4→M8 defect where an omitted dimension moves the failure silently to the
 * caller.
 *
 * So M10 takes only the fields its selection actually reads, matched
 * structurally. It never sees an origin, so it works with every origin, and it
 * creates no second entity competing with M8's.
 *
 * This is an established pattern here, not a new one: `hotels/rate-reference.ts`
 * consumes a requirement as `Pick<SupplyRequirement, "dateFrom" | "roomType" |
 * "mealPlan">`, and `documents/linkage.ts` reads contracts and rate sheets by
 * shape rather than importing them, precisely to keep the dependency arrow
 * pointing one way.
 *
 * When requirement persistence is eventually built, a shared origin model can
 * be settled with the departure case actually in hand — and this parameter will
 * be satisfied by that type with no change here.
 */
export type TransportRequirementQuery = {
  /** Stable within the proposal. NOT a booking id and NOT a customer id. */
  id: string;
  /** ISO calendar dates the transport is needed for, inclusive. */
  dateFrom: string;
  dateTo: string;
  /** Opaque `destinations.id`, when the requirement names one. */
  destinationId?: string;
  /** What MUST be satisfied. Empty is valid — "any eligible vehicle". */
  hardRequirements: HardRequirement[];
};

/* ------------------------------------------------------------------ *
 * Exclusion and refusal vocabulary
 * ------------------------------------------------------------------ */

/**
 * Why an option was removed. Each code maps to a real gate, so an operator
 * reads a cause rather than an empty screen — "why", not just "that".
 */
export const EXCLUSION_REASONS = [
  "supplier_not_eligible",
  "capacity_insufficient",
  "capacity_unknown",
  "class_mismatch",
  "class_unmappable",
  "class_unresolved",
  "model_mismatch",
  "model_unstated",
  "no_applicable_tariff",
  "tariff_not_active",
  "tariff_lapsed",
  "tariff_outside_validity",
  "operating_area_unresolved",
  "operating_area_mismatch",
  "no_price_for_combination",
] as const;
export type ExclusionReason = (typeof EXCLUSION_REASONS)[number];

export const EXCLUSION_REASON_DESCRIPTIONS: Record<ExclusionReason, string> = {
  supplier_not_eligible:
    "The transporter is not active, not verified, or does not serve this destination.",
  capacity_insufficient: "The offering seats fewer people than the requirement needs.",
  capacity_unknown:
    "The offering states no capacity, so it cannot be PROVEN to meet the requirement. Unknown is never treated as sufficient.",
  class_mismatch: "The offering is not in the commercial class the requirement names.",
  class_unmappable:
    "The requirement names a commercial class with no fleet category behind it. It is surfaced rather than approximated.",
  class_unresolved: "The offering has not been classified into a commercial class.",
  model_mismatch: "The offering is a different vehicle model from the one required.",
  model_unstated:
    "The offering states no model, so it cannot satisfy a named-model requirement. Unstated is not a match.",
  no_applicable_tariff: "No tariff line prices this offering for this requirement.",
  tariff_not_active: "The tariff has not been approved for use.",
  tariff_lapsed: "The tariff is marked active but its validity has passed.",
  tariff_outside_validity: "The requirement's dates fall outside the tariff's validity.",
  operating_area_unresolved: "The tariff's operating area has not been matched to a destination.",
  operating_area_mismatch: "The tariff prices a different operating area.",
  no_price_for_combination:
    "The transporter answered something other than a price — not offered, on request, or complimentary.",
};

export const TRANSPORT_REFUSAL_CODES = [
  "no_offerings",
  "no_eligible_supplier",
  "no_option_satisfies_capacity",
  "no_option_satisfies_class",
  "no_option_satisfies_model",
  "commercial_class_unmappable",
  "no_applicable_commercial_terms",
  "requirement_incomplete",
] as const;
export type TransportRefusalCode = (typeof TRANSPORT_REFUSAL_CODES)[number];

export type TransportRefusal = {
  code: TransportRefusalCode;
  reason: string;
};

const refuse = (code: TransportRefusalCode, reason: string): TransportRefusal => ({
  code,
  reason,
});

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

/**
 * One commercially applicable choice, with the evidence behind it.
 *
 * `amount` is EVIDENCE, not an ordering key. `rank` is the order a human might
 * work through the list; it is not a recommendation and carries no permission.
 */
export type TransportOption = {
  offeringId: string;
  vendorId: string;
  vendorName: string;

  fleetCategoryRef: string;
  commercialClass?: string;
  model?: string;
  capacity?: number;

  tariffId: string;
  tariffLineId: string;
  pricing: TransportPricing;
  /** COMMERCIALLY SENSITIVE — founder-only, redacted at the data layer. */
  amount?: number;
  currency?: string;
  seasonId?: string;

  /** Surfaced beside the option. NEVER applied to it — see the model header. */
  charges: ConditionalCharge[];

  /** 0–100 from the EXISTING engine, or null when unscored. Never zero-by-default. */
  score: number | null;
  /** Order of CONSIDERATION. Advisory. Never a booking instruction. */
  rank: number;
  /** Null when no contract was supplied to check against. */
  contractInForce: boolean | null;
};

export type ExcludedOption = {
  offeringId: string;
  vendorId: string;
  reason: ExclusionReason;
};

/* ------------------------------------------------------------------ *
 * Hard requirements — the elimination
 * ------------------------------------------------------------------ */

export type HardRequirementOutcome =
  | { satisfied: true }
  | { satisfied: false; reason: ExclusionReason };

/**
 * Does one offering satisfy one hard requirement?
 *
 * ⚠️ EVERY UNKNOWN IS A FAILURE, NEVER A PASS. An offering with no stated
 * capacity does not satisfy a capacity requirement; an offering with no stated
 * model does not satisfy a named-model requirement. Treating unknown as
 * acceptable is how a 26-seater gets sent to a group of forty.
 */
export function satisfiesHardRequirement(
  offering: Pick<TransportOffering, "capacity" | "commercialClass" | "model">,
  requirement: HardRequirement,
): HardRequirementOutcome {
  switch (requirement.kind) {
    case "capacity": {
      if (offering.capacity === undefined) {
        return { satisfied: false, reason: "capacity_unknown" };
      }
      return offering.capacity >= requirement.minSeats
        ? { satisfied: true }
        : { satisfied: false, reason: "capacity_insufficient" };
    }

    case "class": {
      // A class nobody has mapped to a fleet category cannot be checked. Say so
      // rather than approximating — the hotel `boutique` rule, in transport.
      if (isUnmappableCommercialClass(requirement.commercialClass)) {
        return { satisfied: false, reason: "class_unmappable" };
      }
      if (offering.commercialClass === undefined) {
        return { satisfied: false, reason: "class_unresolved" };
      }
      return offering.commercialClass === requirement.commercialClass
        ? { satisfied: true }
        : { satisfied: false, reason: "class_mismatch" };
    }

    case "model": {
      if (offering.model === undefined || offering.model.trim() === "") {
        return { satisfied: false, reason: "model_unstated" };
      }
      // Formatting-insensitive, identity-strict. See `modelsMatch`.
      return modelsMatch(offering.model, requirement.modelText)
        ? { satisfied: true }
        : { satisfied: false, reason: "model_mismatch" };
    }

    case "exclusive":
      // Exclusive use is a property of the ARRANGEMENT, not of the vehicle: any
      // chartered vehicle is exclusive by construction, because BPT is buying
      // the vehicle rather than a seat on it. It eliminates nothing here, and
      // it is carried so a future seat-based supply mode cannot satisfy it.
      return { satisfied: true };
  }
}

/**
 * Keep only the offerings that satisfy EVERY hard requirement.
 *
 * ⚠️ THIS RUNS BEFORE ANY SCORE IS COMPUTED, and it returns a REDUCED SET.
 * A failing offering is absent from the result, so nothing applied afterwards
 * can reintroduce it. Its id and cause go to `excluded`, which is how an
 * operator sees why a supplier they expected is missing.
 */
export function applyHardRequirements(
  offerings: TransportOffering[],
  hardRequirements: HardRequirement[],
): { kept: TransportOffering[]; excluded: ExcludedOption[] } {
  const kept: TransportOffering[] = [];
  const excluded: ExcludedOption[] = [];

  for (const offering of offerings) {
    let failure: ExclusionReason | null = null;
    for (const requirement of hardRequirements) {
      const outcome = satisfiesHardRequirement(offering, requirement);
      if (!outcome.satisfied) {
        failure = outcome.reason;
        break;
      }
    }
    if (failure) {
      excluded.push({ offeringId: offering.id, vendorId: offering.vendorId, reason: failure });
    } else {
      kept.push(offering);
    }
  }

  return { kept, excluded };
}

/* ------------------------------------------------------------------ *
 * Commercial applicability
 * ------------------------------------------------------------------ */

/**
 * Which line on this tariff prices this offering for these dates?
 *
 * Matching is on IDENTITY, never on proximity: a line's category, model,
 * capacity and season must agree with the offering, and a line that states a
 * dimension the offering contradicts does not apply. A line that states nothing
 * about a dimension does not constrain it.
 */
function applicableLine(
  tariff: TransportTariff,
  offering: TransportOffering,
  at: Date,
): TariffLine | undefined {
  return tariff.lines.find((line) => {
    if (!isPricedLine(line)) return false;

    if (
      line.fleetCategoryRef.trim() !== "" &&
      offering.fleetCategoryRef.trim() !== "" &&
      line.fleetCategoryRef.trim().toLowerCase() !== offering.fleetCategoryRef.trim().toLowerCase()
    ) {
      return false;
    }

    if (line.commercialClass !== undefined && offering.commercialClass !== undefined) {
      if (line.commercialClass !== offering.commercialClass) return false;
    }

    if (line.model !== undefined && offering.model !== undefined) {
      if (!modelsMatch(line.model, offering.model)) return false;
    }

    if (line.capacity !== undefined && offering.capacity !== undefined) {
      if (line.capacity !== offering.capacity) return false;
    }

    if (line.seasonId !== undefined) {
      const season = tariff.seasons.find((s) => s.id === line.seasonId);
      if (!season) return false;
      const start = new Date(season.startDate).getTime();
      const end = new Date(season.endDate).getTime();
      const t = at.getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return false;
      if (t < start || t > end) return false;
    }

    return true;
  });
}

/* ------------------------------------------------------------------ *
 * Proposal
 * ------------------------------------------------------------------ */

export type TransportOptionProposal = {
  requirementId: string;

  /**
   * ⚠️ THE REQUIREMENTS TRAVEL WITH THE PROPOSAL, AND THAT IS THE WHOLE POINT.
   *
   * M8's audit found `exactHotelId` was read once from the requirement and then
   * dropped, which left every later check comparing by RANK POSITION —
   * `candidates[0]` — instead of by identity. Rank is a supplier quality
   * ordering with no relationship to what was promised, so the two agreed only
   * by coincidence, and when they disagreed the result was either a silent
   * substitution or a false refusal.
   *
   * Carrying them here means a later consumer can re-check by identity rather
   * than trusting that a filter ran.
   */
  hardRequirements: HardRequirement[];

  /** Commercially applicable options, in order of consideration. */
  candidates: TransportOption[];
  /** What was removed, and why. Internal operational data. */
  excluded: ExcludedOption[];
  /** The commitment question. Unfilled whenever no transporter has committed. */
  acceptance: AcceptanceSlot;
  /** Why nothing may be put to anyone. Null only when options survived. */
  refusal: TransportRefusal | null;
  /**
   * True only when a human may consider these options.
   *
   * ⚠️ DELIBERATELY NOT `allocatable` AND NOT `selected`. M10 allocates
   * nothing and selects nothing. This says a person may look; it grants no
   * permission to book, and nothing downstream may read it as one.
   */
  proposable: boolean;
};

export type ProposalInput = {
  requirement: TransportRequirementQuery;
  /** Offerings to consider. Usually every offering for the destination. */
  offerings: TransportOffering[];
  /** Supplier records for those offerings. Ranking reuses the vendor engine. */
  vendors: VendorRecord[];
  /** Tariffs to price against. Only ACTIVE ones can produce an option. */
  tariffs: TransportTariff[];
  /** Contracts by id, for the in-force check. Absent entries report null. */
  contracts?: Record<string, { inForce: boolean }>;
  now?: Date;
};

/**
 * Assemble the commercial options for a requirement, and refuse when there are
 * none.
 *
 * The order matters and mirrors the four selection steps. Hard requirements are
 * applied before eligibility so an operator sees "no Innova Crysta exists"
 * rather than "no supplier was eligible", which are different problems with
 * different fixes.
 */
export function proposeTransportOptions(input: ProposalInput): TransportOptionProposal {
  const { requirement, offerings, vendors, tariffs } = input;
  const now = input.now ?? new Date();
  const contracts = input.contracts ?? {};
  const at = new Date(requirement.dateFrom);

  const base = {
    requirementId: requirement.id,
    hardRequirements: requirement.hardRequirements,
  };

  const unfilled = (reason: string): AcceptanceSlot => ({ filled: false, reason });
  const noCommitment = unfilled(
    "No transporter has been asked. A commercial option is not a commitment.",
  );

  if (!requirement.dateFrom || !requirement.dateTo || Number.isNaN(at.getTime())) {
    return {
      ...base,
      candidates: [],
      excluded: [],
      acceptance: unfilled("The requirement is incomplete."),
      refusal: refuse(
        "requirement_incomplete",
        "The requirement states no usable dates. A transport rate cannot be applied without knowing when the operation runs.",
      ),
      proposable: false,
    };
  }

  if (offerings.length === 0) {
    return {
      ...base,
      candidates: [],
      excluded: [],
      acceptance: noCommitment,
      refusal: refuse(
        "no_offerings",
        "No transport offerings were supplied to consider. Nothing is on record for this destination.",
      ),
      proposable: false,
    };
  }

  // A class requirement naming an unmappable class is refused up front rather
  // than silently eliminating everything — the two look identical in a
  // candidate list, and only one of them is the operator's fault.
  const unmappable = requirement.hardRequirements.find(
    (r) => r.kind === "class" && isUnmappableCommercialClass(r.commercialClass),
  );
  if (unmappable && unmappable.kind === "class") {
    return {
      ...base,
      candidates: [],
      excluded: [],
      acceptance: noCommitment,
      refusal: refuse(
        "commercial_class_unmappable",
        `The commercial class "${unmappable.commercialClass}" has no fleet category behind it, so no offering can be checked against it. Surfacing this is deliberate: approximating it would put a different kind of vehicle against a class somebody sold.`,
      ),
      proposable: false,
    };
  }

  /* -- 1. HARD REQUIREMENTS. Eliminate before anything is scored. -- */
  const { kept: conforming, excluded } = applyHardRequirements(
    offerings,
    requirement.hardRequirements,
  );

  if (conforming.length === 0) {
    const reasons = new Set(excluded.map((e) => e.reason));
    const code: TransportRefusalCode = reasons.has("model_mismatch") || reasons.has("model_unstated")
      ? "no_option_satisfies_model"
      : reasons.has("capacity_insufficient") || reasons.has("capacity_unknown")
        ? "no_option_satisfies_capacity"
        : "no_option_satisfies_class";
    return {
      ...base,
      candidates: [],
      excluded,
      acceptance: noCommitment,
      refusal: refuse(
        code,
        "No offering satisfies the stated hard requirements. A near match is not offered, because substituting a different vehicle for one that was required is exactly what this gate exists to prevent.",
      ),
      proposable: false,
    };
  }

  /* -- 2. ELIGIBILITY. Reuse the existing vendor engine. -- */
  const eligible = new Map(
    proposeVendors(vendors, {
      type: "transport",
      ...(requirement.destinationId ? { destination: requirement.destinationId } : {}),
    }).map((p) => [p.vendorId, p]),
  );

  const afterEligibility: TransportOffering[] = [];
  for (const offering of conforming) {
    if (eligible.has(offering.vendorId)) {
      afterEligibility.push(offering);
    } else {
      excluded.push({
        offeringId: offering.id,
        vendorId: offering.vendorId,
        reason: "supplier_not_eligible",
      });
    }
  }

  if (afterEligibility.length === 0) {
    return {
      ...base,
      candidates: [],
      excluded,
      acceptance: noCommitment,
      refusal: refuse(
        "no_eligible_supplier",
        "Every conforming offering belongs to a transporter who is not active, not verified, or does not serve this destination.",
      ),
      proposable: false,
    };
  }

  /* -- 3. COMMERCIAL APPLICABILITY. -- */
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const priced: Omit<TransportOption, "rank">[] = [];

  for (const offering of afterEligibility) {
    const forVendor = tariffs.filter((t) => t.vendorId === offering.vendorId);

    let matched = false;
    let lastReason: ExclusionReason = "no_applicable_tariff";

    for (const tariff of forVendor) {
      if (tariff.status !== "active") {
        lastReason = "tariff_not_active";
        continue;
      }
      if (isTariffLapsed(tariff, now)) {
        lastReason = "tariff_lapsed";
        continue;
      }
      if (!isDateInValidity(tariff, at)) {
        lastReason = "tariff_outside_validity";
        continue;
      }
      if (!tariff.operatingAreaId || tariff.operatingAreaId.trim() === "") {
        lastReason = "operating_area_unresolved";
        continue;
      }
      if (requirement.destinationId && tariff.operatingAreaId !== requirement.destinationId) {
        lastReason = "operating_area_mismatch";
        continue;
      }

      const line = applicableLine(tariff, offering, at);
      if (!line) {
        // Distinguish "no row at all" from "a row that answered something other
        // than a price". They are different supplier facts.
        const answered = tariff.lines.some(
          (l) =>
            l.fleetCategoryRef.trim().toLowerCase() ===
              offering.fleetCategoryRef.trim().toLowerCase() && !isPricedLine(l),
        );
        lastReason = answered ? "no_price_for_combination" : "no_applicable_tariff";
        continue;
      }

      const vendor = vendorById.get(offering.vendorId);
      const contract = tariff.contractId ? contracts[tariff.contractId] : undefined;

      priced.push({
        offeringId: offering.id,
        vendorId: offering.vendorId,
        vendorName: offering.vendorName,
        fleetCategoryRef: offering.fleetCategoryRef,
        ...(offering.commercialClass !== undefined
          ? { commercialClass: offering.commercialClass }
          : {}),
        ...(offering.model !== undefined ? { model: offering.model } : {}),
        ...(offering.capacity !== undefined ? { capacity: offering.capacity } : {}),
        tariffId: tariff.id,
        tariffLineId: line.id,
        pricing: line.pricing,
        ...(line.amount !== undefined ? { amount: line.amount } : {}),
        ...(tariff.currency !== undefined ? { currency: tariff.currency } : {}),
        ...(line.seasonId !== undefined ? { seasonId: line.seasonId } : {}),
        charges: tariff.charges,
        score: vendor ? scoreTransporter(vendor) : null,
        contractInForce: contract ? contract.inForce : null,
      });
      matched = true;
      break;
    }

    if (!matched) {
      excluded.push({
        offeringId: offering.id,
        vendorId: offering.vendorId,
        reason: lastReason,
      });
    }
  }

  if (priced.length === 0) {
    return {
      ...base,
      candidates: [],
      excluded,
      acceptance: noCommitment,
      refusal: refuse(
        "no_applicable_commercial_terms",
        "Conforming offerings exist, but no active tariff prices any of them for this operating area and these dates.",
      ),
      proposable: false,
    };
  }

  /* -- 4. RANK. Tie-break only, and never on cost. -- */
  const ordered = [...priced]
    .map((option, index) => ({ option, index }))
    .sort((a, b) => {
      const left = a.option.score ?? -1;
      const right = b.option.score ?? -1;
      if (left !== right) return right - left;
      // Stable: equal scores keep the order they arrived in. Deterministic
      // output matters more than any tie-breaking cleverness, and sorting a tie
      // by amount is exactly the cost ordering this module refuses to have.
      return a.index - b.index;
    })
    .map(({ option }, i): TransportOption => ({ ...option, rank: i + 1 }));

  return {
    ...base,
    candidates: ordered,
    excluded,
    acceptance: noCommitment,
    refusal: null,
    proposable: true,
  };
}

/**
 * Score a transporter for supply work using the EXISTING engine.
 *
 * Uses the vendor's stored `qualityScore` when there is one; otherwise asks
 * `computeQualityScore` with the inputs the vendor record actually carries,
 * rather than inventing a default. The engine returns null when it has nothing
 * to work with, and that null is preserved — null means "not enough data to
 * score", never "scored zero".
 *
 * ponytail: duplicates the six-line fallback in `hotels/allocation.ts`
 * `scoreSupplier`. Importing that would create the first runtime edge from
 * another domain into lib/hotels; lifting it to lib/vendor/ranking.ts is the
 * right fix and needs its own approval to touch M8/M1.
 */
export function scoreTransporter(vendor: VendorRecord): number | null {
  if (vendor.qualityScore !== null) return vendor.qualityScore;
  return computeQualityScore({
    ...(typeof vendor.avgResponseMins === "number"
      ? { avgResponseMins: vendor.avgResponseMins }
      : {}),
    ...(typeof vendor.googleRating === "number" ? { reviewAvg: vendor.googleRating } : {}),
  });
}

/* ------------------------------------------------------------------ *
 * Requests
 * ------------------------------------------------------------------ */

export type BuildRequestResult =
  | { ok: true; request: TransportRequest }
  | { ok: false; error: string };

/**
 * Turn one option into a request BPT could put to a transporter.
 *
 * ⚠️ THE ASKED SCOPE IS CAPTURED WHOLE, INCLUDING THE HARD REQUIREMENTS.
 * A request that cannot be reproduced cannot be the thing that was accepted —
 * six months later "they agreed" means nothing without what they agreed to. So
 * the scope is recorded here and never recomputed from a tariff that may have
 * moved since.
 *
 * ⚠️ THIS SENDS NOTHING. `ACCEPTANCE_CHANNELS_ENABLED` is empty. The request is
 * a `draft` and stays one until something that does not exist yet transmits it.
 */
export function buildRequest(
  proposal: TransportOptionProposal,
  option: TransportOption,
  requirement: TransportRequirementQuery,
  tariff: TransportTariff,
  id: string,
): BuildRequestResult {
  if (proposal.refusal) {
    return {
      ok: false,
      error: `This proposal was refused (${proposal.refusal.code}). A refused proposal cannot produce a request.`,
    };
  }
  if (!proposal.candidates.some((c) => c.offeringId === option.offeringId)) {
    return {
      ok: false,
      error:
        "That option is not among this proposal's candidates. Requesting an option that was eliminated would bypass the hard requirements that eliminated it.",
    };
  }
  if (tariff.id !== option.tariffId) {
    return {
      ok: false,
      error: "The tariff supplied is not the one this option was priced from.",
    };
  }

  const requested: RequestedScope = {
    dateFrom: requirement.dateFrom,
    dateTo: requirement.dateTo,
    operatingAreaRef: tariff.operatingAreaRef,
    fleetCategoryRef: option.fleetCategoryRef,
    ...(option.commercialClass !== undefined
      ? { commercialClass: option.commercialClass }
      : {}),
    ...(option.model !== undefined ? { model: option.model } : {}),
    ...(option.capacity !== undefined ? { capacity: option.capacity } : {}),
    ...(option.pricing.kind === "scope" ? { scopeRef: option.pricing.scopeRef } : {}),
    hardRequirements: proposal.hardRequirements,
  };

  return {
    ok: true,
    request: {
      id,
      requirementId: requirement.id,
      vendorId: option.vendorId,
      offeringId: option.offeringId,
      tariffId: option.tariffId,
      tariffLineId: option.tariffLineId,
      state: "draft",
      requested,
    },
  };
}

export type RecordResponseResult =
  | { ok: true; request: TransportRequest }
  | { ok: false; error: string };

/**
 * Record what a transporter answered.
 *
 * ⚠️ ONLY A `sent` REQUEST CAN BE ANSWERED. Recording an answer to a request
 * that was never put to anyone would create a commitment out of nothing.
 *
 * ⚠️ AN ACCEPTANCE REQUIRES A REFERENCE. An acceptance nobody can produce is
 * not evidence of one, and the whole value of this record is that a later
 * dispute can be settled against what the transporter actually said.
 *
 * ⚠️ NO APPROVER IS STORED. Who at BPT decided to send this, and who accepted
 * the answer, cannot be recorded — there is no audit log, and a stored approver
 * would be an unverifiable record that looks like proof. Same position as
 * `activateTariff`.
 */
export function recordResponse(
  request: TransportRequest,
  response: {
    outcome: "accepted" | "declined";
    at: string;
    reference?: string;
    note?: string;
    rateOutcome?: TransportRateOutcome;
  },
): RecordResponseResult {
  if (request.state !== "sent") {
    return {
      ok: false,
      error: `Only a sent request can be answered; this one is ${request.state}.`,
    };
  }
  if (response.outcome === "accepted" && !response.reference?.trim()) {
    return {
      ok: false,
      error:
        "An acceptance must carry the transporter's own reference. An acceptance nobody can produce is not evidence of one.",
    };
  }

  return {
    ok: true,
    request: {
      ...request,
      state: response.outcome === "accepted" ? "accepted" : "declined",
      response: {
        outcome: response.outcome,
        at: response.at,
        ...(response.reference ? { reference: response.reference } : {}),
        ...(response.note ? { note: response.note } : {}),
        ...(response.rateOutcome ? { rateOutcome: response.rateOutcome } : {}),
      },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Assignment conflicts
 * ------------------------------------------------------------------ */

export type AssignmentConflict = {
  candidateId: string;
  conflictsWith: string;
  registration: string;
  reason: "same_vehicle_overlapping_window";
};

/** Do two inclusive date windows overlap? */
function overlaps(a: { from: string; to: string }, b: { from: string; to: string }): boolean {
  const aFrom = new Date(a.from).getTime();
  const aTo = new Date(a.to).getTime();
  const bFrom = new Date(b.from).getTime();
  const bTo = new Date(b.to).getTime();
  if ([aFrom, aTo, bFrom, bTo].some(Number.isNaN)) return false;
  return aFrom <= bTo && bFrom <= aTo;
}

/** Registration comparison ignores spacing and case, never identity. */
function normalizeRegistration(value: string): string {
  return value.replace(/[\s-]+/g, "").toUpperCase();
}

/**
 * Is this vehicle already committed to an overlapping BPT operation?
 *
 * ⚠️ THE CLAIM THIS MAKES IS NARROW, AND `CONFLICT_SCOPE` SAYS SO.
 * It detects the same registration committed to two overlapping BPT
 * assignments. A transporter who commits the same vehicle to a BPT trip and to
 * a non-BPT trip creates a conflict NO data BPT holds can detect — that would
 * need the transporter's whole order book. No surface may describe this as
 * "prevents double-booking".
 *
 * Only live assignments occupy a vehicle: a cancelled or superseded one has
 * released it, and treating those as conflicts would block legitimate
 * replacements.
 */
export function findAssignmentConflicts(
  assignments: TransportAssignment[],
  candidate: TransportAssignment,
): AssignmentConflict[] {
  const registration = candidate.vehicle?.registration;
  if (!registration || registration.trim() === "") return [];
  if (!LIVE_ASSIGNMENT_STATES.includes(candidate.state)) return [];

  const target = normalizeRegistration(registration);

  return assignments
    .filter((existing) => {
      if (existing.id === candidate.id) return false;
      // A replacement does not conflict with what it replaces.
      if (candidate.supersedes === existing.id) return false;
      if (!LIVE_ASSIGNMENT_STATES.includes(existing.state)) return false;
      const reg = existing.vehicle?.registration;
      if (!reg || normalizeRegistration(reg) !== target) return false;
      return overlaps(existing.window, candidate.window);
    })
    .map((existing) => ({
      candidateId: candidate.id,
      conflictsWith: existing.id,
      registration,
      reason: "same_vehicle_overlapping_window" as const,
    }));
}

/* ------------------------------------------------------------------ *
 * Redaction
 * ------------------------------------------------------------------ */

export type TransportOptionView = Omit<TransportOption, "amount" | "charges"> & {
  amount?: number;
  charges: (Omit<ConditionalCharge, "amount"> & { amount?: number })[];
  amountRedacted: boolean;
};

export type TransportOptionProposalView = Omit<TransportOptionProposal, "candidates"> & {
  candidates: TransportOptionView[];
  amountsRedacted: boolean;
};

/**
 * A proposal as a given actor may see it.
 *
 * The `amount` KEY is physically ABSENT for unauthorised actors, so it cannot
 * survive JSON serialisation. `excluded` is retained for every staff actor and
 * is INTERNAL FOREVER — a transporter never learns they were passed over, and a
 * customer never learns which suppliers were considered.
 */
export function redactProposal(
  proposal: TransportOptionProposal,
  actor: DocumentActor,
): TransportOptionProposalView {
  const allowed = canViewTariffAmounts(actor);
  let withheld = false;

  const candidates: TransportOptionView[] = proposal.candidates.map((option) => {
    const charges = option.charges.map((charge) => {
      const { amount, ...chargeRest } = charge;
      if (allowed) {
        return amount === undefined ? { ...chargeRest } : { ...chargeRest, amount };
      }
      if (amount !== undefined) withheld = true;
      return { ...chargeRest };
    });

    const { amount, ...rest } = option;
    if (allowed) {
      return amount === undefined
        ? { ...rest, charges, amountRedacted: false }
        : { ...rest, amount, charges, amountRedacted: false };
    }
    if (amount !== undefined) withheld = true;
    return { ...rest, charges, amountRedacted: amount !== undefined };
  });

  return { ...proposal, candidates, amountsRedacted: withheld };
}

/**
 * What a customer may be told about their transport.
 *
 * Category and capacity are the STANDARD that was sold and are safe to state.
 * The registration, the driver and the transporter's identity are withheld
 * here: naming a vehicle before it is committed creates a promise a routine
 * replacement then breaks, and naming the supplier invites disintermediation of
 * a curated network. Releasing them is a disclosure decision for a future
 * booking layer, gated on state AND ownership — the rule M8 arrived at after
 * gating on state alone let every customer read every confirmed allocation.
 */
export type CustomerFacingTransport = {
  fleetCategoryRef: string;
  commercialClass?: string;
  capacity?: number;
  identityWithheld: true;
};

export function toCustomerFacingAssignment(
  assignment: TransportAssignment,
): CustomerFacingTransport {
  return {
    fleetCategoryRef: assignment.vehicle?.fleetCategoryRef ?? "",
    ...(assignment.vehicle?.capacity !== undefined
      ? { capacity: assignment.vehicle.capacity }
      : {}),
    identityWithheld: true,
  };
}
