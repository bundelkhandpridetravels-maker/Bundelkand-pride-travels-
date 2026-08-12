import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { company, companyStats, whyChoose } from "@/data/company";
import CountUp from "@/components/motion/CountUp";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About us",
  description:
    "Bundelkhand Pride Travels — a premium travel company based in Jhansi, planning curated holidays, group departures and adventure trips across India.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate bg-ink px-6 pb-16 pt-36 text-cream sm:px-10 lg:px-16">
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
              About us
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Open the World <em className="italic text-gold">Close to You</em>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/75">
              {company.about}
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="bg-ink px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 lg:grid-cols-4">
              {companyStats.map((s) => (
                <div key={s.label} className="bg-ink-raised px-6 py-8 text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-semibold text-gold tabular-nums sm:text-4xl">
                      <CountUp value={s.value} />
                    </span>
                    <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Mission / vision / promise */}
        <section className="bg-bone px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-3">
              {[
                { label: "Our mission", body: company.mission },
                { label: "Our vision", body: company.vision },
                { label: "Our promise", body: company.promise },
              ].map((item) => (
                <div key={item.label} className="border-t border-line pt-6">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-dim">
                    {item.label}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-text-2">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="bg-paper px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim">
                <span className="h-px w-5 bg-gold-dim" />
                What we do
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink-text">
                Everything between the first enquiry and the way home
              </h2>
            </div>

            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="mt-3 text-[15px] font-bold text-ink-text">{pillar.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-text-2">{pillar.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Where we are */}
        <section className="bg-ink px-6 py-20 text-cream sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                <span className="h-px w-5 bg-gold" />
                Where we are
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
                Based in Jhansi. Planning across India.
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-cream/70">
                Our name is local, our map isn&apos;t. We&apos;re based in{" "}
                {company.location}, and we plan and run trips from Kashmir to
                Kerala, the Andamans to Rajasthan — plus international
                itineraries for travellers who want the same level of planning
                further afield.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Plan my trip
                </Link>
                <a
                  href={company.phoneHref}
                  className="rounded-lg border border-cream/30 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                >
                  {company.phone}
                </a>
              </div>
            </div>

            <blockquote className="rounded-2xl border border-cream/10 bg-ink-raised p-8">
              <p className="font-display text-2xl italic leading-relaxed text-cream">
                “{company.tagline}.”
              </p>
              <footer className="mt-5 border-t border-cream/10 pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
                {company.name} · {company.location}
              </footer>
            </blockquote>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
