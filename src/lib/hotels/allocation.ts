/**
 * Allocation — refusal-first hotel proposal.
 *
 * Given a booking's requirement and the properties that could satisfy it, this
 * produces a RANKED PROPOSAL and then refuses to allocate, because availability
 * cannot be established by anything in the platform today.
 *
 * That refusal is the deliverable, not a limitation of it. Hotel allocation is
 * currently done from memory and phone calls; the failure mode being designed
 * out is a property committed to a customer BEFORE availability is confirmed,
 * where BPT absorbs the upgrade, the refund or the reputational cost when the
 * hotel turns out to be full. A system that guesses is worse than one that says
 * "I cannot answer that yet" — so this one says so, in a typed way a console
 * and a future workflow can both act on.
 *
 * SELECTION IS ELIMINATION FIRST, RANKING SECOND
 *   1. FILTER eligibility   `category.ts` — hard, in the data
 *   2. PROVE availability   `capacity.ts` — hard, and currently unprovable
 *   3. VALIDATE rate        `rate-reference.ts` — hard, delegated to M4/M7
 *   4. RANK                 tie-break only, via the EXISTING quality engine
 *
 * Steps 1–3 are eliminations. A preferred supplier that fails step 2 is
 * REMOVED, not demoted. Rank never overrides availability — priority determines
 * the order of attempt and nothing else, and a top-ranked candidate on a list
 * is not a recommendation to book.
 *
 * REUSE, NOT REBUILD
 * `proposeVendors` and `computeQualityScore` already exist, are pure, and
 * already refuse to fabricate a score when data is missing. This module calls
 * them. A second ranking engine would be a defect, not an alternative.
 *
 * ⚠️ WHAT THIS MODULE NEVER DOES
 * Fabricate availability · infer availability from a room count · write a
 * booking · confirm a hotel · substitute an EXACT property · persist anything.
 */
import {
  canAllocateAgainst,
  currentAvailability,
  unknownAvailability,
  type AvailabilityResult,
} from "@/lib/hotels/capacity";
import {
  packageCategoryForHotel,
  resolveHotelCandidates,
  type CandidateExclusionReason,
} from "@/lib/hotels/category";
import {
  allowsSubstitution,
  redactAllocation,
  type CommitmentType,
  type HotelAllocation,
  type HotelAllocationView,
  type HotelRecord,
} from "@/lib/hotels/model";
import type { SupplyRequirement } from "@/lib/hotels/supply";
import { proposeVendors } from "@/lib/vendor/assignment";
import { computeQualityScore } from "@/lib/vendor/ranking";
import type { VendorRecord } from "@/lib/vendor/model";
import type { DocumentActor } from "@/lib/documents/permissions";

/* ------------------------------------------------------------------ *
 * The unfillable slot
 * ------------------------------------------------------------------ */

/**
 * The availability question a proposal cannot answer.
 *
 * A proposal has a SLOT where proven availability belongs. In M8 that slot is
 * always empty, because no channel, provider or record can fill it — and
 * modelling it as an explicit hole is what stops a later milestone from
 * quietly treating "no answer" as "yes". `filled` is a discriminant, so a
 * caller cannot read `evidence` without first proving the slot was filled.
 */
export type AvailabilitySlot =
  | {
      filled: false;
      /** The best-known status. UNKNOWN or RECHECK_REQUIRED, never AVAILABLE. */
      result: AvailabilityResult;
      reason: string;
    }
  | {
      filled: true;
      result: AvailabilityResult;
      /** Non-null by construction — an empty ref cannot fill a slot. */
      evidenceRef: string;
    };

/**
 * Turn an availability answer into a slot. The ONLY way a slot becomes filled
 * is `canAllocateAgainst` — positive evidence, from an evidence-bearing source,
 * with a reference, an observation time and an unexpired expiry.
 */
export function toAvailabilitySlot(
  result: AvailabilityResult,
  now: Date = new Date(),
): AvailabilitySlot {
  const current = currentAvailability(result, now);
  if (canAllocateAgainst(current, now) && current.evidenceRef) {
    return { filled: true, result: current, evidenceRef: current.evidenceRef };
  }
  return {
    filled: false,
    result: current,
    reason: current.reason,
  };
}

