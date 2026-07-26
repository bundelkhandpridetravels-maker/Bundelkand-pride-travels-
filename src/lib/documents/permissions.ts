/**
 * Document access policy. Maps visibility → allowed roles, with owner-scoped
 * checks for customer/vendor documents. Future-ready RBAC — a real session
 * simply provides the actor; the policy here does not change.
 */
import type { DocumentRecord, DocumentVisibility } from "@/lib/documents/model";

export type DocumentActorRole =
  | "public"
  | "customer"
  | "vendor"
  | "employee"
  | "operations"
  | "finance"
  | "founder";

export type DocumentActor = {
  role: DocumentActorRole;
  customerId?: string;
  vendorId?: string;
};

const VISIBILITY_ROLES: Record<DocumentVisibility, DocumentActorRole[]> = {
  public: ["public", "customer", "vendor", "employee", "operations", "finance", "founder"],
  internal: ["employee", "operations", "finance", "founder"],
  finance: ["finance", "founder"],
  operations: ["operations", "founder"],
  vendor_only: ["vendor", "operations", "founder"],
  customer_only: ["customer", "operations", "founder"],
  founder_only: ["founder"],
  confidential: ["operations", "founder"],
};

/** Can this actor view the document? Owner-scoped for customer/vendor docs. */
export function canViewDocument(actor: DocumentActor, record: DocumentRecord): boolean {
  const allowed = VISIBILITY_ROLES[record.metadata.visibility];
  if (!allowed.includes(actor.role)) return false;

  // Staff/founder see everything they're allowed; owners see only their own.
  if (actor.role === "customer") {
    return !record.metadata.customerId || record.metadata.customerId === actor.customerId;
  }
  if (actor.role === "vendor") {
    return !record.metadata.vendorId || record.metadata.vendorId === actor.vendorId;
  }
  return true;
}

/** Who may verify/reject a document (operations + founder). */
export function canManageDocument(actor: DocumentActor): boolean {
  return actor.role === "operations" || actor.role === "founder";
}
