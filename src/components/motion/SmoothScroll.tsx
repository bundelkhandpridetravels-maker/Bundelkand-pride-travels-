"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide inertial smooth scrolling (Lenis) — the single biggest lever on how
 * "expensive" a site feels. Mounted once in the root layout.
 *
 * Guardrails:
 *  - Completely disabled under `prefers-reduced-motion` (motion sickness is real).
 *  - Disabled on touch devices, where native momentum scrolling is already good
 *    and hijacking it feels laggy on mid-range Android.
 *  - Anchor links are routed through Lenis so in-page jumps glide.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Route in-page anchors through Lenis for a glide instead of a jump.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
