import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Access gate for internal tooling (Next 16 renamed Middleware → Proxy).
 *
 * /dashboard/* is the founder's command centre: roadmap, blockers, internal
 * notes. `robots.txt` only asks crawlers not to index it — it does not stop a
 * person opening the URL. This puts HTTP Basic Auth in front of it.
 *
 * Fails CLOSED: if no password is configured in the environment, the dashboard
 * is blocked entirely rather than served unprotected. An unset variable must
 * never be the reason internal data leaks.
 *
 * Set in Vercel → Settings → Environment Variables:
 *   FOUNDER_DASHBOARD_USER      (optional, defaults to "founder")
 *   FOUNDER_DASHBOARD_PASSWORD  (required — pick something long)
 *
 * This is deliberately a simple lock for a single-user internal page. When the
 * Vendor/Customer portals arrive they get real sessions (see
 * docs/security-architecture.md §2), not Basic Auth.
 */

function unauthorized(message = "Authentication required") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      // Header values must be ASCII (ByteString) — no em-dashes or smart quotes.
      "WWW-Authenticate": 'Basic realm="Bundelkhand Pride Travels internal", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

/** Constant-time-ish comparison to avoid leaking length/prefix via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function proxy(request: NextRequest) {
  const expectedPassword = process.env.FOUNDER_DASHBOARD_PASSWORD;
  const expectedUser = process.env.FOUNDER_DASHBOARD_USER ?? "founder";

  // No password configured → refuse to serve the page at all.
  if (!expectedPassword) {
    return new NextResponse(
      "Dashboard locked: set FOUNDER_DASHBOARD_PASSWORD in the environment to enable access.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized("Malformed credentials");
  }

  const sep = decoded.indexOf(":");
  const user = sep === -1 ? "" : decoded.slice(0, sep);
  const password = sep === -1 ? "" : decoded.slice(sep + 1);

  if (!safeEqual(user, expectedUser) || !safeEqual(password, expectedPassword)) {
    return unauthorized("Invalid credentials");
  }

  const res = NextResponse.next();
  // Internal pages must never be cached by a CDN or shared proxy.
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
