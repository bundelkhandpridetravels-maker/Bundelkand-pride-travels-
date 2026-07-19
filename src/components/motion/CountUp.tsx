"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Counts a numeric stat up when it scrolls into view (once).
 * Accepts a display string like "9,000+" or "24×7" and animates only the
 * leading number, preserving any prefix/suffix. Reduced-motion (and no-JS/SSR)
 * shows the final value immediately — it's the initial state.
 */
export default function CountUp({ value }: { value: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduce) return;
    const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!match) return;
    const target = Number(match[2].replace(/,/g, ""));
    if (!Number.isFinite(target)) return;
    const [, prefix, , suffix] = match;
    const el = ref.current;
    if (!el) return;

    const fmt = (n: number) =>
      `${prefix}${Math.round(n).toLocaleString("en-IN")}${suffix}`;

    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 1100;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDisplay(fmt(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
