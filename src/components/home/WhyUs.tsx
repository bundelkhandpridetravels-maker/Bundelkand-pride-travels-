import { Section, SectionHeading } from "@/components/site/Section";
import { company, companyStats, whyChoose } from "@/data/company";
import CountUp from "@/components/motion/CountUp";

/** Trust band: headline metrics over the six "why choose us" pillars. */
export default function WhyUs() {
  return (
    <Section id="about" tone="paper">
      <SectionHeading
        eyebrow="Why Bundelkhand Pride"
        title={company.descriptor}
        lede={company.promise}
      />

      <dl className="mb-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {companyStats.map((stat) => (
          <div key={stat.label} className="bg-bone px-6 py-7 text-center">
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block font-display text-3xl font-semibold text-ink-text tabular-nums sm:text-4xl">
                <CountUp value={stat.value} />
              </span>
              <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {whyChoose.map((pillar) => (
          <li key={pillar.title}>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-pine-tint text-pine">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-3 text-[15px] font-bold text-ink-text">
              {pillar.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-text-2">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-14 grid gap-8 rounded-2xl border border-line bg-bone p-8 sm:grid-cols-2">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-dim">
            Our mission
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-text-2">
            {company.mission}
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-dim">
            Our vision
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-text-2">
            {company.vision}
          </p>
        </div>
      </div>
    </Section>
  );
}
