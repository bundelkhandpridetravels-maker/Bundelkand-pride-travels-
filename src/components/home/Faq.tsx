import { Section, SectionHeading } from "@/components/site/Section";
import { company } from "@/data/company";
import { faqs } from "@/data/home";

/** Native <details> accordion — keyboard accessible with no client JS. */
export default function Faq() {
  return (
    <Section id="faq" tone="bone">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Questions"
            title="Before you book"
          />
          <p className="text-[15px] leading-relaxed text-ink-text-2">
            Still unsure about something? Talk to a travel expert directly — no
            call centre, no scripts.
          </p>
          <a
            href={company.phoneHref}
            className="mt-5 inline-block font-mono text-sm text-gold-dim transition-colors hover:text-ink-text"
          >
            {company.phone}
          </a>
        </div>

        <ul className="divide-y divide-hair border-y border-hair">
          {faqs.map((faq) => (
            <li key={faq.q}>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink-text marker:hidden">
                  {faq.q}
                  <span
                    className="shrink-0 text-gold-dim transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1v12M1 7h12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-text-2">
                  {faq.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
