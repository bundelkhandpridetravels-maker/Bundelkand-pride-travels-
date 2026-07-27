import Card from "@/components/ui/Card";
import ReviewStars from "@/components/reviews/ReviewStars";
import type { ReviewRecord } from "@/lib/reviews/model";

/** Presentational single-review card. Reused wherever reviews display. */
export default function ReviewCard({ review }: { review: ReviewRecord }) {
  const context = review.packageSlug || review.destination;
  return (
    <Card className="flex h-full flex-col p-5">
      <ReviewStars rating={review.rating} />
      {review.title && (
        <h3 className="mt-2 font-display text-base font-semibold text-ink-text">{review.title}</h3>
      )}
      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-text-2">“{review.body}”</p>
      <div className="mt-4 flex items-center justify-between border-t border-hair pt-3">
        <span className="text-[12.5px] font-medium text-ink-text">
          {review.authorName}
          {review.authorCity && <span className="text-muted"> · {review.authorCity}</span>}
        </span>
        {context && (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold-dim">{context}</span>
        )}
      </div>
    </Card>
  );
}
