import { formatINR } from "@/lib/format";
import { company } from "@/data/company";
import BookNowButton from "@/components/booking/BookNowButton";

type Props = {
  slug: string;
  priceFrom: number;
  priceUnit: string;
  nights: number;
  days: number;
  rating: number;
  reviews: number;
  minPax: string;
  pickup: string;
  drop: string;
  title: string;
  isGroup: boolean;
};

/**
 * Sticky booking panel (desktop). Primary action opens the booking modal with
 * this package prefilled; WhatsApp and Call are secondary support channels.
 */
export default function BookingPanel({
  slug,
  priceFrom,
  priceUnit,
  nights,
  days,
  rating,
  reviews,
  minPax,
  pickup,
  drop,
  title,
  isGroup,
}: Props) {
  const waHref = `${company.whatsappHref}?text=${encodeURIComponent(
    `Hi Bundelkhand Pride Travels, I'd like to know more about the "${title}" package.`,
  )}`;

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-line bg-bone p-6 shadow-[0_12px_40px_-16px_rgba(10,14,26,0.25)]">
        <div className="flex items-end justify-between border-b border-hair pb-4">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
              Starting from
            </span>
            <span className="font-mono text-3xl font-bold text-ink-text tabular-nums">
              {formatINR(priceFrom)}
            </span>
            <span className="block font-mono text-[11px] text-muted">{priceUnit}</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm text-gold-dim">
              <span aria-hidden="true">★</span>{" "}
              <span className="tabular-nums">{rating.toFixed(1)}</span>
            </span>
            <span className="block font-mono text-[10px] text-muted tabular-nums">
              {reviews} reviews
            </span>
          </div>
        </div>

        <dl className="space-y-2.5 border-b border-hair py-4 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Duration</dt>
            <dd className="font-mono tabular-nums text-ink-text">
              {nights}N / {days}D
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{isGroup ? "Availability" : "Group size"}</dt>
            <dd className="text-right text-ink-text">{minPax}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted">Pickup</dt>
            <dd className="text-right text-ink-text">{pickup}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted">Drop</dt>
            <dd className="text-right text-ink-text">{drop}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2.5">
          <BookNowButton
            slug={slug}
            title={title}
            isGroup={isGroup}
            source={isGroup ? "departure_board" : "package_page"}
            className="block w-full text-center"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-ink/20 py-2.5 text-center text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5"
            >
              WhatsApp
            </a>
            <a
              href={company.phoneHref}
              className="block rounded-lg border border-ink/20 py-2.5 text-center text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5"
            >
              Call us
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          No payment now. We confirm availability and share a written itinerary
          with full inclusions first.
        </p>
      </div>
    </aside>
  );
}
