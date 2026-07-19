import Link from "next/link";
import { Section, SectionHeading } from "@/components/site/Section";
import { categories } from "@/data/home";

/** Travel categories — the way most visitors self-identify before browsing. */
export default function Categories() {
  return (
    <Section id="categories" tone="bone">
      <SectionHeading
        eyebrow="Travel styles"
        title="Find the trip that fits how you travel"
        lede="Every itinerary is built around who's going — couples, families, students, trekkers."
        action={
          <Link
            href="/packages"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold-dim transition-colors hover:text-ink-text"
          >
            Browse all packages →
          </Link>
        }
      />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href="/packages"
              className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 sm:h-48"
            >
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: c.gradient }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 to-transparent" aria-hidden="true" />
              <div className="relative">
                <h3 className="font-display text-lg font-semibold text-cream">
                  {c.title}
                </h3>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-gold-bright tabular-nums">
                  {c.count} packages
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
