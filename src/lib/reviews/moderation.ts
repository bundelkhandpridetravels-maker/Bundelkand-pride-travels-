/**
 * Review moderation — pure status transitions. New reviews land `pending`; a
 * human approves/rejects; approved reviews are published. No auto-publish.
 */
import type { ReviewStatus } from "@/lib/reviews/model";

export type ModerationAction = "approve" | "reject" | "publish" | "unpublish";

const TRANSITIONS: Record<ReviewStatus, Partial<Record<ModerationAction, ReviewStatus>>> = {
  pending: { approve: "approved", reject: "rejected" },
  approved: { publish: "published", reject: "rejected" },
  rejected: { approve: "approved" },
  published: { unpublish: "approved" },
};

export function canModerate(status: ReviewStatus, action: ModerationAction): boolean {
  return Boolean(TRANSITIONS[status][action]);
}

/** Returns the next status, or the same status if the action isn't allowed. */
export function applyModeration(status: ReviewStatus, action: ModerationAction): ReviewStatus {
  return TRANSITIONS[status][action] ?? status;
}

export function isPublished(status: ReviewStatus): boolean {
  return status === "published";
}
