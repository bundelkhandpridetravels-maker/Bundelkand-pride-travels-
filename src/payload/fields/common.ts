/**
 * Reusable field models — the composable building blocks every collection is
 * assembled from, so shapes (money, contact, address, SEO, status, geo) stay
 * consistent across the whole schema and can evolve in one place.
 */
import type { CollectionSlug, Field, FieldOption } from "@/payload/types";

/** Supported currencies — multi-country from day one (vision: global expansion). */
export const CURRENCIES: FieldOption[] = [
  { label: "INR ₹", value: "INR" },
  { label: "USD $", value: "USD" },
  { label: "EUR €", value: "EUR" },
  { label: "GBP £", value: "GBP" },
  { label: "AED", value: "AED" },
];

/** A titled, indexed slug derived from another field. */
export const slugField = (from = "title"): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: { description: `URL slug (from ${from})`, position: "sidebar" },
});

/** Lifecycle status with draft/active/archived by default. */
export const statusField = (
  options: FieldOption[] = [
    { label: "Draft", value: "draft" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ],
  defaultValue = "draft",
): Field => ({
  name: "status",
  type: "select",
  options,
  defaultValue,
  index: true,
  admin: { position: "sidebar" },
});

export const currencyField = (defaultValue = "INR"): Field => ({
  name: "currency",
  type: "select",
  options: CURRENCIES,
  defaultValue,
});

/** A money group: amount + currency, kept together everywhere. */
export const moneyGroup = (name: string, label?: string): Field => ({
  name,
  type: "group",
  label,
  fields: [
    { name: "amount", type: "number", min: 0, defaultValue: 0 },
    currencyField(),
  ],
});

/** Standard contact channels. */
export const contactGroup: Field = {
  name: "contact",
  type: "group",
  fields: [
    { name: "phone", type: "text" },
    { name: "whatsapp", type: "text" },
    { name: "email", type: "email" },
    { name: "website", type: "text" },
  ],
};

/** Address with country + geo point — multi-country ready. */
export const addressGroup: Field = {
  name: "address",
  type: "group",
  fields: [
    { name: "line1", type: "text" },
    { name: "line2", type: "text" },
    { name: "city", type: "text", index: true },
    { name: "state", type: "text" },
    { name: "country", type: "text", index: true, defaultValue: "India" },
    { name: "pincode", type: "text" },
    { name: "geo", type: "point" },
  ],
};

/** SEO block for public-facing content. */
export const seoGroup: Field = {
  name: "seo",
  type: "group",
  admin: { description: "Search/social metadata" },
  fields: [
    { name: "metaTitle", type: "text" },
    { name: "metaDescription", type: "textarea" },
    { name: "ogImage", type: "upload", relationTo: "media" },
    { name: "noindex", type: "checkbox", defaultValue: false },
  ],
};

/** A relationship field with sensible defaults. */
export const relation = (
  name: string,
  relationTo: CollectionSlug | CollectionSlug[],
  opts: { hasMany?: boolean; required?: boolean } = {},
): Field => ({
  name,
  type: "relationship",
  relationTo,
  hasMany: opts.hasMany,
  required: opts.required,
  index: true,
});

/**
 * AI-assist block. Present on records AI workflows will enrich (leads, reviews,
 * vendors). Populated by Hermes AI later; never blocks manual use. Design intent
 * is flagged via `admin.aiWritable` so provenance stays explicit.
 */
export const aiAssistGroup: Field = {
  name: "ai",
  type: "group",
  admin: { description: "AI-generated assistance (Hermes) — advisory only" },
  fields: [
    { name: "summary", type: "textarea", admin: { readOnly: true, aiWritable: true } },
    { name: "score", type: "number", admin: { readOnly: true, aiWritable: true } },
    { name: "nextAction", type: "text", admin: { readOnly: true, aiWritable: true } },
    { name: "lastEvaluatedAt", type: "date", admin: { readOnly: true, aiWritable: true } },
  ],
};

/** Free-form internal tags. */
export const tagsField: Field = {
  name: "tags",
  type: "array",
  fields: [{ name: "tag", type: "text" }],
};
