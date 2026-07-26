/**
 * Hermes — the ONE shared operational-intelligence contract for the whole
 * platform. Hermes is not a chatbot; it is the layer that consumes context from
 * every module and returns insights/recommendations/summaries (advisory), with
 * critical actions always gated by human approval (security §12).
 *
 * The base types (HermesContext/HermesSuggestion/HERMES_ENABLED) already exist in
 * src/lib/crm/hermes.ts and are re-exported here so there is a single definition
 * and a single import surface (`@/lib/hermes`). Modules expose context through
 * the common HermesContextProvider below — no module implements AI independently.
 */
export { HERMES_ENABLED, buildLeadContext, hermesSuggestionsFor } from "@/lib/crm/hermes";
export type {
  HermesContext,
  HermesContextKind,
  HermesSuggestion,
  HermesConfidence,
} from "@/lib/crm/hermes";

import type { HermesConfidence } from "@/lib/crm/hermes";

/** Every module that can feed Hermes — today and planned. */
export const HERMES_MODULES = [
  "crm",
  "vendor",
  "booking",
  "quote",
  "customer",
  "dashboard",
  "marketing",
  "finance",
  "operations",
] as const;
export type HermesModule = (typeof HERMES_MODULES)[number];

export type HermesInsightKind =
  | "recommendation"
  | "summary"
  | "risk"
  | "metric"
  | "approval";

/**
 * A surfaced insight — what dashboards render. `action.requiresApproval` marks
 * anything a human must confirm; Hermes never auto-executes it.
 */
export type HermesInsight = {
  id: string;
  module: HermesModule;
  kind: HermesInsightKind;
  title: string;
  detail?: string;
  confidence?: HermesConfidence;
  action?: { label: string; requiresApproval: boolean };
};

/**
 * The single interface each business module implements to plug into Hermes.
 * Future modules (marketing/finance/operations/notifications…) implement the
 * same shape and register in providers.ts — no new AI contract per module.
 */
export interface HermesContextProvider {
  module: HermesModule;
  /** Read-only context snapshots for the intelligence layer. */
  getContexts(): Promise<import("@/lib/crm/hermes").HermesContext[]>;
  /** Pre-computed insights this module surfaces (empty while disabled). */
  getInsights(): Promise<HermesInsight[]>;
}
