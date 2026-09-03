/**
 * Hotel supply model — M8 Hotel Foundation.
 *
 * The `hotels` table, its room types and its supplier relation have existed and
 * been migrated since the initial schema. What has never existed is any code
 * that can READ one. This module is that shape: the application's view of a
 * property, plus the two distinctions the business depends on and the schema
 * cannot express by itself.
 *
 * THE TWO DISTINCTIONS THIS MODULE EXISTS TO KEEP SEPARATE
 *
 *   representative vs allocated  A representative hotel illustrates a STANDARD
 *     before booking ("4-star similar — A, B, C, D"). An allocated hotel is the
 *     property a specific customer is actually given, after availability has
 *     been verified. Conflating them promises a property BPT has not secured.
 *
 *   capacity vs availability     `roomTypes[].count` is a fact about the
 *     building, not about a date. It lives here; availability does not, and
 *     deriving one from the other is the error `capacity.ts` exists to prevent.
 *
 * WHAT THIS MODULE DOES NOT CONTAIN — deliberately:
 *   no hotel names, no ratings, no room counts, no rates, no availability. Every
 *   one of those is real business data. This is the shape it arrives in, never
 *   the values. Existing static hotel names on package pages are registered
 *   debt and are NOT read, mirrored or replaced here.
 *
 * Reuse, not redefinition:
 *   - the supplier is a `VendorRecord` (src/lib/vendor/model.ts)
 *   - actors and roles are the ONE platform vocabulary (documents/permissions)
 *   - redaction is M4/M7's proven key-removal technique, not a new framework
 *
 * Pure types and pure functions. No I/O.
 */
import type { DocumentActor } from "@/lib/documents/permissions";

/* ------------------------------------------------------------------ *
 * Vocabulary — mirrors the applied migration, never widens it
 * ------------------------------------------------------------------ */

/**
 * `enum_hotels_star_category`, exactly as migrated.
 *
 * ⚠️ `boutique` IS IN THIS LIST AND IS NOT IN THE PACKAGE LIST BELOW. That
 * asymmetry is real, it is in the database, and `category.ts` surfaces it as
 * UNMAPPABLE rather than papering over it. Widening either enum is a migration.
 */
export const HOTEL_STAR_CATEGORIES = ["3", "4", "5", "premium", "boutique"] as const;
export type HotelStarCategory = (typeof HOTEL_STAR_CATEGORIES)[number];

/** `enum_packages_hotel_category`, exactly as migrated. No `boutique`. */
export const PACKAGE_HOTEL_CATEGORIES = ["3", "4", "5", "premium"] as const;
export type PackageHotelCategory = (typeof PACKAGE_HOTEL_CATEGORIES)[number];

export const HOTEL_STAR_CATEGORY_LABELS: Record<HotelStarCategory, string> = {
  "3": "3 Star",
  "4": "4 Star",
  "5": "5 Star",
  premium: "Premium",
  boutique: "Boutique / Homestay",
};

/** Mirrors the shared `status` field every content collection carries. */
export const HOTEL_STATUSES = ["draft", "published", "archived"] as const;
export type HotelStatus = (typeof HOTEL_STATUSES)[number];

export function isHotelStarCategory(value: unknown): value is HotelStarCategory {
  return typeof value === "string" && (HOTEL_STAR_CATEGORIES as readonly string[]).includes(value);
}

export function isPackageHotelCategory(value: unknown): value is PackageHotelCategory {
  return (
    typeof value === "string" && (PACKAGE_HOTEL_CATEGORIES as readonly string[]).includes(value)
  );
}

/* ------------------------------------------------------------------ *
 * Room types — CAPACITY ONLY
 * ------------------------------------------------------------------ */

/**
 * One row of `hotels_room_types`. Four columns, and not one of them is a date.
 *
 * ⚠️ `count` IS CAPACITY. It is how many rooms of this type the building has,
 * not how many are free on any night. Nothing in this module or any other may
 * read `count` and report availability — see `capacity.ts`.
 *
 * `name` and `mealPlan` stay free text, carrying the supplier's own wording,
 * for the same reason M4's rate lines do: a platform enum would silently
 * rewrite what the supplier sent.
 */
export type RoomTypeRecord = {
  id: string;
  name?: string;
  /** People the room sleeps. */
  occupancy?: number;
  /** CAPACITY — rooms in the building. Never availability. */
  count?: number;
  mealPlan?: string;
};

/* ------------------------------------------------------------------ *
 * Hotels
 * ------------------------------------------------------------------ */

/**
 * A property, mirroring the `hotels` collection field for field. Nothing is
 * added that the schema does not carry — an invented field here would become an
 * invented fact everywhere downstream.
 */
export type HotelRecord = {
  id: string;
  name: string;
  destinationId: string;
  /** The supplier who sells this property. Absent = orphan; see `findOrphanHotels`. */
  vendorId?: string;
  starCategory?: HotelStarCategory;
  /** Marks a sample partner hotel shown for its category BEFORE booking. */
  representative: boolean;
  roomTypes: RoomTypeRecord[];
  amenities: string[];
  status: HotelStatus;
  city?: string;
};

