/**
 * Capacity versus availability — the single most important distinction in the
 * hotel architecture, and the one the current schema cannot make.
 *
 *   CAPACITY      "20 rooms"   A fact about the BUILDING. Static. Stored in
 *                              `hotels_room_types.count`.
 *   AVAILABILITY  "? free"     A fact about specific DATES. Changes hourly.
 *                              Stored nowhere, by anything, today.
 *
 * `hotels_room_types` carries name, occupancy, count and meal_plan. There is no
 * date column. `transport_providers.vehicles` has the identical defect. So the
 * system has no date-aware availability at all, and this module's entire job is
 * to make that impossible to forget.
 *
 * ⚠️ THE PROHIBITION
 * The system must never be described — in a dashboard, a document, a report, an
 * API response or a conversation — as having real-time availability, live
 * inventory or room-level stock. It has none of these.
 *
 * ⚠️ THE RULE THIS MODULE ENFORCES IN CODE
 * A capacity reader may NEVER produce availability. `availabilityFromCapacity`
 * exists precisely so the tempting call has one implementation, and that
 * implementation returns UNKNOWN every time, whatever the room count is. There
 * is no argument, no flag and no code path that makes it return AVAILABLE.
 *
 * UNKNOWN never becomes AVAILABLE without positive evidence from a named
 * source, carrying an observation time and an expiry. Founder decision of
 * record: UNKNOWN availability is never allocated as AVAILABLE.
 *
 * Pure functions. No I/O, no persistence, no provider, no evidence source.
 */
import type { HotelRecord, RoomTypeRecord } from "@/lib/hotels/model";

/* ------------------------------------------------------------------ *
 * Capacity — what the building has
 * ------------------------------------------------------------------ */

/**
 * A property's rooms, read straight from the schema.
 *
 * ⚠️ THERE IS NO AVAILABILITY FIELD ON THIS TYPE, AND THERE MUST NEVER BE ONE.
 * The absence is the safeguard: a caller holding a `CapacityReading` cannot
 * accidentally read availability off it, because the key does not exist.
 */
export type CapacityReading = {
  hotelId: string;
  roomTypeCount: number;
  /** Sum of `count` across room types. Rooms in the building. Not free rooms. */
  totalRooms: number;
  /** Room types whose `count` is absent — capacity is unknown, not zero. */
  roomTypesWithoutCount: number;
  /**
   * Largest number of people any room type on record sleeps. A fact about the
   * building, for requirement matching. Null if none.
   */
  largestRoomSleeps: number | null;
  /** Distinct meal plans the supplier named. Their wording, not ours. */
  mealPlans: string[];
};

export function readCapacity(hotel: HotelRecord): CapacityReading {
  const rooms = hotel.roomTypes;
  const counted = rooms.filter((r) => typeof r.count === "number");
  const occupancies = rooms
    .map((r) => r.occupancy)
    .filter((o): o is number => typeof o === "number");
  const mealPlans = [
    ...new Set(
      rooms.map((r) => r.mealPlan).filter((m): m is string => typeof m === "string" && m.trim() !== ""),
    ),
  ];

  return {
    hotelId: hotel.id,
    roomTypeCount: rooms.length,
    totalRooms: counted.reduce((sum, r) => sum + (r.count ?? 0), 0),
    roomTypesWithoutCount: rooms.length - counted.length,
    largestRoomSleeps: occupancies.length > 0 ? Math.max(...occupancies) : null,
    mealPlans,
  };
}

/**
 * Room types that could physically hold the party and match the meal plan.
 *
 * ⚠️ "COULD HOLD" IS A STRUCTURAL STATEMENT, NOT AN OFFER. A room type returned
 * here may be fully booked on every night of the trip; nothing in the schema
 * can say otherwise. This narrows WHAT to ask a supplier about. It never
 * answers whether the answer will be yes.
 */
