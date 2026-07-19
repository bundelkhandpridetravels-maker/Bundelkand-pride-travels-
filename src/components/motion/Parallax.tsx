"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP ScrollTrigger parallax — moves a layer at a different rate to the page,
 * which is what creates real depth rather than a flat scrolling document.
 *
 * `speed` is the fraction of the scroll distance this layer travels:
 *   0.2 → drifts slowly (background)   |   -0.15 → moves against the scroll
 *
 * Registers the plugin exactly once, and skips entirely under reduced-motion
 * (content still renders — only the movement is dropped).
 */

let registered = false;

export default function Parallax({
  children,
  speed = 0.18,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
