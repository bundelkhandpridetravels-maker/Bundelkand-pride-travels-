// Server-only: imported exclusively by the /api/bookings/lookup route handler.
import type { BookingLookup, BookingLookupHit } from "@/lib/booking/lookup";

/**
 * Lookup boundary for customer booking tracking.
 *
 * `live: false` means no persistent store is connected yet (today) — the route
 * returns a "tracking pending" state rather than a false "not found". When a
 * real store lands, `find()` returns `{ live: true, hit }` and the SAME route
 * distinguishes found vs not_found. UI never changes.
 */
export type LookupOutcome =
  | { live: false }
  | { live: true; hit: BookingLookupHit | null };

export interface BookingLookupRepository {
  find(input: BookingLookup): Promise<LookupOutcome>;
}

/** Pre-backend stub: cannot resolve references (nothing is persisted yet). */
class ConsoleBookingLookupRepository implements BookingLookupRepository {
  async find(_input: BookingLookup): Promise<LookupOutcome> {
    void _input;
    return { live: false };
  }
}

let repo: BookingLookupRepository | null = null;

/** Swap in PayloadBookingLookupRepository / NeonBookingLookupRepository here. */
export function getBookingLookupRepository(): BookingLookupRepository {
  if (!repo) repo = new ConsoleBookingLookupRepository();
  return repo;
}
