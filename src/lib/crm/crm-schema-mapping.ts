/**
 * CRM application vocabulary ↔ database vocabulary. Pure, total, no I/O.
 *
 * Three vocabularies drifted apart while the backend was disconnected, and
 * nothing reconciled them:
 *
 *   booking status   app 5 values (lib/booking/status.ts)  ·  db 7 values (enum_bookings_status)
 *   activity type    app 10 values (lib/crm/model.ts)      ·  db 6 values (enum_crm_activities_type)
 *   lead value       app `number`                          ·  db { amount, currency }
 *
 * Only THREE booking values appear in both lists. `lib/booking/status.ts` states
 * it mirrors the Payload collection; it does not, and that comment is how the
 * divergence stayed invisible. This module is the reconciliation, done in code
 * because the database enums are already applied and widening one means
 * `ALTER TYPE` against a live database.
 *
 * ⚠️ DO NOT resolve any mismatch below by editing an enum or writing a migration.
 *
 * THE GOVERNING INVARIANT — asymmetric, and deliberately so:
 *
 *   READS  (database → app) may narrow to a WEAKER TRUE statement. A fully paid
 *          booking really is confirmed, so `paid → confirmed` loses detail while
 *          asserting nothing false.
 *
 *   WRITES (app → database) may never assert something the application has not
 *          established. There is no database value meaning "submitted, awaiting
 *          payment": `confirmed` and `partially_paid` would both claim progress
 *          that has not happened, and `enquiry` would deny that a booking was
 *          submitted at all. So `payment_pending` is UNMAPPABLE rather than
 *          quietly coerced — see PAYMENT_PENDING_RESOLUTION.
 *
 * Callers must handle the failure case. That is the point: a mapping that cannot
 * fail is a mapping that lies.
 */
import type { BookingStatus } from "@/lib/booking/status";
import type { CrmActivityType } from "@/lib/crm/model";

/* ------------------------------------------------------------------ *
 * Result type
 * ------------------------------------------------------------------ */

export type MappingSuccess<T> = {
  ok: true;
  value: T;
  /** True when the target cannot express everything the source did. */
  lossy: boolean;
  note?: string;
};

export type MappingFailure = {
  ok: false;
  reason: string;
  /** Values considered and rejected, with why — so the refusal is auditable. */
  rejected: { value: string; because: string }[];
};

export type MappingResult<T> = MappingSuccess<T> | MappingFailure;

const ok = <T>(value: T, lossy = false, note?: string): MappingSuccess<T> => ({
  ok: true,
  value,
  lossy,
  ...(note ? { note } : {}),
});

/* ------------------------------------------------------------------ *
 * The database vocabulary (mirrors the applied migration exactly)
 * ------------------------------------------------------------------ */

