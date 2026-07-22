import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Pill / badge primitive — the small uppercase mono chips used for tags,
 * ratings, "featured" flags, statuses and category labels.
 */

export type BadgeVariant = "gold" | "ink" | "outline" | "pine" | "glass";

const variants: Record<BadgeVariant, string> = {
  gold: "bg-gold text-ink",
  ink: "bg-ink/70 text-gold-bright backdrop-blur-sm",
  outline: "border border-line text-muted",
  pine: "bg-pine-tint text-pine",
  glass: "border border-cream/20 text-cream/85",
};

export default function Badge({
  children,
  variant = "gold",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
