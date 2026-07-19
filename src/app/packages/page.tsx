import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { featuredPackages } from "@/data/home";
import { packageDetails } from "@/data/packages";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/packages" },
  title: "Packages",
  description:
    "Curated premium travel packages across India — Kashmir, Manali, Himachal, Himalayan treks, school and group tours. Transparent pricing, real inclusions.",
};

export default function PackagesPage() {
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
              All packages
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Every trip we run, in one place
            </h1>
            <p className="mt-4 max-w-xl text-cream/70">
              Transparent pricing and real inclusions on every package. Nothing
              here is resold — we plan and run these trips ourselves.
            </p>
            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cream/15 bg-cream/5 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Private tours (most packages)
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream/70">
                  Fully customisable, flexible dates, your own vehicle and
                  itinerary — for couples, families, friends and corporate groups.
                </p>
              </div>
              <div className="rounded-xl border border-cream/15 bg-cream/5 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Fixed group departures
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream/70">
                  Scheduled dates you join as a seat — currently the Jaisalmer
                  Desert Weekend, every Friday after 15 September.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPackages.map((p) => {
                const hasDetail = Boolean(packageDetails[p.slug]);
                return (
                  <li key={p.slug}>
                    <Link
                      href={hasDetail ? `/packages/${p.slug}` : "/contact"}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: p.gradient }}
                          aria-hidden="true"
                        />
                        {p.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink">
                            {p.badge}
                          </span>
                        )}
                        <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-gold-bright backdrop-blur-sm">
                          <span aria-hidden="true">★</span>{" "}
                          <span className="tabular-nums">{p.rating.toFixed(1)}</span>
                        </span>
                        <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/90">
                          {p.route}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold-dim">
                          {p.destination}
                        </span>
                        <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink-text">
                          {p.title}
                        </h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-text-2">
                          {p.summary}
                        </p>
                        <div className="mt-5 flex items-end justify-between border-t border-hair pt-4">
                          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted tabular-nums">
                            {p.nights}N / {p.days}D
                          </span>
                          <span className="text-right">
                            <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                              From
                            </span>
                            <span className="font-mono text-base font-bold text-ink-text tabular-nums">
                              {formatINR(p.priceFrom)}
                            </span>
                          </span>
                        </div>
                        <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-gold-dim">
                          {hasDetail ? "View itinerary →" : "Enquire →"}
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