export function roomTypesMatching(
  hotel: HotelRecord,
  // `minSleeps` is a FLOOR, not an exact match: a room that sleeps more than
  // asked for still holds the party. That is the opposite of M4's rated-occupancy
  // matching, which is strict equality because a rate covers exactly what it
  // says. Both comparisons are correct for their own question, and the names now
  // say which question is being asked.
  need: { minSleeps?: number; mealPlan?: string },
): RoomTypeRecord[] {
  const norm = (v?: string) => (v ?? "").trim().toLowerCase();
  return hotel.roomTypes.filter((room) => {
    if (need.minSleeps !== undefined) {
      if (typeof room.occupancy !== "number") return false;
      if (room.occupancy < need.minSleeps) return false;
    }
    if (need.mealPlan !== undefined && norm(room.mealPlan) !== norm(need.mealPlan)) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ *
 * Availability — what nothing currently knows
 * ------------------------------------------------------------------ */

export const AVAILABILITY_STATUSES = [
  "UNKNOWN",
  "AVAILABLE",
  "UNAVAILABLE",
  "RECHECK_REQUIRED",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const AVAILABILITY_STATUS_DESCRIPTIONS: Record<AvailabilityStatus, string> = {
  UNKNOWN:
    "The default. Never derived from capacity, never treated as available, never allocated against.",
  AVAILABLE:
    "Positive evidence from a named source, with an observation time and an expiry. Nothing else qualifies.",
  UNAVAILABLE: "An explicit negative response from the supply side.",
  RECHECK_REQUIRED: "Prior evidence has expired or is contradicted. Ask again.",
};

/**
 * Where an availability answer came from.
 *
 * `capacity` is present as an explicitly INVALID source: it is what
 * `availabilityFromCapacity` stamps on its UNKNOWN result, so that a reading
 * derived from a room count is identifiable as such and can never be mistaken
 * for evidence. Every other source is a future channel — none is wired.
 */
export const AVAILABILITY_SOURCES = [
  "capacity",
  "email",
  "portal",
  "api",
  "messaging",
  "voice",
  "manual",
] as const;
export type AvailabilitySource = (typeof AVAILABILITY_SOURCES)[number];

/** Sources that may ever support an AVAILABLE result. `capacity` is not one. */
export const EVIDENCE_SOURCES: readonly AvailabilitySource[] = [
  "email",
  "portal",
  "api",
  "messaging",
  "voice",
  "manual",
];

/**
 * A normalised availability answer — the one shape every channel and every
 * future provider adapter must produce.
 *
 * The four evidence fields are not optional decoration:
 *   source      who said so
 *   evidenceRef what they said, retrievable later
 *   observedAt  when it was true
 *   expiresAt   when it stops being trustworthy
 *
 * Availability confirmed six days ago is not availability today. A result with
 * no expiry cannot age, and a result that cannot age will eventually confirm a
 * booking into a full hotel.
 */
export type AvailabilityResult = {
  status: AvailabilityStatus;
  source: AvailabilitySource;
  /** Pointer to the underlying evidence — a message, response or document ref. */
  evidenceRef: string | null;
  /** ISO timestamp the observation was made. Null when there is no observation. */
  observedAt: string | null;
  /** ISO timestamp the observation stops being trustworthy. */
  expiresAt: string | null;
  /** Plain-language reason, for an operator reading a console. */
  reason: string;
};

/**
 * ⚠️ NOTHING PERSISTS AVAILABILITY IN M8, AND NOTHING MAY.
 *
 * An availability table is a schema change with its own migration gate, and it
 * is the single largest design decision left in the roadmap. This constant is
 * asserted by the verification suite so the exclusion cannot quietly lapse.
 */
export const AVAILABILITY_PERSISTENCE = "none" as const;

/** The safe default, used wherever an answer is required and none exists. */
export function unknownAvailability(
  reason: string,
  source: AvailabilitySource = "capacity",
): AvailabilityResult {
  return {
    status: "UNKNOWN",
    source,
    evidenceRef: null,
    observedAt: null,
    expiresAt: null,
    reason,
  };
}

/* ------------------------------------------------------------------ *
 * The one-way door
 * ------------------------------------------------------------------ */

/**
 * Capacity → availability. ALWAYS UNKNOWN.
 *
 * This function exists so the conversion has exactly one implementation and
 * that implementation refuses. It takes the reading only to make the refusal
 * legible — the room count is deliberately never consulted, so there is no
 * branch, no threshold and no "if there are rooms then…" for a future edit to
 * reach for.
 *
 * If this ever returns anything but UNKNOWN, the system is confidently wrong
 * about the most expensive fact it handles.
 */
export function availabilityFromCapacity(reading: CapacityReading): AvailabilityResult {
  return unknownAvailability(
    `Capacity is not availability. ${reading.roomTypeCount} room type(s) are on record for this property, and the schema carries no date dimension, so whether any room is free on the travel dates is unknown.`,
    "capacity",
  );
}

/**
 * Is this result usable as proof, as of `now`?
 *
 * Every condition must hold: AVAILABLE status, a source that can carry
 * evidence, an evidence reference, an observation time, an expiry, and an
 * expiry still in the future. Anything less is not evidence, whatever it is
 * labelled.
 */
export function isEvidenceValid(result: AvailabilityResult, now: Date = new Date()): boolean {
  if (result.status !== "AVAILABLE") return false;
  if (!EVIDENCE_SOURCES.includes(result.source)) return false;
  if (!result.evidenceRef || !result.observedAt || !result.expiresAt) return false;

  const expires = Date.parse(result.expiresAt);
  const observed = Date.parse(result.observedAt);
  if (Number.isNaN(expires) || Number.isNaN(observed)) return false;
  return expires > now.getTime();
}

/**
 * Availability with expiry applied. Expired evidence becomes
 * RECHECK_REQUIRED — it does not stay AVAILABLE and it does not become
 * UNAVAILABLE, because a lapsed confirmation is a question, not a refusal.
 */
export function currentAvailability(
  result: AvailabilityResult,
  now: Date = new Date(),
): AvailabilityResult {
  if (result.status !== "AVAILABLE") return result;
  if (isEvidenceValid(result, now)) return result;
  return {
    ...result,
    status: "RECHECK_REQUIRED",
    reason:
      "The evidence supporting this availability has expired or is incomplete. It must be rechecked before it can support a confirmation.",
  };
}

/**
 * The gate every allocation passes through: may this result support a booking?
 *
 * UNKNOWN can never open it. That is the founder decision of record, expressed
 * as the only function allocation is allowed to ask.
 */
export function canAllocateAgainst(
  result: AvailabilityResult,
  now: Date = new Date(),
): boolean {
  return isEvidenceValid(currentAvailability(result, now), now);
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export type CapacityReport = {
  /** Properties read. */
  hotels: number;
  /** Properties carrying no room-type rows at all. */
  withoutRoomTypes: number;
  /** Room-type rows whose `count` is blank. */
  roomTypesWithoutCount: number;
  /**
   * Always "none". Stated as data so a console renders the truth from the
   * architecture rather than from a hand-written sentence that could drift.
   */
  availabilityPersistence: typeof AVAILABILITY_PERSISTENCE;
  /** Always true while no availability source exists. */
  availabilityUnknownForAll: boolean;
};

export function describeCapacity(hotels: HotelRecord[]): CapacityReport {
  const readings = hotels.map(readCapacity);
  return {
    hotels: hotels.length,
    withoutRoomTypes: readings.filter((r) => r.roomTypeCount === 0).length,
    roomTypesWithoutCount: readings.reduce((s, r) => s + r.roomTypesWithoutCount, 0),
    availabilityPersistence: AVAILABILITY_PERSISTENCE,
    availabilityUnknownForAll: readings.every(
      (r) => availabilityFromCapacity(r).status === "UNKNOWN",
    ),
  };
}
