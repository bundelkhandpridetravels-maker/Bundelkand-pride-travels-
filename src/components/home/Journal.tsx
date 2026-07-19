import Link from "next/link";
import { Section, SectionHeading } from "@/components/site/Section";
import { journal } from "@/data/home";

/** Journal teaser — three posts, linking out to the future /journal route. */
export default function Journal() {
  return (
    <Section id="journal" tone="bone">
      <SectionHeading
        eyebrow="The journal"
        title="Notes from people who run the trips"
        lede="Practical guides written by our coordinators — not scraped, not generic."
      />

      <ul className="grid gap-5 sm:grid-cols-3">
        {journal.map((post) => (
          <li key={post.slug}>
            <Link
              href="/journal"
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
            >
              <div className="h-32 overflow-hidden">
                <div
                  className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: post.gradient }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold-dim">
                  {post.category}
                </span>
                <h3 className="mt-2 flex-1 font-display text-base font-semibold leading-snug text-ink-text">
                  {post.title}
                </h3>
                <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted tabular-nums">
                  {post.readMins} min read
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
