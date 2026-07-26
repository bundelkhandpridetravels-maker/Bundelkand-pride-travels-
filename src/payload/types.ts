/**
 * Local, build-safe mirror of Payload CMS's collection-config API.
 *
 * WHY THIS EXISTS: the backend is being designed before it is wired. This repo
 * runs Next 16 (Payload 3 targets Next 15) and auto-deploys `main`, so we do NOT
 * install `payload` yet — that would risk breaking the live build. These types
 * mirror Payload's real shape closely enough that migration is mechanical:
 * change `import ... from "@/payload/types"` to `import ... from "payload"`,
 * add payload.config.ts + the /admin route + DATABASE_URL.
 *
 * Nothing under src/payload/ is imported by any page/route, so it stays out of
 * the production bundle. It is type-checked (design is validated) but inert.
 */

/** Every collection slug — gives relationships compile-time safety. */
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

export type FieldType =
  | "text"
  | "textarea"
  | "richText"
  | "number"
  | "email"
  | "date"
  | "checkbox"
  | "select"
  | "radio"
  | "relationship"
  | "array"
  | "group"
  | "json"
  | "upload"
  | "point";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldAdmin {
  description?: string;
  readOnly?: boolean;
  position?: "sidebar";
  /** Marks fields an AI workflow may populate later (design intent only). */
  aiWritable?: boolean;
}

export interface Field {
  name: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  localized?: boolean;
  hasMany?: boolean;
  relationTo?: CollectionSlug | CollectionSlug[];
  options?: FieldOption[];
  /** Sub-fields for `array` and `group`. */
  fields?: Field[];
  defaultValue?: unknown;
  min?: number;
  max?: number;
  admin?: FieldAdmin;
}

/** Access-control function signature — mirrors Payload's `Access`. */
export interface AuthUser {
  id: string;
  email?: string;
  role?: Role;
  /** For vendor-scoped users: the vendor document they belong to. */
  vendor?: string;
}

export interface AccessArgs {
  req: { user?: AuthUser | null };
  id?: string;
  data?: Record<string, unknown>;
}

/** `true`/`false`, or a Where-style constraint object for row-level access. */
export type AccessResult = boolean | Record<string, unknown>;
export type Access = (args: AccessArgs) => AccessResult;

export interface CollectionAccess {
  read?: Access;
  create?: Access;
  update?: Access;
  delete?: Access;
  admin?: Access;
}

export interface UploadConfig {
  staticDir?: string;
  mimeTypes?: string[];
  /** Named image sizes generated on upload. */
  imageSizes?: { name: string; width: number; height?: number }[];
}

export interface CollectionConfig {
  slug: CollectionSlug;
  labels?: { singular: string; plural: string };
  admin?: {
    useAsTitle?: string;
    defaultColumns?: string[];
    group?: AdminGroup;
    description?: string;
  };
  access?: CollectionAccess;
  /** Enables Payload auth on this collection (Users). */
  auth?: boolean;
  /** Enables file uploads (Media, Documents). */
  upload?: boolean | UploadConfig;
  timestamps?: boolean;
  versions?: boolean | { drafts?: boolean };
  fields: Field[];
}
