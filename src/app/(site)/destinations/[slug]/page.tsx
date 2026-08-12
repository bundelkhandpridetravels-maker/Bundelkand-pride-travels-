import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Parallax from "@/components/motion/Parallax";
import { breadcrumbJsonLd, touristDestinationJsonLd } from "@/lib/seo";
import { featuredDestinations } from "@/data/destinations";
import { destinationDetails } from "@/data/destination-details";
import { featuredPackages } from "@/data/home";
import { packageDetails } from "@/data/packages";
import { formatINR } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

function getDestination(slug: string) {
  const summary = featuredDestinations.find((d) => d.slug === slug);
  const detail = destinationDetails[slug];
  if (!summary || !detail) return null;
  return { summary, detail };
}

export function generateStaticParams() {
  return Object.keys(destinationDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Destination not found" };
  return {
    title: `${dest.summary.name} travel guide`,
    description: dest.detail.overview[0].slice(0, 155),
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: {
      type: "article",
      title: `${dest.summary.name} · Bundelkhand Pride Travels`,
      description: dest.detail.tagline,
      url: `/destinations/${slug}`,
    },
  };
}

const labelClass =
  "mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim";

export default async function DestinationPage({ params }: Params) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const { summary, detail } = dest;
  const packages = featuredPackages.filter((p) => detail.packageSlugs.includes(p.slug));
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.mapQuery)}`;

  return (
    <>
      <JsonLd
        data={[
          touristDestinationJsonLd({
            name: summary.name,
            description: detail.overview[0],
            path: `/destinations/${slug}`,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: summary.name, path: `/destinations/${slug}` },
          ]),
        ]}
      />
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <header className="relative isolate flex min-h-[62vh] items-end overflow-hidden px-6 pb-12 pt-32 text-cream sm:px-10 lg:px-16">
          {/* Parallax layer drifts slower than the page, creating real depth */}
          <Parallax speed={0.22} className="absolute inset-0 -z-10">
            <div
              className="h-[130%] w-full"
              style={{ backgroundImage: detail.heroGradient }}
              aria-hidden="true"
            />
          </Parallax>
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,14,26,0.6) 0%, rgba(10,14,26,0.15) 40%, rgba(10,14,26,0.9) 100%)",
            }}
          />
          <div className="mx-auto w-full max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-5 font-mono text-[11px] uppercase tracking-[0.1em] text-cream/60">
              <Link href="/" className="hover:text-cream">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/destinations" className="hover:text-cream">Destinations</Link>
            </nav>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold-bright">
              {summary.region}
            </span>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {summary.name}
            </h1>
            <p className="mt-3 max-w-xl font-display text-lg italic text-cream/80">
              {detail.tagline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-cream/15 pt-5 font-mono text-[12px]">
              <span className="text-gold">
                <span aria-hidden="true">★</span> {summary.rating.toFixed(1)}
                <span className="ml-1.5 text-mist">({summary.reviews} reviews)</span>
              </span>
              <span className="text-cream/80">Best: {detail.bestTime.window}</span>
              <span className="text-cream/80">
                From <span className="text-gold">{formatINR(summary.priceFrom)}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Overview + best time */}
        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className={labelClass}>
                <span className="h-px w-5 bg-gold-dim" />
                Overview
              </h2>
              {detail.overview.map((p) => (
                <p key={p.slice(0, 30)} className="mb-4 text-[15px] leading-relaxed text-ink-text-2 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-dim">
                Best time to visit
              </h2>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-text">
                {detail.bestTime.window}
              </p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-text-2">
                {detail.bestTime.why}
              </p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-ink/20 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-text transition-colors hover:bg-ink/5"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        </section>

        {/* Attractions */}
        <section className="bg-paper px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              What you&apos;ll see
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.attractions.map((a) => (
                <li key={a.name} className="group overflow-hidden rounded-2xl border border-line bg-bone">
                  <div className="relative h-32 overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: a.gradient }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-bold text-ink-text">{a.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-text-2">{a.blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Activities + hotels */}
        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className={labelClass}>
                <span className="h-px w-5 bg-gold-dim" />
                Things to do
              </h2>
              <ul className="space-y-2.5">
                {detail.activities.map((a) => (
                  <li key={a} className="flex gap-3 text-[14px] leading-relaxed text-ink-text-2">
                    <span className="mt-0.5 shrink-0 text-pine" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={labelClass}>
                <span className="h-px w-5 bg-gold-dim" />
                Where you&apos;ll stay
              </h2>
              <ul className="divide-y divide-hair rounded-xl border border-line bg-paper">
                {detail.hotels.map((h) => (
                  <li key={h.name} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[14px] font-bold text-ink-text">{h.name}</h3>
                      <span className="shrink-0 font-mono text-[11px] text-gold-dim">
                        <span aria-hidden="true">★</span> {h.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                      {h.area}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-text-2">{h.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Weather */}
        <section className="bg-paper px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              Weather through the year
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    {["Season", "Months", "Temp", "What to expect"].map((h) => (
                      <th key={h} className="py-2.5 pr-4 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.weather.map((w) => (
                    <tr key={w.season} className="border-b border-hair last:border-0">
                      <td className="py-3 pr-4 text-[13px] font-bold text-ink-text">{w.season}</td>
                      <td className="py-3 pr-4 font-mono text-[12px] text-ink-text-2 tabular-nums">{w.months}</td>
                      <td className="py-3 pr-4 font-mono text-[12px] text-ink-text-2 tabular-nums">{w.temp}</td>
                      <td className="py-3 pr-4 text-[13px] text-ink-text-2">{w.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Travel tips */}
        <section className="bg-ink px-6 py-16 text-cream sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              <span className="h-px w-5 bg-gold" />
              Travel tips from our team
            </h2>
            <p className="mb-8 max-w-xl text-cream/70">
              The things we tell every traveller before they go — learned from
              running these trips, not from a brochure.
            </p>
            <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {detail.tips.map((t) => (
                <li key={t.slice(0, 24)} className="flex gap-3 border-t border-cream/10 pt-4 text-[14px] leading-relaxed text-cream/80">
                  <span className="shrink-0 font-mono text-gold" aria-hidden="true">→</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
              {detail.gallery.map((g, i) => (
                <figure
                  key={g.id}
                  className={`group relative overflow-hidden rounded-xl ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square lg:aspect-auto" : "aspect-[4/3]"
                  }`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: g.gradient }}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-cream">
                    {g.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="bg-paper px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              {summary.name} packages
            </h2>
            {packages.length > 0 ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={packageDetails[p.slug] ? `/packages/${p.slug}` : "/contact"}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bone transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: p.gradient }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold-dim">
                          {p.destination}
                        </span>
                        <h3 className="mt-1.5 flex-1 font-display text-base font-semibold text-ink-text">
                          {p.title}
                        </h3>
                        <span className="mt-3 font-mono text-sm font-bold text-ink-text tabular-nums">
                          {formatINR(p.priceFrom)}
                          <span className="ml-1 text-[10px] font-normal text-muted">{p.priceUnit}</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-line bg-bone p-8 text-center">
                <p className="text-[15px] text-ink-text-2">
                  We build {summary.name} trips to order rather than off a shelf.
                  Tell us your dates and we&apos;ll send a written itinerary.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Plan a {summary.name} trip
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
