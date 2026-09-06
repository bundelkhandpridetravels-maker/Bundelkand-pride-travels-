/**
 * DMC offer validation and the activation gate. Pure — no I/O, explicit `now`.
 *
 * These checks are about the INTEGRITY of what the supplier sent, never about
 * whether a price is "reasonable". The platform has no opinion on what a Manali
 * package should cost; judging that is the operations team's job, and encoding a
 * rule here would be inventing commercial policy. Same discipline as M4.
 *
 * THE SPLIT, AND WHY IT MATTERS HERE
 * ERRORS mean the record is not a coherent offer — it could not be acted on
 * whatever the business rules turn out to be, and it blocks activation.
 * WARNINGS are things a person should look at and NEVER block: an offer is
 * evidence of what a supplier said, and refusing to record an incomplete one
 * loses the commercial memory this milestone exists to keep.
 */
import { isInForce } from "@/lib/contracts/lifecycle";
import type { ContractRecord } from "@/lib/contracts/model";
import {
  declaredPaxBandIds,
  isComponentKindValue,
  isOfferBasis,
  isOfferCoverage,
  isOfferLapsed,
  isOfferPriceUnit,
  isOfferRecurrence,
  isRateOfferingValue,
  isUnboundQuotation,
  offerLineOffering,
  reconcileComponents,
  TERM_STATUS,
  type DmcOffer,
} from "@/lib/dmc/model";

export type OfferIssueSeverity = "error" | "warning";

export type OfferIssue = {
  severity: OfferIssueSeverity;
  /** Stable key so a surface can group or filter without parsing text. */
  code: string;
  message: string;
};

export type OfferValidationResult = {
  ok: boolean;
  errors: OfferIssue[];
  warnings: OfferIssue[];
};

/** Inclusive window check in UTC, so a timezone cannot shift a boundary day. */
function isValidWindow(from: string, to: string): boolean {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return end >= start;
}

const isWholeNonNegative = (value: number): boolean =>
  Number.isInteger(value) && value >= 0;

/**
 * Validate one offer.
 *
 * Runtime vocabulary guards are deliberate even though the types already require
 * these fields: a record arriving from JSON, a form or a future repository is
 * not type-checked, and a discriminator that must never be guessed must not be
 * assumed present either.
 */
