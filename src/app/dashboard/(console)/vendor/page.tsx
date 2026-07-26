import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  ProgressBar,
} from "@/components/dashboard";
import { getVendorRepository } from "@/lib/vendor/vendor-repository";
import {
  VERIFICATION_STATUSES,
  VERIFICATION_LABELS,
  VENDOR_TYPE_LABELS,
} from "@/lib/vendor/model";
import { RANKING_WEIGHTS } from "@/lib/vendor/ranking";

export const metadata = { title: "Vendor" };

const WEIGHT_LABELS: Record<keyof typeof RANKING_WEIGHTS, string> = {
  reviews: "Customer reviews",
  complaints: "Complaint rate",
  response: "Response time",
  service: "Service quality",
  pricing: "Pricing",
  professionalism: "Professionalism",
};

/**
 * Vendor dashboard — renders from the VendorRepository seam. Verification,
 * ranking-engine transparency, the vendor register and the assignment queue.
 * Populates once the DB backs the repository; nothing is invented.
 */
export default async function VendorDashboard() {
  const vendors = getVendorRepository();
  const [summary, list, assignments] = await Promise.all([
    vendors.getVerificationSummary(),
    vendors.listVendors(),
    vendors.listAssignments(),
  ]);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Vendor operations run on the supply model (`src/lib/vendor`) — verification,
        ranking engine and assignment. The read seam is wired; vendors populate once
        the database backs the repository.
      </ScaffoldNote>

      {/* Verification summary */}
      <Panel eyebrow="Trust" title="Verification">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {VERIFICATION_STATUSES.map((s) => (
            <div key={s} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {VERIFICATION_LABELS[s]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Ranking engine transparency */}
      <Panel eyebrow="Ranking engine" title="How vendor quality is scored">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(RANKING_WEIGHTS) as (keyof typeof RANKING_WEIGHTS)[]).map((k) => (
            <li key={k} className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-white/70">{WEIGHT_LABELS[k]}</span>
                <span className="font-mono text-[11px] text-gold">{Math.round(RANKING_WEIGHTS[k] * 100)}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={RANKING_WEIGHTS[k] * 100} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Scores are advisory. Assignment is human-confirmed — AI may propose, never auto-assign
          (security-architecture §12).
        </p>
      </Panel>

      {/* Vendor register */}
      <Panel eyebrow="Supply" title="Vendor register">
        <DataTable
          columns={[
            { key: "name", header: "Vendor" },
            { key: "type", header: "Type" },
            { key: "verification", header: "Verification" },
            { key: "score", header: "Quality score" },
          ]}
          rows={list.vendors.map((v) => ({
            name: v.businessName,
            type: VENDOR_TYPE_LABELS[v.type],
            verification: VERIFICATION_LABELS[v.verificationStatus],
            score:
              v.qualityScore === null ? (
                <span className="text-white/25">—</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-white/80">{v.qualityScore}</span>
                  <span className="w-16">
                    <ProgressBar value={v.qualityScore} />
                  </span>
                </span>
              ),
          }))}
          emptyTitle={list.live ? "No vendors yet" : "Vendor register pending backend"}
          emptyHint="Verified hotels, DMCs, transport, guides and activity partners will appear here."
        />
      </Panel>

      {/* Assignment queue */}
      <Panel eyebrow="Operations" title="Assignment queue">
        {assignments.live && assignments.assignments.length > 0 ? (
          <ul className="space-y-2">
            {assignments.assignments.map((a) => (
              <li key={a.vendorId} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
                <span className="text-[13px] text-white/85">{a.vendorName}</span>
                <span className="font-mono text-[11px] text-white/45">{a.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No assignments pending"
            hint="Confirmed bookings will surface ranked vendor proposals here for human approval."
          />
        )}
      </Panel>
    </div>
  );
}
