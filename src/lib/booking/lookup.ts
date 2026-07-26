import { z } from "zod";
import type { BookingStatus } from "@/lib/booking/status";

/**
 * Customer booking lookup — the "track my trip" contract. Isolated client model;
 * the API route's sink swaps from stub → real store without touching the UI.
 */

export const bookingLookupSchema = z.object({
  reference: z.string().trim().min(3, "Enter your booking reference.").max(40),
  phone: z
    .string()
    .trim()
    .min(4, "Enter the phone number on the booking.")
    .max(20),
});

export type BookingLookup = z.infer<typeof bookingLookupSchema>;

export type BookingLookupHit = {
  reference: string;
  status: BookingStatus;
  packageTitle?: string;
  travelDate?: string;
};

export type BookingLookupResult =
  | { ok: true; found: true; booking: BookingLookupHit }
  | { ok: true; found: false; reason: "not_found" | "pending_backend" }
  | {
      ok: false;
      fieldErrors?: Partial<Record<keyof BookingLookup, string>>;
      error?: string;
    };

type ApiResponse = {
  ok?: boolean;
  found?: boolean;
  reason?: "not_found" | "pending_backend";
  booking?: BookingLookupHit;
  error?: string;
  fieldErrors?: Partial<Record<keyof BookingLookup, string>>;
};

export async function lookupBooking(
  input: BookingLookup,
): Promise<BookingLookupResult> {
  try {
    const res = await fetch("/api/bookings/lookup", {
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
    if (data.found && data.booking) {
      return { ok: true, found: true, booking: data.booking };
    }
    return { ok: true, found: false, reason: data.reason ?? "not_found" };
  } catch {
    return {
      ok: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
