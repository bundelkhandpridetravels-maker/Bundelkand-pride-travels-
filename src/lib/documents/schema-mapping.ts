/**
 * Application vocabulary ↔ database vocabulary. Pure, total, no I/O.
 *
 * The platform carries TWO document vocabularies at different resolutions:
 *
 *   application  32 `DocumentKind`s   ·  6 `DocumentStatus`es   (src/lib/documents/model.ts)
 *   database      6 `docType` values  ·  3 `status` values      (enum_documents_doc_type,
 *                                                                enum_documents_status)
 *
 * The database enums were created by `src/migrations/20260812_194805_initial.ts`
 * and are ALREADY APPLIED. Widening a Postgres enum means `ALTER TYPE` against a
 * live database, so the coarser vocabulary is treated here as fixed and the
 * translation is done in code instead.
 *
 * ⚠️ DO NOT "fix" the mismatch by adding values to the database enums. The whole
 * point of this module is that the mapping is explicit, reviewed and tested,
 * rather than improvised by whoever first wires persistence. Every lossy pair is
 * named below, so the loss is a documented decision and not a surprise.
 *
 * The one invariant that actually protects data: NO application status meaning
 * "not in force" may map to `active`. A rejected or pending document must never
 * present as live. See `NOT_IN_FORCE` and its test.
 */
import { DOCUMENT_KINDS, type DocumentKind, type DocumentStatus } from "@/lib/documents/model";

/* ------------------------------------------------------------------ *
 * The database vocabulary (mirrors the applied migration exactly)
 * ------------------------------------------------------------------ */

export const PAYLOAD_DOC_TYPES = [
  "id_proof",
  "passport",
  "agreement",
  "invoice",
  "voucher",
  "other",
] as const;
export type PayloadDocType = (typeof PAYLOAD_DOC_TYPES)[number];

export const PAYLOAD_DOCUMENT_STATUSES = ["active", "expired", "archived"] as const;
export type PayloadDocumentStatus = (typeof PAYLOAD_DOCUMENT_STATUSES)[number];

/* ------------------------------------------------------------------ *
 * Kind → docType
 * ------------------------------------------------------------------ */

/**
 * Total map — every kind has exactly one database value, so persistence can
 * never hit an unmapped case. `Record<DocumentKind, …>` makes the compiler
 * enforce that: adding a kind without mapping it is a build error, by design.
 *
 * Grouping rules applied:
 *   id_proof  — documents that identify a person or a business
 *   passport  — passports only (the enum has a dedicated value)
 *   agreement — executed agreements between parties
 *   invoice   — money owed or paid
 *   voucher   — proof of a booked entitlement (tickets, confirmations)
 *   other     — everything the coarse enum cannot express
 */
export const DOC_TYPE_MAP: Record<DocumentKind, PayloadDocType> = {
  // Customer
  cust_passport: "passport",
  cust_visa: "other", // a visa is an endorsement, not an identity document
  cust_aadhaar: "id_proof",
  cust_pan: "id_proof",
  cust_driving_licence: "id_proof",
  cust_photo: "other",
  cust_travel_insurance: "other",
  cust_medical_certificate: "other",
  cust_consent_form: "other", // signed acknowledgement, not an agreement between parties

  // Vendor
  vend_gst: "id_proof", // identifies the business
  vend_pan: "id_proof",
  vend_bank_details: "other",
  vend_cancelled_cheque: "other",
  vend_agreement: "agreement",
  vend_rate_sheet: "other", // a price list is NOT an agreement — see note below
  vend_hotel_brochure: "other",
  vend_hotel_images: "other",
  vend_vehicle_images: "other",
  vend_fleet_documents: "other",
  vend_insurance: "other",
  vend_rc: "other",
  vend_permit: "other",
  vend_fitness: "other",

  // Booking
  book_voucher: "voucher",
  book_invoice: "invoice",
  book_receipt: "invoice", // no dedicated receipt value
  book_quotation_pdf: "other",
  book_hotel_confirmation: "voucher",
  book_flight_ticket: "voucher",
  book_train_ticket: "voucher",
  book_bus_ticket: "voucher",
  book_activity_voucher: "voucher",
};

