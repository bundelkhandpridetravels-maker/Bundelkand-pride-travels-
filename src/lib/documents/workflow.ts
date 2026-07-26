// Server-only: high-level document workflows. These call ONLY the provider
// interface — never a storage implementation.
import {
  isConfidentialKind,
  type DocumentKind,
  type DocumentUploadResult,
  type DocumentVisibility,
} from "@/lib/documents/model";
import {
  validateConfidential,
  validateImageUpload,
  validateUpload,
  type UploadCandidate,
  type ValidationOutcome,
} from "@/lib/documents/validation";
import { buildDocumentMetadata } from "@/lib/documents/metadata";
import { getDocumentProvider } from "@/lib/documents/provider";

export type UploadParams = {
  filename: string;
  mimeType: string;
  size: number;
  ownerId?: string;
  bookingId?: string;
  vendorId?: string;
  customerId?: string;
  createdBy?: string;
  hash?: string;
  visibility?: DocumentVisibility;
};

function fail(errors: string[]): DocumentUploadResult {
  return {
    ok: false,
    provider: getDocumentProvider().name,
    stored: false,
    status: "pending_upload",
    validationErrors: errors,
  };
}

/** Core path every workflow funnels through. Validate → metadata → provider. */
async function uploadDocument(
  kind: DocumentKind,
  params: UploadParams,
  validate: (c: UploadCandidate) => ValidationOutcome = validateUpload,
): Promise<DocumentUploadResult> {
  const candidate: UploadCandidate = {
    filename: params.filename,
    mimeType: params.mimeType,
    size: params.size,
  };

  const base = validate(candidate);
  if (!base.ok) return fail(base.errors);

  const metadata = buildDocumentMetadata({
    kind,
    filename: params.filename,
    mimeType: params.mimeType,
    ownerId: params.ownerId,
    bookingId: params.bookingId,
    vendorId: params.vendorId,
    customerId: params.customerId,
    createdBy: params.createdBy,
    hash: params.hash,
    visibility: params.visibility,
  });

  const confidential = isConfidentialKind(kind);
  const confCheck = validateConfidential({ confidential, metadata });
  if (!confCheck.ok) return fail(confCheck.errors);

  return getDocumentProvider().upload({ kind, metadata, mimeType: params.mimeType, size: params.size });
}

// ── Generic, group-scoped ────────────────────────────────────────────────
export const uploadCustomerDocument = (kind: DocumentKind, params: UploadParams) =>
  uploadDocument(kind, params);
export const uploadVendorDocument = (kind: DocumentKind, params: UploadParams) =>
  uploadDocument(kind, params);

// ── Specific booking documents ───────────────────────────────────────────
export const uploadBookingVoucher = (params: UploadParams) => uploadDocument("book_voucher", params);
export const uploadInvoice = (params: UploadParams) => uploadDocument("book_invoice", params);
export const uploadPaymentReceipt = (params: UploadParams) => uploadDocument("book_receipt", params);
export const uploadHotelVoucher = (params: UploadParams) =>
  uploadDocument("book_hotel_confirmation", params);
export const uploadTransportVoucher = (
  params: UploadParams,
  kind: Extract<DocumentKind, "book_flight_ticket" | "book_train_ticket" | "book_bus_ticket"> = "book_bus_ticket",
) => uploadDocument(kind, params);

// ── Specific identity / agreement documents ──────────────────────────────
export const uploadPassport = (params: UploadParams) => uploadDocument("cust_passport", params);
export const uploadGovernmentID = (
  params: UploadParams,
  kind: Extract<DocumentKind, "cust_aadhaar" | "cust_pan" | "cust_driving_licence"> = "cust_aadhaar",
) => uploadDocument(kind, params);
export const uploadAgreement = (params: UploadParams) => uploadDocument("vend_agreement", params);

// ── Insurance (customer travel insurance or vendor insurance) ─────────────
export const uploadInsurance = (params: UploadParams, scope: "customer" | "vendor" = "customer") =>
  uploadDocument(scope === "vendor" ? "vend_insurance" : "cust_travel_insurance", params);

// ── Image-only convenience (photos, hotel/vehicle images) ─────────────────
export const uploadImageDocument = (
  kind: Extract<DocumentKind, "cust_photo" | "vend_hotel_images" | "vend_vehicle_images">,
  params: UploadParams,
) => uploadDocument(kind, params, validateImageUpload);
