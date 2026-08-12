import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  HermesPanel,
} from "@/components/dashboard";
import { getContractRepository } from "@/lib/contracts/contract-repository";
import { getESignatureProvider } from "@/lib/contracts/esign-provider";
import { getHermesInsights } from "@/lib/hermes";
import {
  CONTRACT_STATUSES,
  CONTRACT_STATUS_DESCRIPTIONS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  SUPPLY_CONTRACT_TYPES,
  redactContracts,
} from "@/lib/contracts/model";
import { EXPIRY_WARNING_DAYS, buildRenewalWatchlist } from "@/lib/contracts/renewal";
import type { DocumentActor } from "@/lib/documents/permissions";

export const metadata = { title: "Contracts" };

/**
 * Contract register — agreements, their lifecycle and the renewal watchlist.
 * Renders from the ContractRepository seam; populates once the database backs
 * it. Nothing is invented.
 *
 * Vendor-first by decision: the model covers all nine contract types already in
 * the Payload schema, while this surface focuses on the supply relationships
 * (vendor/hotel/DMC) that Phase 3 is operationalising.
 *
 * Commercial terms are founder-only. The console's Basic Auth is a single shared
 * founder credential, so the actor is `founder` here — but values are redacted
 * through the shared documents RBAC rather than by hiding a column, so when real
 * staff sessions arrive the redaction is already enforced in the data layer.
 */
const CONSOLE_ACTOR: DocumentActor = { role: "founder" };

export default async function ContractsDashboard() {
  const repo = getContractRepository();
  const [summary, list, hermes] = await Promise.all([
    repo.getSummary(),
    repo.list({ types: SUPPLY_CONTRACT_TYPES }),
    getHermesInsights("vendor"),
  ]);

  const esign = getESignatureProvider();
  const watchlist = buildRenewalWatchlist(list.contracts);
  const visible = redactContracts(list.contracts, CONSOLE_ACTOR);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        The contract register tracks agreements that already exist — the platform
        stores, tracks and reminds; it never drafts legal text, terms or durations.
        Signing is <strong>manual</strong>: issue the agreement, then upload the returned
        signed copy against the contract. Records persist once <code>DATABASE_URL</code>{" "}
        is configured.
      </ScaffoldNote>

      {/* Status board */}
      <Panel eyebrow="Register" title="Contract status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CONTRACT_STATUSES.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
              title={CONTRACT_STATUS_DESCRIPTIONS[s]}
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {CONTRACT_STATUS_LABELS[s]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Renewal watchlist — the money-losing case */}
      <Panel eyebrow="Renewal" title={`Expiring within ${EXPIRY_WARNING_DAYS} days`}>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
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
              Lapsed
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-red-300">
              {summary.live ? summary.lapsed : "—"}
            </p>
          </div>
        </div>

        {watchlist.length > 0 ? (
          <ul className="space-y-2">
            {watchlist.map(({ contract, daysUntilExpiry: days, urgency }) => (
              <li
                key={contract.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
              >
                <span className="text-[13px] text-white/85">{contract.party.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[12px] text-white/45">{contract.title}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] ${
                      urgency === "lapsed"
                        ? "border-red-400/30 bg-red-400/10 text-red-300"
                        : urgency === "critical"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                          : "border-white/12 text-white/45"
                    }`}
                  >
                    {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={list.live ? "Nothing expiring" : "Watchlist pending backend"}
            hint={`Signed contracts inside the ${EXPIRY_WARNING_DAYS}-day window — and any already past their expiry date — surface here, most urgent first.`}
          />
        )}
      </Panel>

      {/* Signing */}
      <Panel eyebrow="Signing" title="Signature collection">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-white/50">
            {esign.name}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] ${
              esign.electronic
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/12 text-white/40"
            }`}
          >
            {esign.electronic ? "electronic" : "manual"}
          </span>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Operations issues the agreement, the counterparty signs and returns it, and a staff
          member uploads the signed copy against the contract. A contract cannot be marked
          signed without an attached document and a named signatory. Adopting DocuSign or Zoho
          Sign later is one provider swap — the register, lifecycle and this page do not change.
        </p>
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Contract assistance" />

      {/* Register */}
      <Panel eyebrow="Supply" title="Vendor, hotel & DMC agreements">
        <DataTable
          columns={[
            { key: "party", header: "Counterparty" },
            { key: "title", header: "Contract" },
            { key: "type", header: "Type" },
            { key: "status", header: "Status" },
            { key: "expiry", header: "Expires" },
          ]}
          rows={visible.map((c) => ({
            party: c.party.name,
            title: c.title,
            type: CONTRACT_TYPE_LABELS[c.contractType],
            status: CONTRACT_STATUS_LABELS[c.status],
            expiry: c.expiryDate ?? "—",
          }))}
          emptyTitle={list.live ? "No contracts yet" : "Contract register pending backend"}
          emptyHint="Agreements with vendors, hotels and DMCs appear here with their status and expiry. Influencer, employment and NDA contracts reuse the same register."
        />
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Contract values are commercially sensitive and are restricted to founder access —
          redacted in the data layer via the platform&apos;s document RBAC, not merely hidden in
          this table.
        </p>
      </Panel>
    </div>
  );
}
