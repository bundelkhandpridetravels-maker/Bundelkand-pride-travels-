import { z } from "zod";
import type { BookingStatus } from "@/lib/booking/status";

/**
 * The guided online-booking model. Isolated from the quick-enquiry path
 * (src/lib/enquiry.ts), which is unchanged. Shape mirrors the Payload `bookings`
 * collection so the future backend swap is a drop-in — only the API route's sink
 * changes, never this client contract.
 */

export const bookingRequestSchema = z.object({
  // Trip
  packageSlug: z.string().trim().min(1, "Choose a package.").max(80),
  packageTitle: z.string().trim().min(1).max(160),
  travelDate: z.string().trim().max(40).optional().or(z.literal("")),
  adults: z.coerce.number().int().min(1, "At least one adult.").max(40),
  children: z.coerce.number().int().min(0).max(40),
  pickupPoint: z.string().trim().max(120).optional().or(z.literal("")),

  // Traveller / contact
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number, including country code.")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Enter a valid phone number."),
  email: z
    .string()
    .trim()
    .max(120)
    .email("Enter a valid email, or leave it blank.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  specialRequirements: z.string().trim().max(1000).optional().or(z.literal("")),

  // Indicative quote snapshot captured at submission (not a final invoice).
  quoteTotal: z.coerce.number().min(0).optional(),

  // Attribution.
  source: z.string().trim().max(60).default("booking_journey"),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** Persisted booking — what the repository / future CRM stores. */
export type BookingRecord = BookingRequest & {
  id: string;
  /** Human-friendly reference shown to the customer (e.g. BPT-7F3K2Q). */
  reference: string;
  status: BookingStatus;
  createdAt: string;
};

export type SubmitBookingResult =
  | { ok: true; id: string; reference: string; status: BookingStatus }
  | {
      ok: false;
      fieldErrors?: Partial<Record<keyof BookingRequest, string>>;
      error?: string;
    };

type ApiResponse = {
  ok?: boolean;
  id?: string;
  reference?: string;
  status?: BookingStatus;
  error?: string;
  fieldErrors?: Partial<Record<keyof BookingRequest, string>>;
};

/** Client submit → the one booking API route. UI never calls fetch directly. */
export async function submitBooking(
  input: BookingRequest,
): Promise<SubmitBookingResult> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse;
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        fieldErrors: data.fieldErrors,
        error: data.error ?? "Something went wrong. Please try again.",
      };
    }
    return {
      ok: true,
      id: data.id ?? "",
      reference: data.reference ?? "",
      status: data.status ?? "payment_pending",
    };
  } catch {
    return {
      ok: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
