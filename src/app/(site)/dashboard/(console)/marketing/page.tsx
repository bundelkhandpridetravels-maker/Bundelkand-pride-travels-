import {
  Panel,
  DataTable,
  ScaffoldNote,
  HermesPanel,
} from "@/components/dashboard";
import { getMarketingRepository } from "@/lib/marketing/marketing-repository";
import {
  MARKETING_CHANNELS,
  CHANNEL_LABELS,
  PARTNER_TYPE_LABELS,
} from "@/lib/marketing/model";
import { getHermesInsights } from "@/lib/hermes";

export const metadata = { title: "Marketing" };

/**
 * Marketing & Partnership dashboard — campaigns, channels and creator /
 * Trip-Captain partnerships. Renders from the MarketingRepository seam;
 * attribution ties back to CRM leads/bookings once the DB is live. Nothing
 * invented.
 */
export default async function MarketingDashboard() {
  const marketing = getMarketingRepository();
  const [summary, campaigns, partners, hermes] = await Promise.all([
    marketing.getSummary(),
    marketing.listCampaigns(),
    marketing.listPartners(),
    getHermesInsights("marketing"),
  ]);

  const dash = (n: number) => (summary.live ? n : "—");

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Marketing runs on the `src/lib/marketing` model; partnerships mirror the
        Influencers / TripCaptains schema. Metrics attribute to CRM leads/bookings once
        the database backs the repository — nothing here is invented.
      </ScaffoldNote>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active campaigns", value: dash(summary.counts.activeCampaigns) },
          { label: "Attributed leads", value: dash(summary.counts.attributedLeads) },
          { label: "Partners", value: dash(summary.counts.partners) },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">{m.label}</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Channels */}
      <Panel eyebrow="Channels" title="Reach by channel">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {MARKETING_CHANNELS.map((c) => (
            <div key={c} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">{CHANNEL_LABELS[c]}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {summary.live ? summary.counts.channels[c] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Hermes marketing insights */}
      <HermesPanel result={hermes} title="Marketing recommendations" />

      {/* Campaigns */}
      <Panel eyebrow="Campaigns" title="All campaigns">
        <DataTable
          columns={[
            { key: "name", header: "Campaign" },
            { key: "channel", header: "Channel" },
            { key: "status", header: "Status" },
            { key: "leads", header: "Leads" },
          ]}
          rows={campaigns.campaigns.map((c) => ({
            name: c.name,
            channel: CHANNEL_LABELS[c.channel],
            status: c.status,
            leads: c.attributedLeads ?? "—",
          }))}
          emptyTitle={campaigns.live ? "No campaigns yet" : "Campaigns pending backend"}
          emptyHint="Channel campaigns with lead/booking attribution will appear here."
        />
      </Panel>

      {/* Partnerships */}
      <Panel eyebrow="Partnerships" title="Creators & Trip Captains">
        <DataTable
          columns={[
            { key: "name", header: "Partner" },
            { key: "type", header: "Type" },
            { key: "status", header: "Status" },
            { key: "referral", header: "Referral" },
          ]}
          rows={partners.partners.map((p) => ({
            name: p.name,
            type: PARTNER_TYPE_LABELS[p.type],
            status: p.status,
            referral: p.referralCode ?? "—",
          }))}
          emptyTitle={partners.live ? "No partners yet" : "Partnerships pending backend"}
          emptyHint="Influencers and Trip Captains, their reach, referrals and performance."
        />
      </Panel>
    </div>
  );
}
