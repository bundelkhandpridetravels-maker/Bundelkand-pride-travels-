/**
 * Email workflow model. The template registry is the single source of truth for
 * the platform's transactional emails — reused by the workflow orchestrators and
 * the Admin surface. No provider is integrated yet (console stub); this is the
 * architecture, ready to attach Resend later with no caller change.
 */

export const EMAIL_TEMPLATES = [
  "enquiry_received",
  "sales_new_lead",
  "quote_sent",
  "booking_payment_pending",
  "review_request",

  // Vendor lifecycle (Phase 3 M2) — driven by the onboarding state machine
  // (src/lib/vendor/onboarding.ts). Added to THIS registry rather than a parallel
  // one, so the Admin surface and Hermes see every template in one place.
  "vendor_onboarding_invite",
  "vendor_details_request",
  "vendor_documents_request",
  "vendor_verification_approved",
  "vendor_verification_rejected",
  "vendor_agreement_sent",
  "vendor_activated",
  "vendor_suspended",
] as const;
export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[number];

export type EmailAudience = "customer" | "internal" | "vendor";

export const EMAIL_TEMPLATE_META: Record<
  EmailTemplateId,
  { label: string; trigger: string; audience: EmailAudience }
> = {
  enquiry_received: {
    label: "Enquiry received",
    trigger: "New enquiry submitted",
    audience: "customer",
  },
  sales_new_lead: {
    label: "New lead (internal)",
    trigger: "New enquiry/booking submitted",
    audience: "internal",
  },
  quote_sent: {
    label: "Quote sent",
    trigger: "Quote shared with customer",
    audience: "customer",
  },
  booking_payment_pending: {
    label: "Booking received — payment pending",
    trigger: "Booking submitted",
    audience: "customer",
  },
  review_request: {
    label: "Review request",
    trigger: "Trip completed",
    audience: "customer",
  },

  vendor_onboarding_invite: {
    label: "Vendor onboarding invitation",
    trigger: "Supplier captured by operations",
    audience: "vendor",
  },
  vendor_details_request: {
    label: "Vendor details request",
    trigger: "Profile incomplete",
    audience: "vendor",
  },
  vendor_documents_request: {
    label: "Vendor documents request",
    trigger: "Compliance documents outstanding",
    audience: "vendor",
  },
  vendor_verification_approved: {
    label: "Vendor verification approved",
    trigger: "Operations verified the supplier (human approval)",
    audience: "vendor",
  },
  vendor_verification_rejected: {
    label: "Vendor verification declined",
    trigger: "Operations declined the supplier (human approval)",
    audience: "vendor",
  },
  vendor_agreement_sent: {
    label: "Vendor agreement sent",
    trigger: "Agreement issued for signature (human approval)",
    audience: "vendor",
  },
  vendor_activated: {
    label: "Vendor activated",
    trigger: "Supplier activated in the network (human approval)",
    audience: "vendor",
  },
  vendor_suspended: {
    label: "Vendor suspended",
    trigger: "Supplier withdrawn from allocation (human approval)",
    audience: "vendor",
  },
};

export type EmailMessage = {
  template: EmailTemplateId;
  /** Recipient; may be absent (e.g. internal queue, or customer left email blank). */
  to?: string;
  subject: string;
  text: string;
  meta?: Record<string, string>;
};

export type EmailSendResult = {
  ok: boolean;
  id?: string;
  provider: string;
  /** Whether it was actually delivered (false for the console stub). */
  delivered: boolean;
  error?: string;
};
