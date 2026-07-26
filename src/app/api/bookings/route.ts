import { bookingRequestSchema } from "@/lib/booking/booking";
import { getBookingRepository } from "@/lib/booking/booking-repository";

/**
 * The one online-booking sink. Validates with the shared Zod schema, persists
 * via the repository (console today, Neon/Payload later), and returns the id,
 * reference and status. Isolated from /api/enquiries (unchanged).
 *
 * Future integration points added here without touching the client:
 *   - Resend confirmation email + WhatsApp ops notification
 *   - Payment link issuance for the payment_pending booking (when gateway live)
 *   - Rate limiting (Upstash) + bot check (Turnstile)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
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

  try {
    const booking = await getBookingRepository().create(parsed.data);
    return Response.json(
      { ok: true, id: booking.id, reference: booking.reference, status: booking.status },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Couldn't save your booking. Please try again." },
      { status: 500 },
    );
  }
}
