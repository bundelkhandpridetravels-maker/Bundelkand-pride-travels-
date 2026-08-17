/**
 * Canonical money. Integer minor units, explicit currency, no floating-point
 * arithmetic anywhere in the calculation path. Pure — no I/O.
 *
 * WHY THIS EXISTS:
 * the platform currently carries five different money representations — a bare
 * `number` of rupees, Payload's `{amount, currency}` group, a hardcoded
 * `currency: "INR"` literal, M4's optional-currency rate lines, and a formatted
 * STRING (`"₹8,999 /person"`) on the departures board. Every one of them is a
 * float, and none of them agrees with the others about whether a currency is
 * even required.
 *
 * That is survivable while the only arithmetic is `unitPrice × quantity` on
 * whole rupees. It stops being survivable the moment a percentage markup or a
 * tax rate is applied: 0.1 + 0.2 !== 0.3 in IEEE-754, and a pricing engine that
 * accumulates fractions of a paise produces invoices that do not reconcile.
 *
 * So the canonical type stores an INTEGER number of minor units (paise for INR)
 * and carries its currency with it. A `Money` cannot exist without a currency,
 * and two `Money` values in different currencies cannot be added — the compiler
 * cannot stop that, so the arithmetic returns an explicit failure instead.
 *
 * SCOPE NOTE: this milestone does NOT rewrite the legacy paths. `buildQuote()`,
 * `data/home.ts` and `departures.ts` are untouched; adapters below convert at
 * the boundary so the new engine is exact without a disruptive migration of
 * customer-facing code.
 */

/* ------------------------------------------------------------------ *
 * Currency
 * ------------------------------------------------------------------ */

/**
 * Mirrors the currency enum the database already uses (`enum_*_currency`, five
 * values, created by src/migrations/20260812_194805_initial.ts). Declared here
 * rather than imported from the CRM mapping layer so that pricing does not
 * depend on CRM; a test asserts the two lists stay identical.
 */
export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

/**
 * Minor units per major unit. All five currencies are two-decimal, but the map
 * is explicit so a zero-decimal currency (JPY) or three-decimal (KWD) can be
 * added later without hunting for a hardcoded 100.
 */
export const MINOR_UNITS_PER_MAJOR: Record<Currency, number> = {
  INR: 100,
  USD: 100,
  EUR: 100,
  GBP: 100,
  AED: 100,
};

/* ------------------------------------------------------------------ *
 * The type
 * ------------------------------------------------------------------ */

/** An exact amount of money. `amountMinor` is always an integer. */
export type Money = {
  readonly amountMinor: number;
  readonly currency: Currency;
};

export type MoneyErrorCode =
  | "not_an_integer"
  | "not_finite"
  | "unsafe_magnitude"
  | "unknown_currency"
  | "missing_currency"
  | "currency_mismatch"
  | "negative_not_allowed"
  | "invalid_quantity"
  | "invalid_rate";

export type MoneyResult<T> = { ok: true; value: T } | { ok: false; code: MoneyErrorCode; error: string };

const fail = (code: MoneyErrorCode, error: string): { ok: false; code: MoneyErrorCode; error: string } => ({
  ok: false,
  code,
  error,
});
const succeed = <T>(value: T): { ok: true; value: T } => ({ ok: true, value });

/* ------------------------------------------------------------------ *
 * Rounding
 * ------------------------------------------------------------------ */

/**
 * THE ROUNDING POLICY — half-up, away from zero, applied ONCE at each
 * calculation boundary.
 *
 *   1.5 →  2      2.5 →  3      -1.5 → -2      -2.5 → -3
 *
 * Half-up is the convention Indian commercial invoicing uses, and "away from
 * zero" keeps a refund the exact mirror of the charge it reverses — banker's
 * rounding would make some refunds a paise short of what was taken.
 *
 * "Once at each boundary" is the part that matters: a rounded value is never
 * fed back into another rounding step within the same operation, so error
 * cannot compound. Multiplication rounds once; percentage application rounds
 * once; allocation distributes the remainder rather than rounding each share.
 */
export const ROUNDING_POLICY = "half_up_away_from_zero" as const;
export type RoundingPolicy = typeof ROUNDING_POLICY;

