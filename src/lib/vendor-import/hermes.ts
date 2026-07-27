/**
 * Vendor-import → Hermes seam. Lets the intelligence layer later assist with
 * import triage — suggesting field completions, flagging likely duplicates and
 * summarising a batch — on the shared HermesContext contract. Advisory only.
 */
import type { HermesContext } from "@/lib/hermes";
import type { VendorImportCandidate } from "@/lib/vendor-import/model";

export function buildImportContext(candidate: VendorImportCandidate): HermesContext {
  return {
    kind: "vendor",
    facts: {
      source: candidate.sourceType,
      status: candidate.status,
      readiness: candidate.readiness,
      missingFields: candidate.validation.missingFields.length,
      duplicates: candidate.duplicates.length,
    },
  };
}
