import Link from "next/link";
import { featuredDestinations } from "@/data/destinations";
import { destinationDetails } from "@/data/destination-details";
import DestinationImage from "@/components/ui/DestinationImage";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Premium destination cards shown at the foot of the hero. */
export default function FeaturedDestinations() {
  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
          Featured destinations
        </h2>
        <Link
          href="/destinations"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold-bright hover:text-gold transition-colors"
        >
          View all →
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {featuredDestinations.map((d) => (
          <li key={d.slug}>
            <Link
              href={destinationDetails[d.slug] ? `/destinations/${d.slug}` : "/destinations"}
              className="group block overflow-hidden rounded-xl border border-cream/10 bg-ink-raised transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="relative h-24 overflow-hidden sm:h-28">
                <DestinationImage
                  src={d.image}
                  alt={d.imageAlt}
                  gradient={d.gradient}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-gold-bright backdrop-blur-sm">
                  <span aria-hidden="true">★</span>
                  <span className="tabular-nums">{d.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-bold text-cream">{d.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-mist">
                  {d.nights}N / {d.days}D · {d.region}
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-cream/10 pt-2">
                  <span className="font-mono text-sm text-gold tabular-nums">
                    {inr.format(d.priceFrom)}
                  </span>
                  <span className="font-mono text-[9px] uppercase text-mist">
                    from
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
