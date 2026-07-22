import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Unmistakable "scaffold — awaiting real business data" marker.
 *
 * Per the Master Business Blueprint we NEVER invent destinations, hotels,
 * itineraries, prices or business rules. Every scaffolded page/section that is
 * waiting on real founder-supplied data renders this so it can never be mistaken
 * for live content. It is intentionally loud (dashed gold border + label) and
 * carries a `data-scaffold` hook so scaffolds are easy to grep/remove later.
 */
export default function ScaffoldNotice({
  title = "Structure ready — content pending",
  children,
  className,
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-scaffold="true"
      className={cn(
        "rounded-2xl border border-dashed border-gold/60 bg-gold/[0.06] p-6 sm:p-8",
        className,
      )}
    >
      <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-gold-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Scaffold · awaiting real data
      </div>
      <p className="font-display text-lg font-semibold text-ink-text">{title}</p>
      {children && (
        <div className="mt-2 text-[14px] leading-relaxed text-ink-text-2">{children}</div>
      )}
    </div>
  );
}
