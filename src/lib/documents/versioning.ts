/**
 * Document versioning — append-only, pure, no I/O.
 *
 * A supplier sends a corrected GST certificate, a re-signed agreement, a revised
 * rate sheet. The old file does not stop being true: it is what was on record at
 * the time, and a booking, a contract or an audit may still point at it. So a
 * new version NEVER overwrites or deletes its predecessor — it links to it.
 *
 * The chain is expressed with two pointers rather than a mutable "latest" flag:
 *
 *   supersedesId    → the document this one replaces   (backward)
 *   supersededById  → the document that replaced this  (forward)
 *
 * Both are kept because each answers a question the other cannot without a full
 * scan, and because disagreement between them is itself a detectable integrity
 * fault (`validateVersionGraph`).
 *
 * These fields extend `DocumentRecord` HERE rather than in the model, so the
 * shared document model stays exactly as it shipped. Every function below takes
 * the documents it should consider and returns new values — nothing in this
 * module mutates its input.
 */
import type { DocumentRecord } from "@/lib/documents/model";

/** A document participating in a version chain. */
export type VersionedDocument = DocumentRecord & {
  /** The document this one replaces. Absent on the first version. */
  supersedesId?: string;
  /** The document that replaced this one. Absent while this is current. */
  supersededById?: string;
};

/** Guard against a malformed chain spinning forever. */
const MAX_CHAIN_LENGTH = 1000;

function byId(documents: VersionedDocument[]): Map<string, VersionedDocument> {
  return new Map(documents.map((d) => [d.id, d]));
}

/* ------------------------------------------------------------------ *
 * Chain traversal
 * ------------------------------------------------------------------ */

/** Has this document been replaced? */
export function isSuperseded(document: VersionedDocument): boolean {
  return Boolean(document.supersededById);
}

/**
 * Walk backwards to the first version. Stops on a missing link (the earliest
 * version we can actually see) or on a cycle.
 */
export function firstVersion(
  documents: VersionedDocument[],
  id: string,
): VersionedDocument | null {
  const index = byId(documents);
  let current = index.get(id) ?? null;
  const seen = new Set<string>();

  while (current?.supersedesId) {
    if (seen.has(current.id)) return current; // cycle — stop where we are
    seen.add(current.id);
    const previous = index.get(current.supersedesId);
    if (!previous) return current; // dangling link: this is the earliest we hold
    current = previous;
  }
  return current;
}

/**
 * The version in force today. Follows the forward pointers to the end.
 * Returns null when the id is unknown — an unknown id must not silently
 * resolve to something else.
 */
export function currentVersion(
  documents: VersionedDocument[],
  id: string,
): VersionedDocument | null {
  const index = byId(documents);
  let current = index.get(id) ?? null;
  const seen = new Set<string>();

  while (current?.supersededById) {
    if (seen.has(current.id)) return current; // cycle — refuse to loop
    seen.add(current.id);
    const next = index.get(current.supersededById);
    if (!next) return current; // dangling forward link: this is the newest we hold
    current = next;
  }
  return current;
}

/**
 * The whole chain containing `id`, oldest first. Includes the document itself,
 * everything it replaced, and everything that replaced it.
 */
export function versionChain(documents: VersionedDocument[], id: string): VersionedDocument[] {
  const index = byId(documents);
  const start = firstVersion(documents, id);
  if (!start) return [];

  const chain: VersionedDocument[] = [start];
  const seen = new Set<string>([start.id]);
  let cursor = start;

  while (cursor.supersededById && chain.length < MAX_CHAIN_LENGTH) {
    const next = index.get(cursor.supersededById);
    if (!next || seen.has(next.id)) break;
    chain.push(next);
    seen.add(next.id);
    cursor = next;
  }
  return chain;
}

/** Every document that has not been replaced. The set a register should show. */
export function currentVersions(documents: VersionedDocument[]): VersionedDocument[] {
  return documents.filter((d) => !isSuperseded(d));
}

/** Every document that HAS been replaced. Retained, never deleted. */
export function supersededVersions(documents: VersionedDocument[]): VersionedDocument[] {
  return documents.filter(isSuperseded);
}

/** The next version number for a chain — max seen + 1, never a reused value. */
export function nextVersionNumber(chain: VersionedDocument[]): number {
  if (chain.length === 0) return 1;
  return Math.max(...chain.map((d) => d.metadata.version)) + 1;
}

