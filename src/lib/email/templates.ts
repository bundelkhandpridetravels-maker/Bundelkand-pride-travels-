/**
 * Pure email template renderers. Each takes an existing domain object and the
 * shared company branding and returns a typed EmailMessage. Plain-text (no
 * templating dependency); invents nothing. When Resend + React Email are added,
 * these text bodies map straight into templates.
 */
import { company } from "@/data/company";
import { formatINR } from "@/lib/format";
import type { EnquiryInput } from "@/lib/enquiry";
import type { BookingRecord } from "@/lib/booking/booking";
import type { QuoteDocument } from "@/lib/quote/quote";
import { quoteViewUrl } from "@/lib/quote/share";
import type { EmailMessage } from "@/lib/email/model";

const footer = `\n\n— ${company.name}\n${company.location} · ${company.phone}\n${company.tagline}`;

export function renderEnquiryReceived(input: EnquiryInput): EmailMessage {
  const text =
    `Hi ${input.name},\n\n` +
    `Thank you for your enquiry with ${company.name}. Our team has received your request` +
    `${input.packageTitle ? ` for "${input.packageTitle}"` : ""} and will get back to you shortly with the details.\n\n` +
    `If it's urgent, reach us on ${company.phone}.` +
    footer;
  return {
    template: "enquiry_received",
    to: input.email || undefined,
    subject: `We've received your enquiry — ${company.name}`,
    text,
  };
}

export function renderSalesNewLead(input: EnquiryInput): EmailMessage {
  const text =
    `New lead received.\n\n` +
    `Name: ${input.name}\nPhone: ${input.phone}\nEmail: ${input.email || "—"}\n` +
    `Package: ${input.packageTitle || "—"}\n` +
    `Travellers: ${input.adults} adult(s)${input.children ? `, ${input.children} child(ren)` : ""}\n` +
    `Source: ${input.source}`;
  return {
    template: "sales_new_lead",
    subject: `New lead: ${input.name}${input.packageTitle ? ` — ${input.packageTitle}` : ""}`,
    text,
  };
}

export function renderQuoteSent(doc: QuoteDocument): EmailMessage {
  const text =
    `Hi${doc.customerName ? ` ${doc.customerName}` : ""},\n\n` +
    `Here is your indicative quote from ${company.name}.\n\n` +
    `Reference: ${doc.reference}\n` +
    `${doc.packageTitle} — ${doc.destination} (${doc.durationLabel})\n` +
    `Travellers: ${doc.travellers.adults} adult(s)${doc.travellers.children ? `, ${doc.travellers.children} child(ren)` : ""}\n` +
    `Indicative total: ${formatINR(doc.price.total)} (${doc.gstStatus})\n\n` +
    `View the full quote: ${quoteViewUrl(doc)}\n\n` +
    `This is indicative — our team confirms availability and final pricing before any payment.` +
    footer;
  return {
    template: "quote_sent",
    subject: `Your quote ${doc.reference} — ${company.name}`,
    text,
    meta: { reference: doc.reference },
  };
}

export function renderBookingPaymentPending(booking: BookingRecord): EmailMessage {
  const text =
    `Hi ${booking.name},\n\n` +
    `Thank you — we've received your booking request for "${booking.packageTitle}".\n\n` +
    `Reference: ${booking.reference}\n` +
    `Status: Payment pending\n\n` +
    `Our team will confirm availability and share a secure payment link to finalise your seats. ` +
    `You can track your booking any time with your reference.` +
    footer;
  return {
    template: "booking_payment_pending",
    to: booking.email || undefined,
    subject: `Booking received (${booking.reference}) — ${company.name}`,
    text,
    meta: { reference: booking.reference },
  };
}

export function renderReviewRequest(args: {
  name: string;
  email?: string;
  packageTitle: string;
  reference?: string;
}): EmailMessage {
  const text =
    `Hi ${args.name},\n\n` +
    `We hope you had a wonderful trip with ${company.name}${args.packageTitle ? ` on "${args.packageTitle}"` : ""}!\n\n` +
    `Your feedback means the world to us and helps other travellers. Would you take a moment to share a review?\n\n` +
    `Thank you for travelling with us.` +
    footer;
  return {
    template: "review_request",
    to: args.email || undefined,
    subject: `How was your trip? — ${company.name}`,
    text,
    meta: args.reference ? { reference: args.reference } : undefined,
  };
}