/** enum_bookings_status — src/migrations/20260812_194805_initial.ts */
export const DB_BOOKING_STATUSES = [
  "enquiry",
  "confirmed",
  "partially_paid",
  "paid",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type DbBookingStatus = (typeof DB_BOOKING_STATUSES)[number];

/** enum_crm_activities_type */
export const DB_ACTIVITY_TYPES = [
  "call",
  "email",
  "whatsapp",
  "meeting",
  "note",
  "task",
] as const;
export type DbActivityType = (typeof DB_ACTIVITY_TYPES)[number];

/** The shared currency enum used by every moneyGroup. */
export const DB_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;
export type DbCurrency = (typeof DB_CURRENCIES)[number];

/** Mirrors `moneyGroup` in src/payload/fields/common.ts. */
export type DbMoney = { amount: number; currency: DbCurrency };

/* ------------------------------------------------------------------ *
 * A. Booking status
 * ------------------------------------------------------------------ */

/**
 * What a future, separately approved migration would need to do so that the
 * application's default booking state becomes persistable. Stated here as data
 * rather than prose so it cannot be lost: every online booking is created
 * `payment_pending` (lib/booking/status.ts), and until this is resolved no such
 * booking can be written to the database without misrepresenting it.
 */
export const PAYMENT_PENDING_RESOLUTION =
  "enum_bookings_status has no value meaning 'submitted, awaiting payment'. " +
  "A future approved migration should add one; until then this state is app-only.";

/** app → database. Refuses rather than overstates. */
export function toDbBookingStatus(status: BookingStatus): MappingResult<DbBookingStatus> {
  switch (status) {
    case "confirmed":
      return ok("confirmed");
    case "completed":
      return ok("completed");
    case "cancelled":
      return ok("cancelled");

    // A requested quote has not been committed to. `enquiry` is the database's
    // pre-commitment state and says nothing untrue; it loses the detail that a
    // quote specifically was asked for.
    case "quote_requested":
      return ok("enquiry", true, "Quote request stored as the generic pre-commitment state.");

    case "payment_pending":
      return {
        ok: false,
        reason: PAYMENT_PENDING_RESOLUTION,
        rejected: [
          { value: "enquiry", because: "denies that a booking request was actually submitted" },
          { value: "confirmed", because: "claims a confirmation that has not happened" },
          { value: "partially_paid", because: "claims money was received when none was" },
        ],
      };
  }
}

/** database → app. May narrow to a weaker true statement. */
export function fromDbBookingStatus(status: DbBookingStatus): MappingResult<BookingStatus> {
  switch (status) {
    case "confirmed":
      return ok("confirmed");
    case "completed":
      return ok("completed");
    case "cancelled":
      return ok("cancelled");
    case "enquiry":
      return ok("quote_requested", true, "Generic pre-commitment state read as a quote request.");
    case "partially_paid":
      return ok("confirmed", true, "Booking is confirmed; the partial payment is not representable.");
    case "paid":
      return ok("confirmed", true, "Booking is confirmed; full payment is not representable.");
    case "refunded":
      return ok("cancelled", true, "Booking has ended; the refund is not representable.");
  }
}

/** True when the app value cannot be written at all. */
export function isUnmappableBookingStatus(status: BookingStatus): boolean {
  return !toDbBookingStatus(status).ok;
}

/* ------------------------------------------------------------------ *
 * B. CRM activity type
 * ------------------------------------------------------------------ */

/**
 * Four application types describe SYSTEM events (an enquiry arrived, a quote was
 * issued, a booking was made, a status changed) rather than a human touch. The
 * database enum has no system-event value.
 *
 * They map to `note`, which is safe because a note asserts nothing about how the
 * contact happened — mapping a system event to `call` would invent a phone call
 * that never took place. The application type remains the precise answer.
 */
const SYSTEM_ACTIVITY_TYPES: readonly CrmActivityType[] = [
  "enquiry",
  "quote",
  "booking",
  "status_change",
];

export function toDbActivityType(type: CrmActivityType): MappingResult<DbActivityType> {
  switch (type) {
    case "call":
    case "email":
    case "whatsapp":
    case "meeting":
    case "note":
    case "task":
      return ok(type);
    case "enquiry":
    case "quote":
    case "booking":
    case "status_change":
      return ok(
        "note",
        true,
        `System event '${type}' stored as a note — the database enum has no system-event value.`,
      );
  }
}

/** database → app. Exact in this direction: every db value is an app value. */
export function fromDbActivityType(type: DbActivityType): MappingResult<CrmActivityType> {
  return ok(type);
}

export function isSystemActivityType(type: CrmActivityType): boolean {
  return SYSTEM_ACTIVITY_TYPES.includes(type);
}

/** Activity types that lose their identity on write. */
export function lossyActivityTypes(): CrmActivityType[] {
  return [...SYSTEM_ACTIVITY_TYPES];
}

/* ------------------------------------------------------------------ *
 * C. Lead value / money
 * ------------------------------------------------------------------ */

export function isDbCurrency(value: string): value is DbCurrency {
  return (DB_CURRENCIES as readonly string[]).includes(value);
}

/**
 * app → database.
 *
 * The currency is REQUIRED and is not defaulted. `CrmLead.value` is a bare
 * number with no currency anywhere on the model, and the platform has supported
 * five currencies since the schema was written (vision: multi-country). Silently
 * stamping INR would be inventing a commercial fact — the same class of mistake
 * M4 refuses to make with rates — and it would be invisible the day a USD lead
 * arrives. So the caller must state the currency.
 */
export function toDbMoney(
  value: number | undefined,
  currency: string | undefined,
): MappingResult<DbMoney> {
  if (value === undefined) {
    return {
      ok: false,
      reason: "No value recorded — nothing to store.",
      rejected: [{ value: "0", because: "zero is a real amount, not a stand-in for 'unknown'" }],
    };
  }
  if (!Number.isFinite(value) || value < 0) {
    return {
      ok: false,
      reason: "Amount must be a finite number of at least 0 (the database column is min:0).",
      rejected: [],
    };
  }
  if (!currency) {
    return {
      ok: false,
      reason:
        "Currency must be supplied explicitly. The app lead model carries no currency and the " +
        "platform supports five, so defaulting to INR would invent a commercial fact.",
      rejected: [{ value: "INR", because: "assumed, not established" }],
    };
  }
  if (!isDbCurrency(currency)) {
    return {
      ok: false,
      reason: `Currency '${currency}' is not in the database currency enum.`,
      rejected: DB_CURRENCIES.map((c) => ({ value: c, because: "not the supplied currency" })),
    };
  }
  return ok({ amount: value, currency });
}

/** The app-side pair, since `CrmLead.value` alone cannot carry a currency. */
export type AppMoney = { value: number; currency: DbCurrency };

/**
 * database → app. Always succeeds, and always returns the currency alongside,
 * because assigning `money.amount` straight onto `CrmLead.value` is exactly how
 * currency gets lost.
 */
export function fromDbMoney(money: DbMoney): MappingResult<AppMoney> {
  return ok(
    { value: money.amount, currency: money.currency },
    true,
    "CrmLead.value has no currency field — carry the currency separately.",
  );
}

/* ------------------------------------------------------------------ *
 * D. Tags
 * ------------------------------------------------------------------ */

/**
 * Payload's `tagsField` stores an ARRAY OF ROWS, not an array of strings —
 * `[{ tag: "VIP" }, { tag: "corporate" }]` — because a Payload `array` field is
 * a related table whose columns are its sub-fields. The app model uses
 * `string[]`, which is what every caller actually wants.
 *
 * The shape difference is small and therefore easy to get wrong silently, which
 * is exactly the class of defect this module exists to prevent. Both directions
 * are explicit, total, and drop nothing without reporting it.
 */
export type DbTagRow = { tag?: string | null };

export type TagMappingResult = {
  tags: string[];
  /** Rows that carried no usable tag (null, undefined, non-string, or blank). */
  dropped: number;
  /** Repeat values collapsed. The first spelling encountered wins. */
  duplicates: number;
};

/**
 * database → app, with an account of everything that did not survive.
 *
 * Tolerant of a null column, a missing array and a malformed row, because all
 * three are reachable states in a Postgres-backed array table and a thrown
 * exception here would take down a customer page over a blank tag.
 */
export function fromDbTagsDetailed(rows: DbTagRow[] | null | undefined): TagMappingResult {
  if (!Array.isArray(rows)) return { tags: [], dropped: 0, duplicates: 0 };

  const tags: string[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  let duplicates = 0;

  for (const row of rows) {
    const value = typeof row?.tag === "string" ? row.tag.trim() : "";
    if (!value) {
      dropped += 1;
      continue;
    }
    const key = value.toLowerCase();
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    tags.push(value);
  }

  return { tags, dropped, duplicates };
}

/** database → app. Use `fromDbTagsDetailed` when the losses matter. */
export function fromDbTags(rows: DbTagRow[] | null | undefined): string[] {
  return fromDbTagsDetailed(rows).tags;
}

/** app → database. Trims, drops blanks, and collapses case-insensitive repeats. */
export function toDbTags(tags: string[] | null | undefined): DbTagRow[] {
  if (!Array.isArray(tags)) return [];

  const rows: DbTagRow[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const value = typeof tag === "string" ? tag.trim() : "";
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ tag: value });
  }

  return rows;
}

