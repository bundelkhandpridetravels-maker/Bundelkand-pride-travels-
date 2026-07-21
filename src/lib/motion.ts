import type { Variants } from "framer-motion";

/**
 * Motion foundation — the single source of truth for how this site moves.
 *
 * Every animation (Framer components, CSS keyframes) should pull its easing and
 * timing from here so the whole product feels like one hand made it. The
 * signature curve is a soft ease-out-expo — quick to start, long gentle
 * settle — which reads as "expensive" without drawing attention to itself.
 *
 * Keep these in sync with the `bpt-fade-up` keyframe easing in globals.css
 * (same cubic-bezier), so JS- and CSS-driven motion match.
 */

/** Signature ease-out. Matches the cubic-bezier used in globals.css. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** A slightly softer ease-out for larger travel (page/hero-scale moves). */
export const EASE_OUT_SOFT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Durations in seconds. Named by intent, not by number, so calls read well. */
export const DURATION = {
  fast: 0.35,
  base: 0.55,
  slow: 0.9,
} as const;

/** Shared "reveal once when it scrolls in" viewport config. */
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

/** Initial offset for a given reveal direction, in pixels. */
export function directionOffset(
  direction: RevealDirection,
  distance: number,
): { x: number; y: number } {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "none":
      return { x: 0, y: 0 };
  }
}

/**
 * Stagger container/item variants. The container orchestrates; each item plays
 * the same fade-up. Used by <StaggerGroup>/<StaggerItem>.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Opacity-only page transition. No transform/filter — safe above a fixed nav. */
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
};