/* ------------------------------------------------------------------ *
 * Ranked candidates
 * ------------------------------------------------------------------ */

/**
 * One property BPT could ask about, with the supplier's standing attached.
 *
 * `availability` is carried per candidate and defaults to UNKNOWN. `score` is
 * whatever the existing ranking engine returned — including `null`, which means
 * "not enough data to score", never "scored zero".
 */
export type RankedHotelCandidate = {
  hotelId: string;
  hotelName: string;
  vendorId: string;
  vendorName: string;
  /** 0–100 from the existing quality engine, or null when unscored. */
  score: number | null;
  /** Order of ATTEMPT. Not a recommendation, not a guarantee. */
  rank: number;
  reason: string;
  availability: AvailabilityResult;
};

/**
 * Score a supplier for supply work using the EXISTING engine.
 *
 * Uses the vendor's stored `qualityScore` when there is one. When there is not,
 * it asks `computeQualityScore` with the inputs the vendor record actually
 * carries — response speed and the public rating — rather than inventing a
 * default. The engine returns null when it has nothing to work with, and that
 * null is preserved all the way to the console.
 */
export function scoreSupplier(vendor: VendorRecord): number | null {
  if (vendor.qualityScore !== null) return vendor.qualityScore;
  return computeQualityScore({
    ...(typeof vendor.avgResponseMins === "number"
      ? { avgResponseMins: vendor.avgResponseMins }
      : {}),
    ...(typeof vendor.googleRating === "number" ? { reviewAvg: vendor.googleRating } : {}),
  });
}

/* ------------------------------------------------------------------ *
 * Refusal
 * ------------------------------------------------------------------ */

/**
 * Why an allocation cannot be made. Each code maps to a real gate, so an
 * operator reads a cause rather than an empty screen — "why", not just "that".
 */
export const ALLOCATION_REFUSAL_CODES = [
  "no_candidates",
  "no_eligible_supplier",
  "availability_unknown",
  "availability_unavailable",
  "availability_expired",
  "exact_hotel_not_a_candidate",
  "exact_substitution_forbidden",
  "category_unresolved",
  "requirement_incomplete",
  "wrong_supply_kind",
] as const;
export type AllocationRefusalCode = (typeof ALLOCATION_REFUSAL_CODES)[number];

export type AllocationRefusal = {
  code: AllocationRefusalCode;
  reason: string;
  /** Which auto-complete gate this failure belongs to, where one applies. */
  gate?: string;
};

const refuse = (
  code: AllocationRefusalCode,
  reason: string,
  gate?: string,
): AllocationRefusal => ({ code, reason, ...(gate ? { gate } : {}) });

/* ------------------------------------------------------------------ *
 * Proposal
 * ------------------------------------------------------------------ */

export type AllocationProposal = {
  requirementId: string;
  bookingId: string;
  commitmentType: CommitmentType;
  /**
   * When EXACT: the property that was actually sold.
   *
   * ⚠️ THIS IS THE PROMISE, AND IT MUST TRAVEL WITH THE PROPOSAL. It was
   * previously read once from the requirement and then dropped, which left
   * every later check comparing by RANK POSITION — `candidates[0]` — instead of
   * by identity. Rank is a supplier quality ordering; it has no relationship to
   * which property was sold, so the two agreed only by coincidence. When they
   * disagreed the result was either a silent substitution (a different property
   * allocated against a named promise) or a false refusal (the promised
   * property available, and refused for not being ranked first).
   *
   * Absent on a CATEGORY_SIMILAR proposal, where no property was promised.
   */
  exactHotelId?: string;
  /** Who the booking is for, carried through so the allocation can be owner-scoped. */
  customerId?: string;
  /** Ranked order of ATTEMPT. Advisory. Never a booking instruction. */
  candidates: RankedHotelCandidate[];
  /** Properties eliminated, with cause. Internal operational data. */
  excluded: { hotelId: string; reason: CandidateExclusionReason | "supplier_not_eligible" }[];
  /** The availability question. Unfilled whenever no evidence exists. */
  slot: AvailabilitySlot;
  /** Why nothing may be allocated. Null only when every gate passed. */
  refusal: AllocationRefusal | null;
  /** True only when an allocation could legitimately be made right now. */
  allocatable: boolean;
};

