"use client";

import { useState } from "react";
import { Section } from "@/components/site/Section";
import { company } from "@/data/company";

/**
 * Newsletter capture.
 *
 * TODO(Phase 1B): submit to the real inquiry/newsletter endpoint. There is no
 * backend yet, so this only renders the states — nothing is stored or sent.
 * Must be wired (and Turnstile-gated) before this page goes live.
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <Section id="contact" tone="paper">
      <div className="rounded-3xl border border-line bg-ink px-8 py-12 sm:px-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              <span className="h-px w-5 bg-gold" />
              Trip drops
            </div>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-cream">
              {company.tagline}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mist">
              New group departures, seasonal batches and quiet-season prices —
              about once a month. No spam, ever.
            </p>
          </div>

          <div>
            {done ? (
              <p
                className="rounded-xl border border-pine/50 bg-pine/20 px-5 py-4 text-sm text-pine-tint"
                role="status"
              >
                Thanks — you&apos;re on the list. Watch for the next departures drop.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-xl border border-cream/20 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-mist/70 focus:border-gold/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-mist">
              Or talk to us ·{" "}
              <a href={company.phoneHref} className="text-gold-bright hover:text-gold">
                {company.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
