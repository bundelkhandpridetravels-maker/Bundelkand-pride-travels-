import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Surface primitive — the rounded, bordered "paper" card used across packages,
 * destinations, departures and dashboards. `interactive` adds the signature
 * hover lift + gold border + soft shadow (for cards that are links/buttons).
 */
export default function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <Tag
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-bone",
        interactive &&
          "group transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-20px_rgba(10,14,26,0.4)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
