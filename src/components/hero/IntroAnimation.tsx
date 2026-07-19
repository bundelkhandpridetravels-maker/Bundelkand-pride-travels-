"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "bpt-intro-seen";
const PLAY_MS = 2800;

type Phase = "idle" | "playing" | "leaving";

/**
 * Cinematic opening: an aircraft crosses an ink sky, the brand mark resolves,
 * then the curtain lifts to reveal the hero.
 * - Plays once per browser (localStorage flag), never for returning visitors.
 * - Fully skippable (button, click, Escape, or any key).
 * - Skipped entirely for users who prefer reduced motion.
 */
export default function IntroAnimation() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const alreadySeen =
      typeof window !== "undefined" && localStorage.getItem(SEEN_KEY) === "1";

    // Force-replay escape hatch: visit any page with ?intro=1 to watch the
    // opening again (it's otherwise once-per-browser, so you'd never see it
    // after the first visit). Useful for review and for demoing the site.
    const forced =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("intro") === "1";

    if (!forced && (prefersReduced || alreadySeen)) {
      markSeen();
      return;
    }

    // Client-only decision (localStorage + matchMedia): must run in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("playing");
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(dismiss, PLAY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — non-fatal, intro simply plays again next time */
    }
  }

  function dismiss() {
    setPhase((p) => (p === "playing" ? "leaving" : p));
    markSeen();
    window.setTimeout(() => {
      document.body.style.overflow = "";
      setPhase("idle");
    }, 650);
  }

  if (phase === "idle") return null;

  return (
    <div
      role="presentation"
      onClick={dismiss}
      onKeyDown={dismiss}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-opacity duration-[650ms] ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Aircraft + contrail */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 flex items-center"
        style={{ animation: `intro-fly ${PLAY_MS}ms cubic-bezier(0.4,0,0.2,1) forwards` }}
      >
        <span
          className="block h-px w-[46vw] origin-right"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(221,182,98,0.55))",
          }}
        />
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
            fill="#ede7d6"
          />
        </svg>
      </div>

      {/* Brand mark */}
      <div className="relative z-10 text-center px-6">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.42em] text-gold"
          style={{ animation: `intro-mark ${PLAY_MS}ms ease-out forwards` }}
        >
          Bundelkhand Pride Travels
        </div>
        <div
          className="mx-auto mt-4 h-px w-24 origin-center bg-gold/60"
          style={{ animation: `intro-line ${PLAY_MS}ms ease-out forwards` }}
        />
        <div
          className="mt-4 font-display italic text-cream/90 text-lg"
          style={{ animation: `intro-mark ${PLAY_MS}ms ease-out forwards` }}
        >
          Explore India with confidence
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="absolute bottom-7 right-7 z-20 font-mono text-[11px] uppercase tracking-[0.12em] text-mist hover:text-cream transition-colors"
      >
        Skip intro →
      </button>
    </div>
  );
}