export type ProposalInput = {
  requirement: SupplyRequirement;
  /** Properties to consider. Usually every published hotel for the destination. */
  hotels: HotelRecord[];
  /** Supplier records for those properties. Ranking reuses the vendor engine. */
  vendors: VendorRecord[];
  /**
   * Availability by hotel id, from whatever evidence source a FUTURE milestone
   * supplies. Absent entries default to UNKNOWN — which is the case in M8 for
   * every property, because no source exists.
   */
  availability?: Record<string, AvailabilityResult>;
  now?: Date;
};

/**
 * Propose properties for a requirement, and refuse to allocate.
 *
 * The order matters and mirrors the four selection steps. Eligibility is
 * settled before availability is consulted, so an ineligible property is never
 * asked about; availability is consulted before ranking, so a high-scoring
 * supplier with no proven room cannot rise to the top and look like an answer.
 */
export function proposeAllocation(input: ProposalInput): AllocationProposal {
  const { requirement, hotels, vendors } = input;
  const now = input.now ?? new Date();
  const availability = input.availability ?? {};

  const base = {
    requirementId: requirement.id,
    bookingId: requirement.bookingId,
    commitmentType: requirement.commitmentType,
    // Carried on EVERY return path, including the refusals — a refusal that
    // cannot say which property was promised is not much of an audit record.
    ...(requirement.exactHotelId !== undefined
      ? { exactHotelId: requirement.exactHotelId }
      : {}),
    ...(requirement.customerId !== undefined ? { customerId: requirement.customerId } : {}),
  };

  /* ---- 0. the requirement itself has to make sense ---- */

  if (requirement.kind !== "hotel") {
    return {
      ...base,
      candidates: [],
      excluded: [],
      slot: emptySlot("This requirement is not for hotel supply."),
      refusal: refuse(
        "wrong_supply_kind",
        `Requirement kind "${requirement.kind}" is not hotel supply. Activity and transport supply are later milestones and have no model to allocate against.`,
      ),
      allocatable: false,
    };
  }

  if (!requirement.category) {
    return {
      ...base,
      candidates: [],
      excluded: [],
      slot: emptySlot("No package category is set on the requirement."),
      refusal: refuse(
        "category_unresolved",
        "The requirement carries no package hotel category, so no candidate set can be resolved. A category that could not be mapped — boutique, for instance — is surfaced rather than assumed.",
        "category_matches",
      ),
      allocatable: false,
    };
  }

  if (!requirement.dateFrom || !requirement.dateTo) {
    return {
      ...base,
      candidates: [],
      excluded: [],
      slot: emptySlot("The requirement has no travel dates."),
      refusal: refuse(
        "requirement_incomplete",
        "The requirement has no date range. Availability is a fact about dates, so without them there is nothing to establish.",
        "dates_match_exactly",
      ),
      allocatable: false,
    };
  }

  /* ---- 1. FILTER — hard eligibility ---- */

  const resolution = resolveHotelCandidates(hotels, {
    category: requirement.category,
    ...(requirement.destinationId ? { destinationId: requirement.destinationId } : {}),
  });

  const excluded: AllocationProposal["excluded"] = resolution.excluded.map((e) => ({
    hotelId: e.hotelId,
    reason: e.reason,
  }));

  if (resolution.candidates.length === 0) {
    return {
      ...base,
      candidates: [],
      excluded,
      slot: emptySlot("No property is eligible, so there is nothing to ask about."),
      refusal: refuse(
        "no_candidates",
        `No published, supplier-linked property matches category "${requirement.category}"${
          requirement.destinationId ? " in the requested destination" : ""
        }.`,
      ),
      allocatable: false,
    };
  }

  /* ---- 1b. the supplier behind each property must be eligible too ---- */

  // Reuse the existing proposal engine for supplier eligibility AND ordering,
  // rather than re-deciding what "eligible supplier" means.
  const vendorsById = new Map(vendors.map((v) => [v.id, v]));
  const candidateVendors = [
    ...new Map(
      resolution.candidates
        .map((h) => vendorsById.get(h.vendorId as string))
        .filter((v): v is VendorRecord => v !== undefined)
        .map((v) => [v.id, v]),
    ).values(),
  ];

  const rankedVendors = proposeVendors(candidateVendors, {
    type: "hotel",
    ...(requirement.destinationId ? { destination: requirement.destinationId } : {}),
  });
  const vendorRank = new Map(rankedVendors.map((p, i) => [p.vendorId, i]));

  const eligible = resolution.candidates.filter((h) => vendorRank.has(h.vendorId as string));
  for (const hotel of resolution.candidates) {
    if (!vendorRank.has(hotel.vendorId as string)) {
      excluded.push({ hotelId: hotel.id, reason: "supplier_not_eligible" });
    }
  }

  if (eligible.length === 0) {
    return {
      ...base,
      candidates: [],
      excluded,
      slot: emptySlot("No eligible supplier stands behind any matching property."),
      refusal: refuse(
        "no_eligible_supplier",
        "Matching properties exist, but none has an active, verified supplier able to be asked. An unverified or inactive supplier is removed, not demoted.",
        "supplier_identity_verified",
      ),
      allocatable: false,
    };
  }

  /* ---- 2 + 4. availability per candidate, then rank as tie-break ---- */

  const candidates: RankedHotelCandidate[] = eligible
    .map((hotel) => {
      const vendor = vendorsById.get(hotel.vendorId as string) as VendorRecord;
      const known = availability[hotel.id];
      const result = currentAvailability(
        known ??
          unknownAvailability(
            "No availability evidence exists for this property. Nothing in the platform records whether a room is free on these dates.",
          ),
        now,
      );
      const score = scoreSupplier(vendor);
      return {
        hotelId: hotel.id,
        hotelName: hotel.name,
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        score,
        rank: 0,
        reason:
          score === null
            ? "Eligible property; supplier not yet scored. Order of attempt only."
            : `Eligible property; supplier quality score ${score}. Order of attempt only.`,
        availability: result,
      };
    })
    .sort((a, b) => {
      const byScore = (b.score ?? -1) - (a.score ?? -1);
      if (byScore !== 0) return byScore;
      // Stable, explainable tie-break so the same input always ranks the same.
      return a.hotelId.localeCompare(b.hotelId);
    })
    .map((c, i) => ({ ...c, rank: i + 1 }));

  /* ---- 3. EXACT commitment is checked before anything is proposed ---- */

  if (requirement.commitmentType === "EXACT") {
    const exactId = requirement.exactHotelId;
    if (!exactId) {
      return {
        ...base,
        candidates,
        excluded,
        slot: emptySlot("An EXACT commitment names no property."),
        refusal: refuse(
          "requirement_incomplete",
          "The requirement is an EXACT commitment but names no property. An exact promise with no property recorded cannot be honoured or checked.",
          "commitment_type_respected",
        ),
        allocatable: false,
      };
    }
    if (!candidates.some((c) => c.hotelId === exactId)) {
      return {
        ...base,
        candidates,
        excluded,
        slot: emptySlot("The exactly promised property is not an eligible candidate."),
        refusal: refuse(
          "exact_hotel_not_a_candidate",
          "This booking promised one named property, and that property is not currently eligible. Substituting another is never automatic — a sold guarantee cannot be varied operationally, so this is a founder decision.",
          "commitment_type_respected",
        ),
        allocatable: false,
      };
    }
  }

  /* ---- the availability gate ---- */

  // ⚠️ AN EXACT COMMITMENT ASKS ABOUT ONE PROPERTY, NOT THE FIELD.
  //
  // Ranking orders the properties BPT would try when it is free to choose. An
  // EXACT commitment removed that freedom at the moment of sale, so scanning
  // the ranked list here answers a question nobody asked: it reports the
  // proposal allocatable, and fills the slot with a DIFFERENT property's
  // availability evidence, whenever some higher-ranked hotel happens to be
  // free. Narrowing the field to the promised property is what makes the
  // refusal below true — and what makes a filled slot mean what it says.
  const inPlay =
    requirement.commitmentType === "EXACT"
      ? candidates.filter((c) => c.hotelId === requirement.exactHotelId)
      : candidates;

  const best = inPlay.find((c) => canAllocateAgainst(c.availability, now));

  if (!best) {
    const anyRecheck = inPlay.some((c) => c.availability.status === "RECHECK_REQUIRED");
    const allUnavailable =
      inPlay.length > 0 && inPlay.every((c) => c.availability.status === "UNAVAILABLE");

    // The wording follows what was actually asked about. On an EXACT
    // commitment that is ONE property, and saying "every eligible property"
    // would tell an operator the field was exhausted when it was never in play.
    const scope =
      requirement.commitmentType === "EXACT"
        ? "the exactly promised property"
        : "every eligible property";

    const [code, reason, gate]: [AllocationRefusalCode, string, string] = allUnavailable
      ? [
          "availability_unavailable",
          `Availability was explicitly refused by ${scope} — it cannot take this booking.`,
          "evidence_valid_and_fresh",
        ]
      : anyRecheck
        ? [
            "availability_expired",
            "The only availability evidence held has expired. Availability confirmed days ago is not availability today, so it must be rechecked before it can support a confirmation.",
            "evidence_valid_and_fresh",
          ]
        : [
            "availability_unknown",
            `Availability is UNKNOWN for ${scope}. UNKNOWN is never treated as available: allocating here would promise a room nobody has confirmed exists. A room count is capacity, not availability, and no evidence source is connected.`,
            "evidence_valid_and_fresh",
          ];

    return {
      ...base,
      candidates,
      excluded,
      slot: emptySlot(reason),
      refusal: refuse(code, reason, gate),
      allocatable: false,
    };
  }

  /* ---- every gate passed ---- */

  return {
    ...base,
    candidates,
    excluded,
    slot: toAvailabilitySlot(best.availability, now),
    refusal: null,
    allocatable: true,
  };
}

