// Server-only: imported by the documents dashboard.
import {
  DOCUMENT_STATUSES,
  type DocumentKind,
  type DocumentRecord,
  type DocumentStatus,
} from "@/lib/documents/model";
import {
  isDocumentExpiredButActive,
  isDocumentExpiringSoon,
  type DocumentLifecycleTally,
  tallyLifecycle,
} from "@/lib/documents/lifecycle";
import {
  currentVersions,
  supersededVersions,
  validateVersionGraph,
  type VersionedDocument,
} from "@/lib/documents/versioning";

/**
 * Document aggregation boundary — the seam every other module already assumed
 * existed.
 *
 * `contracts`, `rates` and `vendor/onboarding` all carry `documentRefs: string[]`
 * pointing into the document layer, but the layer had a storage PROVIDER and no
 * repository, so those refs could never be read back. This is that reader.
 *
 * Going live = implement PayloadDocumentRepository against the EXISTING
 * `documents` collection (already created by src/migrations/20260812_194805_initial.ts)
 * and swap it in `getDocumentRepository()`. The model, lifecycle, versioning,
 * linkage, schema mapping and dashboard do not change.
 *
 * NOTE: this deliberately does NOT persist. The `documents` table exists, but
 * writing to it is database activation — a separate, explicitly gated decision.
 * Storage of the file BYTES is a third thing again, and belongs to the existing
 * DocumentProvider seam (src/lib/documents/provider.ts), not here.
 */

export type DocumentRegisterSummary = {
  live: boolean;
  total: number;
  counts: Record<DocumentStatus, number>;
  /** In-force documents inside the expiry-warning window. */
  expiringSoon: number;
  /** In-force documents already past their expiry date — the expensive case. */
  expiredButActive: number;
  /** Documents replaced by a newer version. Retained, never deleted. */
  superseded: number;
  /** Version-graph faults (orphans, cycles, forks, mismatched pointers). */
  integrityIssues: number;
  lifecycle: DocumentLifecycleTally;
};

export function emptyDocumentSummary(live = false): DocumentRegisterSummary {
  return {
    live,
    total: 0,
    counts: {
      pending_upload: 0,
      uploaded: 0,
      verified: 0,
      rejected: 0,
      expired: 0,
      archived: 0,
    },
    expiringSoon: 0,
    expiredButActive: 0,
    superseded: 0,
    integrityIssues: 0,
    lifecycle: {
      valid: 0,
      expiringSoon: 0,
      expired: 0,
      expiredButActive: 0,
      noExpiry: 0,
    },
  };
}

export type DocumentListFilter = {
  vendorId?: string;
  kind?: DocumentKind;
  status?: DocumentStatus;
  /** Omit superseded versions — what a register normally wants. */
  currentOnly?: boolean;
};

export interface DocumentRepository {
  getSummary(): Promise<DocumentRegisterSummary>;
  list(filter?: DocumentListFilter): Promise<{ live: boolean; documents: VersionedDocument[] }>;
  /** Resolve refs held by another module (contract, rate sheet, vendor). */
  resolve(refs: string[]): Promise<{ live: boolean; documents: DocumentRecord[] }>;
  /** Records a status decision. Never auto-applied — see lifecycle.derivedStatus. */
  setStatus(
    id: string,
    status: DocumentStatus,
    meta?: { approvedBy?: string },
  ): Promise<{ live: boolean }>;
}

/**
 * Default store until the Payload-backed repository is wired. Reads report
 * `live:false` so surfaces show "pending backend" honestly rather than an empty
 * register that looks real.
 *
 * Writes are logged and never persisted. The log carries the document id, its
 * kind and the approver only — never a filename, never a URL, never file
 * contents, never a commercial amount. A confidential document's FILENAME can
 * itself disclose the subject ("vendor-x-passport.pdf"), so it is excluded on
 * purpose; the existing upload provider logs a stored path, and this seam
 * deliberately does not repeat that.
 */
class ConsoleDocumentRepository implements DocumentRepository {
  async getSummary(): Promise<DocumentRegisterSummary> {
    return emptyDocumentSummary(false);
  }

  async list(): Promise<{ live: boolean; documents: VersionedDocument[] }> {
    return { live: false, documents: [] };
  }

  async resolve(): Promise<{ live: boolean; documents: DocumentRecord[] }> {
    return { live: false, documents: [] };
  }

  async setStatus(
    id: string,
    status: DocumentStatus,
    meta: { approvedBy?: string } = {},
  ): Promise<{ live: boolean }> {
    console.info(
      "[document:status]",
      JSON.stringify({ id, status, approvedBy: meta.approvedBy ?? null }),
    );
    return { live: false };
  }
}

let repo: DocumentRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getDocumentRepository(): DocumentRepository {
  if (!repo) repo = new ConsoleDocumentRepository();
  return repo;
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

/** Fold documents into the register summary. Pure; used by the repository and UI. */
export function summarizeDocuments(
  documents: VersionedDocument[],
  live: boolean,
  now: Date = new Date(),
): DocumentRegisterSummary {
  const summary = emptyDocumentSummary(live);
  summary.total = documents.length;

  for (const document of documents) {
    summary.counts[document.status] += 1;
    if (isDocumentExpiringSoon(document, now)) summary.expiringSoon += 1;
    if (isDocumentExpiredButActive(document, now)) summary.expiredButActive += 1;
  }

  summary.superseded = supersededVersions(documents).length;
  summary.integrityIssues = validateVersionGraph(documents).issues.length;
  summary.lifecycle = tallyLifecycle(documents, now);

  return summary;
}

/** Apply a filter in memory. The Payload repository will push this to the query. */
export function applyDocumentFilter(
  documents: VersionedDocument[],
  filter: DocumentListFilter = {},
): VersionedDocument[] {
  let result = filter.currentOnly ? currentVersions(documents) : documents;
  if (filter.vendorId) result = result.filter((d) => d.metadata.vendorId === filter.vendorId);
  if (filter.kind) result = result.filter((d) => d.kind === filter.kind);
  if (filter.status) result = result.filter((d) => d.status === filter.status);
  return result;
}

/** The status vocabulary, for surfaces that render a status board. */
export const DOCUMENT_STATUS_ORDER: readonly DocumentStatus[] = DOCUMENT_STATUSES;
