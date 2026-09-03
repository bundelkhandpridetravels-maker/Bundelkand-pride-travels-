/**
 * Party composition — who is travelling. Pure types and pure functions.
 *
 * ⚠️ THIS MODULE IMPORTS NOTHING AND IS IMPORTED BY NOTHING.
 * No I/O, no persistence, no pricing, no rooms, no rates, no UI, no API. It is
 * a leaf by construction, which is what keeps it above M4, M7 and M8 without
 * touching any of their dependency edges.
 *
 * WHY IT EXISTS
 *
 * The platform currently carries ELEVEN separate traveller representations —
 * two zod schemas, a quote params schema, a CRM lead field, a quote document
 * type, two React form states, a persisted Payload group, a persisted column
 * set, a bracketed search dropdown ("3–4 travellers"), and one place that sums
 * adults and children into a single number. Every one of them is a COUNT, and
 * not one of them can say how old a child is or which bed anyone occupies.
 *
 * That is survivable while every traveller is charged the same rate. It stops
 * being survivable the moment supplier rates distinguish a child with a bed
 * from a child without one: age and bed status are facts about a PERSON, and a
 * count cannot hold a per-person fact. Two children of different ages in one
 * booking can fall in different bands and carry different rates, and a
 * `children: 2` field can never express that.
 *
 * THE ORGANISING RULE: GUEST TYPE AND BED STATUS ARE ORTHOGONAL.
 * An adult can occupy an extra bed. A child can occupy a standard bed. Which
 * combinations a given supplier actually prices is COMMERCIAL POLICY that
 * nobody has supplied, so this module represents every combination and endorses
 * none. A type that could only express "child ⇒ no bed" would have hardcoded a
 * business rule the founder has not made.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *   · derive a guest type from an age — the bands are empty, see AGE_BANDS
 *   · decide which guest-type / bed-status pairs are sellable
 *   · assign anyone to a room — that is a future room plan, not a party fact
 *   · imply single occupancy from a party of one
 *   · price, mark up, tax or discount anything
 *   · read or write the `bookings.travellers_*` columns
 */

/* ------------------------------------------------------------------ *
 * Guest type
 * ------------------------------------------------------------------ */

/**
 * What a traveller is, commercially.
 *
 * DECLARED, never inferred. Age alone cannot produce this today because
 * `AGE_BANDS` is empty, and the existing booking forms let a customer say
 * "1 child" without ever stating an age — so a model that required an age to
 * know someone was a child could not represent a booking the live site already
 * accepts.
 */
export const GUEST_TYPES = ["adult", "child", "infant"] as const;
export type GuestType = (typeof GUEST_TYPES)[number];

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  adult: "Adult",
  child: "Child",
  infant: "Infant",
};

/* ------------------------------------------------------------------ *
 * Bed status
 * ------------------------------------------------------------------ */

/**
 * What a traveller sleeps in.
 *
 * ⚠️ INDEPENDENT OF GUEST TYPE, AND USUALLY UNKNOWN AT CAPTURE TIME.
 * Bed status is decided when rooms are chosen, not when a party is described —
 * a customer says "two adults and a child", not "a child on an extra bed". So
 * it is optional on a member and absent until a future room plan assigns it.
 *
 * `no_bed` covers a traveller sharing existing bedding — an infant in a cot is
 * a separate supplier charge rather than a bed status, and is deliberately not
 * modelled here.
 */
export const BED_STATUSES = ["standard_bed", "extra_bed", "no_bed"] as const;
export type BedStatus = (typeof BED_STATUSES)[number];

export const BED_STATUS_LABELS: Record<BedStatus, string> = {
  standard_bed: "Standard bed",
  extra_bed: "Extra bed",
  no_bed: "No separate bed",
};

/* ------------------------------------------------------------------ *
 * Age bands
 * ------------------------------------------------------------------ */

