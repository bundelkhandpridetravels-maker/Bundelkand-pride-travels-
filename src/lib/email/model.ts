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
