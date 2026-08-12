/**
 * Payload type surface for the BPT schema.
 *
 * HISTORY: this file used to be a hand-written *mirror* of Payload's API, because
 * Payload could not be installed while `main` auto-deployed and Payload 3 did not
 * yet support Next 16. That constraint is gone — Payload 3.88.0 officially
 * supports Next 16.2.x — so the mirror has been replaced by the real thing.
 *
 * The 19 collection files did NOT have to change their imports: they still
 * `import type { CollectionConfig } from "@/payload/types"`, but that name now
 * resolves to Payload's own type. The compiler therefore checks every collection
 * against the real CMS contract instead of against our approximation.
 *
 * What stays local is our DOMAIN vocabulary — roles, admin groups, the collection
 * slug union — because those are BPT's design decisions, not Payload's.
 */

// ── Real Payload types, re-exported under the names the schema already uses.
export type {
  Access,
  AccessArgs,
  AccessResult,
  CollectionConfig,
  Field,
  PayloadRequest,
  Where,
} from "payload";

/** Every collection slug — gives our own helpers compile-time safety. */
export type CollectionSlug =
  | "users"
  | "customers"
  | "vendors"
  | "hotels"
  | "dmcs"
  | "transport-providers"
  | "destinations"
  | "packages"
  | "itineraries"
  | "bookings"
  | "payments"
  | "leads"
  | "crm-activities"
  | "reviews"
  | "influencers"
  | "trip-captains"
  | "documents"
  | "media"
  | "contracts";

/** Roles across the whole platform (extends security-architecture §2). */
export type Role =
  | "admin"
  | "ops"
  | "sales"
  | "vendor"
  | "customer"
  | "trip_captain"
  | "influencer"
  | "b2b_partner";

/** Admin sidebar grouping — keeps the CMS navigable as collections grow. */
export type AdminGroup =
  | "Access"
  | "CRM"
  | "Catalogue"
  | "Supply"
  | "Operations"
  | "Finance"
  | "Partners"
  | "Content"
  | "Legal";

/** Select/radio option shape used by our field helpers. */
export interface FieldOption {
  label: string;
  value: string;
}

/**
 * The shape our RBAC helpers read off `req.user`. Payload types `req.user` from
 * the auth collection with an `any` index signature, so this narrows it to the
 * fields we actually rely on without fighting the CMS's own typing.
 */
export interface AuthUser {
  /** Payload document IDs are `string | number` depending on the adapter. */
  id: string | number;
  email?: string;
  role?: Role;
  /** For vendor-scoped users: the vendor document they belong to. */
  vendor?: string;
}

/**
 * Marker for fields a Hermes AI workflow may populate. Stored under Payload's
 * native `admin.custom`, so provenance stays explicit without inventing a
 * non-standard admin property.
 */
export const AI_WRITABLE = { aiWritable: true } as const;
