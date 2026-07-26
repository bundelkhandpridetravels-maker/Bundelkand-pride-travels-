import {
  BOOKING_JOURNEY,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/lib/booking/status";
import { cn } from "@/lib/cn";

/**
 * Reusable booking-journey timeline. Renders the canonical stages
 * (quote_requested → payment_pending → confirmed → completed) and highlights the
 * current one. `status` omitted → all upcoming (generic explainer). Used on the
 * booking confirmation, the customer tracking page, and later the dashboards.
 */
export default function BookingStatusTimeline({
  status,
  className,
}: {
  status?: BookingStatus;
  className?: string;
}) {
  if (status === "cancelled") {
    return (
      <div className={cn("rounded-xl border border-line bg-paper p-4 text-center", className)}>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-red-600">
          Booking cancelled
        </span>
      </div>
    );
  }

  const currentIndex = status ? BOOKING_JOURNEY.indexOf(status) : -1;

  return (
    <ol className={cn("flex items-start", className)} aria-label="Booking progress">
      {BOOKING_JOURNEY.map((stage, i) => {
        const done = currentIndex > i;
        const current = currentIndex === i;
        return (
          <li key={stage} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-px flex-1", i === 0 ? "bg-transparent" : done || current ? "bg-pine" : "bg-line")} />
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                  done
                    ? "bg-pine text-cream"
                    : current
                      ? "bg-gold text-ink"
                      : "border border-line bg-bone text-muted",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={cn("h-px flex-1", i === BOOKING_JOURNEY.length - 1 ? "bg-transparent" : done ? "bg-pine" : "bg-line")} />
            </div>
            <span
              className={cn(
                "mt-2 px-1 text-[11.5px] font-medium leading-tight",
                current ? "text-ink-text" : done ? "text-ink-text-2" : "text-muted",
              )}
            >
              {BOOKING_STATUS_LABELS[stage]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
