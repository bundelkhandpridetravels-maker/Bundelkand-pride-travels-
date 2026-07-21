"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  DURATION,
  EASE_OUT,
  VIEWPORT_ONCE,
  directionOffset,
  type RevealDirection,
} from "@/lib/motion";

/**
 * Scroll-reveal wrapper — eases content in as it enters the viewport, once.
 * Purely decorative: content is fully present in the DOM for SSR/SEO and for
 * reduced-motion users (who get no transform, just the final state).
 *
 * Backwards-compatible: existing `<Reveal delay className>` calls keep working;
 * `direction`, `distance` and `duration` are new opt-in controls that read
 * their defaults from the shared motion tokens (src/lib/motion.ts).
 */
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 18,
  duration = DURATION.base,
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const { x, y } = directionOffset(direction, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
