/**
 * Reusable RBAC access functions — the single pattern every collection reuses,
 * exactly as required by security-architecture §2/§14 ("every future module
 * inherits this without a redesign"). Pure functions of (role, id, doc).
 *
 * These are now typed against Payload's REAL `Access` contract (see types.ts),
 * so the compiler verifies them against the CMS rather than against a mirror.
 *
 * Implementation note: Payload's `Access` may return a Promise, and every one of
 * ours is synchronous. Composition therefore goes through the private `staff()`
 * predicate below rather than calling an `Access`-typed function and branching
 * on its result — `if (somePromise)` is always truthy, which would silently
 * grant access. Keeping the predicate separate makes that mistake impossible.
 */
import type { Access, AuthUser, Role, Where } from "@/payload/types";

export const ROLES: Role[] = [
  "admin",
  "ops",
  "sales",
  "vendor",
  "customer",
  "trip_captain",
  "influencer",
  "b2b_partner",
];

/** Internal staff who run operations. */
export const STAFF_ROLES: Role[] = ["admin", "ops", "sales"];

/** Narrow Payload's loosely-typed `req.user` to the fields our RBAC reads. */
function actor(req: { user?: unknown }): AuthUser | null {
  const user = req.user as AuthUser | null | undefined;
  return user ?? null;
}

/** Private synchronous predicate — the basis for all composition below. */
function hasAnyRole(req: { user?: unknown }, roles: Role[]): boolean {
  const user = actor(req);
  return user?.role !== undefined && roles.includes(user.role);
}

const staff = (req: { user?: unknown }): boolean => hasAnyRole(req, STAFF_ROLES);

/** Anyone, including anonymous — for public content reads. */
export const anyone: Access = () => true;

/** Any authenticated user. */
export const isAuthenticated: Access = ({ req }) => Boolean(actor(req));

/** Restrict to specific roles. */
export const hasRole =
  (...roles: Role[]): Access =>
  ({ req }) =>
    hasAnyRole(req, roles);

export const isAdmin: Access = hasRole("admin");
export const isStaff: Access = hasRole(...STAFF_ROLES);

/** Staff may write; everyone may read only `active` documents. */
export const readPublishedOrStaff: Access = ({ req }) => {
  if (staff(req)) return true;
  return { status: { equals: "active" } } satisfies Where;
};

/** Admin/staff see all; a user sees only their own record. */
export const isAdminOrSelf =
  (idField = "id"): Access =>
  ({ req }) => {
    if (staff(req)) return true;
    const uid = actor(req)?.id;
    if (!uid) return false;
    return { [idField]: { equals: uid } } satisfies Where;
  };

/**
 * Row-level vendor scoping: vendor users see only rows tied to their vendor;
 * staff see all. The blueprint's "vendors see only their own" rule, written
 * once and reused across Hotels/DMCs/Transport/Payables/Reviews/etc.
 */
export const vendorScoped =
  (vendorField = "vendor"): Access =>
  ({ req }) => {
    if (staff(req)) return true;
    const user = actor(req);
    if (user?.role === "vendor" && user.vendor) {
      return { [vendorField]: { equals: user.vendor } } satisfies Where;
    }
    return false;
  };

/**
 * AI-agent gate (vision: Hermes AI). Any irreversible/financial mutation an AI
 * proposes must pass through a human ApprovalQueue (security-architecture §12).
 * Placeholder policy: never allow an automated principal to write directly.
 */
export const requiresHumanApproval: Access = ({ req }) => {
  // A future AI principal would carry role/agent metadata; until then, only
  // real staff may mutate. AI writes go via ApprovalQueue, never here.
  return staff(req);
};
