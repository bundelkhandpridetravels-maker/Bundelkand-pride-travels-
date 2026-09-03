/**
 * Shared supply architecture — ARCHITECTURAL PREPARATION ONLY.
 *
 * ⚠️ THIS MODULE CONTAINS NO OPERATIONAL BEHAVIOUR, BY DESIGN.
 * No API call, no availability lookup, no supplier request, no supplier
 * response, no persistence, no AI execution, no provider integration. It is
 * types, vocabulary and one interface. Every constant that could be mistaken
 * for a switch is declared off, and the verification suite asserts it.
 *
 * WHY IT EXISTS NOW RATHER THAN LATER
 *
 * Hotel, activity and transport follow the identical chain — only the supply
 * unit changes (a room-night, an activity slot, a seat on a departure). Three
 * separate systems would implement the capacity-versus-availability distinction
 * three times and would get it wrong in at least one. One shape, with a `kind`
 * discriminator, means the rule is written once and audited once.
 *
 * The same argument applies to providers. If the first integration is wired
 * straight into the core, that provider's response shape BECOMES the
 * architecture and the second provider is painful or impossible. The normalised
 * model and the adapter interface have to be settled before the first
 * integration, not after it — the platform already does exactly this for email,
 * e-signature and storage.
 *
 * WHAT IS DELIBERATELY ABSENT
 * SupplierCandidate, AvailabilityRequest, SupplierResponse, Allocation and
 * ApprovalQueue records. Each needs a table, so each is a migration gate. The
 * requirement SHAPE is prepared here; nothing that stores a request or a
 * response is.
 */
import type { AvailabilityResult } from "@/lib/hotels/capacity";
import type { CommitmentType, PackageHotelCategory } from "@/lib/hotels/model";

/* ------------------------------------------------------------------ *
 * Supply kinds
 * ------------------------------------------------------------------ */

/**
 * The three things BPT buys. The discriminator that selects the supply unit and
 * (later) the adapter, so one chain serves all three.
 */
export const SUPPLY_KINDS = ["hotel", "activity", "transport"] as const;
export type SupplyKind = (typeof SUPPLY_KINDS)[number];

/** What one unit of each kind actually is. Documentation as data. */
export const SUPPLY_UNIT_LABELS: Record<SupplyKind, string> = {
  hotel: "Room type for a date range",
  activity: "Activity slot on a date",
  transport: "Seat on a dated departure",
};

/**
 * Which kinds M8 models. Hotel only — an activity entity does not exist at all
 * (activities are free text inside itineraries) and transport carries the same
 * date-dimension gap as hotels. Both are later milestones.
 */
export const SUPPLY_KINDS_IMPLEMENTED: readonly SupplyKind[] = ["hotel"];

/* ------------------------------------------------------------------ *
 * Supply requirement
 * ------------------------------------------------------------------ */

export const REQUIREMENT_STATUSES = [
  "draft",
  "open",
  "awaiting_response",
  "allocated",
  "cancelled",
] as const;
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

/**
 * A booking turned into a NEED: what has to be secured, for whom, when.
 *
 * One shape for all three kinds. The hotel fields are optional rather than
 * split into a separate type, because a seat and a room-night differ in their
 * unit, not in their lifecycle — and a second type would be the first step back
 * towards three parallel systems.
 *
 * ⚠️ NOT PERSISTED. `SUPPLY_REQUIREMENT_PERSISTENCE` is "none".
 */
export type SupplyRequirement = {
  id: string;
  kind: SupplyKind;
  bookingId: string;
  /**
   * Who the booking is for. Carried so an allocation can be OWNER-SCOPED.
   *
   * Not a new concept and not a business rule — the customer relation already
   * exists on `bookings`, and `DocumentActor.customerId` already exists on the
   * actor side. What was missing was the path between them: without this the
   * allocation has no owner, and disclosure can only be gated on state, which
   * means every customer can read every confirmed allocation.
   *
   * Optional because nothing populates a requirement yet. Absent stays
   * unscoped, exactly as in M5.
   */
  customerId?: string;
  status: RequirementStatus;
  destinationId?: string;
  /** ISO calendar dates, inclusive — the dates the supply is needed for. */
  dateFrom?: string;
  dateTo?: string;
  /**
   * Guests or passengers — a count of PEOPLE.
   *
   * ⚠️ NOT a rated occupancy. What a supplier's rate line covers
   * (`RateLine.ratedOccupancy`) is a property of the room being bought, not of
   * the party staying in it: one traveller in a double room is a guest count of
   * 1 against a rated occupancy of 2. The two numbers coincide only when the
   * party exactly fills the room, which is why conflating them stays invisible
   * until a solo traveller or a child appears. This field must never be used to
   * resolve a rate.
   */
  guestCount?: number;
  /** Hotel only. The category that was actually sold. */
  category?: PackageHotelCategory;
  /** Hotel only. The supplier's own meal-plan wording. */
  mealPlan?: string;
  /** Hotel only. The room type asked for, in the supplier's wording. */
  roomType?: string;
  /** What was promised — a category, or one named property. */
  commitmentType: CommitmentType;
  /** When EXACT: the property that was sold. Substitution is never automatic. */
  exactHotelId?: string;
};

