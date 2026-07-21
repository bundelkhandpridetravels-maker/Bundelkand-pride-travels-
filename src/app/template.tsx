import type { ReactNode } from "react";
import PageTransition from "@/components/motion/PageTransition";

/**
 * Root template — Next gives this a fresh key on every top-level route change
 * (see node_modules/next/dist/docs/.../file-conventions/template.md), so the
 * PageTransition inside it remounts and plays its enter crossfade per page.
 * Layout state (fonts, providers) still persists in layout.tsx above this.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
