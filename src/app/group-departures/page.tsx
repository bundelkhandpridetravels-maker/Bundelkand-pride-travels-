import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { type Departure } from "@/data/home";
import { getDepartures } from "@/lib/departures";
import { company } from "@/data/company";
import BookNowButton from "@/components/booking/BookNowButton";

const departures = getDepartures();

export const metadata: Metadata = {
  alternates: { canonical: "/group-departures" },
  title: "Group Departures",
  description:
    "Fixed-date group departures across India — weekly Manali batches, Kashmir group tours and seasonal trips. Set dates, fixed prices, a dedicated trip captain.",
};

const statusStyle: Record<Departure["status"], string> = {
  Open: "border-pine/50 bg-pine/20 text-pine-tint",
  Filling: "border-gold/50 bg-gold/15 text-gold-bright",
  Limited: "border-gold-bright/60 bg-gold-bright/15 text-gold-bright",
  Seasonal: "border-cream/25 bg-cream/10 text-cream/80",
};

const howItWorks = [
  {
    title: "Pick a date, not an itinerary",
    body: "Every batch has a set departure date, a fixed price and a published route. You choose the date that suits you — the planning is already done.",
  },
  {
    title: "Travel with a trip captain",
    body: "A dedicated coordinator travels with every group. They handle hotels, transport, timings and anything that goes sideways, so you don't.",
  },
  {
    title: "Join solo, as a couple, or as a family",
    body: "Group batches are the easiest way to travel if you don't have a full group of your own — and the safest way to do a first Himalayan trip.",
  },
];

export default function GroupDeparturesPage() {
  const waHref = `${company.whatsappHref}?text=${encodeURIComponent(
    "Hi Bundelkhand Pride Travels, I'd like to reserve a seat on an upcoming group departure.",
  )}`;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate bg-ink px-6 pb-14 pt-36 text-cream sm:px-10 lg:px-16">
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
              Fixed departures
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              The departures board
            </h1>
            <p className="mt-4 max-w-xl text-cream/70">
              Set dates, fixed prices, a dedicated trip captain. Reserve a seat
              and we handle everything from the pickup point onward.
            </p>
          </div>
        </header>

        {/* Board */}
        <section className="bg-ink px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-cream/10 bg-ink-raised">
              <div className="hidden grid-cols-[92px_1fr_100px_150px_110px] gap-4 border-b border-cream/10 px-5 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-mist lg:grid">
                <span>Departs</span>
                <span>Trip</span>
                <span>Duration</span>
                <span>From</span>
                <span className="text-right">Status</span>
              </div>

              <ul>
                {departures.map((d) => (
                  <li key={`${d.when}-${d.title}`}>
                    <Link
                      href="/contact"
                      className="group grid grid-cols-1 gap-2 border-b border-cream/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-cream/5 lg:grid-cols-[92px_1fr_100px_150px_110px] lg:items-center lg:gap-4"
                    >
                      <span className="flex items-baseline gap-2 lg:block">
                        <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
                          {d.cadence}
                        </span>
                        <span className="block font-mono text-sm font-bold text-gold tabular-nums">
                          {d.when}
                        </span>
                      </span>
                      <span className="text-[15px] font-semibold text-cream transition-colors group-hover:text-gold-bright">
                        {d.title}
                      </span>
                      <span className="font-mono text-xs text-mist tabular-nums">
                        {d.duration}
                      </span>
                      <span className="font-mono text-sm text-cream tabular-nums">
                        {d.price}
                      </span>
                      <span className="lg:text-right">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${statusStyle[d.status]}`}
                        >
                          {d.status}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-center font-mono text-[11px] text-mist">
              Seats are confirmed on full payment before departure · Jaisalmer
              departures launch on 13 October and run every Friday through the
              desert season · Exact boarding point is shared with your seat
              confirmation
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-center text-[13.5px] leading-relaxed text-cream/70">
              Looking for Manali, Kashmir, Goa, Kerala or any other trip?
              Those are <span className="text-cream">private, fully customisable
              tours</span> that leave on <span className="text-cream">your</span>{" "}
              dates — browse them under{" "}
              <Link href="/packages" className="text-gold-bright underline underline-offset-2 hover:text-gold">
                Packages
              </Link>
              . Only intentionally scheduled fixed-date tours appear on this board.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <BookNowButton
                slug="jaisalmer"
                title="Jaisalmer Desert Weekend"
                isGroup
                source="departure_board"
                label="Reserve your seat"
                variant="primary"
                className="px-7 py-3.5"
              />
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-bone px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-9 max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim">
                <span className="h-px w-5 bg-gold-dim" />
                How group trips work
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink-text">
                No need to plan it alone
              </h2>
            </div>

            <ul className="grid gap-6 sm:grid-cols-3">
              {howItWorks.map((item) => (
                <li key={item.title} className="border-t border-line pt-5">
                  <h3 className="text-[15px] font-bold text-ink-text">{item.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-text-2">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-2xl border border-line bg-paper p-8 text-center">
              <p className="font-display text-xl italic text-ink-text">
                Travelling as your own group instead?
              </p>
              <p className="mx-auto mt-2 max-w-lg text-[14px] leading-relaxed text-ink-text-2">
                We run private departures for families, schools, colleges and
                corporate teams — any destination, any group size, priced for the
                group rather than per seat.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block rounded-lg border border-ink/20 px-6 py-3 text-sm font-semibold text-ink-text transition-colors hover:bg-ink/5"
              >
                Plan a private group trip →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
