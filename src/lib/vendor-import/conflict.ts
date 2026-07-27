/**
 * Conflict resolution for vendor imports. Given a candidate and its detected
 * duplicates, decides how to reconcile — advisory only; a human confirms merges.
 * Pure. Extends the import pipeline additively.
 */
import type { VendorImportCandidate } from "@/lib/vendor-import/model";

export type ConflictAction = "create_new" | "merge" | "skip" | "manual_review";

export type ConflictResolution = {
  action: ConflictAction;
  reason: string;
  /** Existing vendor to merge into / that this duplicates. */
  targetVendorId?: string;
  requiresHumanApproval: boolean;
};

export function resolveConflict(candidate: VendorImportCandidate): ConflictResolution {
  const dups = candidate.duplicates;

  if (dups.length === 0) {
    return { action: "create_new", reason: "No duplicates detected.", requiresHumanApproval: false };
  }

  const high = dups.find((d) => d.confidence === "high");
  if (high) {
    // Same GST/phone → almost certainly the same vendor.
    return candidate.validation.ok
      ? {
          action: "merge",
          reason: `High-confidence duplicate (${high.reason}).`,
          targetVendorId: high.vendorId,
          requiresHumanApproval: true,
        }
      : {
          action: "skip",
          reason: `Duplicate of an existing vendor (${high.reason}) and incomplete.`,
          targetVendorId: high.vendorId,
          requiresHumanApproval: true,
        };
  }

  const medium = dups.find((d) => d.confidence === "medium");
  return {
    action: "manual_review",
    reason: medium
      ? `Possible duplicate (${medium.reason}) — review before importing.`
      : "Low-confidence similarity — review before importing.",
    targetVendorId: (medium ?? dups[0]).vendorId,
    requiresHumanApproval: true,
  };
}