/**
 * A band maps an age to a guest type for a supplier or for BPT policy.
 *
 * ⚠️ `AGE_BANDS` IS EMPTY, AND THAT IS THE DELIVERABLE.
 *
 * Where a child stops being an infant, and where a child becomes an adult, is
 * real business data that differs per supplier and per contract. Shipping a
 * plausible default (0–2? 2–5? 5–12?) would invent BPT's child economics, and
 * the first quote computed from it would be wrong in a way nobody would notice.
 * The same deliberate extension point as `MARKUP_RULES`, `TYPE_REQUIREMENTS`
 * and `CATEGORY_SUBSTITUTIONS`.
 *
 * `maxAgeInclusive` is inclusive on purpose: "up to and including 11" is how
 * suppliers write it, and an exclusive bound silently shifts every boundary by
 * one year.
 */
export type AgeBand = {
  id: string;
  label: string;
  guestType: GuestType;
  minAgeInclusive: number;
  maxAgeInclusive: number;
};

export const AGE_BANDS: AgeBand[] = [];

/* ------------------------------------------------------------------ *
 * Party members
 * ------------------------------------------------------------------ */

/**
 * One traveller.
 *
 * `age` is optional because the platform does not capture it anywhere today,
 * and a required age would make every existing booking unrepresentable. When
 * present it is whole years at travel date — not a birth date, which would be
 * personal data this layer has no reason to hold.
 */
export type PartyMember = {
  /** Stable within a party. Not a person's identity, and never a customer id. */
  id: string;
  guestType: GuestType;
  /** Whole years at travel date. Absent whenever it was never captured. */
  age?: number;
  /** Assigned by a future room plan. Absent while rooms are undecided. */
  bedStatus?: BedStatus;
};

export type PartyComposition = {
  members: PartyMember[];
};

/* ------------------------------------------------------------------ *
 * Derived counts — the bridge to the eleven existing representations
 * ------------------------------------------------------------------ */

/**
 * Counts derived FROM members, never stored alongside them.
 *
 * Two numbers that can disagree are a defect waiting to happen, so a party has
 * exactly one source of truth and the counts are computed on demand. This shape
 * intentionally mirrors `bookings.travellers_{adults,children,infants}` so a
 * future mapping layer has an obvious target — mapping it is NOT this
 * milestone's job, and nothing here reads or writes that table.
 */
export type PartyCounts = {
  adults: number;
  children: number;
  infants: number;
  total: number;
};

export function countParty(party: PartyComposition): PartyCounts {
  let adults = 0;
  let children = 0;
  let infants = 0;

  for (const member of party.members) {
    if (member.guestType === "adult") adults += 1;
    else if (member.guestType === "child") children += 1;
    else infants += 1;
  }

  return { adults, children, infants, total: party.members.length };
}

/** Members of one guest type, in declaration order. */
export function membersOfType(party: PartyComposition, guestType: GuestType): PartyMember[] {
  return party.members.filter((m) => m.guestType === guestType);
}

/**
 * True when no member carries an age.
 *
 * Reported rather than defaulted: an age-less party is the CURRENT state of
 * every booking the platform takes, and a future child-policy resolver must be
 * able to see that it cannot band anyone rather than banding them wrongly.
 */
export function isAgeUnknown(party: PartyComposition): boolean {
  return party.members.every((m) => m.age === undefined);
}

/** True when no member has been assigned a bed. The state before a room plan. */
export function isBedStatusUnassigned(party: PartyComposition): boolean {
  return party.members.every((m) => m.bedStatus === undefined);
}

/* ------------------------------------------------------------------ *
 * Structural validation
 * ------------------------------------------------------------------ */

/**
 * ⚠️ STRUCTURAL ONLY. NOTHING HERE IS A COMMERCIAL RULE.
 *
 * These checks answer "is this object internally coherent?" and never "is this
 * party sellable?". Specifically NOT checked, because each is founder or
 * supplier policy that does not exist yet:
 *
 *   · whether a party needs at least one adult
 *   · whether an infant may occupy a bed
 *   · whether a child may occupy a standard bed
 *   · whether an unaccompanied minor is permitted
 *   · what age makes someone an infant, a child or an adult
 *   · whether a declared guest type must agree with a supplied age
 *   · any maximum party size
 *
 * The last two are worth stating plainly. A member declared `child` with an age
 * of 40 is structurally valid here — resolving that disagreement needs bands
 * that do not exist, and guessing which side wins would be inventing policy.
 */
