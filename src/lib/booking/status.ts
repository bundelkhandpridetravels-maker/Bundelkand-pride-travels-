/**
 * Booking state machine — the backbone that lets payments be connected later
 * without redesigning the customer journey.
 *
 * Mirrors the Payload `bookings` collection statuses (src/payload/collections/
 * Bookings.ts). `payment_pending` is a first-class state: every online booking
 * lands here today. When the gateway goes live, a booking simply advances
 * payment_pending → confirmed on successful payment — the journey, the record
 * and the UI states already exist.
 */

export const BOOKING_STATUSES = [
  "quote_requested",
  "payment_pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  quote_requested: "Quote requested",
  payment_pending: "Payment pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Forward progression used by the UI stepper / status badges. */
export const BOOKING_JOURNEY: BookingStatus[] = [
  "quote_requested",
  "payment_pending",
  "confirmed",
  "completed",
];

/**
 * Master switch. Payments are intentionally postponed (GST registration +
 * merchant verification in progress). Flip to `true` when the gateway is live —
 * that is the ONLY change needed to turn on the pay step.
 */
export const PAYMENTS_ENABLED = false;

/**
 * The status a newly submitted online booking takes. Today: payment_pending
 * (awaiting a payment link / offline confirmation). This stays correct when
 * payments turn on — a paid booking then transitions to `confirmed`.
 */
export function initialBookingStatus(): BookingStatus {
  return "payment_pending";
}
