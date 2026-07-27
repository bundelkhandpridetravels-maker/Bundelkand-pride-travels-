/**
 * CRM Integration map — the connected customer lifecycle, expressed in terms of
 * the EXISTING adapters/seams that already wire each hop. Pure definition; reuses
 * the CRM lifecycle vocabulary. Nothing new is implemented — this documents and
 * exposes how the locked modules connect end to end.
 *
 *   Enquiry → Quote → Booking → Payment Pending → Vendor Assignment → Trip →
 *   Review → Repeat Customer → Marketing → Hermes
 */
import type { LifecycleStage } from "@/lib/crm/model";

export type IntegrationStatus = "connected" | "ready" | "pending_backend";

export type LifecycleLink = {
  from: LifecycleStage;
  to: LifecycleStage;
  /** The existing adapter/seam that connects this hop. */
  via: string;
  status: IntegrationStatus;
};

export const LIFECYCLE_FLOW: LifecycleLink[] = [
  { from: "lead", to: "quote", via: "quote/buildQuoteDocument", status: "connected" },
  { from: "quote", to: "booking", via: "booking journey (accept → /book)", status: "connected" },
  { from: "booking", to: "payment", via: "booking/status (payment_pending)", status: "connected" },
  { from: "payment", to: "vendor_assignment", via: "vendor/assignment (proposeVendors)", status: "ready" },
  { from: "vendor_assignment", to: "trip", via: "bookings.assignedVendors", status: "pending_backend" },
  { from: "trip", to: "review", via: "reviews/integration (trip complete → request)", status: "ready" },
  { from: "review", to: "repeat", via: "crm/adapters + reviews → CRM activity", status: "ready" },
  { from: "repeat", to: "loyalty", via: "crm lifecycle (customer)", status: "pending_backend" },
  { from: "loyalty", to: "community", via: "marketing (partnerships / Trip Captains)", status: "ready" },
  { from: "community", to: "lifetime", via: "hermes (insights across the lifecycle)", status: "ready" },
];

/** CRM entry adapters that fold each source into the unified pipeline. */
export const INTEGRATION_ADAPTERS = [
  { source: "Enquiry", adapter: "crm/adapters:leadFromEnquiry", reused: true },
  { source: "Booking", adapter: "crm/adapters:leadFromBooking + activityFromBooking", reused: true },
  { source: "Quote", adapter: "crm/adapters:activityFromQuote", reused: true },
  { source: "Vendor", adapter: "vendor/assignment:proposeVendors", reused: true },
  { source: "Review", adapter: "reviews/integration:crmActivityFromReview", reused: true },
  { source: "Marketing", adapter: "hermes/providers:marketingHermesProvider", reused: true },
  { source: "Hermes", adapter: "hermes/insights:getHermesInsights", reused: true },
] as const;
