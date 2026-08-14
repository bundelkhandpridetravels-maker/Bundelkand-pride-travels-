/**
 * Document linkage — resolving the refs other modules already hold. Pure, no I/O.
 *
 * Three modules point INTO the document layer today:
 *
 *   contracts/model.ts    documentRefs: string[]   (the signed agreement)
 *   rates/model.ts        documentRefs: string[]   (the supplier's rate sheet PDF)
 *   vendor/onboarding.ts  documentRefs?: string[]  (supporting paperwork)
 *
 * Until now nothing could turn one of those strings back into a record, so a ref
 * could be wrong, stale or dangling and no surface would ever notice. This
 * module is the reader those three were written against.
 *
 * WHY THIS TAKES STRUCTURAL TYPES, NOT IMPORTS:
 * every holder is matched by shape (`{ documentRefs }`), so this module imports
 * neither contracts nor rates. That keeps the dependency arrow pointing one way
 * — contracts and rates already depend on documents — and it means M4 gains
 * traceability without a single line of M4 changing.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO:
 * it never writes a `contractId` or `rateSheetId` onto a document. The owning
 * record's `documentRefs` is the one truth, and the link is DERIVED from it —
 * the same discipline `contracts/vendor-link.ts` applies to vendor agreement
 * status. A second copy of a relationship is a second thing to get wrong.
 */
import type { DocumentKind, DocumentRecord } from "@/lib/documents/model";

/** Anything that references documents by id — a contract, a rate sheet, a vendor file. */
export type DocumentRefHolder = { documentRefs: string[] };

/** A holder that also belongs to a specific supplier. */
export type VendorScopedRefHolder = DocumentRefHolder & { vendorId: string };

/* ------------------------------------------------------------------ *
 * Resolution
 * ------------------------------------------------------------------ */

export type RefResolution = {
  /** Refs that matched a document on record. */
  resolved: DocumentRecord[];
  /** Refs that matched nothing — the source cannot be produced or audited. */
  missing: string[];
};

/**
 * Resolve raw ids against the documents on record. Order follows the refs, so a
 * caller's own ordering is preserved rather than silently re-sorted.
 */
export function resolveRefs(documents: DocumentRecord[], refs: string[]): RefResolution {
  const index = new Map(documents.map((d) => [d.id, d]));
  const resolved: DocumentRecord[] = [];
  const missing: string[] = [];

  for (const ref of refs) {
    const found = index.get(ref);
    if (found) resolved.push(found);
    else missing.push(ref);
  }
  return { resolved, missing };
}

/** Every document belonging to a supplier, by the metadata the layer already carries. */
export function documentsForVendor(
  documents: DocumentRecord[],
  vendorId: string,
): DocumentRecord[] {
  return documents.filter((d) => d.metadata.vendorId === vendorId);
}

/** The documents a holder references. Missing refs are reported by `resolveRefs`. */
export function documentsForRefs(
  documents: DocumentRecord[],
  holder: DocumentRefHolder,
): DocumentRecord[] {
  return resolveRefs(documents, holder.documentRefs).resolved;
}

/** Documents attached to a contract. Optionally narrowed to a kind. */
export function documentsForContract(
  documents: DocumentRecord[],
  contract: DocumentRefHolder,
  kind?: DocumentKind,
): DocumentRecord[] {
  const attached = documentsForRefs(documents, contract);
  return kind ? attached.filter((d) => d.kind === kind) : attached;
}

/**
 * The original rate sheet file(s) behind a rate sheet record.
 *
 * Narrowed to `vend_rate_sheet` on purpose: a rate sheet record may reference a
 * covering email or a brochure too, but only the rate sheet document is the
 * price source that a quote would later have to be defended against.
 */
export function documentsForRateSheet(
  documents: DocumentRecord[],
  sheet: DocumentRefHolder,
): DocumentRecord[] {
  return documentsForRefs(documents, sheet).filter((d) => d.kind === "vend_rate_sheet");
}

/** Does this rate sheet have a source document that actually exists? */
export function hasResolvableSource(
  documents: DocumentRecord[],
  sheet: DocumentRefHolder,
): boolean {
  return documentsForRateSheet(documents, sheet).length > 0;
}

/* ------------------------------------------------------------------ *
 * Integrity
 * ------------------------------------------------------------------ */

export type LinkageIssueCode = "ref_missing" | "vendor_mismatch";

export type LinkageIssue = {
  code: LinkageIssueCode;
  ref: string;
  message: string;
};

/**
 * Documents referenced by a supplier-scoped holder that belong to a DIFFERENT
 * supplier. This is the mistake worth catching: attaching Vendor A's rate sheet
 * to Vendor B's record would let the platform price one supplier from another's
 * prices, and nothing else in the system would question it.
 *
 * A document with no `vendorId` is not a mismatch — it is unattributed, which is
 * a weaker and separate condition, and treating it as a clash would raise a
 * false alarm on every document captured before supplier attribution existed.
 */
export function findVendorMismatches(
  documents: DocumentRecord[],
  holder: VendorScopedRefHolder,
): LinkageIssue[] {
  return documentsForRefs(documents, holder)
    .filter((d) => d.metadata.vendorId !== undefined && d.metadata.vendorId !== holder.vendorId)
    .map((d) => ({
      code: "vendor_mismatch" as const,
      ref: d.id,
      message: "Document belongs to a different supplier than the record referencing it.",
    }));
}

/** Refs that resolve to nothing. */
export function unresolvableRefs(
  documents: DocumentRecord[],
  holder: DocumentRefHolder,
): string[] {
  return resolveRefs(documents, holder.documentRefs).missing;
}

export type LinkageReport = {
  resolved: DocumentRecord[];
  missing: string[];
  issues: LinkageIssue[];
  /** Rate-sheet source documents among the resolved set. */
  sources: DocumentRecord[];
  ok: boolean;
};

/**
 * One pass over a supplier-scoped holder: what resolved, what did not, and what
 * resolved to the wrong supplier.
 *
 * A missing ref is an ISSUE but not necessarily an error for the caller to
 * refuse on — M4 already treats an absent source document as a warning, since a
 * genuine rate sheet may predate the file being collected. This report states
 * the facts; the calling module keeps its own severity policy.
 */
export function linkageReport(
  documents: DocumentRecord[],
  holder: VendorScopedRefHolder,
): LinkageReport {
  const { resolved, missing } = resolveRefs(documents, holder.documentRefs);
  const issues: LinkageIssue[] = [
    ...missing.map((ref) => ({
      code: "ref_missing" as const,
      ref,
      message: "Referenced document is not on record — the source cannot be audited.",
    })),
    ...findVendorMismatches(documents, holder),
  ];

  return {
    resolved,
    missing,
    issues,
    sources: resolved.filter((d) => d.kind === "vend_rate_sheet"),
    ok: issues.length === 0,
  };
}