/* ------------------------------------------------------------------ *
 * Commitment — what was actually sold
 * ------------------------------------------------------------------ */

/**
 * What the customer was promised.
 *
 *   CATEGORY_SIMILAR  the default. A standard was sold, not a property. An
 *                     equivalent approved hotel may be substituted under BPT
 *                     rules, and the customer learns the outcome, not the
 *                     attempts.
 *   EXACT             a named property was sold. Substitution is NEVER
 *                     automatic; any change is a founder-level exception.
 *
 * ⚠️ NOT PERSISTED. No column carries this today, and adding one is a schema
 * change with its own migration gate. It is represented here so that the moment
 * substitution logic is written — in a later milestone — the concept it must
 * respect already exists and cannot be forgotten. Treating an absent
 * commitmentType as CATEGORY_SIMILAR is safe only because CATEGORY_SIMILAR
 * still cannot substitute anything without verified availability.
 */
export const COMMITMENT_TYPES = ["CATEGORY_SIMILAR", "EXACT"] as const;
export type CommitmentType = (typeof COMMITMENT_TYPES)[number];

export const DEFAULT_COMMITMENT_TYPE: CommitmentType = "CATEGORY_SIMILAR";

export const COMMITMENT_TYPE_DESCRIPTIONS: Record<CommitmentType, string> = {
  CATEGORY_SIMILAR:
    "A category was sold, not a property. An equivalent approved hotel may be substituted under BPT rules.",
  EXACT:
    "A named property was sold. Substitution is never automatic — any change is a founder-level exception.",
};

export const COMMITMENT_PERSISTENCE = "none" as const;

/** May a substitution be considered at all? EXACT always answers no. */
export function allowsSubstitution(commitment: CommitmentType): boolean {
  return commitment === "CATEGORY_SIMILAR";
}

/* ------------------------------------------------------------------ *
 * Allocation state
 * ------------------------------------------------------------------ */

/**
 * How far a booking's hotel has got. Only `confirmed` may name a property to
 * the customer — that is the whole point of the sequence.
 *
 * ⚠️ NOT PERSISTED, and deliberately NOT added to the booking status enum. The
 * application already carries a `payment_pending` state the database enum
 * cannot store; adding confirmation states compounds that mismatch and is a
 * migration gate excluded from M8.
 */
export const ALLOCATION_STATES = [
  "unallocated",
  "proposed",
  "pending_confirmation",
  "confirmed",
] as const;
export type AllocationState = (typeof ALLOCATION_STATES)[number];

export const ALLOCATION_STATE_DESCRIPTIONS: Record<AllocationState, string> = {
  unallocated: "No property has been considered yet.",
  proposed: "Candidates ranked. Nothing secured, nothing promised.",
  pending_confirmation: "A supplier has been asked. No confirmation has been validated.",
  confirmed: "Availability was proven and validated. Only now may the hotel be named.",
};

export const ALLOCATION_PERSISTENCE = "none" as const;

/**
 * A booking's hotel allocation, as the application understands it.
 *
 * `attemptedHotelIds` is the operational record of who was tried. It is
 * INTERNAL FOREVER — a customer learns the outcome, never that two other hotels
 * turned them down, and a supplier never learns they were second choice.
 */
export type HotelAllocation = {
  requirementId: string;
  bookingId: string;
  state: AllocationState;
  commitmentType: CommitmentType;
  /** The category sold. Null when the package category could not be resolved. */
  category: PackageHotelCategory | null;
  /** Illustrative properties shown pre-booking. A standard, not a promise. */
  representativeHotelIds: string[];
  /** The property actually allocated. Absent until one is chosen. */
  allocatedHotelId?: string;
  allocatedHotelName?: string;
  /** The supplier behind the allocated property, for supplier-side scoping. */
  vendorId?: string;
  /**
   * The customer this allocation belongs to, for customer-side scoping.
   *
   * ⚠️ THE COUNTERPART TO `vendorId`, AND IT WAS MISSING. Disclosure was gated
   * on STATE alone — once an allocation reached `confirmed`, every customer
   * actor could read its property, because there was nothing on the record to
   * check ownership against. The vendor branch beside it has always been
   * owner-scoped; this is the same scoping for the other owner, and it mirrors
   * `DocumentActor.customerId`, which already exists.
   *
   * Absent means UNSCOPED, exactly as in M5's `canViewDocument`: an allocation
   * with no owner recorded behaves as it does today. That keeps this additive
   * rather than a silent tightening of records nobody has attributed yet.
   */
  customerId?: string;
  /** Properties tried. Internal operational data — never customer or supplier visible. */
  attemptedHotelIds: string[];
};

/* ------------------------------------------------------------------ *
 * Disclosure — who may learn WHICH hotel
 * ------------------------------------------------------------------ */

