// Server-only: imported exclusively by the /api/bookings route handler.
import { randomUUID } from "node:crypto";
import type { BookingRecord, BookingRequest } from "@/lib/booking/booking";
import { initialBookingStatus } from "@/lib/booking/status";

/**
 * Persistence boundary for bookings — the exact pattern proven by
 * EnquiryRepository. The API route depends on this interface, never a concrete
 * store. Going live = implement PayloadBookingRepository / NeonBookingRepository
 * and swap it in `getBookingRepository()`; the journey, route and buttons stay.
 *
 * Planned side-effects layered in `create()` later: Resend confirmation email,
 * WhatsApp ops notification, and (once the gateway is live) issuing the payment
 * link for the payment_pending booking.
 */
export interface BookingRepository {
  create(input: BookingRequest): Promise<BookingRecord>;
}

/** Short, human-friendly, non-sequential reference. Not a security token. */
function makeReference(): string {
  const s = randomUUID().replace(/-/g, "").toUpperCase();
  return `BPT-${s.slice(0, 6)}`;
}

/**
 * Default store until the database is connected. Stamps id/reference/status/
 * timestamp and logs a structured record so nothing is lost pre-backend. New
 * bookings start `payment_pending` — payment is connected later without any
 * change here.
 */
class ConsoleBookingRepository implements BookingRepository {
  async create(input: BookingRequest): Promise<BookingRecord> {
    const record: BookingRecord = {
      ...input,
      id: `bkg_${randomUUID()}`,
      reference: makeReference(),
      status: initialBookingStatus(),
      createdAt: new Date().toISOString(),
    };
    console.info("[booking:new]", JSON.stringify(record));
    return record;
  }
}

let repo: BookingRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getBookingRepository(): BookingRepository {
  if (!repo) repo = new ConsoleBookingRepository();
  return repo;
}
