"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { VIEWPORT_ONCE, staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Staggered scroll-reveal. Wrap a list/grid in <StaggerGroup> and each direct
 * child in <StaggerItem>; the items fade up one after another as the group
 * enters view. This replaces the manual `delay={i * 0.05}` pattern with a
 * single orchestrated timeline, so rows always cascade in the right order.
 *
 * Reduced-motion (and SSR/no-JS) render the final state immediately — the
 * markup is identical, only the motion is dropped.
 */

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
