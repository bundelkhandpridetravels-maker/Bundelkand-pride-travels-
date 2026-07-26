/**
 * Vendor domain model — the supply-side vocabulary, mirroring the stable Payload
 * schema (src/payload/collections/Vendors.ts and the Hotels/Dmcs/
 * TransportProviders that link to it). One language, no parallel model. Plugs
 * into the CRM lifecycle's `vendor_assignment` stage.
 */

export const VENDOR_TYPES = ["hotel", "dmc", "transport", "guide", "activity", "other"] as const;
export type VendorType = (typeof VENDOR_TYPES)[number];

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  hotel: "Hotel",
  dmc: "DMC",
  transport: "Transport",
  guide: "Guide",
  activity: "Activity",
  other: "Other",
};

/** Mirrors payload `vendors.verificationStatus`. */
export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "suspended",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

/** Normalized vendor — what dashboards, ranking and assignment consume. */
export type VendorRecord = {
  id: string;
  businessName: string;
  type: VendorType;
  verificationStatus: VerificationStatus;
  destinations: string[];
  /** 0–100, output of the ranking engine; null when not yet scored. */
  qualityScore: number | null;
  avgResponseMins?: number;
  googleRating?: number;
  agreementStatus?: "none" | "draft" | "signed" | "expired";
  active: boolean;
};

export type VendorVerificationSummary = {
  live: boolean;
  counts: Record<VerificationStatus, number>;
  total: number;
};

export function emptyVerificationSummary(live = false): VendorVerificationSummary {
  return {
    live,
    counts: { unverified: 0, pending: 0, verified: 0, rejected: 0, suspended: 0 },
    total: 0,
  };
}

/** A ranked allocation proposal — advisory; a human confirms it. */
export type VendorAssignmentProposal = {
  vendorId: string;
  vendorName: string;
  type: VendorType;
  score: number | null;
  reason: string;
};