export type PartyIssueCode =
  | "no_members"
  | "member_id_missing"
  | "member_id_duplicated"
  | "guest_type_invalid"
  | "bed_status_invalid"
  | "age_not_an_integer"
  | "age_negative";

export type PartyIssue = {
  code: PartyIssueCode;
  message: string;
  /** Which member caused it, when the fault is attributable to one. */
  memberId?: string;
};

export type PartyValidation = { ok: boolean; issues: PartyIssue[] };

/**
 * Check a party's shape.
 *
 * No upper bound is placed on age. Any ceiling would be a judgement about
 * people rather than about data, and the structural fact — a whole,
 * non-negative number of years — is all this layer can honestly assert.
 */
export function validateParty(party: PartyComposition): PartyValidation {
  const issues: PartyIssue[] = [];

  if (party.members.length === 0) {
    issues.push({ code: "no_members", message: "A party needs at least one traveller." });
  }

  const seen = new Set<string>();
  for (const member of party.members) {
    const id = member.id?.trim() ?? "";

    if (id === "") {
      issues.push({ code: "member_id_missing", message: "Every traveller needs an id." });
    } else if (seen.has(id)) {
      issues.push({
        code: "member_id_duplicated",
        message: `Traveller id '${id}' appears more than once.`,
        memberId: id,
      });
    } else {
      seen.add(id);
    }

    if (!(GUEST_TYPES as readonly string[]).includes(member.guestType)) {
      issues.push({
        code: "guest_type_invalid",
        message: `Unknown guest type '${member.guestType}'.`,
        ...(id ? { memberId: id } : {}),
      });
    }

    if (
      member.bedStatus !== undefined &&
      !(BED_STATUSES as readonly string[]).includes(member.bedStatus)
    ) {
      issues.push({
        code: "bed_status_invalid",
        message: `Unknown bed status '${member.bedStatus}'.`,
        ...(id ? { memberId: id } : {}),
      });
    }

    if (member.age !== undefined) {
      if (!Number.isInteger(member.age)) {
        issues.push({
          code: "age_not_an_integer",
          message: "Age must be a whole number of years.",
          ...(id ? { memberId: id } : {}),
        });
      } else if (member.age < 0) {
        issues.push({
          code: "age_negative",
          message: "Age cannot be negative.",
          ...(id ? { memberId: id } : {}),
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/* ------------------------------------------------------------------ *
 * Readiness
 * ------------------------------------------------------------------ */

export type PartyReadinessItem = {
  capability: string;
  ready: boolean;
  blocker?: string;
};

/**
 * What the party layer can and cannot do. Structural facts only — no amounts,
 * no policy — so this is safe on any surface.
 */
export function getPartyReadiness(): PartyReadinessItem[] {
  return [
    { capability: "Represent a party as individual travellers", ready: true },
    { capability: "Represent guest type and bed status independently", ready: true },
    { capability: "Carry a per-traveller age", ready: true },
    { capability: "Derive adult / child / infant counts", ready: true },
    {
      capability: "Resolve a guest type from an age",
      ready: AGE_BANDS.length > 0,
      blocker:
        AGE_BANDS.length > 0
          ? undefined
          : "No age band exists. Band boundaries are supplier and founder data and are never defaulted.",
    },
    {
      capability: "Assign travellers to rooms",
      ready: false,
      blocker: "No room plan exists. Room allocation is a later milestone and is not a party fact.",
    },
    {
      capability: "Capture ages from a customer",
      ready: false,
      blocker: "No surface collects an age. Adding one is a customer-facing change, held separately.",
    },
    {
      capability: "Map a party to the persisted booking traveller fields",
      ready: false,
      blocker:
        "No mapping layer exists. `bookings.travellers_*` is untouched by this milestone by design.",
    },
  ];
}
