/**
 * Reusable RBAC access functions — the single pattern every collection reuses,
 * exactly as required by security-architecture §2/§14 ("every future module
 * inherits this without a redesign"). Pure functions of (role, id, doc); they
 * are design-time definitions here and become live Payload access control when
 * the backend is wired. No runtime dependency, fully build-safe.
 */
import type { Access, Role } from "@/payload/types";

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

/** Anyone, including anonymous — for public content reads. */
export const anyone: Access = () => true;

/** Any authenticated user. */
export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

/** Restrict to specific roles. */
export const hasRole =
  (...roles: Role[]): Access =>
  ({ req }) =>
    req.user?.role !== undefined && roles.includes(req.user.role);

export const isAdmin: Access = hasRole("admin");
export const isStaff: Access = hasRole(...STAFF_ROLES);

/** Staff may write; everyone may read only `active` documents. */
export const readPublishedOrStaff: Access = (args) => {
  if (isStaff(args)) return true;
  return { status: { equals: "active" } };
};

/** Admin/staff see all; a user sees only their own record. */
export const isAdminOrSelf =
  (idField = "id"): Access =>
  (args) => {
    if (isStaff(args)) return true;
    const uid = args.req.user?.id;
    if (!uid) return false;
    return { [idField]: { equals: uid } };
  };

/**
 * Row-level vendor scoping: vendor users see only rows tied to their vendor;
 * staff see all. The blueprint's "vendors see only their own" rule, written
 * once and reused across Hotels/DMCs/Transport/Payables/Reviews/etc.
 */
export const vendorScoped =
  (vendorField = "vendor"): Access =>
  (args) => {
    if (isStaff(args)) return true;
    const { user } = args.req;
    if (user?.role === "vendor" && user.vendor) {
      return { [vendorField]: { equals: user.vendor } };
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
  return isStaff({ req });
};
