import { cn } from "@/lib/cn";

/**
 * Eyebrow label — the mono uppercase kicker with a leading gold rule, used above
 * section headings and on cards. `tone="dark"` for ink backgrounds.
 */
export default function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em]",
        tone === "dark" ? "text-gold-bright" : "text-gold-dim",
        className,
      )}
    >
      <span className={cn("h-px w-5", tone === "dark" ? "bg-gold-bright" : "bg-gold-dim")} />
      {children}
    </span>
  );
}
