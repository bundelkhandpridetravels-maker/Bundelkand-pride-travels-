/**
 * Maps raw captured fields onto the canonical VendorRecord shape. Pure. Reuses
 * the vendor model — produces a Partial<VendorRecord>, never a new model.
 */
import { VENDOR_TYPES, type VendorRecord, type VendorType } from "@/lib/vendor/model";
import type { RawVendorImport } from "@/lib/vendor-import/model";

/** Pick the first non-empty value among candidate keys. */
function pick(fields: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = fields[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

function normalizeType(raw?: string): VendorType {
  if (!raw) return "other";
  const v = raw.toLowerCase().trim();
  const match = (VENDOR_TYPES as readonly string[]).find((t) => t === v);
  if (match) return match as VendorType;
  if (v.includes("hotel") || v.includes("resort") || v.includes("stay")) return "hotel";
  if (v.includes("transport") || v.includes("cab") || v.includes("fleet") || v.includes("bus")) return "transport";
  if (v.includes("dmc") || v.includes("agent")) return "dmc";
  if (v.includes("guide")) return "guide";
  if (v.includes("activity") || v.includes("adventure")) return "activity";
  return "other";
}

export function mapRawToVendor(raw: RawVendorImport): Partial<VendorRecord> {
  const f = raw.fields;
  const destinationsRaw = pick(f, "destinations", "destination", "location", "city");
  const rating = pick(f, "googleRating", "rating");

  return {
    businessName: pick(f, "businessName", "name", "company", "vendor"),
    type: normalizeType(pick(f, "type", "category", "kind")),
    verificationStatus: "unverified",
    destinations: destinationsRaw
      ? destinationsRaw.split(/[,;/]/).map((s) => s.trim()).filter(Boolean)
      : [],
    qualityScore: null,
    googleRating: rating && Number.isFinite(Number(rating)) ? Number(rating) : undefined,
    agreementStatus: "none",
    active: true,
  };
}
