/**
 * CRM domain model — the single operational vocabulary for the whole platform.
 *
 * Deliberately mirrors the stable Payload schema (src/payload/collections/
 * Leads.ts `stage`, CrmActivities.ts `type`) so there is ONE language, not a
 * parallel model. When the DB is connected, these types map onto the schema with
 * minimal change. Every workflow (enquiry, quote, booking, vendor, marketing,
 * Hermes) speaks this vocabulary.
 */

/** Actionable sales stages — mirror payload `leads.stage`. */
export const LEAD_STAGES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

/** Open pipeline columns (won/lost are terminal outcomes). */
export const OPEN_PIPELINE_STAGES: LeadStage[] = ["new", "contacted", "quoted"];

/**
 * The full customer lifecycle the CRM is the brain of. This is the macro journey
 * (documented + used for lifecycle badges); the actionable day-to-day pipeline
 * uses LeadStage above.
 */
export const LIFECYCLE_STAGES = [
  "customer",
  "lead",
  "quote",
  "booking",
  "payment",
  "vendor_assignment",
  "trip",
  "review",
  "repeat",
  "loyalty",
  "community",
  "lifetime",
] as const;
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export const LIFECYCLE_LABELS: Record<LifecycleStage, string> = {
  customer: "Customer",
  lead: "Lead",
  quote: "Quote",
  booking: "Booking",
  payment: "Payment",
  vendor_assignment: "Vendor assignment",
  trip: "Trip execution",
  review: "Reviews",
  repeat: "Repeat customer",
  loyalty: "Loyalty",
  community: "Community",
  lifetime: "Lifetime customer",
};

/** Normalized activity kinds — payload CrmActivities.type plus system events. */
export const CRM_ACTIVITY_TYPES = [
  "enquiry",
  "quote",
  "booking",
  "call",
  "email",
  "whatsapp",
  "meeting",
  "note",
  "task",
  "status_change",
] as const;
export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];

export type CrmContact = {
  name: string;
  phone?: string;
  email?: string;
  city?: string;
};

/** Advisory AI block — populated by Hermes later; never required. */
export type CrmAiAssist = {
  summary?: string;
  score?: number;
  nextAction?: string;
};

/** A unified lead — what every source (enquiry/quote/booking) folds into. */
export type CrmLead = {
  id: string;
  reference?: string;
  contact: CrmContact;
  stage: LeadStage;
  /** Origin channel: enquiry_form, booking_journey, quote, manual… */
  source: string;
  packageSlug?: string;
  packageTitle?: string;
  destination?: string;
  travellers?: { adults: number; children: number };
  /** Estimated value in INR. */
  value?: number;
  createdAt: string;
  lastActivityAt?: string;
  ai?: CrmAiAssist;
};

/** A unified activity/timeline event across the whole CRM. */
export type CrmActivity = {
  id: string;
  leadRef?: string;
  type: CrmActivityType;
  channel?: string;
  subject: string;
  body?: string;
  at: string;
  source: string;
  aiGenerated?: boolean;
};

/** Pipeline roll-up for the dashboard. `live:false` = no store connected yet. */
export type CrmPipelineSummary = {
  live: boolean;
  counts: Record<LeadStage, number>;
  totalOpenValue: number;
};

export function emptyPipelineSummary(live = false): CrmPipelineSummary {
  return {
    live,
    counts: { new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 },
    totalOpenValue: 0,
  };
}
