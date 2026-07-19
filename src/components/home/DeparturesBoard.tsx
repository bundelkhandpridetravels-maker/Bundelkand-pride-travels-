import Link from "next/link";
import { Section, SectionHeading } from "@/components/site/Section";
import { type Departure } from "@/data/home";
import { getDepartures } from "@/lib/departures";

const departures = getDepartures();

const statusStyle: Record<Departure["status"], string> = {
  Open: "border-pine/50 bg-pine/20 text-pine-tint",
  Filling: "border-gold/50 bg-gold/15 text-gold-bright",
  Limited: "border-gold-bright/60 bg-gold-bright/15 text-gold-bright",
  Seasonal: "border-cream/25 bg-cream/10 text-cream/80",
};

/**
 * The signature "departures board" — an airport flip-board rendered as a
 * table of fixed-date group batches.
 */
export default function DeparturesBoard() {
  return (
    <Section id="group-departures" tone="ink">
      <SectionHeading
        eyebrow="Fixed departures"
        tone="dark"
        title="The departures board"
        lede="Set dates, fixed prices, a dedicated trip captain. Reserve a seat and we handle the rest."
        action={
          <Link
            href="/group-departures"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold-bright transition-colors hover:text-gold"
          >
            All departures →
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-cream/10 bg-ink-raised">
        <div className="hidden grid-cols-[92px_1fr_100px_150px_110px] gap-4 border-b border-cream/10 px-5 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-mist lg:grid">
          <span>Departs</span>
          <span>Trip</span>
          <span>Duration</span>
          <span>From</span>
          <span className="text-right">Status</span>
        </div>

        <ul>
          {departures.map((d) => (
            <li key={`${d.when}-${d.title}`}>
              <Link
                href="/group-departures"
                className="group grid grid-cols-1 gap-2 border-b border-cream/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-cream/5 lg:grid-cols-[92px_1fr_100px_150px_110px] lg:items-center lg:gap-4"
              >
                <span className="flex items-baseline gap-2 lg:block">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
                    {d.cadence}
                  </span>
                  <span className="block font-mono text-sm font-bold text-gold tabular-nums">
                    {d.when}
                  </span>
                </span>

                <span className="text-[15px] font-semibold text-cream transition-colors group-hover:text-gold-bright">
                  {d.title}
                </span>

                <span className="font-mono text-xs text-mist tabular-nums">
                  {d.duration}
                </span>

                <span className="font-mono text-sm text-cream tabular-nums">
                  {d.price}
                </span>

                <span className="lg:text-right">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${statusStyle[d.status]}`}
                  >
                    {d.status}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
