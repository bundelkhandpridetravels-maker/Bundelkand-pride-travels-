/**
 * Import readiness score — 0–100. How ready a candidate is to become a real
 * vendor: complete, valid, and not a duplicate. Pure.
 */
import type {
  DuplicateMatch,
  ImportStatus,
  ImportValidationResult,
} from "@/lib/vendor-import/model";

export function computeReadiness(
  validation: ImportValidationResult,
  duplicates: DuplicateMatch[],
): number {
  let score = 100;
  score -= validation.missingFields.length * 25;
  score -= validation.errors.length * 15;
  score -= validation.warnings.length * 5;

  if (duplicates.some((d) => d.confidence === "high")) score -= 60;
  else if (duplicates.some((d) => d.confidence === "medium")) score -= 30;
  else if (duplicates.length > 0) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Derive the workflow status from validation + duplicates. */
export function deriveImportStatus(
  validation: ImportValidationResult,
  duplicates: DuplicateMatch[],
): ImportStatus {
  if (duplicates.some((d) => d.confidence === "high")) return "duplicate";
  if (!validation.ok) return "needs_review";
  if (duplicates.length > 0) return "needs_review";
  return "ready";
}
