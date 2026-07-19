"use client";

import { useBooking } from "./BookingProvider";
import { company } from "@/data/company";
import { formatINR } from "@/lib/format";

/**
 * Sticky mobile action bar (hidden on lg+). Keeps the primary booking action
 * plus WhatsApp/Call thumb-reachable on every package page — the conversion
 * pattern BPT's mobile-first audience expects.
 */
export default function MobileBookingBar({
  slug,
  title,
  priceFrom,
  priceUnit,
  isGroup,
}: {
  slug: string;
  title: string;
  priceFrom: number;
  priceUnit: string;
  isGroup: boolean;
}) {
  const { open } = useBooking();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-bone/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
            From
          </span>
          <span className="font-mono text-base font-bold text-ink-text tabular-nums">
            {formatINR(priceFrom)}
            <span className="ml-1 text-[10px] font-normal text-muted">{priceUnit}</span>
          </span>
        </div>
        <a
          href={company.phoneHref}
          aria-label="Call us"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink/20 text-ink-text"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => open({ slug, title, isGroup, source: isGroup ? "departure_board" : "package_page" })}
          className="shrink-0 rounded-lg bg-gold px-6 py-3 text-sm font-bold text-ink"
        >
          {isGroup ? "Reserve seat" : "Book now"}
        </button>
      </div>
    </div>
  );
}
