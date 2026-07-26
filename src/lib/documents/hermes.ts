/**
 * Document ← Hermes seam. Lets the intelligence layer summarise, review, extract
 * from, and set reminders on documents later — without changing these contracts.
 * All advisory: a human verifies/acts. Stubs return null while Hermes is disabled.
 */
import { HERMES_ENABLED } from "@/lib/hermes";
import type { DocumentRecord } from "@/lib/documents/model";

export type DocumentSummary = {
  documentId: string;
  summary: string;
};

export type DocumentReview = {
  documentId: string;
  verdict: "looks_valid" | "needs_attention" | "likely_invalid";
  notes: string;
  requiresHumanApproval: true;
};

export type DocumentExtraction = {
  documentId: string;
  /** Extracted key/value fields (e.g. passport number, expiry) — advisory. */
  fields: Record<string, string>;
};

export type DocumentReminder = {
  documentId: string;
  dueDate: string;
  reason: string;
};

export function summariseDocument(record: DocumentRecord): DocumentSummary | null {
  void record;
  if (!HERMES_ENABLED) return null;
  return null;
}

export function reviewDocument(record: DocumentRecord): DocumentReview | null {
  void record;
  if (!HERMES_ENABLED) return null;
  return null;
}

export function extractDocument(record: DocumentRecord): DocumentExtraction | null {
  void record;
  if (!HERMES_ENABLED) return null;
  return null;
}

/** Expiry reminders (passport/insurance/permit/fitness). */
export function documentReminder(record: DocumentRecord): DocumentReminder | null {
  if (!HERMES_ENABLED) return null;
  if (!record.expiresAt) return null;
  return { documentId: record.id, dueDate: record.expiresAt, reason: "Document expiring" };
}
