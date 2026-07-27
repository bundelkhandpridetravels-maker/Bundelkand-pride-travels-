/**
 * Duplicate detection. Compares an incoming candidate against existing vendors
 * by normalized business name, phone and GST. Pure. Runs against the EXISTING
 * VendorRepository data — no parallel store.
 */
import type { VendorRecord } from "@/lib/vendor/model";
import type { DuplicateMatch, RawVendorImport } from "@/lib/vendor-import/model";

function norm(s?: string): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Existing vendors may carry gst/phone in an extended record; read defensively. */
function readField(v: VendorRecord, key: string): string | undefined {
  const val = (v as unknown as Record<string, unknown>)[key];
  return typeof val === "string" ? val : undefined;
}

export function detectDuplicates(
  vendor: Partial<VendorRecord>,
  raw: RawVendorImport,
  existing: VendorRecord[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const name = norm(vendor.businessName);
  const phone = norm(raw.fields.phone || raw.fields.mobile);
  const gst = norm(raw.fields.gst);

  for (const v of existing) {
    if (gst && norm(readField(v, "gst")) === gst && gst.length > 4) {
      matches.push({ vendorId: v.id, vendorName: v.businessName, reason: "Same GST", confidence: "high" });
      continue;
    }
    if (phone && norm(readField(v, "phone")) === phone && phone.length > 6) {
      matches.push({ vendorId: v.id, vendorName: v.businessName, reason: "Same phone", confidence: "high" });
      continue;
    }
    if (name && norm(v.businessName) === name) {
      matches.push({ vendorId: v.id, vendorName: v.businessName, reason: "Same business name", confidence: "medium" });
    } else if (name && name.length > 4 && norm(v.businessName).includes(name)) {
      matches.push({ vendorId: v.id, vendorName: v.businessName, reason: "Similar business name", confidence: "low" });
    }
  }

  return matches;
}
