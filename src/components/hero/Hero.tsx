import Link from "next/link";
import HeroBackground from "./HeroBackground";
import SmartSearch from "./SmartSearch";
import FeaturedDestinations from "./FeaturedDestinations";
import { heroScenes, heroVideoSources, heroPoster } from "@/data/destinations";
import { companyStats as stats } from "@/data/company";
import CountUp from "@/components/motion/CountUp";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden text-cream">
      <HeroBackground
        scenes={heroScenes}
        videoSources={heroVideoSources}
        poster={heroPoster}
      />

      {/* Ambient destination ticker */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-6 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="bpt-fade-up bpt-d1 mb-5 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-ink/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Premium travel · trusted across India
          </div>

          <h1 className="bpt-fade-up bpt-d2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Explore India{" "}
            <em className="italic text-gold">with confidence.</em>
          </h1>

          <p className="bpt-fade-up bpt-d3 mt-5 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
            Premium holiday packages, curated itineraries, trusted hotels,
            seamless travel, and AI-powered planning — designed end to end by a
            team that plans like an engineer and cares like family.
          </p>

          <div className="bpt-fade-up bpt-d4 mt-8 flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="rounded-lg bg-gold px-7 py-3.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Explore packages
            </Link>
            <Link
              href="/group-departures"
              className="rounded-lg border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream/10"
            >
              Upcoming group departures
            </Link>
          </div>

          {/* Smart search */}
          <div className="bpt-fade-up bpt-d5 mt-10 max-w-4xl">
            <SmartSearch />
          </div>

          {/* Trust stats */}
          <dl className="bpt-fade-up bpt-d5 mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-cream/15 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-mono text-xl text-gold">
                    <CountUp value={s.value} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-mist">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Featured destinations band */}
      <div id="destinations" className="relative z-10 px-6 pb-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <FeaturedDestinations />
        </div>
      </div>
    </section>
  );
}
