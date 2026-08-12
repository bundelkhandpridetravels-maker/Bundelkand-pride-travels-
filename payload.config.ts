import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { collections } from "@/payload/schema";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Payload CMS configuration.
 *
 * ⚠️ ROUTE ISOLATION — the single most important line in this file is
 * `routes.api`. Payload mounts its REST API at `/api` by DEFAULT, which would
 * sit on top of this application's existing, already-live endpoints:
 *
 *     /api/enquiries · /api/bookings · /api/reviews        (PUBLIC)
 *     /api/vendors/onboarding · /api/contracts             (staff, auth-gated)
 *
 * Payload is therefore mounted at `/payload-api` instead. Do not change this
 * without re-checking every route above — they are customer-facing and are
 * verified in production after each deploy.
 *
 * The 19 collections come from the existing schema (src/payload/schema.ts)
 * unchanged: this file wires the design that was already reviewed, it does not
 * redefine it.
 */
export default buildConfig({
  // Signs auth tokens. Supplied via the environment; never hard-coded.
  secret: process.env.PAYLOAD_SECRET ?? "",

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? "" },
  }),

  // Required because Destinations.overview is a `richText` field.
  editor: lexicalEditor(),

  // Image processing for the upload-enabled collections (Media, Documents).
  sharp,

  collections,

  admin: {
    // The only auth-enabled collection.
    user: "users",
    meta: {
      titleSuffix: "— Bundelkhand Pride Travels",
    },
  },

  routes: {
    // See the warning above. NOT "/api".
    api: "/payload-api",
  },

  typescript: {
    outputFile: path.resolve(dirname, "src/payload/payload-types.ts"),
  },
});
