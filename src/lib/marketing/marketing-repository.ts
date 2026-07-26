// Server-only: imported by the marketing dashboard + future marketing routes.
import {
  emptyMarketingSummary,
  type CampaignRecord,
  type MarketingSummary,
  type PartnerRecord,
} from "@/lib/marketing/model";

/**
 * Marketing aggregation boundary. Same proven pattern as CRM/Vendor. Console
 * stub reports `live:false`; swap PayloadMarketingRepository / NeonMarketing-
 * Repository (aggregating campaigns + Influencers/TripCaptains, with attribution
 * derived from CRM leads/bookings) with no UI change.
 */
export interface MarketingRepository {
  getSummary(): Promise<MarketingSummary>;
  listCampaigns(): Promise<{ live: boolean; campaigns: CampaignRecord[] }>;
  listPartners(): Promise<{ live: boolean; partners: PartnerRecord[] }>;
}

class ConsoleMarketingRepository implements MarketingRepository {
  async getSummary(): Promise<MarketingSummary> {
    return emptyMarketingSummary(false);
  }
  async listCampaigns(): Promise<{ live: boolean; campaigns: CampaignRecord[] }> {
    return { live: false, campaigns: [] };
  }
  async listPartners(): Promise<{ live: boolean; partners: PartnerRecord[] }> {
    return { live: false, partners: [] };
  }
}

let repo: MarketingRepository | null = null;

export function getMarketingRepository(): MarketingRepository {
  if (!repo) repo = new ConsoleMarketingRepository();
  return repo;
}
