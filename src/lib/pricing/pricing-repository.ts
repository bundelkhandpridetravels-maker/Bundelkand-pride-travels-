// Server-only: imported by the pricing dashboard.
import { emptyPricingSummary, type PricingSummary } from "@/lib/pricing/model";
import { MARGIN_POLICY, MARKUP_RULES, type MarginPolicy, type MarkupRule } from "@/lib/pricing/rules";
import { GST_ENABLED } from "@/lib/pricing/tax";

/**
 * Pricing aggregation boundary — the seam a future persisted pricing layer
 * plugs into.
 *
 * Two different things are missing today, and this seam keeps them distinct:
 *
 *   markup rules   exist as a SHAPE with an empty registry, because the rates
 *                  are founder business data nobody has supplied
 *   rate sheets    exist as an M4 model with no store, because persisting them
 *                  is a schema change held for its own approved milestone
 *
 * Neither is a bug, and reporting `live:false` says so honestly rather than
 * presenting an empty pricing engine as a configured one.
 *
 * Going live = implement a repository backed by wherever rules and rate sheets
 * come to live, and swap it in `getPricingRepository()`. The money type, model,
 * engine, resolver, tax structure and dashboard do not change.
 *
 * ⚠️ LOGGING: this seam logs NOTHING. A pricing diagnostic would carry supplier
 * costs and margins — the most commercially sensitive figures in the platform —
 * and no debugging convenience justifies putting those into a log aggregator.
 */

export interface PricingRepository {
  getSummary(): Promise<PricingSummary>;
  /** Markup rules in force. Empty until the founder supplies them. */
  listMarkupRules(): Promise<{ live: boolean; rules: MarkupRule[] }>;
  getMarginPolicy(): Promise<{ live: boolean; policy: MarginPolicy }>;
}

class ConsolePricingRepository implements PricingRepository {
  async getSummary(): Promise<PricingSummary> {
    return {
      ...emptyPricingSummary(false),
      // Read from the real registries, so the console shows the true count
      // rather than a hardcoded zero that would stay zero after configuration.
      rulesConfigured: MARKUP_RULES.length,
      gstEnabled: GST_ENABLED,
    };
  }

  async listMarkupRules(): Promise<{ live: boolean; rules: MarkupRule[] }> {
    return { live: false, rules: [...MARKUP_RULES] };
  }

  async getMarginPolicy(): Promise<{ live: boolean; policy: MarginPolicy }> {
    return { live: false, policy: MARGIN_POLICY };
  }
}

let repo: PricingRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getPricingRepository(): PricingRepository {
  if (!repo) repo = new ConsolePricingRepository();
  return repo;
}

/* ------------------------------------------------------------------ *
 * Readiness
 * ------------------------------------------------------------------ */

export type PricingReadinessItem = {
  capability: string;
  ready: boolean;
  blocker?: string;
};

/**
 * What the pricing engine can and cannot do right now. Structural facts only —
 * no amounts, no rates, nothing commercially sensitive — so this is safe to
 * render on any staff surface.
 */
export function getPricingReadiness(): PricingReadinessItem[] {
  return [
    {
      capability: "Exact money arithmetic (integer minor units)",
      ready: true,
    },
    {
      capability: "Cost breakdown with provenance",
      ready: true,
    },
    {
      capability: "Markup and margin calculation",
      ready: true,
    },
    {
      capability: "Rate resolution from a supplier rate sheet",
      ready: false,
      blocker: "M4 rate sheets are not persisted — the repository is live:false and returns none.",
    },
    {
      capability: "Markup rules configured",
      ready: MARKUP_RULES.length > 0,
      blocker:
        MARKUP_RULES.length > 0
          ? undefined
          : "No markup rule exists. Rates are founder business data and are never defaulted.",
    },
    {
      capability: "Minimum-margin policy",
      ready: MARGIN_POLICY.minimumBasisPoints !== null,
      blocker:
        MARGIN_POLICY.minimumBasisPoints !== null ? undefined : "No minimum margin configured — nothing is enforced.",
    },
    {
      capability: "GST calculation",
      ready: false,
      blocker: "GST is disabled and no rate is configured. Registration is in progress.",
    },
    {
      capability: "Quote persistence",
      ready: false,
      blocker: "No quotations collection exists — persisting a quote is a schema change and a separate milestone.",
    },
  ];
}