export function roundHalfUp(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/* ------------------------------------------------------------------ *
 * Construction
 * ------------------------------------------------------------------ */

/** Build a Money from integer minor units. Rejects anything that is not exact. */
export function money(amountMinor: number, currency: string): MoneyResult<Money> {
  if (!currency) return fail("missing_currency", "Currency is required — it is never assumed.");
  if (!isCurrency(currency)) {
    return fail("unknown_currency", `Currency '${currency}' is not supported.`);
  }
  if (!Number.isFinite(amountMinor)) {
    return fail("not_finite", "Amount must be a finite number.");
  }
  if (!Number.isInteger(amountMinor)) {
    return fail(
      "not_an_integer",
      `Amount must be an integer number of minor units; received ${amountMinor}. Use fromMajor() to convert.`,
    );
  }
  if (!Number.isSafeInteger(amountMinor)) {
    return fail("unsafe_magnitude", "Amount exceeds the exact-integer range.");
  }
  return succeed({ amountMinor, currency });
}

/**
 * Convert a major-unit amount (rupees) into exact minor units.
 *
 * This is the ONLY place a float legitimately enters, because the legacy
 * representations are floats. It rounds once, immediately, so everything
 * downstream is exact.
 */
export function fromMajor(amountMajor: number, currency: string): MoneyResult<Money> {
  if (!currency) return fail("missing_currency", "Currency is required — it is never assumed.");
  if (!isCurrency(currency)) {
    return fail("unknown_currency", `Currency '${currency}' is not supported.`);
  }
  if (!Number.isFinite(amountMajor)) {
    return fail("not_finite", "Amount must be a finite number.");
  }
  const factor = MINOR_UNITS_PER_MAJOR[currency];
  return money(roundHalfUp(amountMajor * factor), currency);
}

export function zero(currency: Currency): Money {
  return { amountMinor: 0, currency };
}

/* ------------------------------------------------------------------ *
 * Arithmetic — every operation that can disagree returns a result
 * ------------------------------------------------------------------ */

function sameCurrency(a: Money, b: Money): boolean {
  return a.currency === b.currency;
}

export function add(a: Money, b: Money): MoneyResult<Money> {
  if (!sameCurrency(a, b)) {
    return fail("currency_mismatch", `Cannot add ${a.currency} to ${b.currency}.`);
  }
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtract(a: Money, b: Money): MoneyResult<Money> {
  if (!sameCurrency(a, b)) {
    return fail("currency_mismatch", `Cannot subtract ${b.currency} from ${a.currency}.`);
  }
  return money(a.amountMinor - b.amountMinor, a.currency);
}

/** Sum a list. An empty list has no currency of its own, so one must be given. */
export function sum(values: Money[], currency: Currency): MoneyResult<Money> {
  let total = zero(currency);
  for (const value of values) {
    const next = add(total, value);
    if (!next.ok) return next;
    total = next.value;
  }
  return succeed(total);
}

/** Multiply by a whole quantity. Exact — no rounding is needed or performed. */
export function multiply(value: Money, quantity: number): MoneyResult<Money> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return fail("invalid_quantity", "Quantity must be a non-negative whole number.");
  }
  const product = value.amountMinor * quantity;
  if (!Number.isSafeInteger(product)) {
    return fail("unsafe_magnitude", "Result exceeds the exact-integer range.");
  }
  return money(product, value.currency);
}

/**
 * Percentages are carried as BASIS POINTS (integer hundredths of a percent), so
 * a rate is never itself a float: 18% is 1800, 12.5% is 1250. Rounds once.
 */
export function applyBasisPoints(value: Money, basisPoints: number): MoneyResult<Money> {
  if (!Number.isInteger(basisPoints)) {
    return fail("invalid_rate", "A rate must be whole basis points (1% = 100).");
  }
  const product = value.amountMinor * basisPoints;
  if (!Number.isSafeInteger(product)) {
    return fail("unsafe_magnitude", "Result exceeds the exact-integer range.");
  }
  return money(roundHalfUp(product / 10_000), value.currency);
}

/**
 * Split an amount across weights without losing or inventing a single minor
 * unit. Remainders go to the earliest shares (largest-remainder), so the parts
 * always sum back to the whole — the property naive per-line rounding breaks.
 */
export function allocate(value: Money, weights: number[]): MoneyResult<Money[]> {
  if (weights.length === 0 || weights.some((w) => !Number.isFinite(w) || w < 0)) {
    return fail("invalid_quantity", "Weights must be a non-empty list of non-negative numbers.");
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) {
    return fail("invalid_quantity", "Weights must sum to more than zero.");
  }

  const shares = weights.map((w) => Math.floor((value.amountMinor * w) / totalWeight));
  let remainder = value.amountMinor - shares.reduce((a, b) => a + b, 0);
  for (let i = 0; remainder > 0 && i < shares.length; i++, remainder--) shares[i] += 1;

  const out: Money[] = [];
  for (const share of shares) {
    const m = money(share, value.currency);
    if (!m.ok) return m;
    out.push(m.value);
  }
  return succeed(out);
}

