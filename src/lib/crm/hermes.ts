/**
 * Hermes AI contract — the seam through which the operational intelligence layer
 * consumes and enriches CRM data. Hermes is NOT a bolt-on chatbot: every module
 * exposes its data as a `HermesContext`, and Hermes returns `HermesSuggestion`s
 * (advisory only). This file defines the contract now so future modules are
 * Hermes-consumable without redesign. No model calls here — pure types + stubs.
 */
import type { CrmActivity, CrmLead, LifecycleStage } from "@/lib/crm/model";

/** Master switch — Hermes is not connected yet. */
export const HERMES_ENABLED = false;

export type HermesContextKind = "lead" | "booking" | "vendor" | "dashboard";

export type HermesContext = {
  kind: HermesContextKind;
  lifecycle?: LifecycleStage;
  lead?: CrmLead;
  activities?: CrmActivity[];
  /** Free-form structured facts a specific surface wants Hermes to consider. */
  facts?: Record<string, string | number | boolean>;
};

export type HermesConfidence = "low" | "medium" | "high";

export type HermesSuggestion = {
  title: string;
  detail: string;
  /** Optional follow-up the human can approve (never auto-executed). */
  action?: string;
  confidence?: HermesConfidence;
};

/** Assemble the context Hermes would consume for a lead. Pure. */
export function buildLeadContext(
  lead: CrmLead,
  activities: CrmActivity[] = [],
): HermesContext {
  return {
    kind: "lead",
    lifecycle: "lead",
    lead,
    activities: activities.filter((a) => a.leadRef === lead.reference || a.leadRef === lead.id),
    facts: {
      stage: lead.stage,
      source: lead.source,
      hasEmail: Boolean(lead.contact.email),
      travellers: (lead.travellers?.adults ?? 0) + (lead.travellers?.children ?? 0),
    },
  };
}

/**
 * Suggestion entry point. Returns [] while Hermes is disabled — the contract
 * exists so callers can wire it now; a live implementation swaps in here and
 * routes any actionable/irreversible step through the human ApprovalQueue
 * (security-architecture §12).
 */
export function hermesSuggestionsFor(context: HermesContext): HermesSuggestion[] {
  void context;
  if (!HERMES_ENABLED) return [];
  return [];
}
