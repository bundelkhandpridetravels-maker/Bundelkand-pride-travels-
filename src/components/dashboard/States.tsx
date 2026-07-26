import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared dashboard states — dark, internal design language. Used everywhere data
 * is not yet wired, so scaffolds never show invented numbers.
 */

/** Empty state for panels/tables with no data yet. */
export function EmptyState({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/12 bg-white/[0.015] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M4 7h16v12H4zM4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[13.5px] font-medium text-white/75">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-white/40">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Skeleton loading block — used in loading.tsx and Suspense fallbacks. */
export function LoadingState({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-white/8 bg-white/[0.03]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl border border-white/8 bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}

/** Internal "scaffold — awaiting real data / backend" note (dark variant). */
export function ScaffoldNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-scaffold="true"
      className={cn(
        "rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-[12.5px] leading-relaxed text-amber-200/80",
        className,
      )}
    >
      {children}
    </div>
  );
}