/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */

export function equals(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.amountMinor === b.amountMinor;
}

/** -1 | 0 | 1, or a failure when the currencies differ. */
export function compare(a: Money, b: Money): MoneyResult<number> {
  if (!sameCurrency(a, b)) {
    return fail("currency_mismatch", `Cannot compare ${a.currency} with ${b.currency}.`);
  }
  return succeed(a.amountMinor === b.amountMinor ? 0 : a.amountMinor < b.amountMinor ? -1 : 1);
}

export const isZero = (value: Money): boolean => value.amountMinor === 0;
export const isNegative = (value: Money): boolean => value.amountMinor < 0;
export const isPositive = (value: Money): boolean => value.amountMinor > 0;

/**
 * Ratio of `part` to `whole`, in basis points. Used for margin percentages, so
 * the percentage itself stays an integer rather than a float.
 */
export function ratioBasisPoints(part: Money, whole: Money): MoneyResult<number> {
  if (!sameCurrency(part, whole)) {
    return fail("currency_mismatch", `Cannot compare ${part.currency} with ${whole.currency}.`);
  }
  if (whole.amountMinor === 0) {
    return fail("invalid_rate", "Cannot express a ratio of zero.");
  }
  return succeed(roundHalfUp((part.amountMinor * 10_000) / whole.amountMinor));
}

/* ------------------------------------------------------------------ *
 * Adapters — the boundary with the five legacy representations
 * ------------------------------------------------------------------ */

/** Payload's `moneyGroup` shape: a MAJOR-unit number plus a currency. */
export type PayloadMoney = { amount: number; currency: string };

export function fromPayloadMoney(value: PayloadMoney): MoneyResult<Money> {
  return fromMajor(value.amount, value.currency);
}

/**
 * Back to the database shape. Returns MAJOR units, because that is what the
 * column stores — exactness is preserved on the way in, not on the way out, so
 * this is a write-boundary conversion and not a round-trip guarantee.
 */
export function toPayloadMoney(value: Money): PayloadMoney {
  return {
    amount: value.amountMinor / MINOR_UNITS_PER_MAJOR[value.currency],
    currency: value.currency,
  };
}

/**
 * A legacy bare number of rupees (`priceFrom`, `quoteTotal`, `CrmLead.value`).
 * The currency must be supplied by the caller — the legacy value does not carry
 * one, and assuming INR is exactly the habit this module exists to end.
 */
export function fromLegacyAmount(amountMajor: number, currency: string): MoneyResult<Money> {
  return fromMajor(amountMajor, currency);
}

/** For handing a value to legacy display code. Lossy below one minor unit. */
export function toMajorNumber(value: Money): number {
  return value.amountMinor / MINOR_UNITS_PER_MAJOR[value.currency];
}

/**
 * An M4 rate line. `RateLine.amount` is an optional major-unit number and
 * `RateSheet.currency` is an optional free-text string, so both absences are
 * real and both are refused rather than defaulted.
 */
export function fromRateLineAmount(
  amountMajor: number | undefined,
  currency: string | undefined,
): MoneyResult<Money> {
  if (amountMajor === undefined) {
    return fail("not_finite", "Rate line has no amount recorded.");
  }
  if (!currency) {
    return fail("missing_currency", "Rate sheet has no currency — an amount without one cannot be priced.");
  }
  return fromMajor(amountMajor, currency);
}

/* ------------------------------------------------------------------ *
 * Display
 * ------------------------------------------------------------------ */

/**
 * Formatting only — never feed this back into a calculation.
 *
 * Note the existing `lib/format.ts formatINR` uses `maximumFractionDigits: 0`,
 * which rounds at DISPLAY time and can therefore show a different figure from
 * the exact stored amount. This formatter shows the true minor units.
 */
export function formatMoney(value: Money, locale = "en-IN"): string {
  const factor = MINOR_UNITS_PER_MAJOR[value.currency];
  const digits = String(factor).length - 1;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value.amountMinor / factor);
}

/** Basis points as a human string: 1800 → "18%". Display only. */
export function formatBasisPoints(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(basisPoints % 100 === 0 ? 0 : 2)}%`;
}
