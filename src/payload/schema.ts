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
export const collectionSlugs: CollectionSlug[] = collections.map((c) => c.slug);

/** Roles the RBAC layer recognises. */
export const roles: Role[] = ROLES;

/** Look up a collection config by slug. */
export function getCollection(slug: CollectionSlug): CollectionConfig | undefined {
  return collections.find((c) => c.slug === slug);
}

/**
 * Design-time integrity check — no duplicate slugs, and every `relationTo`
 * points at a real collection. Pure and side-effect-free; a wiring-phase test
 * can assert this returns []. Catches schema drift before it reaches a DB.
 */
export function validateSchema(): string[] {
  const errors: string[] = [];
  const slugs = new Set<CollectionSlug>();

  for (const c of collections) {
    if (slugs.has(c.slug)) errors.push(`Duplicate collection slug: ${c.slug}`);
    slugs.add(c.slug);
  }

  const walk = (fields: CollectionConfig["fields"], where: string) => {
    for (const f of fields) {
      if (f.relationTo) {
        const targets = Array.isArray(f.relationTo) ? f.relationTo : [f.relationTo];
        for (const t of targets) {
          if (!slugs.has(t)) {
            errors.push(`${where}.${f.name}: relationTo unknown collection "${t}"`);
          }
        }
      }
      if (f.fields) walk(f.fields, `${where}.${f.name}`);
    }
  };

  // Slugs are all collected above; validate relationships against them.
  for (const c of collections) walk(c.fields, c.slug);

  return errors;
}
