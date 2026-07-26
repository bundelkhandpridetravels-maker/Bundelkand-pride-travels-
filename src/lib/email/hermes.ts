/**
 * Email ← Hermes seam. Lets the intelligence layer DRAFT emails/replies from a
 * shared context (customer support, follow-ups, quote nudges). Drafts are
 * advisory — a human reviews and sends; Hermes never sends autonomously.
 */
import { HERMES_ENABLED, type HermesContext } from "@/lib/hermes";
import type { EmailTemplateId } from "@/lib/email/model";

export type EmailDraft = {
  template?: EmailTemplateId;
  subject: string;
  body: string;
  /** Always true here — a human reviews and sends. */
  requiresReview: true;
};

/**
 * Draft an email for the given context. Returns null while Hermes is disabled —
 * the seam exists so callers can wire it now; a live model swaps in here.
 */
export function draftEmail(context: HermesContext): EmailDraft | null {
  void context;
  if (!HERMES_ENABLED) return null;
  return null;
}
