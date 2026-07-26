import { bookingLookupSchema } from "@/lib/booking/lookup";
import { getBookingLookupRepository } from "@/lib/booking/booking-lookup-repository";

/**
 * Customer booking lookup. Validates, then asks the repository. While no store
 * is connected, returns `found: false, reason: "pending_backend"` (honest — not
 * a false "not found"). When the backend lands, the same route returns the real
 * booking or `reason: "not_found"`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingLookupSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return Response.json(
      { ok: false, fieldErrors, error: "Please check the highlighted fields." },
      { status: 422 },
    );
  }

  const outcome = await getBookingLookupRepository().find(parsed.data);

  if (!outcome.live) {
    return Response.json({ ok: true, found: false, reason: "pending_backend" }, { status: 200 });
  }
  if (!outcome.hit) {
    return Response.json({ ok: true, found: false, reason: "not_found" }, { status: 200 });
  }
  return Response.json({ ok: true, found: true, booking: outcome.hit }, { status: 200 });
}