export const SUPPLY_REQUIREMENT_PERSISTENCE = "none" as const;
export const SUPPLIER_REQUEST_PERSISTENCE = "none" as const;
export const SUPPLIER_RESPONSE_PERSISTENCE = "none" as const;

/* ------------------------------------------------------------------ *
 * Channels
 * ------------------------------------------------------------------ */

/**
 * How BPT reaches a supplier. Email is first because email is the channel that
 * exists — and it is also the WEAKEST evidence class, which is why the identity
 * and freshness gates exist rather than being implied by an authenticated
 * session the way a portal would.
 *
 * No channel is wired in M8.
 */
export const SUPPLY_CHANNELS = ["email", "portal", "api", "messaging", "voice"] as const;
export type SupplyChannel = (typeof SUPPLY_CHANNELS)[number];

export const SUPPLY_CHANNEL_EVIDENCE_STRENGTH: Record<SupplyChannel, string> = {
  email: "Weakest — unstructured; needs sender authentication and request-ID binding.",
  portal: "Strongest — authenticated session, structured response, identity implicit.",
  api: "Strong — signed, structured, machine-verifiable.",
  messaging: "Semi-structured — identity depends on the platform.",
  voice: "Weakest — a transcript requires corroboration before it can confirm anything.",
};

/** No channel is enabled. M8 sends nothing and receives nothing. */
export const SUPPLY_CHANNELS_ENABLED: readonly SupplyChannel[] = [];

/* ------------------------------------------------------------------ *
 * Provider adapter interface
 * ------------------------------------------------------------------ */

/** What a provider can actually do. An absent capability degrades the channel. */
export type ProviderCapabilities = {
  quote: boolean;
  hold: boolean;
  book: boolean;
  cancel: boolean;
};

export type ProviderIdentity = {
  id: string;
  label: string;
  kinds: readonly SupplyKind[];
};

/**
 * The only shape the core knows about a supply provider — direct hotel, DMC,
 * bedbank, channel manager, transport operator, or a future BPT-operated supply
 * API. NO PROVIDER IS PRIVILEGED, including BPT's own.
 *
 * `checkAvailability` returns the normalised `AvailabilityResult`, which means a
 * provider that cannot answer returns UNKNOWN rather than the core assuming
 * anything. A provider declares what it can do through `capabilities()` instead
 * of the core guessing.
 *
 * ⚠️ NO IMPLEMENTATION OF THIS INTERFACE EXISTS OR MAY EXIST IN M8. It is
 * declared so that the first integration adapts to the core, not the reverse.
 */
export interface SupplyProvider {
  identity(): ProviderIdentity;
  capabilities(): ProviderCapabilities;
  checkAvailability(requirement: SupplyRequirement): Promise<AvailabilityResult>;
}

/** No provider is registered, and registering one is a later milestone. */
export const PROVIDERS_REGISTERED: readonly ProviderIdentity[] = [];

/* ------------------------------------------------------------------ *
 * Rate outcomes
 * ------------------------------------------------------------------ */

/**
 * What happened when a supplier's answer met the contracted rate.
 *
 * The request asks about AVAILABILITY, not price — the rate is already
 * contracted in M4, and re-asking for it invites renegotiation on every
 * booking. So a rate appearing in a response is an exception, and these are the
 * three ways it is handled.
 *
 * ⚠️ NO ESCALATION THRESHOLD IS DEFINED HERE. The point at which a deviation
 * stops being an employee's problem and becomes the founder's is a business
 * policy decision that has not been made. A number here would invent it.
 */
export const RATE_OUTCOMES = ["RATE_MATCH", "RATE_DEVIATION", "COMMERCIAL_EXCEPTION"] as const;
export type RateOutcome = (typeof RATE_OUTCOMES)[number];

