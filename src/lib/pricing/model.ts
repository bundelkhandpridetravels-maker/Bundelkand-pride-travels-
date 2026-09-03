/**
 * Pricing domain model. Pure types plus data-layer redaction. No I/O.
 *
 * THE ORGANISING RULE: every number in a priced quote must be explainable.
 * A price nobody can account for is a price nobody can defend to a customer, a
 * supplier or a tax authority — so each component carries its PROVENANCE (which
 * rate sheet, which line, which season, which vendor) and the finished quote
 * carries a step-by-step explanation of how cost became a selling price.
 *
 * THE SECOND RULE: cost and margin are commercial secrets. They live on the
 * same object as the selling price because the engine needs both, so this
 * module also owns the redaction that strips them before a quote can reach a
 * customer-facing surface. Redaction happens HERE, in the data layer, not in a
 * template — the same mechanism M3, M4, M5 and M6 use, for the same reason: a
 * surface that forgets to hide a column must not be the thing standing between
 * a customer and the supplier's cost price.
 */
import type { Currency, Money } from "@/lib/pricing/money";
import type { TaxBreakdown } from "@/lib/pricing/tax";
import type { Role } from "@/payload/types";
import { canViewPricingCost, canViewPricingMargin } from "@/lib/platform/roles";

/* ------------------------------------------------------------------ *
 * Provenance
 * ------------------------------------------------------------------ */

/**
 * Where a component's cost came from.
 *
 * `rate_sheet` is the only provenance that can currently be produced, because
 * M4 is the only structured supply-side source that exists. `manual` and
 * `package_static` are named so that a component from a human or from the
 * hardcoded package data is visibly NOT sourced from a supplier rate — the
 * distinction a future audit would need.
 */
export const COST_SOURCES = ["rate_sheet", "manual", "package_static"] as const;
export type CostSource = (typeof COST_SOURCES)[number];

export type RateProvenance = {
  source: "rate_sheet";
  vendorId: string;
  vendorName?: string;
  rateSheetId: string;
  rateLineId: string;

  /**
   * The property the caller ASKED about, and the property the winning sheet is
   * actually scoped to. Both are recorded, separately, on purpose.
   *
   * ⚠️ RECORDING ONLY ONE OF THESE WOULD BE WORSE THAN RECORDING NEITHER,
   * because it would look like proof. A property mismatch is the one pricing
   * error that produces a confident, well-formed, entirely wrong number — the
   * right rate for the wrong hotel — and an audit that carries a single
   * property id cannot tell that case from a correct one. Two fields let a
   * later reader assert they are equal instead of trusting that they were.
   *
   * Both are optional because a caller may legitimately omit a property when
   * the supplier has exactly one scope in play, and a legacy sheet may carry no
   * resolved property at all. Absent means "not stated", never "matched".
   */
  requestedPropertyId?: string;
  resolvedPropertyId?: string;

  seasonId?: string;
  seasonLabel?: string;
  /** The sheet's validity window, captured so an audit needs no second lookup. */
  validFrom?: string;
  validTo?: string;
  /** Exactly what was asked for when this rate was resolved. */
  resolvedFor: {
    date: string;
    roomType: string;
    mealPlan?: string;
    /** The occupancy the rate covers — never a party count. */
    ratedOccupancy?: number;
  };
};

export type ManualProvenance = {
  source: "manual" | "package_static";
  /** Who or what supplied the figure. Never guessed. */
  reference?: string;
  note?: string;
};

export type Provenance = RateProvenance | ManualProvenance;

/* ------------------------------------------------------------------ *
 * Components and cost
 * ------------------------------------------------------------------ */

/**
 * What a trip is made of, for pricing purposes.
 *
 * Only `accommodation` can be resolved from M4 today — its rate lines are room
 * type / meal plan / occupancy shaped. Transport, activity and guide have no
 * rate structure anywhere in the platform yet; they are listed so a component
 * can be recorded honestly as manual rather than mislabelled.
 */
export const COMPONENT_KINDS = [
  "accommodation",
  "transport",
  "activity",
  "guide",
  "other",
] as const;
export type ComponentKind = (typeof COMPONENT_KINDS)[number];

export const COMPONENT_KIND_LABELS: Record<ComponentKind, string> = {
  accommodation: "Accommodation",
  transport: "Transport",
  activity: "Activity",
  guide: "Guide",
  other: "Other",
};

/** Kinds a rate sheet can currently price. */
export const RATE_RESOLVABLE_KINDS: readonly ComponentKind[] = ["accommodation"];

export type PriceComponent = {
  id: string;
  label: string;
  kind: ComponentKind;
  /** Whole units — nights, seats, people. */
  quantity: number;
  unitCost: Money;
  /** unitCost × quantity. Exact; no rounding involved. */
  cost: Money;
  provenance: Provenance;
};

