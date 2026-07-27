import {
  Panel,
  DataTable,
  ScaffoldNote,
  ProgressBar,
  HermesPanel,
  VendorOnboardingForm,
} from "@/components/dashboard";
import { getVendorOnboardingRepository } from "@/lib/vendor/onboarding-repository";
import { getHermesInsights } from "@/lib/hermes";
import { VENDOR_TYPE_LABELS } from "@/lib/vendor/model";
import {
  BASE_REQUIREMENTS,
  evaluateOnboarding,
  ONBOARDING_CHANNELS,
  ONBOARDING_PIPELINE,
  ONBOARDING_EXITS,
  ONBOARDING_STAGE_DESCRIPTIONS,
  ONBOARDING_STAGE_LABELS,
} from "@/lib/vendor/onboarding";

export const metadata = { title: "Vendor Onboarding" };

/**
 * Vendor Onboarding dashboard — the staff-managed workflow that moves a supplier
 * from identified to active. Renders from the VendorOnboardingRepository seam;
 * populates once the database backs it. Nothing is invented.
 *
 * Complements /dashboard/vendor (the register of vendors that already exist);
 * that page is unchanged.
 */
export default async function VendorOnboardingDashboard() {
  const repo = getVendorOnboardingRepository();
  const [summary, list, hermes] = await Promise.all([
    repo.getSummary(),
    repo.list(),
    getHermesInsights("vendor"),
  ]);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Phase 3 runs <strong>staff-managed onboarding only</strong> — BPT operates a
        curated, verified-supplier ecosystem, so every hotel, DMC, transport operator,
        guide and activity partner is reviewed by the operations team before becoming
        active. Supplier self-service applications (Phase 4) and bulk import (Phase 5)
        plug into this same state machine. Records persist once{" "}
        <code>DATABASE_URL</code> is configured.
      </ScaffoldNote>

      {/* Pipeline */}
      <Panel eyebrow="Pipeline" title="Onboarding stages">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ONBOARDING_PIPELINE.map((stage) => (
            <div
              key={stage}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
              title={ONBOARDING_STAGE_DESCRIPTIONS[stage]}
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {ONBOARDING_STAGE_LABELS[stage]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[stage] : "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-sm">
          {ONBOARDING_EXITS.map((stage) => (
            <div
              key={stage}
              className="rounded-lg border border-white/8 bg-white/[0.015] px-3 py-2.5"
              title={ONBOARDING_STAGE_DESCRIPTIONS[stage]}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
                {ONBOARDING_STAGE_LABELS[stage]}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white/60">
                {summary.live ? summary.counts[stage] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Completeness */}
      <Panel eyebrow="Quality" title="Average profile completeness">
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-semibold tabular-nums text-white">
            {summary.live ? `${summary.avgCompleteness}%` : "—"}
          </span>
          <span className="flex-1">
            <ProgressBar value={summary.live ? summary.avgCompleteness : 0} />
          </span>
        </div>
        <p className="mt-2 text-[11.5px] text-white/40">
          Measured across required checklist items only — a supplier cannot reach
          verification while any remain unmet.
        </p>
      </Panel>

      {/* Intake channels */}
      <Panel eyebrow="Channels" title="How suppliers enter onboarding">
        <div className="grid gap-3 sm:grid-cols-3">
          {ONBOARDING_CHANNELS.map((c) => (
            <div
              key={c.key}
              className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="text-[12px] text-white/70">{c.label}</span>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] ${
                  c.enabled
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/12 text-white/40"
                }`}
              >
                {c.enabled ? "active" : `phase ${c.phase}`}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Verification checklist */}
      <Panel eyebrow="Standards" title="Verification checklist">
        <ul className="grid gap-2 sm:grid-cols-2">
          {BASE_REQUIREMENTS.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
            >
              <span className="text-[12.5px] text-white/70">{r.label}</span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.08em] ${
                  r.required ? "text-gold" : "text-white/30"
                }`}
              >
                {r.required ? "required" : "optional"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Category-specific rules (hotel certifications, transport permits and insurance,
          guide licences) are <strong>not assumed</strong> — supply them and they attach per
          supplier category automatically.
        </p>
      </Panel>

      {/* Staff intake */}
      <Panel eyebrow="Intake" title="Onboard a supplier">
        <VendorOnboardingForm />
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Onboarding assistance" />

      {/* Register */}
      <Panel eyebrow="Register" title="Suppliers in onboarding">
        <DataTable
          columns={[
            { key: "name", header: "Supplier" },
            { key: "type", header: "Category" },
            { key: "stage", header: "Stage" },
            { key: "completeness", header: "Complete" },
            { key: "blockers", header: "Outstanding" },
          ]}
          rows={list.records.map((r) => {
            const evaluation = evaluateOnboarding(r.profile);
            return {
              name: r.profile.businessName ?? "—",
              type: r.profile.type ? VENDOR_TYPE_LABELS[r.profile.type] : "—",
              stage: ONBOARDING_STAGE_LABELS[evaluation.stage],
              completeness: `${evaluation.completeness}%`,
              blockers: evaluation.blockers.length || "—",
            };
          })}
          emptyTitle={list.live ? "No suppliers in onboarding" : "Onboarding register pending backend"}
          emptyHint="Suppliers captured by the operations team appear here with their stage, completeness and what is outstanding before verification."
        />
      </Panel>
    </div>
  );
}
