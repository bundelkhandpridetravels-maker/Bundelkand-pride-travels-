// Server-only: transactional email orchestrators (render → send).
import type { EnquiryInput } from "@/lib/enquiry";
import type { BookingRecord } from "@/lib/booking/booking";
import type { QuoteDocument } from "@/lib/quote/quote";
import type { EmailSendResult } from "@/lib/email/model";
import { getEmailProvider } from "@/lib/email/email-provider";
import {
  renderBookingPaymentPending,
  renderEnquiryReceived,
  renderQuoteSent,
  renderReviewRequest,
  renderSalesNewLead,
} from "@/lib/email/templates";

/**
 * The email side-effects the platform will trigger. These are the seams the API
 * routes / CRM call — intentionally NOT wired into the completed enquiry/booking
 * routes (those are stable). When email goes live, a route calls the relevant
 * function here; nothing else changes.
 */

/** On a new enquiry: acknowledge the customer + notify sales. */
export async function sendEnquiryReceived(input: EnquiryInput): Promise<EmailSendResult[]> {
  const provider = getEmailProvider();
  return Promise.all([
    provider.send(renderEnquiryReceived(input)),
    provider.send(renderSalesNewLead(input)),
  ]);
}

export async function sendQuoteSent(doc: QuoteDocument): Promise<EmailSendResult> {
  return getEmailProvider().send(renderQuoteSent(doc));
}

export async function sendBookingPaymentPending(booking: BookingRecord): Promise<EmailSendResult> {
  return getEmailProvider().send(renderBookingPaymentPending(booking));
}

export async function sendReviewRequest(args: {
  name: string;
  email?: string;
  packageTitle: string;
  reference?: string;
}): Promise<EmailSendResult> {
  return getEmailProvider().send(renderReviewRequest(args));
}
