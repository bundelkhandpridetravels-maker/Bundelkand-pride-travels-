/**
 * Integration spine: fold each existing seam (enquiry, booking, quote) into the
 * unified CRM model. Pure functions, no side effects — when the DB is connected,
 * the ingestion pipeline uses exactly these mappers, so "everything flows through
 * the CRM" is real, not aspirational.
 */
import type { Enquiry } from "@/lib/enquiry";
import type { BookingRecord } from "@/lib/booking/booking";
import type { QuoteDocument } from "@/lib/quote/quote";
import type { CrmActivity, CrmLead, LeadStage } from "@/lib/crm/model";

/** Enquiry lifecycle status → CRM lead stage. */
function stageFromEnquiryStatus(status: Enquiry["status"]): LeadStage {
  switch (status) {
    case "contacted":
      return "contacted";
    case "quoted":
      return "quoted";
    case "converted":
      return "won";
    case "closed":
      return "lost";
    case "new":
    default:
      return "new";
  }
}

export function leadFromEnquiry(e: Enquiry): CrmLead {
  return {
    id: e.id,
    contact: {
      name: e.name,
      phone: e.phone,
      email: e.email || undefined,
      city: e.city || undefined,
    },
    stage: stageFromEnquiryStatus(e.status),
    source: e.source ? `enquiry:${e.source}` : "enquiry",
    packageSlug: e.packageSlug || undefined,
    packageTitle: e.packageTitle || undefined,
    travellers: { adults: e.adults, children: e.children },
    createdAt: e.createdAt,
    lastActivityAt: e.createdAt,
  };
}

/** A submitted booking is a strong lead (quoted → moving to won on payment). */
export function leadFromBooking(b: BookingRecord): CrmLead {
  return {
    id: `lead_${b.id}`,
    reference: b.reference,
    contact: {
      name: b.name,
      phone: b.phone,
      email: b.email || undefined,
      city: b.city || undefined,
    },
    stage: "quoted",
    source: "booking_journey",
    packageSlug: b.packageSlug,
    packageTitle: b.packageTitle,
    travellers: { adults: b.adults, children: b.children },
    value: b.quoteTotal,
    createdAt: b.createdAt,
    lastActivityAt: b.createdAt,
  };
}

export function activityFromBooking(b: BookingRecord): CrmActivity {
  return {
    id: `act_book_${b.reference}`,
    leadRef: b.reference,
    type: "booking",
    subject: `Booking ${b.reference} — ${b.packageTitle}`,
    body: `${b.adults} adult(s)${b.children ? `, ${b.children} child(ren)` : ""}. Status: ${b.status}.`,
    at: b.createdAt,
    source: "booking_journey",
  };
}

export function activityFromQuote(
  q: Pick<QuoteDocument, "reference" | "packageTitle" | "destination" | "generatedDate">,
): CrmActivity {
  return {
    id: `act_quote_${q.reference}`,
    leadRef: q.reference,
    type: "quote",
    subject: `Quote ${q.reference} — ${q.packageTitle}`,
    body: `Indicative quote issued for ${q.destination}.`,
    at: q.generatedDate,
    source: "quote",
  };
}