/**
 * Kinds whose database value loses information — i.e. the row can no longer be
 * distinguished from other kinds sharing that value. Declared explicitly so a
 * future reader can see the cost of the coarse enum at a glance, rather than
 * inferring it by scanning the map.
 *
 * `vend_rate_sheet` lands in `other` deliberately. Mapping it to `agreement`
 * would be worse than lossy — it would be WRONG: a rate sheet is a price list
 * the supplier sent, not an executed contract, and the two carry different legal
 * weight. The application-layer kind remains the precise answer.
 */
export function isLossyKind(kind: DocumentKind): boolean {
  const target = DOC_TYPE_MAP[kind];
  if (target !== "other") {
    // Shared non-`other` values are still lossy (e.g. receipt→invoice).
    return DOCUMENT_KINDS.filter((k) => DOC_TYPE_MAP[k] === target).length > 1;
  }
  return true;
}

export function toPayloadDocType(kind: DocumentKind): PayloadDocType {
  return DOC_TYPE_MAP[kind];
}

/** Every application kind stored under one database value. */
export function kindsForDocType(docType: PayloadDocType): DocumentKind[] {
  return DOCUMENT_KINDS.filter((k) => DOC_TYPE_MAP[k] === docType);
}

/* ------------------------------------------------------------------ *
 * Status → status
 * ------------------------------------------------------------------ */

/**
 * Application statuses that mean "this document is NOT in force". None of these
 * may ever map to `active`; doing so would present a rejected or not-yet-
 * uploaded document as live, which is the one failure mode here that could
 * actually mislead an operator.
 */
export const NOT_IN_FORCE: readonly DocumentStatus[] = [
  "pending_upload",
  "rejected",
  "expired",
  "archived",
];

export const STATUS_MAP: Record<DocumentStatus, PayloadDocumentStatus> = {
  // Bytes have not arrived. The database cannot express "awaiting upload", and
  // `active` would be a lie, so the row rests in `archived` until it is real.
  pending_upload: "archived",
  uploaded: "active",
  verified: "active", // verification is not representable — see isLossyStatus
  rejected: "archived", // NOT `active`; rejection has no database value
  expired: "expired",
  archived: "archived",
};

/** True when the database value cannot round-trip back to this exact status. */
export function isLossyStatus(status: DocumentStatus): boolean {
  return fromPayloadStatus(STATUS_MAP[status]) !== status;
}

export function toPayloadStatus(status: DocumentStatus): PayloadDocumentStatus {
  return STATUS_MAP[status];
}

/**
 * Reverse direction, deliberately narrow. `active` could have come from
 * `uploaded` or `verified`; claiming `verified` would invent a verification that
 * may never have happened, so the weaker, truthful value wins.
 */
export function fromPayloadStatus(status: PayloadDocumentStatus): DocumentStatus {
  switch (status) {
    case "active":
      return "uploaded";
    case "expired":
      return "expired";
    case "archived":
      return "archived";
  }
}

/* ------------------------------------------------------------------ *
 * Fidelity reporting
 * ------------------------------------------------------------------ */

export type MappingFidelity = {
  kind: DocumentKind;
  docType: PayloadDocType;
  lossy: boolean;
  /** Other kinds that become indistinguishable once stored. */
  sharesValueWith: DocumentKind[];
};

/** Per-kind fidelity — rendered by the console so the loss is visible, not buried. */
export function describeKindMapping(kind: DocumentKind): MappingFidelity {
  const docType = DOC_TYPE_MAP[kind];
  return {
    kind,
    docType,
    lossy: isLossyKind(kind),
    sharesValueWith: kindsForDocType(docType).filter((k) => k !== kind),
  };
}

export function lossyKindCount(): number {
  return DOCUMENT_KINDS.filter(isLossyKind).length;
}
