/**
 * Role bridge — the one place the platform's two role vocabularies meet.
 *
 * THE PROBLEM THIS SOLVES:
 * BPT has two role vocabularies, both legitimate, neither wrong:
 *
 *   Payload (`@/payload/types` Role)      admin · ops · sales · vendor · customer ·
 *                                         trip_captain · influencer · b2b_partner
 *                                         — who a real signed-in USER is.
 *
 *   Documents (`documents/permissions`)   public · customer · vendor · employee ·
 *                                         operations · finance · founder
 *                                         — what a document VISIBILITY level admits.
 *
 * Nothing joined them, so `sales` — the role whose entire job is talking to
 * customers — could not be granted customer contact details by any existing
 * check. The only role that could (`operations`) also carries `confidential`
 * document access, which would have handed supplier rate sheets and signed
 * agreements to the sales desk.
 *
 * THE FIX, AND WHY IT IS SHAPED THIS WAY:
 * these are treated as TWO INDEPENDENT AXES rather than one ladder, because they
 * are answering different questions:
 *
 *   axis 1  document / commercial visibility  → DOCUMENT_ROLE_BRIDGE
 *   axis 2  customer contact (PII)            → CUSTOMER_CONTACT_ROLES
 *
 * A salesperson needs a customer's phone number and must not see what the hotel
 * charges. A single privilege ladder cannot express that; two axes can, and they
 * do it without inventing a third vocabulary or touching the frozen documents
 * permission matrix.
 *
 * Pure data and pure functions. No I/O.
 */
import type { DocumentActorRole } from "@/lib/documents/permissions";
import type { Role } from "@/payload/types";

/* ------------------------------------------------------------------ *
 * Axis 1 — document / commercial visibility
 * ------------------------------------------------------------------ */

/**
 * Which documents-vocabulary role a signed-in Payload user acts as.
 *
 * ⚠️ NOTE THE DELIBERATE ABSENCE: no Payload role maps to `founder`.
 *
 * `founder` is the documents vocabulary's highest level and is what M3 and M4
 * gate commercial values on — contract values and supplier rate amounts. Mapping
 * `admin` to it would mean any account later given the admin role silently
 * inherits the founder's commercial data. The founder actor is therefore granted
 * explicitly (the console does `{ role: "founder" }`) and is never reached by
 * automatic promotion from a user record.
 *
 * `admin` maps to `operations`: full operational visibility including
 * `confidential`, and no founder-only commercial data. If the business decides
 * an admin user IS the founder, that is a one-line change here — but it should
 * be a decision, not a default.
 *
 * `sales` maps to `employee`: internal documents, and explicitly NOT
 * `confidential`, so rate sheets and signed agreements stay out of reach.
 */
export const DOCUMENT_ROLE_BRIDGE: Record<Role, DocumentActorRole> = {
  admin: "operations",
  ops: "operations",
  sales: "employee",
  vendor: "vendor",
  customer: "customer",
  trip_captain: "employee",
  influencer: "public",
  b2b_partner: "public",
};

/** The documents-vocabulary role a Payload user acts as. */
export function toDocumentRole(role: Role): DocumentActorRole {
  return DOCUMENT_ROLE_BRIDGE[role];
}

/** No Payload role is promoted to `founder`. Asserted by test, not just prose. */
export function bridgeGrantsFounder(): boolean {
  return Object.values(DOCUMENT_ROLE_BRIDGE).includes("founder");
}

/* ------------------------------------------------------------------ *
 * Axis 2 — customer contact (PII)
 * ------------------------------------------------------------------ */

/**
 * Who may read a customer's contact details: name is visible to any staff role,
 * but phone, WhatsApp, email, address and internal notes are restricted to the
 * roles who actually contact or serve customers.
 *
 * `sales` is here because Person 1 cannot do their job otherwise. `ops` and
 * `admin` are here because Person 2 executes bookings against real people.
 * Nobody else is: a vendor, an influencer or a B2B partner has no business
 * reading a traveller's phone number.
 *
 * This list is intentionally NOT derived from DOCUMENT_ROLE_BRIDGE. Deriving it
 * would re-couple the two axes and reintroduce exactly the trade-off — contact
 * access implying commercial access — that this module exists to break.
 */
export const CUSTOMER_CONTACT_ROLES: readonly Role[] = ["admin", "ops", "sales"];

export function canAccessCustomerContact(role: Role): boolean {
  return CUSTOMER_CONTACT_ROLES.includes(role);
}

/** Staff, per Payload's own definition (payload/access.ts STAFF_ROLES). */
export const STAFF_ROLES: readonly Role[] = ["admin", "ops", "sales"];

export function isStaffRole(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export type RoleBridgeEntry = {
  role: Role;
  documentRole: DocumentActorRole;
  customerContact: boolean;
  staff: boolean;
};

/** The whole bridge as data, so a console can render it instead of guessing. */
export function describeRoleBridge(): RoleBridgeEntry[] {
  return (Object.keys(DOCUMENT_ROLE_BRIDGE) as Role[]).map((role) => ({
    role,
    documentRole: DOCUMENT_ROLE_BRIDGE[role],
    customerContact: canAccessCustomerContact(role),
    staff: isStaffRole(role),
  }));
}
