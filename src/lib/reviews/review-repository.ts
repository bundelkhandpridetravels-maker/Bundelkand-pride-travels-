// Server-only: review persistence + read boundary.
import { randomUUID } from "node:crypto";
import { emptyReviewSummary, type ReviewRecord, type ReviewStatus, type ReviewSummary } from "@/lib/reviews/model";
import type { ReviewSubmission } from "@/lib/reviews/submission";

/**
 * Review boundary. Public reads (published only), a moderation summary, and
 * submission. Console stub reports `live:false` and stamps a `pending` review
 * (logged, not persisted). Swap PayloadReviewRepository / NeonReviewRepository —
 * public display, CRM moderation and vendor scoring all light up, no UI change.
 */
export interface ReviewRepository {
  getSummary(): Promise<ReviewSummary>;
  listPublished(): Promise<{ live: boolean; reviews: ReviewRecord[] }>;
  submit(input: ReviewSubmission): Promise<{ ok: boolean; id: string; status: ReviewStatus }>;
}

class ConsoleReviewRepository implements ReviewRepository {
  async getSummary(): Promise<ReviewSummary> {
    return emptyReviewSummary(false);
  }
  async listPublished(): Promise<{ live: boolean; reviews: ReviewRecord[] }> {
    return { live: false, reviews: [] };
  }
  async submit(input: ReviewSubmission): Promise<{ ok: boolean; id: string; status: ReviewStatus }> {
    const id = `rev_${randomUUID()}`;
    // New reviews always start pending — a human moderates before publish.
    console.info(
      "[review:new]",
      JSON.stringify({ id, rating: input.rating, author: input.authorName, package: input.packageSlug ?? null }),
    );
    return { ok: true, id, status: "pending" };
  }
}

let repo: ReviewRepository | null = null;

export function getReviewRepository(): ReviewRepository {
  if (!repo) repo = new ConsoleReviewRepository();
  return repo;
}
