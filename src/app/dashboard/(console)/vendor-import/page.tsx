import {
  Panel,
  DataTable,
  ScaffoldNote,
  ProgressBar,
  HermesPanel,
} from "@/components/dashboard";
import { getVendorImportRepository } from "@/lib/vendor-import/import-repository";
import { getImportSourceProvider } from "@/lib/vendor-import/source-provider";
import {
  IMPORT_STATUSES,
  IMPORT_STATUS_LABELS,
  IMPORT_SOURCE_TYPES,
  IMPORT_SOURCE_LABELS,
} from "@/lib/vendor-import/model";
import { getHermesInsights } from "@/lib/hermes";

export const metadata = { title: "Vendor Import" };

/**
 * Vendor Import dashboard (founder-gated by the console Basic Auth). Import
 * status, duplicate detection, missing fields, validation and readiness — driven
 * by the VendorImportRepository seam. Populates when a source provider + store
 * are connected; nothing is invented.
 */
export default async function VendorImportDashboard() {
  const repo = getVendorImportRepository();
  const [summary, list, hermes] = await Promise.all([
    repo.getBatchSummary(),
    repo.listCandidates(),
    getHermesInsights(),
  ]);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        The import pipeline (`src/lib/vendor-import`) is wired: map → validate →
        deduplicate (against existing vendors) → score. Connect a source provider
        (Gmail / OCR / PDF / email sync) to populate — nothing is invented.
      </ScaffoldNote>

      {/* Import status */}
      <Panel eyebrow="Import" title="Status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {IMPORT_STATUSES.map((s) => (
            <div key={s} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">
                {IMPORT_STATUS_LABELS[s]}
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Readiness */}
      <Panel eyebrow="Quality" title="Batch readiness">
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-semibold tabular-nums text-white">
            {summary.live ? `${summary.avgReadiness}%` : "—"}
          </span>
          <span className="flex-1">
            <ProgressBar value={summary.live ? summary.avgReadiness : 0} />
          </span>
        </div>
        <p className="mt-2 text-[11.5px] text-white/40">
          Average readiness across the batch — completeness, valid identifiers (GST/PAN) and no duplicates.
        </p>
      </Panel>

      {/* Sources */}
      <Panel eyebrow="Sources" title="Ingestion providers">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {IMPORT_SOURCE_TYPES.map((t) => {
            const active = Boolean(getImportSourceProvider(t));
            return (
              <div key={t} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                <span className="text-[12px] text-white/70">{IMPORT_SOURCE_LABELS[t]}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] ${
                    active
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-white/12 text-white/40"
                  }`}
                >
                  {active ? "active" : "drop-in"}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Hermes import assistance */}
      <HermesPanel result={hermes} title="Import assistance" />

      {/* Candidates */}
      <Panel eyebrow="Candidates" title="Imported vendor candidates">
        <DataTable
          columns={[
            { key: "source", header: "Source" },
            { key: "name", header: "Business" },
            { key: "status", header: "Status" },
            { key: "missing", header: "Missing" },
            { key: "dupes", header: "Duplicates" },
            { key: "readiness", header: "Readiness" },
          ]}
          rows={list.candidates.map((c) => ({
            source: IMPORT_SOURCE_LABELS[c.sourceType],
            name: c.vendor.businessName ?? "—",
            status: IMPORT_STATUS_LABELS[c.status],
            missing: c.validation.missingFields.length || "—",
            dupes: c.duplicates.length || "—",
            readiness: `${c.readiness}%`,
          }))}
          emptyTitle={list.live ? "No candidates yet" : "Candidates pending a connected source"}
          emptyHint="Raw records from Gmail, business cards, rate sheets, brochures and contracts land here — mapped, validated, deduplicated and scored."
        />
      </Panel>
    </div>
  );
}
