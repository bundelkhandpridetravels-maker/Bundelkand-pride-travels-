/**
 * Pricing rule SHAPES. Pure, no I/O, and containing no commercial values.
 *
 * ⚠️ `MARKUP_RULES` IS EMPTY, AND THAT IS THE DELIVERABLE.
 *
 * What BPT charges above cost is real business data the founder owns — it
 * differs by supplier, season, package type and negotiation, and it is the
 * single most commercially sensitive number in the platform. Shipping a
 * plausible-looking default (15%? 20%?) would be inventing the business's
 * economics, and the first quote computed from it would be wrong in a way
 * nobody would notice until a margin review.
 *
 * So this module defines how a markup rule is SHAPED and how it is validated,
 * and leaves the registry empty — the same deliberate extension point M1 used
 * for `TYPE_REQUIREMENTS`. The engine refuses to price without a rule rather
 * than falling back to zero, because a 0% markup is itself a commercial
 * decision nobody made.
 */
import {
  applyBasisPoints,
  formatBasisPoints,
  type Money,
  type MoneyResult,
  money,
  roundHalfUp,
} from "@/lib/pricing/money";

/* ------------------------------------------------------------------ *
 * Rule shape
 * ------------------------------------------------------------------ */

/**
 * The two ways a travel business marks up a cost, which are NOT the same sum:
 *
 *   cost_plus     sell = cost × (1 + rate)      "add 25% to what we paid"
 *   margin_target sell = cost ÷ (1 − rate)      "keep 25% of what we charge"
 *
 * On a cost of 100: cost_plus 25% sells at 125 and earns a 20% margin;
 * margin_target 25% sells at 133.33 and earns exactly 25%. Conflating them is a
 * classic and expensive mistake, so the basis is always explicit.
 */
export const MARKUP_BASES = ["cost_plus", "margin_target"] as const;
export type MarkupBasis = (typeof MARKUP_BASES)[number];

export const MARKUP_BASIS_LABELS: Record<MarkupBasis, string> = {
  cost_plus: "Cost-plus (add a percentage to cost)",
  margin_target: "Margin target (keep a percentage of the selling price)",
};

/** Optional narrowing of where a rule applies. All absent = applies to everything. */
export type MarkupScope = {
  vendorId?: string;
  packageSlug?: string;
  componentKind?: string;
  /** Inclusive ISO date bounds. */
  validFrom?: string;
  validTo?: string;
};

export type MarkupRule = {
  id: string;
  label: string;
  basis: MarkupBasis;
  /** Whole basis points. 1% = 100. Supplied by the founder, never defaulted. */
  basisPoints: number;
  scope?: MarkupScope;
  /** Higher wins when several rules match. Ties are an error, not a coin toss. */
  priority?: number;
};

/**
 * THE REGISTRY — intentionally empty.
 *
 * Populate from founder-supplied business data (later, and behind approval).
 * Until then the engine has nothing to price with, which is the honest state.
 */
export const MARKUP_RULES: MarkupRule[] = [];

/**
 * A minimum-margin policy, e.g. "never quote below 10% margin". Also founder
 * data: `minimumBasisPoints` is null, meaning no floor is enforced yet rather
 * than a floor of zero.
 */
export type MarginPolicy = {
  minimumBasisPoints: number | null;
  /** Below the floor, a quote needs explicit human approval — never auto-blocked away. */
  requiresApprovalBelowMinimum: boolean;
};

export const MARGIN_POLICY: MarginPolicy = {
  minimumBasisPoints: null,
  requiresApprovalBelowMinimum: true,
};

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export type RuleIssue = { code: string; message: string };

/**
 * Validate a rule's shape. Says nothing about whether the rate is commercially
 * sensible — that is the founder's judgement, not the platform's.
 */
