/**
 * Tax STRUCTURE only. Pure, no I/O, and deliberately incapable of charging
 * anyone anything.
 *
 * ⚠️ GST IS NOT ACTIVE AND NO RATE EXISTS HERE.
 *
 * GST registration is still in progress (founder decision, Phase 3), so this
 * module declares the SHAPE Indian GST needs — place of supply, the intra-state
 * CGST+SGST split versus inter-state IGST, inclusive versus exclusive treatment
 * — without inventing a single percentage. `GST_RATE_BASIS_POINTS` is `null` on
 * purpose: a tax rate is a statutory fact about a specific service category, and
 * guessing one would put a wrong number on a customer invoice.
 *
 * What IS encoded here is statutory STRUCTURE, not business data: which tax
 * heads apply to an intra-state versus an inter-state supply is law, not a
 * commercial decision. Encoding the structure now means that when registration
 * completes, the only change is supplying rates — not redesigning the quote.
 *
 * The existing customer quote already renders a zero, explicitly-pending GST
 * line (`lib/booking/quote.ts`), and this module keeps that behaviour: tax is
 * computed as zero and flagged pending until it is switched on deliberately.
 */
import { type Currency, type Money, zero } from "@/lib/pricing/money";

/** Master switch. Flipping this alone does nothing — rates must also be supplied. */
export const GST_ENABLED = false;

/**
 * Deliberately null. A rate arrives with registration and per-category
 * classification; it is never a default.
 */
export const GST_RATE_BASIS_POINTS: number | null = null;

export const GST_STATUS_NOTE =
  "GST is not active. Registration is in progress; no rate is configured and no tax is charged.";

/* ------------------------------------------------------------------ *
 * Place of supply
 * ------------------------------------------------------------------ */

/**
 * Where a supply is deemed to take place. For Indian GST this decides whether
 * the tax splits into CGST+SGST or is levied as a single IGST — so it is part
 * of the structure, not an optional extra.
 *
 * State codes are left as free text: the GST state-code list is reference data
 * the founder supplies, and inventing a partial list here would be worse than
 * carrying the supplier's own value.
 */
export type PlaceOfSupply = {
  /** ISO country code, e.g. "IN". */
  countryCode: string;
  /** State/UT code as used on GST documents. Absent when not yet known. */
  stateCode?: string;
};

export const TAX_TREATMENTS = ["intra_state", "inter_state", "export", "unknown"] as const;
export type TaxTreatment = (typeof TAX_TREATMENTS)[number];

export const TAX_TREATMENT_LABELS: Record<TaxTreatment, string> = {
  intra_state: "Intra-state (CGST + SGST)",
  inter_state: "Inter-state (IGST)",
  export: "Export of service",
  unknown: "Undetermined",
};

/**
 * Classify a supply. Returns `unknown` rather than guessing whenever either
 * side's location is incomplete — an undetermined treatment is a visible gap,
 * a wrongly assumed one is a silent compliance error.
 */
export function determineTaxTreatment(
  supplier: PlaceOfSupply | undefined,
  customer: PlaceOfSupply | undefined,
): TaxTreatment {
  if (!supplier?.countryCode || !customer?.countryCode) return "unknown";
  if (supplier.countryCode !== customer.countryCode) return "export";
  if (!supplier.stateCode || !customer.stateCode) return "unknown";
  return supplier.stateCode === customer.stateCode ? "intra_state" : "inter_state";
}

/** The tax heads a treatment uses. Structure only — no rates attached. */
export function taxHeadsFor(treatment: TaxTreatment): TaxHead[] {
  switch (treatment) {
    case "intra_state":
      return ["CGST", "SGST"];
    case "inter_state":
      return ["IGST"];
    case "export":
    case "unknown":
      return [];
  }
}

/* ------------------------------------------------------------------ *
 * Tax components
 * ------------------------------------------------------------------ */

export const TAX_HEADS = ["CGST", "SGST", "IGST"] as const;
export type TaxHead = (typeof TAX_HEADS)[number];

export type TaxComponent = {
  head: TaxHead;
  /** Whole basis points. Null while no rate is configured. */
  basisPoints: number | null;
  amount: Money;
};

/**
 * Whether the quoted price already contains tax. The existing customer quote
 * adds GST after the subtotal, so the platform's treatment is EXCLUSIVE; this
 * records that as a decision rather than leaving it implicit in one function.
 */
export const TAX_INCLUSION = "exclusive" as const;
export type TaxInclusion = typeof TAX_INCLUSION | "inclusive";

export type TaxBreakdown = {
  enabled: boolean;
  inclusion: TaxInclusion;
  treatment: TaxTreatment;
  components: TaxComponent[];
  total: Money;
  /** Plain-language reason the total is what it is. Always populated. */
  note: string;
};

export type TaxContext = {
  supplier?: PlaceOfSupply;
  customer?: PlaceOfSupply;
};

/**
 * Compute tax on a base amount.
 *
 * While `GST_ENABLED` is false this always returns zero with the heads that
 * WOULD apply listed and their rates null — so a quote shows the correct tax
 * structure and an honest zero, exactly as the customer-facing quote does now.
 *
 * It never invents a rate. If GST is switched on without rates configured, the
 * total stays zero and the note says so, rather than silently charging nothing
 * while appearing active.
 */
export function computeTax(base: Money, context: TaxContext = {}): TaxBreakdown {
  const treatment = determineTaxTreatment(context.supplier, context.customer);
  const heads = taxHeadsFor(treatment);
  const currency: Currency = base.currency;

  const components: TaxComponent[] = heads.map((head) => ({
    head,
    basisPoints: GST_RATE_BASIS_POINTS,
    amount: zero(currency),
  }));

  const note = !GST_ENABLED
    ? GST_STATUS_NOTE
    : GST_RATE_BASIS_POINTS === null
      ? "GST is enabled but no rate is configured — no tax has been applied."
      : `Tax applied as ${TAX_TREATMENT_LABELS[treatment]}.`;

  return {
    enabled: GST_ENABLED,
    inclusion: TAX_INCLUSION,
    treatment,
    components,
    total: zero(currency),
    note,
  };
}

/** True when a quote's tax figure should not be relied on for invoicing. */
export function isTaxIndicative(breakdown: TaxBreakdown): boolean {
  return !breakdown.enabled || breakdown.components.some((c) => c.basisPoints === null);
}
