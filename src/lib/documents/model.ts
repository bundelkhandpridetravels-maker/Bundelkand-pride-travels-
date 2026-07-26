/**
 * Document Management — the single document model for the whole platform.
 * Provider-driven and storage-agnostic. Mirrors the stable Payload schema
 * (src/payload/collections/Documents.ts): title/docType/relatedTo(polymorphic)/
 * confidential/expiresAt/status. Every module (Customer, Booking, Vendor, CRM,
 * Finance, Operations, Employee Portal) reuses THIS — no parallel document model.
 */

// ── Kinds (namespaced by owner group to avoid collisions e.g. customer vs vendor PAN)
const CUSTOMER_KINDS = [
  "cust_passport",
  "cust_visa",
  "cust_aadhaar",
  "cust_pan",
  "cust_driving_licence",
  "cust_photo",
  "cust_travel_insurance",
  "cust_medical_certificate",
  "cust_consent_form",
] as const;

const VENDOR_KINDS = [
  "vend_gst",
  "vend_pan",
  "vend_bank_details",
  "vend_cancelled_cheque",
  "vend_agreement",
  "vend_hotel_brochure",
  "vend_hotel_images",
  "vend_vehicle_images",
  "vend_fleet_documents",
  "vend_insurance",
  "vend_rc",
  "vend_permit",
  "vend_fitness",
] as const;

const BOOKING_KINDS = [
  "book_voucher",
  "book_invoice",
  "book_receipt",
  "book_quotation_pdf",
  "book_hotel_confirmation",
  "book_flight_ticket",
  "book_train_ticket",
  "book_bus_ticket",
  "book_activity_voucher",
] as const;

export const DOCUMENT_KINDS = [...CUSTOMER_KINDS, ...VENDOR_KINDS, ...BOOKING_KINDS] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export type DocumentGroup = "customer" | "vendor" | "booking";
export type DocumentOwnerType =
  | "customer"
  | "vendor"
  | "booking"
  | "employee"
  | "operations"
  | "finance";

export const DOCUMENT_VISIBILITIES = [
  "public",
  "internal",
  "finance",
  "operations",
  "vendor_only",
  "customer_only",
  "founder_only",
  "confidential",
] as const;
export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];

export const DOCUMENT_STATUSES = [
  "pending_upload",
  "uploaded",
  "verified",
  "rejected",
  "expired",
  "archived",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

// ── Metadata + records
export type DocumentMetadata = {
  owner: DocumentOwnerType;
  ownerId?: string;
  bookingId?: string;
  vendorId?: string;
  customerId?: string;
  fileType: string;
  visibility: DocumentVisibility;
  createdBy?: string;
  uploadedAt: string;
  /** Content hash (provided by caller once bytes exist). */
  hash?: string;
  /** Integrity checksum over the metadata record. */
  checksum: string;
  originalFilename: string;
  storedFilename: string;
  version: number;
};

export type DocumentRecord = {
  id: string;
  kind: DocumentKind;
  status: DocumentStatus;
  confidential: boolean;
  expiresAt?: string;
  metadata: DocumentMetadata;
  note?: string;
};

export type DocumentUploadResult = {
  ok: boolean;
  id?: string;
  storedFilename?: string;
  provider: string;
  /** Whether the bytes were actually stored (false for the console stub). */
  stored: boolean;
  status: DocumentStatus;
  error?: string;
  validationErrors?: string[];
};

/** What the provider receives — no raw bytes in the stub phase. */
export type DocumentUploadDescriptor = {
  kind: DocumentKind;
  metadata: DocumentMetadata;
  mimeType: string;
  size: number;
};

/**
 * Storage boundary. Callers depend on this, never a concrete backend. Implement
 * for Cloudflare R2 / AWS S3 / GCS / Azure later; the model + workflows + UI
 * never change.
 */
export interface DocumentProvider {
  readonly name: string;
  upload(descriptor: DocumentUploadDescriptor): Promise<DocumentUploadResult>;
  getUrl?(storedFilename: string): string | null;
  remove?(storedFilename: string): Promise<boolean>;
}

// ── Derivations (single source, used by workflows + Admin UI)
const CONFIDENTIAL_KINDS = new Set<DocumentKind>([
  "cust_passport",
  "cust_visa",
  "cust_aadhaar",
  "cust_pan",
  "cust_driving_licence",
  "cust_medical_certificate",
  "vend_gst",
  "vend_pan",
  "vend_bank_details",
  "vend_cancelled_cheque",
  "vend_agreement",
  "book_invoice",
  "book_receipt",
]);

const LABEL_OVERRIDES: Partial<Record<DocumentKind, string>> = {
  cust_pan: "PAN card",
  cust_aadhaar: "Aadhaar",
  cust_travel_insurance: "Travel insurance",
  cust_medical_certificate: "Medical certificate",
  vend_gst: "GST certificate",
  vend_pan: "PAN card",
  vend_rc: "RC (registration)",
  vend_bank_details: "Bank details",
  vend_cancelled_cheque: "Cancelled cheque",
  vend_fleet_documents: "Fleet documents",
  book_quotation_pdf: "Quotation PDF",
  book_voucher: "Booking voucher",
  book_hotel_confirmation: "Hotel confirmation",
};

export function documentGroup(kind: DocumentKind): DocumentGroup {
  if (kind.startsWith("cust_")) return "customer";
  if (kind.startsWith("vend_")) return "vendor";
  return "booking";
}

export function documentOwner(kind: DocumentKind): DocumentOwnerType {
  return documentGroup(kind);
}

export function isConfidentialKind(kind: DocumentKind): boolean {
  return CONFIDENTIAL_KINDS.has(kind);
}

export function defaultVisibilityFor(kind: DocumentKind): DocumentVisibility {
  if (isConfidentialKind(kind)) return "confidential";
  switch (documentGroup(kind)) {
    case "customer":
      return "customer_only";
    case "vendor":
      return "vendor_only";
    case "booking":
      return "internal";
  }
}

export function labelForKind(kind: DocumentKind): string {
  const override = LABEL_OVERRIDES[kind];
  if (override) return override;
  const base = kind.replace(/^(cust|vend|book)_/, "").replace(/_/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}