/* ------------------------------------------------------------------ *
 * Fidelity reporting
 * ------------------------------------------------------------------ */

export type VocabularyFidelity = {
  domain: "booking_status" | "activity_type";
  appValues: number;
  dbValues: number;
  exact: number;
  lossy: number;
  unmappable: number;
};

/** Rendered by the console so the divergence is visible rather than buried. */
export function describeBookingStatusFidelity(
  appStatuses: readonly BookingStatus[],
): VocabularyFidelity {
  let exact = 0;
  let lossy = 0;
  let unmappable = 0;
  for (const s of appStatuses) {
    const r = toDbBookingStatus(s);
    if (!r.ok) unmappable += 1;
    else if (r.lossy) lossy += 1;
    else exact += 1;
  }
  return {
    domain: "booking_status",
    appValues: appStatuses.length,
    dbValues: DB_BOOKING_STATUSES.length,
    exact,
    lossy,
    unmappable,
  };
}

export function describeActivityTypeFidelity(
  appTypes: readonly CrmActivityType[],
): VocabularyFidelity {
  let exact = 0;
  let lossy = 0;
  for (const t of appTypes) {
    const r = toDbActivityType(t);
    if (r.ok && r.lossy) lossy += 1;
    else if (r.ok) exact += 1;
  }
  return {
    domain: "activity_type",
    appValues: appTypes.length,
    dbValues: DB_ACTIVITY_TYPES.length,
    exact,
    lossy,
    unmappable: 0,
  };
}
