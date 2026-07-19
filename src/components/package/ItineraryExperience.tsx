"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CinematicMedia from "@/components/media/CinematicMedia";
import type { CinematicClip } from "@/data/media";
import type { ItineraryDay } from "@/data/packages";

/**
 * Interactive day-by-day itinerary.
 *
 * Selecting a day swaps the media, the activity list and the map link together,
 * so the page reads as a journey rather than a table. Each day is bound to a
 * clip from the destination's media library — the moment real footage lands in
 * /public/videos, these panels start playing video with no change here.
 */
export default function ItineraryExperience({
  days,
  clips,
  mapQuery,
  fallbackGradient,
}: {
  days: ItineraryDay[];
  clips: CinematicClip[];
  mapQuery: string;
  fallbackGradient: string;
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const day = days[active];

  // Cycle the destination's b-roll across the days so each has its own visual.
  const clip: CinematicClip =
    clips.length > 0
      ? clips[active % clips.length]
      : { base: "", gradient: fallbackGradient, shot: "", ready: false };

  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${day?.title ?? ""} ${mapQuery}`.trim(),
  )}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      {/* Day selector */}
      <div
        role="tablist"
        aria-label="Itinerary days"
        className="flex gap-1.5 overflow-x-auto border-b border-hair bg-bone p-2.5"
      >
        {days.map((d, i) => {
          const selected = i === active;
          return (
            <button
              key={d.day}
              role="tab"
              aria-selected={selected}
              aria-controls={`day-panel-${i}`}
              id={`day-tab-${i}`}
              onClick={() => setActive(i)}
              className={`relative shrink-0 rounded-lg px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                selected
                  ? "text-ink"
                  : "text-muted hover:text-ink-text"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="day-pill"
                  className="absolute inset-0 rounded-lg bg-gold"
                  transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative">{d.day}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`day-panel-${active}`}
        aria-labelledby={`day-tab-${active}`}
        className="grid gap-0 lg:grid-cols-[1.1fr_1fr]"
      >
        {/* Media for the selected day */}
        <div className="group relative min-h-[260px] lg:min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <CinematicMedia clip={clip} overlay={false} />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.55) 100%)",
                }}
                aria-hidden="true"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/80">
              {clip.ready ? "Now playing" : "Footage coming soon"}
            </span>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-ink/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-cream backdrop-blur-sm transition-colors hover:bg-ink"
            >
              View on map →
            </a>
          </div>
        </div>

        {/* Narrative for the selected day */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-gold-dim">
                {day?.day}
              </span>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-text">
                {day?.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {day?.activities.map((a, i) => (
                  <motion.li
                    key={a}
                    initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduce ? 0 : 0.35,
                      delay: reduce ? 0 : 0.06 * i,
                    }}
                    className="flex gap-3 text-[14px] leading-relaxed text-ink-text-2"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-gold" aria-hidden="true">
                      →
                    </span>
                    {a}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-2 border-t border-hair pt-4">
            <button
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="rounded-lg border border-ink/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-text transition-colors hover:bg-ink/5 disabled:opacity-35"
            >
              ← Prev
            </button>
            <button
              onClick={() => setActive((i) => Math.min(days.length - 1, i + 1))}
              disabled={active === days.length - 1}
              className="rounded-lg border border-ink/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-text transition-colors hover:bg-ink/5 disabled:opacity-35"
            >
              Next day →
            </button>
            <span className="ml-auto font-mono text-[10px] text-muted tabular-nums">
              {active + 1} / {days.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
