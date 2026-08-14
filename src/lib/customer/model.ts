/**
 * Customer domain model — the app-layer view of an EXISTING source of truth.
 *
 * `src/payload/collections/Customers.ts` is authoritative and is already in the
 * applied migration (`customers`, `customers_rels`, `enum_customers_source`,
 * `enum_customers_status`). This module does not define a new customer: it
 * mirrors that collection field-for-field so the CRM layer can work with
 * customers without a second, drifting definition — precisely the drift that
 * produced the booking-status clash this milestone had to reconcile.
 *
 * Every field below exists in the collection. Nothing is invented. The three
 * tiers are kept apart on purpose:
 *
 *   PERSISTED  — in the collection and in the database today
 *   DERIVED    — computed from persisted data, never stored (derive, don't duplicate)
 *   UNPERSISTED— genuinely needed by the business, NOT in the schema, and
 *                explicitly marked so nothing pretends otherwise
 */
import {
  CUSTOMER_CONTACT_ROLES,
  canAccessCustomerContact,
} from "@/lib/platform/roles";
import type { Role } from "@/payload/types";

/* ------------------------------------------------------------------ *
 * PERSISTED — mirrors collections/Customers.ts exactly
 * ------------------------------------------------------------------ */

/** enum_customers_source */
export const CUSTOMER_SOURCES = [
  "website",
  "whatsapp",
  "referral",
  "instagram",
  "walk_in",
  "repeat",
  "other",
] as const;
export type CustomerSource = (typeof CUSTOMER_SOURCES)[number];

export const CUSTOMER_SOURCE_LABELS: Record<CustomerSource, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  referral: "Referral",
  instagram: "Instagram",
  walk_in: "Walk-in",
  repeat: "Repeat",
  other: "Other",
};

/** enum_customers_status */
export const CUSTOMER_STATUSES = ["active", "inactive", "blocked"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  blocked: "Blocked",
};

/** Mirrors `contactGroup` (payload/fields/common.ts). */
export type CustomerContact = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
};

/** Mirrors `addressGroup`. `geo` is a Payload point — [lng, lat]. */
export type CustomerAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  geo?: [number, number];
};