export type CostBreakdown = {
  currency: Currency;
  components: PriceComponent[];
  subtotal: Money;
  componentCount: number;
  /** Components whose cost came from a supplier rate sheet rather than a human. */
  rateBackedCount: number;
};

/* ------------------------------------------------------------------ *
 * Markup application and selling price
 * ------------------------------------------------------------------ */

export type MarkupApplication = {
  ruleId: string;
  ruleLabel: string;
  basis: "cost_plus" | "margin_target";
  basisPoints: number;
  /** The amount markup added to cost. */
  uplift: Money;
};

export type SellingPrice = {
  cost: Money;
  markup: MarkupApplication;
  /** Cost + uplift, before tax. */
  netPrice: Money;
  tax: TaxBreakdown;
  /** What the customer pays. */
  total: Money;
};

export type Margin = {
  amount: Money;
  /** Margin as a share of the net selling price, in basis points. */
  basisPoints: number;
};

/* ------------------------------------------------------------------ *
 * Explanation
 * ------------------------------------------------------------------ */

export type ExplanationStep =
  | "component"
  | "subtotal"
  | "markup"
  | "net_price"
  | "tax"
  | "total"
  | "margin";

export type PriceExplanationLine = {
  step: ExplanationStep;
  label: string;
  detail?: string;
  amount?: Money;
  /** True when this line discloses cost or margin. Drives redaction. */
  commercial: boolean;
};

/* ------------------------------------------------------------------ *
 * The quote
 * ------------------------------------------------------------------ */

export type PriceQuote = {
  currency: Currency;
  breakdown: CostBreakdown;
  selling: SellingPrice;
  margin: Margin;
  explanation: PriceExplanationLine[];
  /** ISO timestamp supplied by the caller — never generated inside a pure function. */
  computedAt: string;
  /** Always true. This engine produces estimates, never tax invoices. */
  indicative: true;
};

/* ------------------------------------------------------------------ *
 * Redaction — commercial data never leaves by accident
 * ------------------------------------------------------------------ */

/**
 * A quote as a given actor may see it.
 *
 * `breakdown`, `margin` and the cost side of `selling` are removed for actors
 * without pricing-cost visibility. The keys are physically absent, not blanked,
 * so they cannot survive JSON serialisation into a browser payload — which is
 * the actual threat here: a customer-facing quote page is rendered from data,
 * and any cost left on that object ships to the client.
 */
export type CustomerFacingSelling = Omit<SellingPrice, "cost" | "markup"> & {
  cost?: Money;
  markup?: MarkupApplication;
};

export type PriceQuoteView = Omit<PriceQuote, "breakdown" | "selling" | "margin"> & {
  breakdown?: CostBreakdown;
  selling: CustomerFacingSelling;
  margin?: Margin;
  /** True when cost detail was withheld from this actor. */
  costRedacted: boolean;
  /** True when margin was withheld from this actor. */
  marginRedacted: boolean;
};

export type PricingActor = { role: Role };

/**
 * Redact a quote for an actor.
 *
 * Sales gets the net price, the tax structure and the total — everything needed
 * to quote a customer — and nothing that reveals what the supplier charged.
 */
export function redactQuote(quote: PriceQuote, actor: PricingActor): PriceQuoteView {
  const seesCost = canViewPricingCost(actor.role);
  const seesMargin = canViewPricingMargin(actor.role);

  const { breakdown, selling, margin, explanation, ...rest } = quote;
  const { cost, markup, ...customerSafeSelling } = selling;

  const visibleExplanation = explanation.filter((line) => !line.commercial || seesCost);

  return {
    ...rest,
    explanation: visibleExplanation,
    ...(seesCost ? { breakdown } : {}),
    selling: seesCost ? { ...customerSafeSelling, cost, markup } : customerSafeSelling,
    ...(seesMargin ? { margin } : {}),
    costRedacted: !seesCost,
    marginRedacted: !seesMargin,
  };
}

/**
 * The strictest view: what may be sent to a customer or rendered in a public
 * page. Takes no actor, because a customer is not an authenticated role and
 * must never be able to reach the cost side through one.
 */
export function toCustomerFacingQuote(quote: PriceQuote): PriceQuoteView {
  // Delegates to the one redaction path rather than repeating the field list:
  // `customer` is a real Payload role with no pricing visibility on either axis,
  // so this cannot drift from `redactQuote` the way a second copy would.
  return redactQuote(quote, { role: "customer" });
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type PricingSummary = {
  live: boolean;
  /** Markup rules configured. Zero until the founder supplies them. */
  rulesConfigured: number;
  /** Rate sheets available to price against. Zero while M4 is live:false. */
  rateSheetsAvailable: number;
  quotesComputed: number;
  gstEnabled: boolean;
};

export function emptyPricingSummary(live = false): PricingSummary {
  return {
    live,
    rulesConfigured: 0,
    rateSheetsAvailable: 0,
    quotesComputed: 0,
    gstEnabled: false,
  };
}
