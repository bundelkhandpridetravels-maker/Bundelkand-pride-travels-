import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  ProgressBar,
  HermesPanel,
} from "@/components/dashboard";
import { getRateSheetRepository } from "@/lib/rates/rate-repository";
import { getHermesInsights } from "@/lib/hermes";
import {
  RATE_SHEET_STATUSES,
  RATE_SHEET_STATUS_DESCRIPTIONS,
  RATE_SHEET_STATUS_LABELS,
  redactRateSheets,
} from "@/lib/rates/model";
import {
  RATE_EXPIRY_WARNING_DAYS,
  daysUntilRateExpiry,
  validateRateSheet,
} from "@/lib/rates/validation";
import type { DocumentActor } from "@/lib/documents/permissions";

export const metadata = { title: "Rate Sheets" };

/**
 * Vendor rate sheet register — the supply-side price book. Renders from the
 * RateSheetRepository seam; populates once a store backs it. Nothing invented.
 *
 * Rate amounts are supplier commercial terms and are founder-only. The console's
 * Basic Auth is a single shared founder credential, so the actor is `founder`
 * here — but redaction runs through the shared documents RBAC in the data layer,
 * so it is already enforced for the day real staff sessions arrive.
 */
const CONSOLE_ACTOR: DocumentActor = { role: "founder" };

export default async function RateSheetsDashboard() {
  const repo = getRateSheetRepository();
  const [summary, list, hermes] = await Promise.all([
    repo.getSummary(),
    repo.list(),
    getHermesInsights("vendor"),
  ]);

  const visible = redactRateSheets(list.sheets, CONSOLE_ACTOR);

  // Sheets carrying blocking validation errors, most broken first.
  const problems = list.sheets
    .map((sheet) => ({ sheet, result: validateRateSheet(sheet) }))
    .filter(({ result }) => !result.ok)
    .sort((a, b) => b.result.errors.length - a.result.errors.length);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Rate sheets are what suppliers actually send — prices per room type, meal plan
        and season, for a stated validity period. The platform stores, validates and
        tracks them; it never invents a rate, a season or a markup. A sheet must pass
        validation and be approved by a human before it can price anything.
      </ScaffoldNote>

      {/* Status board */}
      <Panel eyebrow="Register" title="Rate sheet status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RATE_SHEET_STATUSES.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
              title={RATE_SHEET_STATUS_DESCRIPTIONS[s]}
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {RATE_SHEET_STATUS_LABELS[s]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Renewal + integrity */}
      <Panel eyebrow="Risk" title={`Expiring within ${RATE_EXPIRY_WARNING_DAYS} days`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-200/70">
              Expiring soon
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-amber-200">
              {summary.live ? summary.expiringSoon : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-red-400/25 bg-red-400/[0.05] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-red-300/70">
              Lapsed but still active
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-red-300">
              {summary.live ? summary.lapsed : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              With errors
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
              {summary.live ? summary.withErrors : "—"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          &ldquo;Lapsed but still active&rdquo; is the expensive case — pricing would keep
          quoting from a sheet the supplier has already withdrawn.
        </p>
      </Panel>

      {/* Validation issues */}
      <Panel eyebrow="Integrity" title="Sheets blocked from pricing">
        {problems.length > 0 ? (
          <ul className="space-y-2">
            {problems.map(({ sheet, result }) => (
              <li
                key={sheet.id}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] text-white/85">{sheet.vendorName}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/40">
                      {result.completeness}% priced
                    </span>
                    <span className="w-16">
                      <ProgressBar value={result.completeness} />
                    </span>
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {result.errors.map((e) => (
                    <li key={e.code} className="text-[11.5px] text-red-300/80">
                      · {e.message}
                    </li>
                  ))}
                  {result.warnings.map((w) => (
                    <li key={w.code} className="text-[11.5px] text-amber-200/60">
                      · {w.message}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={list.live ? "No blocked sheets" : "Validation pending backend"}
            hint="Missing amounts, overlapping seasons, duplicate rows and unlinked seasons appear here. A sheet with any error cannot be activated."
          />
        )}
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Rate sheet assistance" />

      {/* Register */}
      <Panel eyebrow="Supply" title="Vendor rate sheets">
        <DataTable
          columns={[
            { key: "vendor", header: "Supplier" },
            { key: "ref", header: "Reference" },
            { key: "status", header: "Status" },
            { key: "currency", header: "Currency" },
            { key: "lines", header: "Lines" },
            { key: "expires", header: "Expires" },
          ]}
          rows={visible.map((s) => {
            const days = daysUntilRateExpiry(s);
            return {
              vendor: s.vendorName,
              ref: s.reference ?? "—",
              status: RATE_SHEET_STATUS_LABELS[s.status],
              currency: s.currency ?? "—",
              lines: s.lines.length || "—",
              expires: s.validTo ? `${s.validTo}${days !== null ? ` (${days}d)` : ""}` : "—",
            };
          })}
          emptyTitle={list.live ? "No rate sheets yet" : "Rate sheet register pending backend"}
          emptyHint="Sheets captured from suppliers appear here with their validity, currency and line count. The Pricing Engine will quote from the active ones."
        />
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Rate amounts are commercially sensitive and restricted to founder access —
          redacted in the data layer via the platform&apos;s document RBAC, not merely
          hidden in this table. No Payload collection backs rates yet; persisting them
          is a schema change that will be reviewed on its own.
        </p>
      </Panel>
    </div>
  );
}
