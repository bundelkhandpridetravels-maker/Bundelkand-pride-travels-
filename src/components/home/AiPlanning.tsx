import { Section } from "@/components/site/Section";

const steps = [
  { title: "Tell it your trip", body: "Dates, budget, who's coming, what you like." },
  { title: "Get a real itinerary", body: "Day by day, priced, built from trips we actually run." },
  { title: "A human signs it off", body: "Your travel expert reviews and refines before anything is booked." },
];

/**
 * Teaser for the Phase 4 AI trip planner.
 * Deliberately states the human-approval guarantee — AI drafts, people confirm
 * (see docs/security-architecture.md §12).
 */
export default function AiPlanning() {
  return (
    <Section id="ai-planning" tone="ink">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-bright">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            In development
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-cream sm:text-4xl">
            An AI trip planner that plans like an engineer
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mist">
            We&apos;re building an assistant that drafts a complete, costed itinerary
            from a few sentences — then hands it to one of our travel experts.
            It never books, pays, or confirms anything on its own. That stays
            with a person, always.
          </p>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10">
          {steps.map((step, i) => (
            <li key={step.title} className="bg-ink-raised px-6 py-5">
              <div className="flex items-start gap-4">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/40 font-mono text-[11px] text-gold tabular-nums"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-cream">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{step.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
