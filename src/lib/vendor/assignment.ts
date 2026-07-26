/**
 * Hotel/Vendor Allocation seam (ARCHITECTURE_V2 §3). Given a booking's needs,
 * rank eligible vendors by quality score → return PROPOSALS ONLY. A human
 * confirms the allocation (blueprint: category-based, no auto-commit; AI may
 * prepare but never execute — security §12). Pure and deterministic.
 */
import type {
  VendorAssignmentProposal,
  VendorRecord,
  VendorType,
} from "@/lib/vendor/model";

export type AssignmentNeed = {
  destination?: string;
  /** e.g. "hotel", "transport" — the kind of vendor required. */
  type?: VendorType;
};

/** Eligible = active, verified, and (if specified) matching type + destination. */
function isEligible(v: VendorRecord, need: AssignmentNeed): boolean {
  if (!v.active) return false;
  if (v.verificationStatus !== "verified") return false;
  if (need.type && v.type !== need.type) return false;
  if (need.destination && !v.destinations.includes(need.destination)) return false;
  return true;
}

export function proposeVendors(
  candidates: VendorRecord[],
  need: AssignmentNeed = {},
): VendorAssignmentProposal[] {
  return candidates
    .filter((v) => isEligible(v, need))
    .sort((a, b) => (b.qualityScore ?? -1) - (a.qualityScore ?? -1))
    .map((v) => ({
      vendorId: v.id,
      vendorName: v.businessName,
      type: v.type,
      score: v.qualityScore,
      reason:
        v.qualityScore === null
          ? "Verified vendor (not yet scored)"
          : `Verified · quality score ${v.qualityScore}`,
    }));
}
