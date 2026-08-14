import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  HermesPanel,
} from "@/components/dashboard";
import { getHermesInsights } from "@/lib/hermes";
import {
  DOCUMENT_STATUS_ORDER,
  getDocumentRepository,
} from "@/lib/documents/document-repository";
import { DOCUMENT_KINDS, labelForKind } from "@/lib/documents/model";
import { canViewDocument } from "@/lib/documents/permissions";
import { getDocumentProvider } from "@/lib/documents/provider";
import { DOCUMENT_EXPIRY_WARNING_DAYS, daysUntilDocumentExpiry } from "@/lib/documents/lifecycle";
import { describeKindMapping, lossyKindCount } from "@/lib/documents/schema-mapping";
import type { DocumentActor } from "@/lib/documents/permissions";

export const metadata = { title: "Documents" };

/**
 * Document register — the reader for every `documentRefs` in the platform.
 * Renders from the DocumentRepository seam; populates once a store backs it.
 * Nothing invented, no file is stored, no document is persisted.
 *
 * The console's Basic Auth is a single shared founder credential, so the actor
 * is `founder` here — but visibility runs through the shared documents RBAC in
 * the data layer, so it is already enforced for the day real staff sessions
 * arrive.
 */
const CONSOLE_ACTOR: DocumentActor = { role: "founder" };

const RATE_SHEET_MAPPING = describeKindMapping("vend_rate_sheet");

export default async function DocumentsDashboard() {
  const repo = getDocumentRepository();
  const [summary, list, hermes] = await Promise.all([
    repo.getSummary(),
    repo.list({ currentOnly: true }),
    getHermesInsights("operations"),
  ]);

  // Visibility is applied in the data layer, not the template — a surface that
  // forgets a check must not be the thing standing between a role and a file.
  const visible = list.documents.filter((d) => canViewDocument(CONSOLE_ACTOR, d));
  const provider = getDocumentProvider().name;

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Every contract, rate sheet and onboarding record in the platform already
        references documents by id. This register is what resolves those references —
        which file backs a record, whether it is still valid, and which version is
        current. No file is stored and no document is persisted yet.
      </ScaffoldNote>

      {/* Status board */}
      <Panel eyebrow="Register" title="Document status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DOCUMENT_STATUS_ORDER.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {s.replace(/_/g, " ")}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Lifecycle risk */}
      <Panel eyebrow="Risk" title={`Expiring within ${DOCUMENT_EXPIRY_WARNING_DAYS} days`}>
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
              Expired but still active
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-red-300">
              {summary.live ? summary.expiredButActive : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              Version integrity issues
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
              {summary.live ? summary.integrityIssues : "—"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Expiry is derived from the document&apos;s date, never written silently. A permit
          that lapsed while the record still reads &ldquo;verified&rdquo; is the case that
          costs money, so it is counted separately and left for a human to act on.
        </p>
      </Panel>

      {/* Storage + persistence honesty */}
      <Panel eyebrow="Storage" title="Where documents actually are">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Upload provider</span>
              <span className="font-mono text-white/85">{provider}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">File bytes</span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300">
                not stored
              </span>
            </div>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Register</span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300">
                {summary.live ? "live" : "pending backend"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Document kinds</span>
              <span className="font-mono text-white/85 tabular-nums">{DOCUMENT_KINDS.length}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Two separate seams, neither active: file bytes go to a storage provider
          (R2/S3/GCS/Azure), the record goes to the register. Nothing is written to either.
        </p>
      </Panel>

      {/* Traceability — the M4 connection */}
      <Panel eyebrow="Traceability" title="Rate sheet sources">
        <div className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] text-white/85">{labelForKind("vend_rate_sheet")}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
              confidential · operations + founder
            </span>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">
            A rate sheet record points at the file the supplier actually sent. Linkage
            resolves that reference, flags one that no longer exists, and catches a
            document attached to the wrong supplier. Commercial amounts stay founder-only
            in the rates layer — this register never shows them.
          </p>
        </div>
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Document assistance" />

      {/* Register */}
      <Panel eyebrow="Records" title="Document register">
        <DataTable
          columns={[
            { key: "title", header: "Document" },
            { key: "kind", header: "Kind" },
            { key: "owner", header: "Owner" },
            { key: "status", header: "Status" },
            { key: "version", header: "Version" },
            { key: "expires", header: "Expires" },
          ]}
          rows={visible.map((d) => {
            const days = daysUntilDocumentExpiry(d);
            return {
              title: d.metadata.originalFilename,
              kind: labelForKind(d.kind),
              owner: d.metadata.owner,
              status: d.status.replace(/_/g, " "),
              version: d.metadata.version,
              expires: d.expiresAt ? `${d.expiresAt}${days !== null ? ` (${days}d)` : ""}` : "—",
            };
          })}
          emptyTitle={list.live ? "No documents yet" : "Document register pending backend"}
          emptyHint="Documents captured against vendors, contracts, rate sheets and bookings appear here with their version, validity and status."
        />
      </Panel>

      {/* Storage vocabulary fidelity */}
      <Panel eyebrow="Schema" title="Application vocabulary vs database vocabulary">
        {DOCUMENT_KINDS.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                  Application kinds
                </p>
                <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                  {DOCUMENT_KINDS.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                  Database docTypes
                </p>
                <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">6</p>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-200/70">
                  Lossy on storage
                </p>
                <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-amber-200">
                  {lossyKindCount()}
                </p>
              </div>
            </div>
            <p className="text-[11.5px] leading-relaxed text-white/40">
              The database vocabulary is coarser than the application&apos;s, so several
              kinds share one stored value — a rate sheet stores as{" "}
              <span className="font-mono text-white/60">{RATE_SHEET_MAPPING.docType}</span>, because
              calling it an agreement would be wrong, not merely imprecise. The mapping is
              explicit and tested rather than improvised later. Widening the database enum is a
              migration and is deliberately not part of this work.
            </p>
          </div>
        ) : (
          <EmptyState title="No document kinds defined" />
        )}
      </Panel>
    </div>
  );
}
