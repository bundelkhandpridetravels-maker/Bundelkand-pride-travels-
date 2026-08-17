/**
 * The pricing engine. Pure, deterministic, no I/O, no network, no database.
 *
 *   components → cost → markup → net price → tax → total → margin
 *
 * EVERY failure is explicit. There is no code path that quietly substitutes a
 * default: a missing currency, a currency mismatch, an absent markup rule, an
 * invalid amount and an impossible margin target each return a typed failure
 * with a reason. That is the whole design intent — a pricing engine that always
 * returns a number is a pricing engine that will one day return a wrong one and
 * nobody will know.
 *
 * The engine also emits an EXPLANATION: an ordered list of steps showing how
 * cost became a price. Lines that disclose cost or margin are flagged
 * `commercial: true`, so `model.redactQuote()` can strip them for an actor who
 * may not see them without the engine needing to know who is asking.
 */
import {
  add,
  applyBasisPoints,
  formatBasisPoints,
  isZero,
  type Currency,
  type Money,
  multiply,
  ratioBasisPoints,
  subtract,
  sum,
  zero,
} from "@/lib/pricing/money";
import {
  type CostBreakdown,
  type Margin,
  type MarkupApplication,
  type PriceComponent,
  type PriceExplanationLine,
  type PriceQuote,
  type SellingPrice,
} from "@/lib/pricing/model";
import { computeUplift, describeRule, type MarkupRule, MARGIN_POLICY } from "@/lib/pricing/rules";
import { computeTax, type TaxContext } from "@/lib/pricing/tax";

/* ------------------------------------------------------------------ *
 * Failure vocabulary
 * ------------------------------------------------------------------ */

export type PricingErrorCode =
  | "no_components"
  | "currency_mismatch"
  | "missing_currency"
  | "invalid_money"
  | "invalid_quantity"
  | "no_markup_rule"
  | "invalid_markup_rule"
  | "margin_below_policy";

export type PricingFailure = {
  ok: false;
  code: PricingErrorCode;
  error: string;
  /** Which component caused it, when the fault is attributable to one. */
  componentId?: string;
};

export type PricingResult<T> = { ok: true; value: T } | PricingFailure;

const failure = (code: PricingErrorCode, error: string, componentId?: string): PricingFailure => ({
  ok: false,
  code,
  error,
  ...(componentId ? { componentId } : {}),
});

/* ------------------------------------------------------------------ *
 * Component construction
 * ------------------------------------------------------------------ */

export type ComponentInput = Omit<PriceComponent, "cost">;

/**
 * Compute a component's cost from its unit cost and quantity. Exact — integer
 * multiplication, no rounding — so a line total never drifts from its unit
 * price × quantity.
 */
export function buildComponent(input: ComponentInput): PricingResult<PriceComponent> {
  if (!Number.isInteger(input.quantity) || input.quantity < 0) {
    return failure("invalid_quantity", `Quantity for '${input.label}' must be a whole number.`, input.id);
  }
  const cost = multiply(input.unitCost, input.quantity);
  if (!cost.ok) {
    return failure("invalid_money", `${input.label}: ${cost.error}`, input.id);
  }
  return { ok: true, value: { ...input, cost: cost.value } };
}

/* ------------------------------------------------------------------ *
 * Cost
 * ------------------------------------------------------------------ */

/**
 * Fold components into a cost breakdown.
 *
 * Requires at least one component and a single shared currency. Mixed
 * currencies fail rather than converting — an FX rate is real financial data
 * this platform does not have, and inventing one would be inventing money.
 */
export function buildCostBreakdown(components: PriceComponent[]): PricingResult<CostBreakdown> {
  if (components.length === 0) {
    return failure("no_components", "A price needs at least one component.");
  }

  const currency: Currency = components[0].cost.currency;
  const mismatch = components.find((c) => c.cost.currency !== currency);
  if (mismatch) {
    return failure(
      "currency_mismatch",
      `Components mix ${currency} and ${mismatch.cost.currency}. No exchange rate exists, so they cannot be combined.`,
      mismatch.id,
    );
  }

  const subtotal = sum(
    components.map((c) => c.cost),
    currency,
  );
  if (!subtotal.ok) {
    return failure("invalid_money", subtotal.error);
  }

  return {
    ok: true,
    value: {
      currency,
      components,
      subtotal: subtotal.value,
      componentCount: components.length,
      rateBackedCount: components.filter((c) => c.provenance.source === "rate_sheet").length,
    },
  };
}

/* ------------------------------------------------------------------ *
 * The full price
 * ------------------------------------------------------------------ */

export type PriceRequest = {
  components: PriceComponent[];
  /** REQUIRED. There is no default markup — see rules.ts. */
  markupRule: MarkupRule | null;
  tax?: TaxContext;
  /** ISO timestamp from the caller; the engine generates nothing. */
  computedAt: string;
};

/**
 * Price a set of components.
 *
 * Order matters and is fixed: cost → uplift → net price → tax on the NET price
 * (tax is exclusive, per tax.TAX_INCLUSION) → total. Margin is measured against
 * the net price, not the tax-inclusive total, because tax is collected on behalf
 * of the government and was never the business's to keep.
 */
