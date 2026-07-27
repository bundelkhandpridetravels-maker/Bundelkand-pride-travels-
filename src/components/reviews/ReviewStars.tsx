import { cn } from "@/lib/cn";

/** Presentational star rating (1–5). Reused by review cards and summaries. */
export default function ReviewStars({
  rating,
  size = "md",
  className,
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  const dim = size === "sm" ? "text-[13px]" : "text-[16px]";
  return (
    <span className={cn("inline-flex tracking-wider", dim, className)} aria-label={`${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden="true" className={i <= r ? "text-gold" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}
