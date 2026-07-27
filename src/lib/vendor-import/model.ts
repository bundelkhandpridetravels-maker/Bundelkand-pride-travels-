/**
 * Vendor import & validation model. Turns raw captured data (Gmail, business
 * cards, rate sheets, brochures, contracts) into validated, deduplicated,
 * scored candidates ready to become real Vendors.
 *
 * Reuses the canonical vendor model (src/lib/vendor/model.ts) — a candidate
 * wraps `Partial<VendorRecord>`, so there is NO duplicate vendor model. Mirrors
 * the Payload Vendors schema by extension.
 */
import type { VendorRecord } from "@/lib/vendor/model";

export const IMPORT_SOURCE_TYPES = [
  "manual",
  "csv",
  "gmail",
  "business_card",
  "rate_sheet",
  "brochure",
  "contract",
  "email_sync",
] as const;
export type ImportSourceType = (typeof IMPORT_SOURCE_TYPES)[number];

export const IMPORT_SOURCE_LABELS: Record<ImportSourceType, string> = {
  manual: "Manual entry",
  csv: "CSV",
  gmail: "Gmail",
  business_card: "Business card",
  rate_sheet: "Rate sheet",
  brochure: "Brochure",
  contract: "Contract",
  email_sync: "Email sync",
};

export const IMPORT_STATUSES = [
  "pending",
  "validated",
  "needs_review",
  "duplicate",
  "ready",
  "imported",
  "rejected",
] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  pending: "Pending",
  validated: "Validated",
  needs_review: "Needs review",
  duplicate: "Duplicate",
  ready: "Ready",
  imported: "Imported",
  rejected: "Rejected",
};

/** Raw captured data before mapping — whatever a source yields. */
export type RawVendorImport = {
  sourceType: ImportSourceType;
  /** Gmail message id, file name, business-card id… */
  sourceRef?: string;
  capturedAt: string;
  /** Free-form captured key/values (businessName, phone, gst, pan, email…). */
  fields: Record<string, string>;
  /** Refs into the Documents layer (brochure/contract scans, etc.). */
  attachments?: string[];
};

export type ImportValidationResult = {
  ok: boolean;
  missingFields: string[];
  errors: string[];
  warnings: string[];
};

export type DuplicateConfidence = "low" | "medium" | "high";

export type DuplicateMatch = {
  vendorId: string;
  vendorName: string;
  reason: string;
  confidence: DuplicateConfidence;
};

/** A mapped, validated candidate — one step from becoming a real Vendor. */
export type VendorImportCandidate = {
  id: string;
  sourceType: ImportSourceType;
  sourceRef?: string;
  /** Mapped toward the canonical VendorRecord — reuse, not a new model. */
  vendor: Partial<VendorRecord>;
  status: ImportStatus;
  validation: ImportValidationResult;
  duplicates: DuplicateMatch[];
  /** 0–100 readiness to import. */
  readiness: number;
  createdAt: string;
};

export type ImportBatchSummary = {
  live: boolean;
  total: number;
  counts: Record<ImportStatus, number>;
  avgReadiness: number;
};

export function emptyImportSummary(live = false): ImportBatchSummary {
  return {
    live,
    total: 0,
    counts: {
      pending: 0,
      validated: 0,
      needs_review: 0,
      duplicate: 0,
      ready: 0,
      imported: 0,
      rejected: 0,
    },
    avgReadiness: 0,
  };
}
