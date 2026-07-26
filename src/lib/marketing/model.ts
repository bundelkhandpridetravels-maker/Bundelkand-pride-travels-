/**
 * Marketing & partnerships domain model. Partnerships mirror the stable Payload
 * schema (src/payload/collections/Influencers.ts, TripCaptains.ts) — one
 * vocabulary, no parallel model. Attribution ties back to the CRM lifecycle
 * (leads/bookings) rather than inventing separate metrics.
 */

export const MARKETING_CHANNELS = [
  "instagram",
  "youtube",
  "whatsapp",
  "email",
  "google",
  "referral",
  "other",
] as const;
export type MarketingChannel = (typeof MARKETING_CHANNELS)[number];

export const CHANNEL_LABELS: Record<MarketingChannel, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  email: "Email",
  google: "Google",
  referral: "Referral",
  other: "Other",
};

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "active", "paused", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type CampaignRecord = {
  id: string;
  name: string;
  channel: MarketingChannel;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  /** Attribution — sourced from CRM leads/bookings, never fabricated. */
  reach?: number;
  attributedLeads?: number;
  attributedBookings?: number;
};

/** Partner types — mirror payload Influencers / TripCaptains. */
export type PartnerType = "influencer" | "trip_captain";

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  influencer: "Influencer",
  trip_captain: "Trip Captain",
};

export type PartnerRecord = {
  id: string;
  name: string;
  type: PartnerType;
  platform?: MarketingChannel;
  followers?: number;
  destinations: string[];
  status: "prospect" | "active" | "paused" | "archived";
  referralCode?: string;
};

export type MarketingSummary = {
  live: boolean;
  counts: {
    activeCampaigns: number;
    attributedLeads: number;
    partners: number;
    channels: Record<MarketingChannel, number>;
  };
};

export function emptyMarketingSummary(live = false): MarketingSummary {
  return {
    live,
    counts: {
      activeCampaigns: 0,
      attributedLeads: 0,
      partners: 0,
      channels: {
        instagram: 0,
        youtube: 0,
        whatsapp: 0,
        email: 0,
        google: 0,
        referral: 0,
        other: 0,
      },
    },
  };
}