/* ------------------------------------------------------------------ *
 * Integrity
 * ------------------------------------------------------------------ */

export type VersionIssueCode =
  | "orphan_backward"
  | "orphan_forward"
  | "pointer_mismatch"
  | "cycle"
  | "fork"
  | "duplicate_version";

export type VersionIssue = {
  code: VersionIssueCode;
  documentId: string;
  message: string;
};

/** Links pointing at a document that is not in the set. */
export function findOrphans(documents: VersionedDocument[]): VersionIssue[] {
  const index = byId(documents);
  const issues: VersionIssue[] = [];

  for (const doc of documents) {
    if (doc.supersedesId && !index.has(doc.supersedesId)) {
      issues.push({
        code: "orphan_backward",
        documentId: doc.id,
        message: `Replaces a document that is not on record (${doc.supersedesId}).`,
      });
    }
    if (doc.supersededById && !index.has(doc.supersededById)) {
      issues.push({
        code: "orphan_forward",
        documentId: doc.id,
        message: `Replaced by a document that is not on record (${doc.supersededById}).`,
      });
    }
  }
  return issues;
}

/**
 * Cycles. A version chain is a line, not a loop: if A replaces B and B replaces
 * A, no version is current and any traversal would run forever.
 */
export function detectCycles(documents: VersionedDocument[]): VersionIssue[] {
  const index = byId(documents);
  const issues: VersionIssue[] = [];
  const settled = new Set<string>();

  for (const doc of documents) {
    if (settled.has(doc.id)) continue;

    const path = new Set<string>();
    let cursor: VersionedDocument | undefined = doc;
    let steps = 0;

    while (cursor && steps++ < MAX_CHAIN_LENGTH) {
      if (path.has(cursor.id)) {
        issues.push({
          code: "cycle",
          documentId: cursor.id,
          message: "Version chain forms a loop — no version can be current.",
        });
        break;
      }
      path.add(cursor.id);
      const nextId: string | undefined = cursor.supersededById;
      cursor = nextId ? index.get(nextId) : undefined;
    }
    for (const id of path) settled.add(id);
  }
  return issues;
}

/**
 * Full integrity pass. Beyond orphans and cycles this catches two faults that
 * only show up when both pointers are compared:
 *
 *   pointer_mismatch — A says it was replaced by B, but B does not claim to
 *                      replace A. One of the two is wrong and a reader would
 *                      get a different answer depending on which it followed.
 *   fork             — two documents claim to replace the SAME predecessor, so
 *                      "the current version" has more than one answer.
 */
export function validateVersionGraph(documents: VersionedDocument[]): {
  ok: boolean;
  issues: VersionIssue[];
} {
  const index = byId(documents);
  const issues: VersionIssue[] = [...findOrphans(documents), ...detectCycles(documents)];

  for (const doc of documents) {
    if (doc.supersededById) {
      const next = index.get(doc.supersededById);
      if (next && next.supersedesId !== doc.id) {
        issues.push({
          code: "pointer_mismatch",
          documentId: doc.id,
          message: `Forward and backward links disagree with ${next.id}.`,
        });
      }
    }
  }

  // Forks: more than one document replacing the same predecessor.
  const replacing = new Map<string, string[]>();
  for (const doc of documents) {
    if (!doc.supersedesId) continue;
    replacing.set(doc.supersedesId, [...(replacing.get(doc.supersedesId) ?? []), doc.id]);
  }
  for (const [predecessorId, replacements] of replacing) {
    if (replacements.length > 1) {
      issues.push({
        code: "fork",
        documentId: predecessorId,
        message: `Replaced by ${replacements.length} documents — the current version is ambiguous.`,
      });
    }
  }

  // Repeated version numbers inside one chain.
  const chainsChecked = new Set<string>();
  for (const doc of documents) {
    if (chainsChecked.has(doc.id)) continue;
    const chain = versionChain(documents, doc.id);
    for (const member of chain) chainsChecked.add(member.id);

    const numbers = chain.map((d) => d.metadata.version);
    const duplicated = numbers.filter((n, i) => numbers.indexOf(n) !== i);
    if (duplicated.length > 0) {
      issues.push({
        code: "duplicate_version",
        documentId: chain[0]?.id ?? doc.id,
        message: `Version number reused within one chain (${[...new Set(duplicated)].join(", ")}).`,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}
