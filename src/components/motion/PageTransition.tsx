"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { pageTransition } from "@/lib/motion";

/**
 * Route-change enter transition. Mounted from app/template.tsx, which Next
 * remounts on every top-level navigation, so this plays a gentle crossfade as
 * each page arrives.
 *
 * IMPORTANT: opacity only — never transform/filter here. This wrapper sits
 * above the `position: fixed` Navbar, and a transform/filter on an ancestor
 * would make the fixed nav scroll with the page (CSS containing-block rule).
 * Directional/rise motion belongs in section-level <Reveal>/<StaggerGroup>,
 * which never wrap the fixed nav.
 *
 * Reduced-motion renders the page immediately, no fade.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
