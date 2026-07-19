import Link from "next/link";
import { Section, SectionHeading } from "@/components/site/Section";
import { featuredPackages } from "@/data/home";
import { packageDetails } from "@/data/packages";
import { formatINR } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";

/** Editorial package cards — the commercial centre of the homepage. */
export default function FeaturedPackages() {
  return (
    <Section id="packages" tone="paper">
      <SectionHeading
        eyebrow="Handpicked"
        title="Packages our travellers keep coming back for"
        lede="Transparent pricing, real inclusions, and a coordinator on call for every departure."
        action={
          <Link
            href="/packages"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold-dim transition-colors hover:text-ink-text"
          >
            View all →
          </Link>
        }
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredPackages.map((p, i) => {
          const href = packageDetails[p.slug] ? `/packages/${p.slug}` : "/packages";
          return (
            <li key={p.slug}>
              <Reveal delay={Math.min(i * 0.05, 0.3)} className="h-full">
                <Link
                  href={href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bone transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-20px_rgba(10,14,26,0.4)]"
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
                      <span className="sr-only">out of 5 from {p.reviews} reviews</span>
                    </span>
                    <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/90">
                      {p.route}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold-dim">
                      {p.destination}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink-text">
                      {p.title}
                    </h3>
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
                        <span className="ml-1 font-mono text-[10px] text-muted">
                          {p.priceUnit}
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
