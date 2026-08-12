/* THIS FILE IS PART OF THE PAYLOAD ADMIN MOUNT.
 *
 * Payload's REST API, mounted at /payload-api — deliberately NOT /api.
 *
 * The application already owns /api/enquiries, /api/bookings, /api/reviews
 * (public) and /api/vendors/onboarding, /api/contracts (staff, auth-gated).
 * A Payload catch-all at /api would sit on top of all of them. The path here
 * must stay in step with `routes.api` in payload.config.ts.
 */
import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
} from "@payloadcms/next/routes";

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const OPTIONS = REST_OPTIONS(config);
