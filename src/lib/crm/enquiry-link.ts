/**
 * Enquiry → CRM link. Pure, deterministic, no I/O.
 *
 * ⚠️ CURRENT REALITY, STATED PLAINLY:
 *   AN ENQUIRY IS NOT PERSISTED ANYWHERE.
 *
 * There is no `enquiries` collection, no table, no migration. `enquiry.ts`
 * validates the shape, `/api/enquiries` accepts it, and `enquiry-repository.ts`
 * writes it to the server console and returns. Its own comment points at a
 * planned `inquiries` collection that has never existed. So every enquiry the
 * site has ever received survives only as a log line.
 *
 * FUTURE: a separately approved milestone may introduce persistent enquiry
 * storage. That needs a new collection and a migration, and is deliberately NOT
 * part of this one.
 *
 * WHAT THIS MODULE IS FOR:
 * making the existing enquiry SHAPE foldable into the CRM without pretending it
 * is stored. It answers "if this enquiry were captured, what lead and what
 * customer would it become, and what is missing?" — so the day persistence is
 * approved, the translation is already written and tested rather than improvised.
 *
 * WHAT IT IS NOT: a second lead model. `crm/adapters.ts` already converts an
 * enquiry to a `CrmLead`, and this module DELEGATES to it rather than restating
 * the mapping — one enquiry→lead translation, not two.
 */
import type { Enquiry, EnquiryInput } from "@/lib/enquiry";
import { leadFromEnquiry } from "@/lib/crm/adapters";
import type { CrmLead } from "@/lib/crm/model";
import { customerSourceFromLead, type CustomerDraft } from "@/lib/crm/conversion";
import type { CustomerIdentity } from "@/lib/customer/duplicate";

/** Where an enquiry currently lives. Not a database table. */
export const ENQUIRY_PERSISTENCE = "none" as const;

export const ENQUIRY_PERSISTENCE_NOTE =
  "Enquiries are validated and logged, never stored. No enquiries collection exists; " +
  "persistent enquiry storage requires a new collection and a migration, and is a " +
  "separately approved milestone.";

/** Quotations are in the same position, and for the same reason. */
export const QUOTATION_PERSISTENCE = "none" as const;

export const QUOTATION_PERSISTENCE_NOTE =
  "Quotes are computed on demand from package data and a QT- reference hash. No " +
  "quotations collection exists, so a quote cannot currently be recalled or audited.";

/* ------------------------------------------------------------------ *
 * Enquiry → Lead
 * ------------------------------------------------------------------ */

/**
 * The lead an enquiry becomes. Delegates to the existing adapter so there is
 * exactly one enquiry→lead mapping in the codebase.
 *
 * Takes a full `Enquiry` (with id/status/createdAt) because that is what the
 * adapter reads — the pre-persistence `EnquiryInput` has no identity yet, which
 * is precisely the gap `draftEnquiry` below makes explicit.
 */
export function leadForEnquiry(enquiry: Enquiry): CrmLead {
  return leadFromEnquiry(enquiry);
}

/**
 * Turn a validated but unstored `EnquiryInput` into the `Enquiry` shape the CRM
 * speaks, WITHOUT inventing persistence.
 *
 * The caller supplies id and timestamp; nothing is generated here, so the
 * function stays pure and the identity is visibly the caller's responsibility
 * rather than something this module quietly conjured.
 */
export function draftEnquiry(input: EnquiryInput, id: string, createdAt: string): Enquiry {
  return { ...input, id, status: "new", createdAt };
}

/* ------------------------------------------------------------------ *
 * Enquiry → Customer
 * ------------------------------------------------------------------ */

/** The identity an enquiry offers for duplicate checking. */
export function identityFromEnquiry(enquiry: Enquiry | EnquiryInput): CustomerIdentity {
  return {
    name: enquiry.name,
    email: enquiry.email || undefined,
    phone: enquiry.phone,
    city: enquiry.city || undefined,
  };
}

/**
 * The customer an enquiry would become. A DRAFT — no id, no timestamps, not
 * persisted.
 *
 * Every `ENQUIRY_SOURCES` value (`package_page`, `departure_board`,
 * `contact_page`, `hero_search`, `general`) describes a place on the website, so
 * all five map to the customer source `website`. That is a translation between
 * two real vocabularies, not an assumption: the enquiry form is only reachable
 * from the site.
 *
 * `consentMarketing` is false. Asking for a trip is not permission to market.
 */
export function customerDraftFromEnquiry(enquiry: Enquiry | EnquiryInput): CustomerDraft {
  return {
    name: enquiry.name.trim(),
    contact: {
      phone: enquiry.phone,
      ...(enquiry.email ? { email: enquiry.email } : {}),
    },
    address: {
      ...(enquiry.city ? { city: enquiry.city } : {}),
    },
    source: customerSourceFromLead(`enquiry:${enquiry.source}`),
    tags: [],
    bookingIds: [],
    documentRefs: [],
    consentMarketing: false,
    status: "active",
  };
}

/* ------------------------------------------------------------------ *
 * Readiness
 * ------------------------------------------------------------------ */

export type EnquiryLinkability = {
  /** Enough to become a lead (the CRM needs a contactable name). */
  canBecomeLead: boolean;
  /** Enough to become a customer (`name` is required by the collection). */
  canBecomeCustomer: boolean;
  /** What is absent, named rather than counted. */
  missing: string[];
  /** Always false — see ENQUIRY_PERSISTENCE. */
  persisted: boolean;
};

/**
 * What this enquiry could become, and what is missing.
 *
 * `persisted` is hard-coded false rather than derived, because there is no state
 * in which it could currently be true, and a field that silently reads false
 * because a lookup failed would be indistinguishable from an honest answer.
 */
export function assessEnquiry(enquiry: Enquiry | EnquiryInput): EnquiryLinkability {
  const missing: string[] = [];
  const name = enquiry.name?.trim();
  const phone = enquiry.phone?.trim();

  if (!name) missing.push("name");
  if (!phone) missing.push("phone");
  if (!enquiry.email?.trim()) missing.push("email (optional, but needed for email follow-up)");
  if (!enquiry.city?.trim()) missing.push("city (optional, weakens duplicate detection)");

  return {
    canBecomeLead: Boolean(name && phone),
    canBecomeCustomer: Boolean(name),
    missing,
    persisted: false,
  };
}

/** The CRM chain, with each hop's true persistence state. Rendered by the console. */
export const CRM_CHAIN_PERSISTENCE = [
  { step: "Lead", collection: "leads", persisted: true },
  { step: "Enquiry", collection: null, persisted: false },
  { step: "Customer", collection: "customers", persisted: true },
  { step: "Quotation", collection: null, persisted: false },
  { step: "Booking", collection: "bookings", persisted: true },
  { step: "Payment", collection: "payments", persisted: true },
] as const;