/**
 * May this actor be told which property was allocated?
 *
 * The business rule — "a specific hotel is not promised before confirmation" —
 * was documented and enforced by nothing. This is the enforcement, and it is
 * deliberately a DATA-LAYER decision rather than a template one:
 *
 *   staff (employee, operations, finance, founder)  yes — they run allocation
 *   customer                                        only once CONFIRMED
 *   supplier (vendor)                               only their OWN property
 *   public                                          never
 *
 * The customer rule is the one that costs money when it is wrong. Naming a
 * hotel that then turns out to be full means BPT absorbs the upgrade, the
 * refund or the reputational damage.
 */
export function canDiscloseAllocatedHotel(
  actor: DocumentActor,
  allocation: Pick<HotelAllocation, "state" | "vendorId" | "customerId">,
): boolean {
  switch (actor.role) {
    case "founder":
    case "operations":
    case "finance":
    case "employee":
      return true;
    // TWO conditions, not one. State says the hotel may be named at all;
    // ownership says to WHOM. State alone let any customer read any confirmed
    // allocation — the vendor branch below never had that gap, and M5's
    // `canViewDocument` resolves it the same way for both owners.
    case "customer":
      return (
        allocation.state === "confirmed" &&
        (allocation.customerId === undefined || allocation.customerId === actor.customerId)
      );
    case "vendor":
      return allocation.vendorId !== undefined && allocation.vendorId === actor.vendorId;
    case "public":
      return false;
  }
}

/** Attempts are internal to BPT operations, at every state, for all time. */
export function canDiscloseAttempts(actor: DocumentActor): boolean {
  return (
    actor.role === "founder" ||
    actor.role === "operations" ||
    actor.role === "finance" ||
    actor.role === "employee"
  );
}

/** An allocation as a given actor may see it — identity keys absent if withheld. */
export type HotelAllocationView = Omit<
  HotelAllocation,
  "allocatedHotelId" | "allocatedHotelName" | "attemptedHotelIds"
> & {
  allocatedHotelId?: string;
  allocatedHotelName?: string;
  attemptedHotelIds?: string[];
  /** True when the allocated property's identity was withheld from this actor. */
  identityRedacted: boolean;
  /** True when the operational attempt history was withheld. */
  attemptsRedacted: boolean;
};

/**
 * Redact in the DATA layer, not the template.
 *
 * The identity keys are physically REMOVED for unauthorised actors — exactly
 * the technique M4 uses for rate amounts and M7 for cost and margin — so they
 * cannot survive JSON serialisation into a browser payload, and cannot be
 * leaked by a surface that forgets to hide a column. Template-level hiding
 * would leave the value sitting in the response body.
 */
export function redactAllocation(
  allocation: HotelAllocation,
  actor: DocumentActor,
): HotelAllocationView {
  const { allocatedHotelId, allocatedHotelName, attemptedHotelIds, ...rest } = allocation;

  const identityAllowed = canDiscloseAllocatedHotel(actor, allocation);
  const attemptsAllowed = canDiscloseAttempts(actor);
  const hadIdentity = allocatedHotelId !== undefined || allocatedHotelName !== undefined;

  return {
    ...rest,
    ...(identityAllowed && allocatedHotelId !== undefined ? { allocatedHotelId } : {}),
    ...(identityAllowed && allocatedHotelName !== undefined ? { allocatedHotelName } : {}),
    ...(attemptsAllowed ? { attemptedHotelIds } : {}),
    identityRedacted: !identityAllowed && hadIdentity,
    attemptsRedacted: !attemptsAllowed && attemptedHotelIds.length > 0,
  };
}

export function redactAllocations(
  allocations: HotelAllocation[],
  actor: DocumentActor,
): HotelAllocationView[] {
  return allocations.map((a) => redactAllocation(a, actor));
}

/* ------------------------------------------------------------------ *
 * Supplier relationship
 * ------------------------------------------------------------------ */

/**
 * Hotels with no supplier behind them.
 *
 * An orphan property cannot be asked for availability, has no contract, has no
 * rate sheet and cannot be allocated. It is not a data-entry nicety — it is a
 * hard blocker, so it is reported rather than silently skipped.
 */
export function findOrphanHotels(hotels: HotelRecord[]): HotelRecord[] {
  return hotels.filter((h) => !h.vendorId);
}

/** Hotels a given supplier owns. The row-scoping a supplier portal will need. */
export function hotelsForVendor(hotels: HotelRecord[], vendorId: string): HotelRecord[] {
  return hotels.filter((h) => h.vendorId === vendorId);
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type HotelSummary = {
  live: boolean;
  total: number;
  /** Properties per star category — a count of ROWS, never of rooms. */
  byCategory: Record<HotelStarCategory, number>;
  representative: number;
  /** Properties with no supplier relation — cannot be allocated. */
  orphans: number;
  /** Properties carrying no room-type rows at all. */
  withoutRoomTypes: number;
  /** Properties whose category cannot map to any package category. */
  unmappableCategory: number;
};

export function emptyHotelSummary(live = false): HotelSummary {
  return {
    live,
    total: 0,
    byCategory: { "3": 0, "4": 0, "5": 0, premium: 0, boutique: 0 },
    representative: 0,
    orphans: 0,
    withoutRoomTypes: 0,
    unmappableCategory: 0,
  };
}