export function priceComponents(request: PriceRequest): PricingResult<PriceQuote> {
  const breakdownResult = buildCostBreakdown(request.components);
  if (!breakdownResult.ok) return breakdownResult;
  const breakdown = breakdownResult.value;
  const currency = breakdown.currency;

  if (!request.markupRule) {
    return failure(
      "no_markup_rule",
      "No markup rule supplied. Pricing refuses to proceed rather than assume a rate — a default markup would be an invented commercial decision.",
    );
  }

  const upliftResult = computeUplift(breakdown.subtotal, request.markupRule);
  if (!upliftResult.ok) {
    return failure("invalid_markup_rule", upliftResult.error);
  }
  const uplift = upliftResult.value;

  const netResult = add(breakdown.subtotal, uplift);
  if (!netResult.ok) return failure("invalid_money", netResult.error);
  const netPrice = netResult.value;

  const tax = computeTax(netPrice, request.tax);

  const totalResult = add(netPrice, tax.total);
  if (!totalResult.ok) return failure("invalid_money", totalResult.error);
  const total = totalResult.value;

  const marginAmountResult = subtract(netPrice, breakdown.subtotal);
  if (!marginAmountResult.ok) return failure("invalid_money", marginAmountResult.error);
  const marginAmount = marginAmountResult.value;

  // Margin share of the net price. A zero net price has no meaningful ratio.
  const marginBpResult = isZero(netPrice) ? { ok: true as const, value: 0 } : ratioBasisPoints(marginAmount, netPrice);
  if (!marginBpResult.ok) return failure("invalid_money", marginBpResult.error);

  const margin: Margin = { amount: marginAmount, basisPoints: marginBpResult.value };

  const markup: MarkupApplication = {
    ruleId: request.markupRule.id,
    ruleLabel: request.markupRule.label,
    basis: request.markupRule.basis,
    basisPoints: request.markupRule.basisPoints,
    uplift,
  };

  const selling: SellingPrice = {
    cost: breakdown.subtotal,
    markup,
    netPrice,
    tax,
    total,
  };

  return {
    ok: true,
    value: {
      currency,
      breakdown,
      selling,
      margin,
      explanation: explain(breakdown, selling, margin, request.markupRule),
      computedAt: request.computedAt,
      indicative: true,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Explanation
 * ------------------------------------------------------------------ */

function explain(
  breakdown: CostBreakdown,
  selling: SellingPrice,
  margin: Margin,
  rule: MarkupRule,
): PriceExplanationLine[] {
  const lines: PriceExplanationLine[] = [];

  for (const component of breakdown.components) {
    const source =
      component.provenance.source === "rate_sheet"
        ? `rate sheet ${component.provenance.rateSheetId}${component.provenance.seasonLabel ? ` · ${component.provenance.seasonLabel}` : ""}`
        : component.provenance.source === "package_static"
          ? "published package price"
          : "entered manually";
    lines.push({
      step: "component",
      label: `${component.label} × ${component.quantity}`,
      detail: `from ${source}`,
      amount: component.cost,
      commercial: true,
    });
  }

  lines.push({
    step: "subtotal",
    label: "Total cost",
    detail: `${breakdown.componentCount} component(s), ${breakdown.rateBackedCount} from a supplier rate`,
    amount: breakdown.subtotal,
    commercial: true,
  });

  lines.push({
    step: "markup",
    label: "Markup",
    detail: describeRule(rule),
    amount: selling.markup.uplift,
    commercial: true,
  });

  lines.push({
    step: "net_price",
    label: "Price before tax",
    amount: selling.netPrice,
    commercial: false,
  });

  lines.push({
    step: "tax",
    label: "Tax",
    detail: selling.tax.note,
    amount: selling.tax.total,
    commercial: false,
  });

  lines.push({
    step: "total",
    label: "Total payable",
    amount: selling.total,
    commercial: false,
  });

  lines.push({
    step: "margin",
    label: "Margin",
    detail: formatBasisPoints(margin.basisPoints),
    amount: margin.amount,
    commercial: true,
  });

  return lines;
}

/* ------------------------------------------------------------------ *
 * Policy checks
 * ------------------------------------------------------------------ */

export type MarginCheck = {
  withinPolicy: boolean;
  /** True when a human must approve before this quote may be issued. */
  requiresApproval: boolean;
  reason?: string;
};

/**
 * Check a quote against the minimum-margin policy.
 *
 * With no floor configured (`minimumBasisPoints === null`) nothing is enforced,
 * and this says so rather than silently passing — an unconfigured policy is not
 * the same as a satisfied one.
 */
export function checkMarginPolicy(margin: Margin): MarginCheck {
  if (MARGIN_POLICY.minimumBasisPoints === null) {
    return {
      withinPolicy: true,
      requiresApproval: false,
      reason: "No minimum-margin policy is configured, so nothing was enforced.",
    };
  }
  const below = margin.basisPoints < MARGIN_POLICY.minimumBasisPoints;
  return {
    withinPolicy: !below,
    requiresApproval: below && MARGIN_POLICY.requiresApprovalBelowMinimum,
    ...(below
      ? {
          reason: `Margin ${formatBasisPoints(margin.basisPoints)} is below the ${formatBasisPoints(MARGIN_POLICY.minimumBasisPoints)} minimum.`,
        }
      : {}),
  };
}

/** A zero-cost, zero-price quote skeleton for a currency. Used by empty surfaces. */
export function emptyQuoteTotals(currency: Currency): { cost: Money; total: Money } {
  return { cost: zero(currency), total: zero(currency) };
}

/** Re-exported so callers can apply a rate without importing the money module. */
export { applyBasisPoints };