function emptySlot(reason: string): AvailabilitySlot {
  return { filled: false, result: unknownAvailability(reason), reason };
}

/* ------------------------------------------------------------------ *
 * Allocation — the decision, still refused
 * ------------------------------------------------------------------ */

export type AllocationOutcome =
  | { ok: true; allocation: HotelAllocation }
  | { ok: false; refusal: AllocationRefusal };

/**
 * Turn a proposal into an allocation, or refuse.
 *
 * This writes nothing and confirms nothing — it produces the in-memory shape a
 * future milestone will persist into `bookings.allocated_hotel_id` once an
 * approval queue and an audit trail exist to make the decision reconstructable.
 *
 * The gates are re-checked here rather than trusted from the proposal, because
 * a proposal is a value that can be held, passed around and grow stale between
 * being made and being acted on. Re-checking against `now` is what stops an
 * expired confirmation from being replayed into an allocation.
 *
 * State is `pending_confirmation`, never `confirmed`. Validated supplier
 * evidence is what confirms a hotel, and no channel exists to deliver it.
 */
export function allocateFromProposal(
  proposal: AllocationProposal,
  hotels: HotelRecord[],
  now: Date = new Date(),
): AllocationOutcome {
  if (proposal.refusal) return { ok: false, refusal: proposal.refusal };

  // An EXACT commitment has exactly one legitimate candidate, and it is named
  // rather than ranked. Re-checking against `now` still applies — the point of
  // re-checking is that a proposal goes stale, not that the promise does.
  if (proposal.commitmentType === "EXACT" && !proposal.exactHotelId) {
    return {
      ok: false,
      refusal: refuse(
        "requirement_incomplete",
        "This proposal is an EXACT commitment but names no property. An exact promise with no property recorded cannot be honoured or checked.",
        "commitment_type_respected",
      ),
    };
  }

  const eligible =
    proposal.commitmentType === "EXACT"
      ? proposal.candidates.filter((c) => c.hotelId === proposal.exactHotelId)
      : proposal.candidates;

  const chosen = eligible.find((c) => canAllocateAgainst(c.availability, now));
  if (!chosen) {
    return {
      ok: false,
      refusal: refuse(
        "availability_unknown",
        proposal.commitmentType === "EXACT"
          ? "Availability could not be established for the exactly promised property at the moment of allocation. A proposal made earlier is not evidence now, and another property is not a substitute for a named one."
          : "Availability could not be established at the moment of allocation. A proposal made earlier is not evidence now.",
        "evidence_valid_and_fresh",
      ),
    };
  }

  // A retained invariant, not a live branch: selection above is by identity, so
  // this cannot fire today. It stays because it is the assertion that would
  // catch a future edit reintroducing rank-based selection — which is exactly
  // how the substitution defect arose the first time.
  if (
    proposal.commitmentType === "EXACT" &&
    !allowsSubstitution(proposal.commitmentType) &&
    proposal.exactHotelId !== chosen.hotelId
  ) {
    return {
      ok: false,
      refusal: refuse(
        "exact_substitution_forbidden",
        "This booking promised one named property. Allocating a different one is a substitution, and substitution on an EXACT commitment is never automatic.",
        "commitment_type_respected",
      ),
    };
  }

  // The category recorded on the allocation is the property's OWN mapped
  // category, not the one asked for — so an audit can see what was actually
  // given. It stays null when the property's category cannot be mapped.
  const hotel = hotels.find((h) => h.id === chosen.hotelId);
  const mapping = packageCategoryForHotel(hotel?.starCategory);

  return {
    ok: true,
    allocation: {
      requirementId: proposal.requirementId,
      bookingId: proposal.bookingId,
      state: "pending_confirmation",
      commitmentType: proposal.commitmentType,
      category: mapping.ok ? mapping.category : null,
      representativeHotelIds: [],
      allocatedHotelId: chosen.hotelId,
      allocatedHotelName: chosen.hotelName,
      vendorId: chosen.vendorId,
      // The other half of disclosure scoping. Absent when the requirement
      // carried no customer — which is every requirement today, since nothing
      // builds one yet. Absent stays unscoped rather than silently unreadable.
      ...(proposal.customerId !== undefined ? { customerId: proposal.customerId } : {}),
      attemptedHotelIds: proposal.candidates.map((c) => c.hotelId),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Redaction
 * ------------------------------------------------------------------ */

/** A proposal as an actor may see it — property identity removed if withheld. */
export type AllocationProposalView = Omit<AllocationProposal, "candidates" | "excluded"> & {
  candidates: RedactedCandidate[];
  excluded?: AllocationProposal["excluded"];
  identityRedacted: boolean;
};

export type RedactedCandidate = Omit<
  RankedHotelCandidate,
  "hotelId" | "hotelName" | "vendorId" | "vendorName"
> & {
  hotelId?: string;
  hotelName?: string;
  vendorId?: string;
  vendorName?: string;
};

/**
 * Redact a proposal in the DATA layer.
 *
 * A proposal is the MOST sensitive object in the hotel model, because it names
 * every property BPT is about to try — the attempts a customer must never see
 * and a supplier must never learn they were ranked within. So identity is
 * removed for every non-staff actor regardless of allocation state: a proposal
 * is by definition not a confirmation, and there is no state in which a
 * customer may see one.
 */
export function redactProposal(
  proposal: AllocationProposal,
  actor: DocumentActor,
): AllocationProposalView {
  const staff =
    actor.role === "founder" ||
    actor.role === "operations" ||
    actor.role === "finance" ||
    actor.role === "employee";

  if (staff) {
    return { ...proposal, identityRedacted: false };
  }

  const candidates: RedactedCandidate[] = proposal.candidates.map((c) => {
    const { hotelId, hotelName, vendorId, vendorName, ...rest } = c;
    // A supplier may see their OWN row, and nobody else's.
    if (actor.role === "vendor" && actor.vendorId !== undefined && actor.vendorId === vendorId) {
      return { ...rest, hotelId, hotelName, vendorId, vendorName };
    }
    return rest;
  });

  // `excluded` is omitted by never being copied — the elimination list names
  // every property that was considered and rejected, which is operational data
  // no customer or supplier may hold.
  return {
    requirementId: proposal.requirementId,
    bookingId: proposal.bookingId,
    commitmentType: proposal.commitmentType,
    slot: proposal.slot,
    refusal: proposal.refusal,
    allocatable: proposal.allocatable,
    candidates,
    identityRedacted: proposal.candidates.length > 0,
  };
}

/** Convenience: an allocation as the customer may see it. Delegates, never copies. */
export function toCustomerFacingAllocation(allocation: HotelAllocation): HotelAllocationView {
  return redactAllocation(allocation, { role: "customer" });
}