/** Mirrors `aiAssistGroup`. Advisory only; Hermes is disabled. */
export type CustomerAiAssist = {
  summary?: string;
  score?: number;
  nextAction?: string;
  lastEvaluatedAt?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  contact: CustomerContact;
  address: CustomerAddress;
  source?: CustomerSource;
  tags: string[];
  /** Relation ids — the booking records stay canonical. */
  bookingIds: string[];
  /** Relation ids into the Documents layer (M5). Never file bytes. */
  documentRefs: string[];
  consentMarketing: boolean;
  notes?: string;
  ai?: CustomerAiAssist;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ *
 * UNPERSISTED — needed by the business, absent from the schema
 * ------------------------------------------------------------------ */

/**
 * Fields the two-person operating model needs but the `customers` collection
 * does NOT have. They are modelled here as a separate overlay rather than as
 * optional fields on `CustomerRecord`, so that no caller can mistake them for
 * something that will survive a write.
 *
 *   ownerId      a salesperson owning the relationship. `leads` and
 *                `crm-activities` both have `owner → users`; `customers` does
 *                not. Person 1 (Sales) needs it.
 *   sourceLeadId which lead became this customer. No such relation exists, so
 *                lead→customer conversion cannot currently be persisted.
 *
 * Adding either is a schema change and therefore a separately approved
 * milestone. See CUSTOMER_UNPERSISTED_FIELDS.
 */
export type CustomerCrmOverlay = {
  customerId: string;
  ownerId?: string;
  sourceLeadId?: string;
  /** Always false in M6 — nothing here survives a database write. */
  persisted: false;
};

export const CUSTOMER_UNPERSISTED_FIELDS = [
  {
    field: "owner",
    need: "A salesperson owns the customer relationship (Person 1 / Sales).",
    blocker: "collections/Customers.ts has no `owner` relation; leads and crm-activities do.",
  },
  {
    field: "sourceLead",
    need: "Answer 'which customer came from this lead?' durably.",
    blocker: "No lead reference exists on customers, and no customer reference exists on leads.",
  },
] as const;

export function emptyOverlay(customerId: string): CustomerCrmOverlay {
  return { customerId, persisted: false };
}

/* ------------------------------------------------------------------ *
 * DERIVED — computed, never stored
 * ------------------------------------------------------------------ */

/**
 * Everything here is a function of persisted data. None of it is written back:
 * a stored "isRepeat" flag would be a second answer to a question the booking
 * relation already answers, and second answers drift.
 */
export type CustomerDerived = {
  /** More than one booking on record. */
  isRepeat: boolean;
  bookingCount: number;
  documentCount: number;
  hasContactChannel: boolean;
  /** Contactable, not blocked, and reachable — safe to include in outreach. */
  isContactable: boolean;
  /** Marketing outreach is permitted only with recorded consent. */
  isMarketable: boolean;
};

export function deriveCustomer(customer: CustomerRecord): CustomerDerived {
  const hasContactChannel = Boolean(
    customer.contact.phone?.trim() ||
      customer.contact.whatsapp?.trim() ||
      customer.contact.email?.trim(),
  );
  const isContactable = hasContactChannel && customer.status !== "blocked";

  return {
    isRepeat: customer.bookingIds.length > 1,
    bookingCount: customer.bookingIds.length,
    documentCount: customer.documentRefs.length,
    hasContactChannel,
    isContactable,
    isMarketable: isContactable && customer.consentMarketing,
  };
}

/** Display name for a surface. Never invents a name for an unnamed record. */
export function customerDisplayName(customer: CustomerRecord): string {
  return customer.name.trim() || "(unnamed customer)";
}

/* ------------------------------------------------------------------ *
 * Privacy
 * ------------------------------------------------------------------ */

/**
 * A customer record is PII — a different class of sensitivity from the
 * commercial data M3/M4 protect, and gated on a DIFFERENT axis.
 *
 * An earlier revision expressed this in the documents vocabulary
 * (`operations`/`founder`). That was wrong: the documents vocabulary has no
 * `sales` role, so the one person whose job is contacting customers could not be
 * given a phone number — and the only role that could also carried
 * `confidential` document access, which would have exposed supplier rate sheets
 * to the sales desk.
 *
 * Customer contact is therefore gated on the PAYLOAD role — who the signed-in
 * user actually is — via the platform role bridge, which keeps PII access and
 * commercial-document access as two independent axes. See lib/platform/roles.ts.
 */
export type CustomerActor = { role: Role };

export function canViewCustomerContact(actor: CustomerActor): boolean {
  return canAccessCustomerContact(actor.role);
}

/** Re-exported so callers have one import for the customer permission surface. */
export { CUSTOMER_CONTACT_ROLES };

/** A customer as an actor may see them — contact details absent unless permitted. */
export type CustomerView = Omit<CustomerRecord, "contact" | "address" | "notes"> & {
  contact?: CustomerContact;
  address?: CustomerAddress;
  notes?: string;
  contactRedacted: boolean;
};

/**
 * Redact in the DATA layer, not the template. The keys are physically removed
 * for unauthorised actors, so contact details cannot survive JSON serialisation
 * or leak through a surface that forgets to hide a column — the same mechanism
 * M3, M4 and M5 use for commercial values and document access.
 */
export function redactCustomer(customer: CustomerRecord, actor: CustomerActor): CustomerView {
  const { contact, address, notes, ...rest } = customer;

  if (canViewCustomerContact(actor)) {
    return { ...rest, contact, address, ...(notes ? { notes } : {}), contactRedacted: false };
  }

  const withheld =
    Object.values(contact).some(Boolean) || Object.values(address).some(Boolean) || Boolean(notes);
  return { ...rest, contactRedacted: withheld };
}

export function redactCustomers(customers: CustomerRecord[], actor: CustomerActor): CustomerView[] {
  return customers.map((c) => redactCustomer(c, actor));
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type CustomerSummary = {
  live: boolean;
  total: number;
  counts: Record<CustomerStatus, number>;
  repeat: number;
  marketable: number;
  withoutContactChannel: number;
  withDocuments: number;
};

export function emptyCustomerSummary(live = false): CustomerSummary {
  return {
    live,
    total: 0,
    counts: { active: 0, inactive: 0, blocked: 0 },
    repeat: 0,
    marketable: 0,
    withoutContactChannel: 0,
    withDocuments: 0,
  };
}

export function summarizeCustomers(customers: CustomerRecord[], live: boolean): CustomerSummary {
  const summary = emptyCustomerSummary(live);
  summary.total = customers.length;

  for (const customer of customers) {
    summary.counts[customer.status] += 1;
    const derived = deriveCustomer(customer);
    if (derived.isRepeat) summary.repeat += 1;
    if (derived.isMarketable) summary.marketable += 1;
    if (!derived.hasContactChannel) summary.withoutContactChannel += 1;
    if (derived.documentCount > 0) summary.withDocuments += 1;
  }

  return summary;
}
