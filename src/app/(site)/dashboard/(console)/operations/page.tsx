import { Panel, ProgressBar, HermesPanel } from "@/components/dashboard";
import { getCrmRepository } from "@/lib/crm/crm-repository";
import { getVendorRepository } from "@/lib/vendor/vendor-repository";
import { getMarketingRepository } from "@/lib/marketing/marketing-repository";
import { getReviewRepository } from "@/lib/reviews/review-repository";
import { getVendorImportRepository } from "@/lib/vendor-import/import-repository";
import { getHermesInsights } from "@/lib/hermes";
import { getGoLiveReadiness } from "@/lib/platform/readiness";

export const metadata = { title: "Operations" };
export const dynamic = "force-dynamic";

/**
 * Founder Operational dashboard — AGGREGATES the existing repositories only. It
 * does not redesign or replace any dashboard; it reads their seams (CRM, Vendor,
 * Marketing, Reviews, Import) plus go-live readiness and Hermes into one view.
 */
export default async function OperationsDashboard() {
  const [crm, vendor, marketing, reviews, imports, hermes, readiness] = await Promise.all([
    getCrmRepository().getPipelineSummary(),
    getVendorRepository().getVerificationSummary(),
    getMarketingRepository().getSummary(),
    getReviewRepository().getSummary(),
    getVendorImportRepository().getBatchSummary(),
    getHermesInsights(),
    getGoLiveReadiness(),
  ]);

  const d = (live: boolean, n: number | string) => (live ? n : "—");

  const stat = (label: string, value: number | string) => (
    <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Go-live readiness */}
      <Panel eyebrow="Go-live" title="Platform readiness">
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-semibold tabular-nums text-white">{readiness.operationalPct}%</span>
          <span className="flex-1"><ProgressBar value={readiness.operationalPct} /></span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stat("Architecture", readiness.architectureComplete.length)}
          {stat("Provider pending", readiness.providerPending.length)}
          {stat("Credential pending", readiness.credentialPending.length)}
          {stat("Business pending", readiness.businessPending.length)}
        </div>
      </Panel>

      {/* Aggregated repositories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="CRM" title="Pipeline">
          <div className="grid grid-cols-3 gap-3">
            {stat("New", d(crm.live, crm.counts.new))}
            {stat("Quoted", d(crm.live, crm.counts.quoted))}
            {stat("Won", d(crm.live, crm.counts.won))}
          </div>
        </Panel>
        <Panel eyebrow="Vendors" title="Verification">
          <div className="grid grid-cols-3 gap-3">
            {stat("Verified", d(vendor.live, vendor.counts.verified))}
            {stat("Pending", d(vendor.live, vendor.counts.pending))}
            {stat("Total", d(vendor.live, vendor.total))}
          </div>
        </Panel>
        <Panel eyebrow="Reviews" title="Trust">
          <div className="grid grid-cols-3 gap-3">
            {stat("Average", d(reviews.live, reviews.average.toFixed(1)))}
            {stat("Pending", d(reviews.live, reviews.pending))}
            {stat("Published", d(reviews.live, reviews.published))}
          </div>
        </Panel>
        <Panel eyebrow="Marketing" title="Growth">
          <div className="grid grid-cols-3 gap-3">
            {stat("Campaigns", d(marketing.live, marketing.counts.activeCampaigns))}
            {stat("Leads", d(marketing.live, marketing.counts.attributedLeads))}
            {stat("Partners", d(marketing.live, marketing.counts.partners))}
          </div>
        </Panel>
      </div>

      {/* Import readiness */}
      <Panel eyebrow="Vendor import" title="Batch readiness">
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-semibold tabular-nums text-white">
            {imports.live ? `${imports.avgReadiness}%` : "—"}
          </span>
          <span className="flex-1"><ProgressBar value={imports.live ? imports.avgReadiness : 0} /></span>
        </div>
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Hermes insights" />
    </div>
  );
}