export function validateOffer(
  offer: DmcOffer,
  now: Date = new Date(),
): OfferValidationResult {
  const errors: OfferIssue[] = [];
  const warnings: OfferIssue[] = [];

  const error = (code: string, message: string) =>
    errors.push({ severity: "error", code, message });
  const warn = (code: string, message: string) =>
    warnings.push({ severity: "warning", code, message });

  /* ── Identity ─────────────────────────────────────────────────────── */
  if (!offer.id?.trim()) {
    error("id_missing", "The offer has no id, so it cannot be referenced or superseded.");
  }
  if (!offer.dmcId?.trim()) {
    error("dmc_missing", "No DMC is recorded. An offer with no partner behind it cannot be used.");
  }
  if (!offer.quoterVendorId?.trim()) {
    error(
      "quoter_missing",
      "No quoting supplier is recorded. Without it, nothing can say who gave BPT this price.",
    );
  }
  if (!offer.title?.trim()) {
    error("title_missing", "The offer has no title, so it cannot be identified by a person.");
  }

  /* ── Classification ───────────────────────────────────────────────── */
  // Absent or unrecognised is UNKNOWN and blocks. It is never read as
  // "contracted" — a default here would make an uncaptured quotation reusable.
  if (!isOfferBasis(offer.basis)) {
    error(
      "basis_invalid",
      "The offer does not say whether it is a contracted offer or a request-specific quotation. Reusability must never be assumed.",
    );
  }
  if (!isOfferRecurrence(offer.recurrence)) {
    error(
      "recurrence_invalid",
      "The offer does not say whether it applies on stated dates or throughout its validity.",
    );
  }
  // A one-off answer to one request cannot also be a repeating departure.
  if (offer.basis === "quoted" && offer.recurrence === "recurring") {
    error(
      "quoted_recurring",
      "A request-specific quotation cannot be recurring — it answers one request, which does not repeat.",
    );
  }

  /* ── Validity ─────────────────────────────────────────────────────── */
  if (!offer.validFrom || !offer.validTo) {
    error(
      "validity_missing",
      "Validity period is missing — the offer cannot expire or be checked against a travel date without it.",
    );
  } else if (!isValidWindow(offer.validFrom, offer.validTo)) {
    error("validity_invalid", "Validity period ends before it starts, or the dates are unusable.");
  }

  /* ── Money ────────────────────────────────────────────────────────── */
  if (!offer.currency?.trim()) {
    error(
      "currency_missing",
      "No currency recorded — an amount without a currency cannot be quoted or compared.",
    );
  }
  // Mirrors M4's `rate_unit_unknown`: an amount whose unit nobody declared
  // cannot be multiplied by a head count. Absent is UNKNOWN, never "person".
  if (!isOfferPriceUnit(offer.priceUnit)) {
    error(
      "price_unit_unknown",
      "No price unit recorded — whether one amount covers one traveller or the whole group is unknown, so it cannot be priced.",
    );
  }

  /* ── Pax bands ────────────────────────────────────────────────────── */
  const bandIds = declaredPaxBandIds(offer);
  if (bandIds.size !== offer.paxBands.length) {
    error(
      "pax_band_duplicate",
      "Two group-size bands share an id, so a price line cannot say which one it means.",
    );
  }
  for (const band of offer.paxBands) {
    if (!band.label?.trim()) {
      error("pax_band_unlabelled", `Group-size band "${band.id}" has no label from the supplier.`);
    }
    if (band.minPax !== undefined && !isWholeNonNegative(band.minPax)) {
      error("pax_band_bounds_invalid", `Band "${band.label || band.id}" has a non-whole minimum.`);
    }
    if (band.maxPax !== undefined && !isWholeNonNegative(band.maxPax)) {
      error("pax_band_bounds_invalid", `Band "${band.label || band.id}" has a non-whole maximum.`);
    }
    if (
      band.minPax !== undefined &&
      band.maxPax !== undefined &&
      band.maxPax < band.minPax
    ) {
      error("pax_band_bounds_invalid", `Band "${band.label || band.id}" ends below where it starts.`);
    }
  }

  /* ── Price lines ──────────────────────────────────────────────────── */
  if (offer.priceLines.length === 0) {
    error("no_price_lines", "The offer carries no prices, so there is nothing to quote from.");
  }

  const lineKeys = new Set<string>();
  for (const line of offer.priceLines) {
    // The band gate. Identical in mechanism and refusal to M4's `seasonId`: a
    // line pointing at a band this offer never declared is unidentifiable, and
    // no platform-wide registry can supply one because bands are per-offer.
    if (!bandIds.has(line.paxBandRef)) {
      error(
        "pax_band_unknown",
        `A price line references group-size band "${line.paxBandRef}", which this offer does not declare.`,
      );
    }
    if (!line.sharingTierLabel?.trim()) {
      error(
        "sharing_tier_missing",
        "A price line records no sharing arrangement, so it cannot be told apart from another line.",
      );
    }
    if (line.offering !== undefined && !isRateOfferingValue(line.offering)) {
      error("offering_invalid", "A price line carries an unrecognised offering state.");
    }
    // Mirrors M4 exactly: two rows differing only by offering are still the same
    // row priced twice, so the key deliberately excludes it.
    const key = `${line.paxBandRef}::${line.sharingTierLabel.trim().toLowerCase()}`;
    if (lineKeys.has(key)) {
      error(
        "duplicate_price_lines",
        `Two price lines cover the same band and sharing arrangement ("${line.sharingTierLabel}"), so which one applies is ambiguous.`,
      );
    }
    lineKeys.add(key);

    // An amount contradicts a declaration that there is no price. Same check,
    // and same reasoning, as M4's `offering_amount_conflict`.
    if (
      line.amount !== undefined &&
      line.offering !== undefined &&
      line.offering !== "PRICED"
    ) {
      error(
        "offering_amount_conflict",
        `A price line carries an amount while stating "${line.offering}". Those cannot both be true.`,
      );
    }
    if (line.amount !== undefined && !Number.isFinite(line.amount)) {
      error("amount_invalid", "A price line carries an amount that is not a usable number.");
    }
  }

  // A row is only faulty for missing an amount if it CLAIMS to be priced. A row
  // the supplier marked "on request" has no amount because there is none to
  // have — treating that as a fault made one honest row invalidate the offer.
  const claimedButUnpriced = offer.priceLines.filter(
    (l) => l.amount === undefined && offerLineOffering(l) === "PRICED",
  );
  if (claimedButUnpriced.length > 0) {
    warn(
      "amounts_uncaptured",
      `${claimedButUnpriced.length} price line(s) have no amount captured yet.`,
    );
  }

  /* ── Components ───────────────────────────────────────────────────── */
  for (const component of offer.components) {
    if (!isComponentKindValue(component.kind)) {
      error("component_kind_invalid", `Component "${component.label}" has an unrecognised kind.`);
    }
    if (!component.performerRef?.trim()) {
      // Without this, a breakdown row is just a number attached to a category,
      // and nothing downstream can tell an intermediary's price from a direct one.
      error(
        "component_performer_missing",
        `Component "${component.label}" does not say who will actually deliver it.`,
      );
    }
    if (component.amount !== undefined && !Number.isFinite(component.amount)) {
      error("amount_invalid", `Component "${component.label}" carries an unusable amount.`);
    }
  }

  const reconciliation = reconcileComponents(offer);
  if (reconciliation.agrees === false) {
    // A WARNING, deliberately, and it names no figures. Real breakdowns often
    // fail to sum through rounding or undisclosed operational margin. Blocking
    // would lose the evidence; reconciling silently would invent a number;
    // stating the gap would leak a founder-only amount past redaction.
    warn(
      "components_do_not_reconcile",
      "The stated components do not add up to the stated total. Both are recorded as received — confirm which figure governs.",
    );
  }

  /* ── Coverage, inclusions, terms ──────────────────────────────────── */
  for (const coverage of offer.claimedCoverage) {
    if (!isOfferCoverage(coverage)) {
      error("coverage_invalid", `The offer claims an unrecognised coverage value "${coverage}".`);
    }
  }
  for (const inclusion of offer.namedInclusions) {
    if (!inclusion.supplierRef?.trim()) {
      error(
        "inclusion_ref_missing",
        "A named inclusion records nothing the supplier actually wrote, so there is no evidence behind it.",
      );
    }
  }
  const unresolved = offer.namedInclusions.filter((i) => !i.resolvedHotelId);
  if (unresolved.length > 0) {
    // Deliberately NOT an error. A DMC's package routinely names hotels BPT has
    // no record of, and demanding a match would either block the offer or push
    // someone to create property records for hotels BPT does not supply.
    warn(
      "inclusions_unresolved",
      `${unresolved.length} named inclusion(s) have not been matched to a BPT property. They remain disclosure only.`,
    );
  }
  for (const term of offer.requestedTerms) {
    if (term.status !== TERM_STATUS) {
      error(
        "term_status_invalid",
        `A recorded term does not carry the "${TERM_STATUS}" marker. A supplier's request must never be storable as an agreement.`,
      );
    }
    if (!term.text?.trim()) {
      error("term_text_missing", "A recorded term has no text from the supplier.");
    }
  }

  /* ── Evidence and links ───────────────────────────────────────────── */
  if (offer.documentRefs.length === 0) {
    warn(
      "no_documents",
      "No supplier document is attached. The original is the evidence a later dispute is settled against.",
    );
  }
  if (offer.basis === "contracted" && !offer.contractId?.trim()) {
    // A warning here and a refusal at the gate: recording a prospective
    // partner's standing offer must stay possible; USING it must not.
    warn(
      "contract_missing",
      "This is a contracted offer with no agreement recorded. It can be kept as evidence but cannot be activated.",
    );
  }
  if (isUnboundQuotation(offer)) {
    warn(
      "unbound_quotation",
      "This quotation records no request. It is readable evidence and can never be activated, because nothing can prove which trip it was created for.",
    );
  }

  /* ── Conditions ───────────────────────────────────────────────────── */
  const conditioned = offer.priceLines.filter((l) => l.conditions?.trim());
  if (conditioned.length > 0 && !offer.conditionsReviewed) {
    warn(
      "conditions_unreviewed",
      `${conditioned.length} price line(s) carry supplier conditions nobody has read yet.`,
    );
  }

  /* ── Lapse ────────────────────────────────────────────────────────── */
  if (offer.status === "active" && isOfferLapsed(offer, now)) {
    warn(
      "lapsed_but_active",
      "The offer is marked active but its validity has passed. It can still be read; it can no longer be used.",
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

/* ------------------------------------------------------------------ *
 * Activation gate
 * ------------------------------------------------------------------ */

export type OfferActivationResult =
  | { ok: true; status: "active"; humanApproval: true }
  | { ok: false; error: string };

/**
 * Approving an offer for use is a commercial decision — it determines what
 * customers can be quoted — so it requires a human approver and a clean
 * validation pass (security-architecture §12, the same gate M2, M3 and M4 apply).
 *
 * ⚠️ WHAT ACTIVATION MEANS DEPENDS ON THE BASIS, AND THAT IS DELIBERATE.
 * Activating a `contracted` offer makes it usable for any matching trip inside
 * its validity. Activating a `quoted` offer makes it usable for ONE request and
 * nothing else. `offerUsability` enforces the difference at the point of use;
 * this gate enforces that the difference is even askable.
 *
 * ⚠️ THE CONTRACT IS PASSED IN, AND IT IS REQUIRED, NOT OPTIONAL.
 * The offer holds a `contractId` — a string. Resolving it would mean a
 * repository read inside a pure function, which this module does not do, so the
 * caller supplies the record. It is REQUIRED rather than optional for a
 * contracted offer because M8's audit established exactly this failure mode:
 * when a module gains a dimension that must not be omitted, making it optional
 * moves the failure silently to the caller. An absent contract refuses.
 *
 * `isInForce` remains the authoritative contract-lifecycle predicate; nothing
 * here re-implements it.
 *
 * ⚠️ NOTHING IS STORED, AND NO APPROVAL HISTORY IS CLAIMED. `approvedBy` is used
 * to decide and then discarded — the same shape as `activateRateSheet`. The
 * platform has no audit log, so a stored approver would be an unverifiable,
 * deletable record that LOOKS like proof. Enforcing the requirement without
 * fabricating the history is the honest position, not a shortcut.
 *
 * `approvedBy` must never be supplied by an automated caller to satisfy the gate.
 */
export function activateOffer(
  offer: DmcOffer,
  options: { approvedBy?: string; contract?: ContractRecord; now?: Date } = {},
): OfferActivationResult {
  const now = options.now ?? new Date();

  if (offer.status === "active") return { ok: false, error: "Offer is already active." };
  if (offer.status === "superseded") {
    return { ok: false, error: "A superseded offer cannot be reactivated." };
  }
  if (offer.status === "expired" || isOfferLapsed(offer, now)) {
    return {
      ok: false,
      error:
        "The offer's validity has passed. Activating it would put a withdrawn price in front of a customer.",
    };
  }

  // BASIS GATE. A quotation with no recorded request cannot be scoped to
  // anything, so activating it would create a price applicable to everything —
  // the exact opposite of what a one-off quotation means.
  if (offer.basis === "quoted" && isUnboundQuotation(offer)) {
    return {
      ok: false,
      error:
        "This quotation records no request. It stays readable evidence: nothing can prove which trip it was created for, so it cannot be activated.",
    };
  }

  // CONTRACT GATE. Only for a contracted offer — a one-off quotation may
  // legitimately arrive from a partner BPT has not yet signed.
  if (offer.basis === "contracted") {
    if (!offer.contractId?.trim()) {
      return {
        ok: false,
        error:
          "This contracted offer records no agreement. Record the contract before activating — a standing price implies terms somebody signed.",
      };
    }
    if (!options.contract) {
      return {
        ok: false,
        error:
          "The contract record was not supplied, so whether the agreement is in force could not be checked. Activation refuses rather than assuming it is.",
      };
    }
    if (options.contract.id !== offer.contractId) {
      return {
        ok: false,
        error:
          "The contract supplied is not the one this offer references. Checking the wrong agreement is worse than checking none.",
      };
    }
    if (!isInForce(options.contract, now)) {
      return {
        ok: false,
        error:
          "The agreement behind this offer is not in force. Quoting from it would sell on terms that are not currently agreed.",
      };
    }
  }

  // CONDITIONS GATE. Suppliers write real restrictions as prose — "not valid
  // over festive dates" — and nothing in this module reads prose. An offer
  // carrying such a statement can otherwise go active and price the excluded
  // case at full confidence, which is a wrong number handed to a customer.
  //
  // The gate asks only that a human has READ the text. It deliberately does not
  // parse it, extract dates, or claim the conditions are satisfied.
  const conditioned = offer.priceLines.filter((l) => l.conditions?.trim());
  if (conditioned.length > 0 && !offer.conditionsReviewed) {
    return {
      ok: false,
      error: `${conditioned.length} price line(s) carry supplier conditions that nobody has reviewed. Read them before activating — they may exclude cases this offer would otherwise price.`,
    };
  }

  const approver = options.approvedBy?.trim();
  if (!approver) {
    return {
      ok: false,
      error: "Activating a DMC offer determines what customers can be quoted and requires human approval.",
    };
  }

  const { ok, errors } = validateOffer(offer, now);
  if (!ok) {
    return { ok: false, error: `Resolve ${errors.length} validation error(s) first.` };
  }

  return { ok: true, status: "active", humanApproval: true };
}

/* ------------------------------------------------------------------ *
 * Supersession
 * ------------------------------------------------------------------ */

/**
 * May `replacement` supersede `existing`?
 *
 * ⚠️ SCOPED BY QUOTER, BASIS AND SCOPE — never by recency alone. Three DMCs
 * quoting the same destination are COMPETING offers that must coexist
 * permanently and remain individually traceable; a newer offer from DMC A must
 * never displace DMC B's. And a contracted offer is a different instrument from
 * a quotation, so neither supersedes the other.
 *
 * "Scope" is the request for a quotation, and the destination for a contracted
 * offer — the thing the two offers are alternatives FOR.
 *
 * ⚠️ SUPERSESSION IS A DECISION; EXPIRY IS A FACT. Expiry follows from the
 * calendar and needs no approval, which is why M3 excludes `expired` from its
 * human-approval list. This is the other case, and it is a human's to make.
 */
export function canSupersede(existing: DmcOffer, replacement: DmcOffer): boolean {
  if (existing.id === replacement.id) return false;
  if (existing.quoterVendorId !== replacement.quoterVendorId) return false;
  if (existing.basis !== replacement.basis) return false;

  if (existing.basis === "quoted") {
    // Both must name the same request, and an unbound quotation supersedes
    // nothing — there is no scope to replace.
    if (!existing.inquiryId || !replacement.inquiryId) return false;
    return existing.inquiryId === replacement.inquiryId;
  }

  if (!existing.destinationId || !replacement.destinationId) return false;
  return existing.destinationId === replacement.destinationId;
}
