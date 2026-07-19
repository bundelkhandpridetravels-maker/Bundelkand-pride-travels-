import { Section, SectionHeading } from "@/components/site/Section";
import { testimonials } from "@/data/home";

/**
 * Curated traveller reviews.
 * Static copy for now — the live Google Places API option is still an open
 * decision (see PROJECT_STATUS.md); this layout suits either source.
 */
export default function Testimonials() {
  return (
    <Section id="reviews" tone="bone">
      <SectionHeading
        eyebrow="Traveller stories"
        title="9,000+ journeys, and the reviews to match"
        lede="Real words from travellers who trusted us with a honeymoon, a school group, or a first Himalayan trek."
      />

      <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5 [&>li]:break-inside-avoid">
        {testimonials.map((t) => (
          <li
            key={t.name}
            className="rounded-2xl border border-line bg-paper p-6"
          >
            <figure>
              <div
                className="font-mono text-xs tracking-[0.1em] text-gold"
                aria-label="Rated 5 out of 5"
              >
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-text">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-hair pt-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-bold text-gold"
                  aria-hidden="true"
                >
                  {t.initials}
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-bold text-ink-text">
                    {t.name}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    {t.trip}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