export function validateMarkupRule(rule: MarkupRule): { ok: boolean; issues: RuleIssue[] } {
  const issues: RuleIssue[] = [];

  if (!rule.id?.trim()) issues.push({ code: "id_missing", message: "Rule needs an id." });
  if (!rule.label?.trim()) issues.push({ code: "label_missing", message: "Rule needs a label." });
  if (!(MARKUP_BASES as readonly string[]).includes(rule.basis)) {
    issues.push({ code: "basis_invalid", message: `Unknown markup basis '${rule.basis}'.` });
  }
  if (!Number.isInteger(rule.basisPoints)) {
    issues.push({ code: "rate_not_integer", message: "Rate must be whole basis points (1% = 100)." });
  } else if (rule.basisPoints < 0) {
    issues.push({ code: "rate_negative", message: "Rate cannot be negative." });
  } else if (rule.basis === "margin_target" && rule.basisPoints >= 10_000) {
    // sell = cost / (1 - rate): at 100% the divisor is zero, beyond it negative.
    issues.push({
      code: "margin_target_impossible",
      message: "A margin target of 100% or more cannot produce a finite selling price.",
    });
  }
  if (rule.scope?.validFrom && rule.scope.validTo && rule.scope.validTo < rule.scope.validFrom) {
    issues.push({ code: "scope_window_invalid", message: "Rule validity ends before it starts." });
  }

  return { ok: issues.length === 0, issues };
}

/* ------------------------------------------------------------------ *
 * Selection
 * ------------------------------------------------------------------ */

export type RuleSelection =
  | { ok: true; rule: MarkupRule }
  | { ok: false; code: "no_rule" | "ambiguous"; error: string; candidates: string[] };

/**
 * Pick the rule that applies. Returns a failure — never a default — when none
 * matches, and refuses to choose when two match at the same priority, because
 * an arbitrary pick would silently set a price.
 */
export function selectMarkupRule(
  rules: MarkupRule[],
  context: { vendorId?: string; packageSlug?: string; componentKind?: string; date?: string } = {},
): RuleSelection {
  const matches = rules.filter((rule) => {
    const s = rule.scope;
    if (!s) return true;
    if (s.vendorId && s.vendorId !== context.vendorId) return false;
    if (s.packageSlug && s.packageSlug !== context.packageSlug) return false;
    if (s.componentKind && s.componentKind !== context.componentKind) return false;
    if (s.validFrom && context.date && context.date < s.validFrom) return false;
    if (s.validTo && context.date && context.date > s.validTo) return false;
    return true;
  });

  if (matches.length === 0) {
    return {
      ok: false,
      code: "no_rule",
      error:
        "No markup rule applies. Pricing requires an explicit rule — a default markup would be an invented commercial decision.",
      candidates: [],
    };
  }

  const top = Math.max(...matches.map((r) => r.priority ?? 0));
  const winners = matches.filter((r) => (r.priority ?? 0) === top);

  if (winners.length > 1) {
    return {
      ok: false,
      code: "ambiguous",
      error: `${winners.length} markup rules match at the same priority — the price would depend on ordering.`,
      candidates: winners.map((r) => r.id),
    };
  }
  return { ok: true, rule: winners[0] };
}

/* ------------------------------------------------------------------ *
 * Application
 * ------------------------------------------------------------------ */

/** The uplift a rule adds to a cost. Rounds once, per the money policy. */
export function computeUplift(cost: Money, rule: MarkupRule): MoneyResult<Money> {
  const check = validateMarkupRule(rule);
  if (!check.ok) {
    return { ok: false, code: "invalid_rate", error: check.issues.map((i) => i.message).join(" ") };
  }

  if (rule.basis === "cost_plus") {
    return applyBasisPoints(cost, rule.basisPoints);
  }

  // margin_target: sell = cost / (1 - rate); uplift = sell - cost.
  const divisorBp = 10_000 - rule.basisPoints;
  const sellMinor = roundHalfUp((cost.amountMinor * 10_000) / divisorBp);
  if (!Number.isSafeInteger(sellMinor)) {
    return { ok: false, code: "unsafe_magnitude", error: "Selling price exceeds the exact-integer range." };
  }
  return money(sellMinor - cost.amountMinor, cost.currency);
}

/** Human-readable description of a rule, for the explanation trail. */
export function describeRule(rule: MarkupRule): string {
  return `${rule.label} — ${MARKUP_BASIS_LABELS[rule.basis]} at ${formatBasisPoints(rule.basisPoints)}`;
}
