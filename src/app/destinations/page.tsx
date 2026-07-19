import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { featuredDestinations } from "@/data/destinations";
import { destinationDetails } from "@/data/destination-details";
import { formatINR } from "@/lib/format";
import DestinationImage from "@/components/ui/DestinationImage";

export const metadata: Metadata = {
  alternates: { canonical: "/destinations" },
  title: "Destinations",
  description:
    "Destinations we run trips to across India — Kashmir, Manali, Goa, Kerala, Rajasthan and the Andamans. Guides, best time to visit, and curated packages.",
};

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate bg-ink px-6 pb-14 pt-36 text-cream sm:px-10 lg:px-16">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(201,162,77,0.14), transparent 55%)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              <span className="h-px w-5 bg-gold" />
              Destinations
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Where we actually run trips
            </h1>
            <p className="mt-4 max-w-xl text-cream/70">
              Not a list of everywhere on the map — these are the places we know
              well enough to plan properly, season by season.
            </p>
          </div>
        </header>

        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDestinations.map((d) => {
                const detail = destinationDetails[d.slug];
                const hasGuide = Boolean(detail);
                return (
                  <li key={d.slug}>
                    <Link
                      href={hasGuide ? `/destinations/${d.slug}` : "/contact"}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <DestinationImage
                          src={d.image}
                          alt={d.imageAlt}
                          gradient={d.gradient}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 to-transparent"
                          aria-hidden="true"
                        />
                        <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-gold-bright backdrop-blur-sm">
                          <span aria-hidden="true">★</span>{" "}
                          <span className="tabular-nums">{d.rating.toFixed(1)}</span>
                        </span>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h2 className="font-display text-2xl font-semibold text-cream">
                            {d.name}
                          </h2>
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/70">
                            {d.region}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        {detail && (
                          <p className="flex-1 font-display text-[15px] italic leading-relaxed text-ink-text-2">
                            {detail.tagline}
                          </p>
                        )}
                        <div className="mt-4 flex items-end justify-between border-t border-hair pt-4">
                          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted tabular-nums">
                            {d.nights}N / {d.days}D
                          </span>
                          <span className="text-right">
                            <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                              From
                            </span>
                            <span className="font-mono text-base font-bold text-ink-text tabular-nums">
                              {formatINR(d.priceFrom)}
                            </span>
                          </span>
                        </div>
                        <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-gold-dim">
                          {hasGuide ? "Read the guide →" : "Plan a trip →"}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
