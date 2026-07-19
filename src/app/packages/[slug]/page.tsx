import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import BookingPanel from "@/components/package/BookingPanel";
import MobileBookingBar from "@/components/booking/MobileBookingBar";
import CinematicMedia from "@/components/media/CinematicMedia";
import MediaGallery from "@/components/media/MediaGallery";
import ItineraryExperience from "@/components/package/ItineraryExperience";
import { mediaForPackage } from "@/data/media";
import JsonLd from "@/components/seo/JsonLd";
import { featuredPackages } from "@/data/home";
import { packageDetails } from "@/data/packages";
import { testimonials } from "@/data/home";
import { formatINR } from "@/lib/format";
import { breadcrumbJsonLd, faqJsonLd, touristTripJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

function getPackage(slug: string) {
  const summary = featuredPackages.find((p) => p.slug === slug);
  const detail = packageDetails[slug];
  if (!summary || !detail) return null;
  return { summary, detail };
}

export function generateStaticParams() {
  return Object.keys(packageDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: pkg.summary.title,
    description: pkg.summary.summary,
    alternates: { canonical: `/packages/${slug}` },
    openGraph: {
      type: "article",
      title: `${pkg.summary.title} · Bundelkhand Pride Travels`,
      description: pkg.summary.summary,
      url: `/packages/${slug}`,
    },
  };
}

const labelClass =
  "mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim";

export default async function PackagePage({ params }: Params) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const { summary, detail } = pkg;
  const related = featuredPackages.filter((p) => p.slug !== slug).slice(0, 3);
  const reviews = testimonials.slice(0, 2);
  // Cinematic hero: this destination's footage when it lands, gradient until then.
  const media = mediaForPackage(slug);
  const heroClip = media?.hero ?? {
    base: "",
    gradient: detail.heroGradient,
    shot: "",
    ready: false,
  };
  // Gallery pairs the written captions with this destination's clips, so it
  // upgrades from gradient → poster → video as real media lands.
  const galleryItems = detail.gallery.map((g, i) => ({
    caption: g.caption,
    clip: media?.gallery[i] ?? {
      base: "",
      gradient: g.gradient,
      shot: "",
      ready: false,
    },
  }));
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.mapQuery)}`;

  return (
    <>
      <JsonLd
        data={[
          touristTripJsonLd({
            name: summary.title,
            description: summary.summary,
            path: `/packages/${slug}`,
            priceFrom: summary.priceFrom,
            days: summary.days,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Packages", path: "/packages" },
            { name: summary.title, path: `/packages/${slug}` },
          ]),
          faqJsonLd(detail.faqs),
        ]}
      />
      <Navbar />
      <main className="flex-1">
        {/* Cinematic hero — plays this destination's footage the moment it exists */}
        <header className="relative isolate flex min-h-[68vh] items-end overflow-hidden px-6 pb-12 pt-32 text-cream sm:px-10 lg:px-16">
          <div className="absolute inset-0 -z-10">
            <CinematicMedia
              clip={heroClip}
              priority
              overlay={false}
            />
          </div>
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
              <Link href="/packages" className="hover:text-cream">Packages</Link>
            </nav>

            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold-bright">
              {summary.destination} · {summary.route}
            </span>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              {summary.title}
            </h1>
            <p className="mt-4 max-w-xl text-cream/75">{summary.summary}</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-cream/15 pt-5 font-mono text-[12px]">
              <span className="text-gold">
                <span aria-hidden="true">★</span> {summary.rating.toFixed(1)}
                <span className="ml-1.5 text-mist">({summary.reviews} reviews)</span>
              </span>
              <span className="text-cream/80 tabular-nums">{summary.nights}N / {summary.days}D</span>
              <span className="text-cream/80">{detail.minPax}</span>
              <span className="text-cream/80">
                From <span className="text-gold">{formatINR(summary.priceFrom)}</span> {summary.priceUnit}
              </span>
            </div>
          </div>
        </header>

        {/* Gallery */}
        <section className="bg-bone px-6 py-14 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              Destination gallery
            </h2>
            <MediaGallery items={galleryItems} />
          </div>
        </section>

        {/* Main content + booking panel */}
        <div className="bg-bone px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-14">
              {/* Highlights */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Package highlights
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {detail.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[14px] leading-relaxed text-ink-text-2">
                      <span className="mt-0.5 shrink-0 text-pine" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Itinerary */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Day-by-day itinerary
                </h2>
                <ItineraryExperience
                  days={detail.itinerary}
                  clips={media?.gallery ?? []}
                  mapQuery={detail.mapQuery}
                  fallbackGradient={detail.heroGradient}
                />
              </section>

              {/* Hotels */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Where you&apos;ll stay
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {detail.hotels.map((h) => (
                    <li key={h.name} className="overflow-hidden rounded-xl border border-line bg-paper">
                      <div className="h-28" style={{ backgroundImage: h.gradient }} aria-hidden="true" />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[14px] font-bold text-ink-text">{h.name}</h3>
                          <span className="shrink-0 font-mono text-[11px] text-gold-dim">
                            <span aria-hidden="true">★</span> {h.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted tabular-nums">
                          {h.location} · {h.nights} {h.nights === 1 ? "night" : "nights"}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-ink-text-2">{h.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Transport */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  How you&apos;ll travel
                </h2>
                <ul className="divide-y divide-hair rounded-xl border border-line bg-paper">
                  {detail.transport.map((t) => (
                    <li key={t.mode} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
                      <span className="w-44 shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-gold-dim">
                        {t.mode}
                      </span>
                      <span className="text-[13.5px] leading-relaxed text-ink-text-2">{t.detail}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Inclusions / exclusions */}
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-pine/25 bg-pine-tint/40 p-5">
                  <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-pine">
                    What&apos;s included
                  </h3>
                  <ul className="space-y-1.5">
                    {detail.inclusions.map((i) => (
                      <li key={i} className="relative pl-5 text-[13px] leading-relaxed text-ink-text-2 before:absolute before:left-0 before:font-bold before:text-pine before:content-['✓']">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-hair bg-paper p-5">
                  <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Not included
                  </h3>
                  <ul className="space-y-1.5">
                    {detail.exclusions.map((i) => (
                      <li key={i} className="relative pl-5 text-[13px] leading-relaxed text-ink-text-2 before:absolute before:left-0 before:text-muted before:content-['✕']">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Map + best time + weather */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Where it is & when to go
                </h2>
                <div className="overflow-hidden rounded-xl border border-line">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex h-44 items-center justify-center"
                    style={{ backgroundImage: detail.heroGradient }}
                  >
                    <span className="rounded-lg bg-ink/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-cream backdrop-blur-sm transition-transform group-hover:scale-105">
                      View {detail.mapQuery} on Google Maps →
                    </span>
                  </a>
                  <div className="bg-paper p-5">
                    <p className="text-[13.5px] leading-relaxed text-ink-text-2">
                      <span className="font-bold text-ink-text">Best time to visit — </span>
                      {detail.bestTime}
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left">
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
              </section>

              {/* Reviews */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Traveller reviews
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {reviews.map((r) => (
                    <li key={r.name} className="rounded-xl border border-line bg-paper p-5">
                      <div className="font-mono text-xs tracking-[0.1em] text-gold" aria-label="Rated 5 out of 5">
                        <span aria-hidden="true">★★★★★</span>
                      </div>
                      <blockquote className="mt-2.5 text-[13.5px] leading-relaxed text-ink-text">
                        “{r.quote}”
                      </blockquote>
                      <div className="mt-4 flex items-center gap-2.5 border-t border-hair pt-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-bold text-gold" aria-hidden="true">
                          {r.initials}
                        </span>
                        <span className="leading-tight">
                          <span className="block text-[12.5px] font-bold text-ink-text">{r.name}</span>
                          <span className="block font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">{r.trip}</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* FAQs */}
              <section>
                <h2 className={labelClass}>
                  <span className="h-px w-5 bg-gold-dim" />
                  Questions about this trip
                </h2>
                <div className="divide-y divide-hair rounded-xl border border-line bg-paper">
                  {detail.faqs.map((f) => (
                    <details key={f.q} className="group p-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-bold text-ink-text">
                        {f.q}
                        <span className="shrink-0 font-mono text-gold-dim transition-transform group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-text-2">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <BookingPanel
              slug={summary.slug}
              priceFrom={summary.priceFrom}
              priceUnit={summary.priceUnit}
              nights={summary.nights}
              days={summary.days}
              rating={summary.rating}
              reviews={summary.reviews}
              minPax={detail.minPax}
              pickup={detail.pickup}
              drop={detail.drop}
              title={summary.title}
              isGroup={summary.tourType === "group"}
            />
          </div>
        </div>

        {/* Related */}
        <section className="bg-paper px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className={labelClass}>
              <span className="h-px w-5 bg-gold-dim" />
              You might also like
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={packageDetails[p.slug] ? `/packages/${p.slug}` : "/packages"}
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
          </div>
        </section>
        {/* Spacer so the sticky mobile bar never covers footer content */}
        <div className="h-16 lg:hidden" aria-hidden="true" />
      </main>
      <Footer />
      <MobileBookingBar
        slug={summary.slug}
        title={summary.title}
        priceFrom={summary.priceFrom}
        priceUnit={summary.priceUnit}
        isGroup={summary.tourType === "group"}
      />
    </>
  );
}
