import type { PackageCard } from "@/data/home";

/**
 * Indicative quote builder. Pure and deterministic.
 *
 * Uses ONLY existing package data (`priceFrom`, "starting from" per person) — it
 * invents no pricing or tax rules. Every traveller is costed at the published
 * "from" per-person rate; the final quote is confirmed by the team (child
 * pricing, seasonal rates, room-sharing all vary and are not guessed here).
 *
 * GST is shown as an explicit PENDING line (0 today) because GST registration is
 * in progress — so the tax step already exists in the UI and just gets a rate
 * when registration completes.
 */

export type QuoteLine = {
  label: string;
  qty: number;
  unitPrice: number;
  amount: number;
};

export type QuoteTax = {
  label: string;
  amount: number;
  pending?: boolean;
};

export type Quote = {
  currency: "INR";
  perPersonFrom: number;
  priceUnit: string;
  lines: QuoteLine[];
  subtotal: number;
  taxes: QuoteTax[];
  total: number;
  /** Always true — this is an estimate, never a final invoice. */
  indicative: true;
};

export type QuotePackage = Pick<PackageCard, "priceFrom" | "priceUnit"> & {
  title?: string;
};

export function buildQuote(
  pkg: QuotePackage,
  adults: number,
  children: number,
): Quote {
  const unit = pkg.priceFrom;
  const a = Math.max(0, Math.floor(adults));
  const c = Math.max(0, Math.floor(children));

  const lines: QuoteLine[] = [];
  if (a > 0) {
    lines.push({ label: "Adults", qty: a, unitPrice: unit, amount: unit * a });
  }
  if (c > 0) {
    // Costed at the same "from" rate — real child pricing is set by the team.
    lines.push({ label: "Children", qty: c, unitPrice: unit, amount: unit * c });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  const taxes: QuoteTax[] = [
    // Rate applied once GST registration completes; 0 and flagged until then.
    { label: "GST (added after registration)", amount: 0, pending: true },
  ];

  const total = subtotal + taxes.reduce((sum, t) => sum + t.amount, 0);

  return {
    currency: "INR",
    perPersonFrom: unit,
    priceUnit: pkg.priceUnit,
    lines,
    subtotal,
    taxes,
    total,
    indicative: true,
  };
}
