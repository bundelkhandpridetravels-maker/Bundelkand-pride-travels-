import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewStars from "@/components/reviews/ReviewStars";
import type { ReviewRecord, ReviewSummary } from "@/lib/reviews/model";

/**
 * Presentational published-reviews list + optional summary header. Reused on the
 * (future) reviews page and package pages once the backend serves real reviews.
 */
export default function ReviewList({
  reviews,
  summary,
  emptyLabel = "No reviews to show yet.",
}: {
  reviews: ReviewRecord[];
  summary?: ReviewSummary;
  emptyLabel?: string;
}) {
  return (
    <div>
      {summary && summary.total > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <span className="font-display text-3xl font-semibold text-ink-text">
            {summary.average.toFixed(1)}
          </span>
          <span>
            <ReviewStars rating={summary.average} />
            <span className="block text-[12px] text-muted">{summary.total} reviews</span>
          </span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-[13.5px] text-muted">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
