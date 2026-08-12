/**
 * Build-isolated schema entry point.
 *
 * This is the single object a future `payload.config.ts` will consume. It does
 * NOT import `payload`, does NOT open a database connection, and requires no
 * DATABASE_URL — importing it has zero runtime side effects. It exists so the
 * schema can be inspected, tested and reviewed before the backend is wired.
 *
 * When the backend goes live (DATABASE_URL available), payload.config.ts will:
 *   import { collections } from "@/payload/schema";
 *   export default buildConfig({ db: postgresAdapter(...), collections, ... });
 */
import { collections } from "@/payload/collections";
import { ROLES } from "@/payload/access";
import type { CollectionConfig, CollectionSlug, Role } from "@/payload/types";

export { collections };

/** Every slug defined, for quick reference / tests. */
export const collectionSlugs: string[] = collections.map((c) => c.slug);

/** Roles the RBAC layer recognises. */
export const roles: Role[] = ROLES;

/** Look up a collection config by slug. */
export function getCollection(slug: CollectionSlug): CollectionConfig | undefined {
  return collections.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ *
 * Field introspection
 *
 * Payload's `Field` is a discriminated union — `relationTo`, `fields` and even
 * `name` exist only on some members. These guards narrow safely instead of
 * assuming a flat shape, so the validator keeps working as Payload's union
 * evolves.
 * ------------------------------------------------------------------ */

type SchemaField = CollectionConfig["fields"][number];

function relationTargets(field: SchemaField): string[] {
  if (!("relationTo" in field)) return [];
  const target = (field as { relationTo?: unknown }).relationTo;
  if (typeof target === "string") return [target];
  if (Array.isArray(target)) return target.filter((t): t is string => typeof t === "string");
  return [];
}

function subFields(field: SchemaField): SchemaField[] {
  if (!("fields" in field)) return [];
  const nested = (field as { fields?: unknown }).fields;
  return Array.isArray(nested) ? (nested as SchemaField[]) : [];
}

function fieldName(field: SchemaField): string {
  return "name" in field && typeof field.name === "string" ? field.name : "(unnamed)";
}

/**
 * Design-time integrity check — no duplicate slugs, and every `relationTo`
 * points at a real collection. Pure and side-effect-free; a wiring-phase test
 * can assert this returns []. Catches schema drift before it reaches a DB.
 */
export function validateSchema(): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();

  for (const c of collections) {
    if (slugs.has(c.slug)) errors.push(`Duplicate collection slug: ${c.slug}`);
    slugs.add(c.slug);
  }

  const walk = (fields: SchemaField[], where: string) => {
    for (const f of fields) {
      for (const target of relationTargets(f)) {
        if (!slugs.has(target)) {
          errors.push(`${where}.${fieldName(f)}: relationTo unknown collection "${target}"`);
        }
      }
      const nested = subFields(f);
      if (nested.length > 0) walk(nested, `${where}.${fieldName(f)}`);
    }
  };

  // Slugs are all collected above; validate relationships against them.
  for (const c of collections) walk(c.fields, c.slug);

  return errors;
}
