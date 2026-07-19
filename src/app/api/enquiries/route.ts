import { enquiryInputSchema } from "@/lib/enquiry";
import { getEnquiryRepository } from "@/lib/enquiry-repository";

/**
 * The one enquiry sink. Validates with the shared Zod schema, persists via the
 * repository (console today, Neon/Payload later), and returns the new id.
 *
 * Future integration points live here, added without touching the client:
 *   - Resend confirmation email to the customer + notification to sales
 *   - WhatsApp Cloud API message to the ops number
 *   - CRM webhook / lead-management event with attribution
 *   - Rate limiting (Upstash) + bot check (Turnstile) before persistence
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = enquiryInputSchema.safeParse(body);
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
    const enquiry = await getEnquiryRepository().create(parsed.data);
    return Response.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, error: "Couldn't save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
