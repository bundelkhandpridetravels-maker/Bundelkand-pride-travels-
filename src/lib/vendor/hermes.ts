/**
 * Vendor → Hermes seam. Exposes vendor data on the shared HermesContext contract
 * so the intelligence layer can later assist with vendor communication,
 * assignment suggestions and performance summaries — advisory only.
 */
import type { HermesContext } from "@/lib/crm/hermes";
import type { VendorRecord } from "@/lib/vendor/model";

export function buildVendorContext(vendor: VendorRecord): HermesContext {
  return {
    kind: "vendor",
    facts: {
      type: vendor.type,
      verification: vendor.verificationStatus,
      score: vendor.qualityScore ?? -1,
      destinations: vendor.destinations.length,
      active: vendor.active,
    },
  };
}