export const RATE_OUTCOME_DESCRIPTIONS: Record<RateOutcome, string> = {
  RATE_MATCH: "Supplier confirms at the applicable contracted rate. The normal path.",
  RATE_DEVIATION:
    "Supplier confirms at a different rate. Never silently accepted, never passed to the customer — a human exception.",
  COMMERCIAL_EXCEPTION:
    "A deviation with commercial consequence. Founder judgement, because it changes what BPT pays or promises.",
};

/** Which outcome may complete without a human. Exactly one. */
export const AUTO_COMPLETABLE_RATE_OUTCOMES: readonly RateOutcome[] = ["RATE_MATCH"];

/* ------------------------------------------------------------------ *
 * AI action classes — VOCABULARY ONLY
 * ------------------------------------------------------------------ */

/**
 * What an AI principal may be authorised to do, by class of action.
 *
 * ⚠️ THIS IS VOCABULARY, NOT PERMISSION. Nothing in M8 grants, checks or
 * exercises any of it. The platform's Hermes layer is off, and the
 * `ApprovalQueue` and audit trail that AI auto-completion depends on DO NOT
 * EXIST — they are the prerequisite milestone. Auto-completion without an
 * append-only audit event written before the state advances would produce
 * confirmations nobody can reconstruct.
 */
export const AI_ACTION_CLASSES = [
  "READ",
  "CLASSIFY",
  "PREPARE",
  "NOTIFY",
  "AUTO_COMPLETE",
  "ESCALATE",
  "HUMAN_ONLY",
] as const;
export type AiActionClass = (typeof AI_ACTION_CLASSES)[number];

export const AI_ACTION_CLASS_DESCRIPTIONS: Record<AiActionClass, string> = {
  READ: "Observe bookings, hotels, rates, contracts and performance data.",
  CLASSIFY: "Parse responses, score confidence, detect exception conditions. No side effect.",
  PREPARE: "Draft candidate sets, requests, allocation proposals and voucher content.",
  NOTIFY: "Send pre-approved templates to known recipients — requests, reminders, escalations.",
  AUTO_COMPLETE:
    "Complete a normal confirmation and issue the customer voucher — only when every gate passes.",
  ESCALATE: "Route to a human exception queue with full context on any gate failure.",
  HUMAN_ONLY:
    "Commercial deviation, discount, repricing, exact-hotel substitution, non-refundable commitment, contract change, new supplier approval.",
};

/**
 * What AI may never do, whatever the gates say. Held as data so a console can
 * render the boundary rather than restating it in prose that could drift.
 */
export const AI_NEVER: readonly string[] = [
  "Invent availability",
  "Invent a rate",
  "Invent a confirmation",
  "Alter customer pricing",
  "Alter margins",
  "Grant a discount",
  "Override a contract",
  "Substitute a hotel on an EXACT commitment",
  "Perform an unauthorised irreversible financial or contractual action",
  "Override founder policy",
];

/** AI is not activated in M8. Asserted by the verification suite. */
export const AI_ENABLED = false;

/**
 * What must exist before AI auto-completion can be switched on at all. Both are
 * referenced by the platform's own AI gate and neither has been built.
 */
export const AI_PREREQUISITES: readonly string[] = [
  "ApprovalQueue collection (referenced in code, does not exist)",
  "Append-only audit trail (referenced in code, does not exist)",
];

/* ------------------------------------------------------------------ *
 * Auto-complete gates — VOCABULARY ONLY
 * ------------------------------------------------------------------ */

/**
 * The ten conditions that must ALL hold before a hotel confirmation could
 * complete without a human. A single failure routes to a person.
 *
 * ⚠️ NONE OF THESE IS EVALUATED IN M8. They are named here so that the
 * refusal codes in `allocation.ts` line up with the gate they correspond to,
 * and so a later milestone implements this list rather than inventing another.
 */
export const AUTO_COMPLETE_GATES = [
  "supplier_identity_verified",
  "bound_to_request_id",
  "dates_match_exactly",
  "category_matches",
  "room_and_meal_match",
  "contracted_rate_matches",
  "commitment_type_respected",
  "evidence_valid_and_fresh",
  "no_conflicting_confirmation",
  "policy_rules_pass",
] as const;
export type AutoCompleteGate = (typeof AUTO_COMPLETE_GATES)[number];

/** Gates M8 can evaluate from data it actually holds. */
export const GATES_EVALUABLE_IN_M8: readonly AutoCompleteGate[] = [
  "category_matches",
  "commitment_type_respected",
  "evidence_valid_and_fresh",
];
