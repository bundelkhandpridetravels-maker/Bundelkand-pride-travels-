/**
 * Transport tariff validation and the activation gate. Pure. No I/O.
 *
 * Two jobs, deliberately separate:
 *
 *   validateTariff   is this capture STRUCTURALLY sound? Errors and warnings.
 *   activateTariff   may a human approve it for use? A single yes-or-refusal.
 *
 * The split matters because a tariff can be perfectly well-formed and still be
 * unusable — an unresolved operating area is not a malformed record, it is an
 * unanswered question, and answering it is human calibration rather than a
 * capture error. So the second gate refuses on things the first only warns
 * about.
 *
 * ⚠️ NOTHING HERE STORES AN APPROVAL. `approvedBy` is used to decide and then
 * DISCARDED, exactly as in `activateRateSheet` and `activateOffer`. The
 * platform has no audit log, so a stored approver would be an unverifiable,
 * deletable record that LOOKS like proof. Enforcing that a human was required
 * without fabricating the history is the honest position, not a shortcut.
 */
import type { ContractRecord } from "@/lib/contracts/model";
import { isInForce } from "@/lib/contracts/lifecycle";
import {
  declaredSeasonIds,
  isFleetCategory,
  isTariffLapsed,
  isTransportRateBasis,
  isTransportScopeKind,
  tariffLineOffering,
  TRANSPORT_COMMERCIAL_CLASSES,
  type TariffStatus,
  type TransportTariff,
} from "@/lib/transport/model";

/* ------------------------------------------------------------------ *
 * Issues
 * ------------------------------------------------------------------ */

export type TariffIssueSeverity = "error" | "warning";

export type TariffIssue = {
  code: string;
  severity: TariffIssueSeverity;
  message: string;
  /** The line or charge the issue belongs to, when it belongs to one. */
  ref?: string;
};

export type TariffValidationResult = {
  ok: boolean;
  issues: TariffIssue[];
  errors: TariffIssue[];
  warnings: TariffIssue[];
  /** Priced share of lines, 0–100. Reported, never a gate on its own. */
  completeness: number;
};

const err = (code: string, message: string, ref?: string): TariffIssue => ({
  code,
  severity: "error",
  message,
  ...(ref ? { ref } : {}),
});

const warn = (code: string, message: string, ref?: string): TariffIssue => ({
  code,
  severity: "warning",
  message,
  ...(ref ? { ref } : {}),
});

const blank = (value?: string): boolean => !value || value.trim() === "";

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

/**
 * Is this tariff structurally sound?
 *
 * ERRORS are things that make the record unusable or self-contradictory.
 * WARNINGS are things a human should look at but which do not make the capture
 * wrong — a missing source document, an unresolved category.
 */
export function validateTariff(
  tariff: TransportTariff,
  now: Date = new Date(),
): TariffValidationResult {
  const issues: TariffIssue[] = [];

  /* -- header -- */

  if (blank(tariff.vendorId)) {
    issues.push(err("vendor_missing", "A tariff must name the transporter it came from."));
  }

  if (blank(tariff.operatingAreaRef)) {
    issues.push(
      err(
        "operating_area_missing",
        "No operating area was captured. The same vehicle carries different rates in different geographies, so a rate with no area cannot be applied to anything.",
      ),
    );
  }

  if (blank(tariff.operatingAreaId)) {
    issues.push(
      warn(
        "operating_area_unresolved",
        "The supplier's operating area has not been matched to a destination. Activation refuses until it is.",
      ),
    );
  }

  if (blank(tariff.currency)) {
    issues.push(
      err(
        "currency_missing",
        "No currency was captured. An amount whose currency nobody declared cannot be used.",
      ),
    );
  }

  if (tariff.basis === "contracted" && blank(tariff.contractId)) {
    issues.push(
      warn(
        "contract_missing",
        "A contracted tariff records no agreement. A standing rate implies terms somebody signed.",
      ),
    );
  }

  const from = tariff.validFrom ? new Date(tariff.validFrom).getTime() : Number.NaN;
  const to = tariff.validTo ? new Date(tariff.validTo).getTime() : Number.NaN;
  if (!Number.isNaN(from) && !Number.isNaN(to) && to < from) {
    issues.push(
      err("validity_inverted", "The tariff's validity ends before it begins."),
    );
  }
  if (Number.isNaN(from) && Number.isNaN(to)) {
    issues.push(
      warn(
        "validity_missing",
        "No validity period was captured. A rate with no end date cannot expire, and a withdrawn rate would stay quotable.",
      ),
    );
  }

  if (isTariffLapsed(tariff, now)) {
    issues.push(
      warn(
        "tariff_lapsed",
        "This tariff is still marked active but its validity has passed. Its status is overdue for a human decision.",
      ),
    );
  }

  if (tariff.documentRefs.length === 0) {
    issues.push(
      warn(
        "source_document_missing",
        "No source document is attached. The original quotation is what a later dispute is settled against.",
      ),
    );
  }

  /* -- seasons -- */

  const seasonIds = declaredSeasonIds(tariff);
  if (seasonIds.size !== tariff.seasons.length) {
    issues.push(err("duplicate_season_ids", "Two seasons on this tariff share an id."));
  }
  for (const season of tariff.seasons) {
    if (blank(season.label)) {
      issues.push(
        err("season_label_missing", "A season carries no label.", season.id),
      );
    }
    const s = new Date(season.startDate).getTime();
    const e = new Date(season.endDate).getTime();
    if (Number.isNaN(s) || Number.isNaN(e)) {
      issues.push(err("season_dates_invalid", "A season has unreadable dates.", season.id));
    } else if (e < s) {
      issues.push(err("season_inverted", "A season ends before it begins.", season.id));
    }
  }

  /* -- lines -- */

  if (tariff.lines.length === 0) {
    issues.push(err("no_lines", "A tariff with no priced rows prices nothing."));
  }

  const lineIds = new Set<string>();
  let priced = 0;

  for (const line of tariff.lines) {
    if (lineIds.has(line.id)) {
      issues.push(err("duplicate_line_ids", "Two lines share an id.", line.id));
    }
    lineIds.add(line.id);

    // The union already makes a basis/scope contradiction unconstructable in
    // TypeScript. This checks the same thing at runtime, because a tariff can
    // arrive from JSON that the compiler never saw.
    if (line.pricing.kind === "basis") {
      if (!isTransportRateBasis(line.pricing.basis)) {
        issues.push(
          err("basis_invalid", "A basis line declares a basis the platform does not know.", line.id),
        );
      }
      if (line.pricing.minimum !== undefined && line.pricing.minimum < 0) {
        issues.push(err("minimum_negative", "A stated minimum cannot be negative.", line.id));
      }
      if ("scopeKind" in line.pricing || "scopeRef" in line.pricing) {
        issues.push(
          err(
            "pricing_contradiction",
            "A line declares a basis and a scope. One amount is either multiplied by a quantity or it is not; it cannot be both.",
            line.id,
          ),
        );
      }
    } else if (line.pricing.kind === "scope") {
      if (!isTransportScopeKind(line.pricing.scopeKind)) {
        issues.push(
          err("scope_kind_invalid", "A scope line declares a scope kind the platform does not know.", line.id),
        );
      }
      if (blank(line.pricing.scopeRef)) {
        issues.push(
          err(
            "scope_ref_missing",
            "A scope line names no scope. A fixed price for an unidentified movement prices nothing, and two such lines are indistinguishable.",
            line.id,
          ),
        );
      }
      if ("basis" in line.pricing || "minimum" in line.pricing) {
        issues.push(
          err(
            "pricing_contradiction",
            "A line declares a scope and a basis. One amount is either multiplied by a quantity or it is not; it cannot be both.",
            line.id,
          ),
        );
      }
    } else {
      issues.push(err("pricing_missing", "A line declares no pricing shape at all.", line.id));
    }

    if (blank(line.fleetCategoryRef)) {
      issues.push(
        err(
          "line_category_missing",
          "A line records no category, so nothing can tell which vehicle it prices.",
          line.id,
        ),
      );
    }

    if (line.fleetCategory !== undefined && !isFleetCategory(line.fleetCategory)) {
      issues.push(
        err(
          "line_fleet_category_invalid",
          "A line resolves to a fleet category the migrated schema does not contain.",
          line.id,
        ),
      );
    }

    if (
      line.commercialClass !== undefined &&
      !TRANSPORT_COMMERCIAL_CLASSES.includes(line.commercialClass)
    ) {
      issues.push(
        warn(
          "line_commercial_class_unknown",
          "A line carries a commercial class BPT has not declared. It cannot be matched against a class requirement until the vocabulary is supplied.",
          line.id,
        ),
      );
    }

    if (line.capacity !== undefined && (!Number.isFinite(line.capacity) || line.capacity <= 0)) {
      issues.push(
        err("line_capacity_invalid", "A stated capacity must be a positive whole number.", line.id),
      );
    }

    if (line.seasonId !== undefined && !seasonIds.has(line.seasonId)) {
      issues.push(
        err(
          "season_ref_unknown",
          "A line references a season this tariff never declared.",
          line.id,
        ),
      );
    }

    if (line.amount !== undefined && line.amount < 0) {
      issues.push(err("amount_negative", "A rate cannot be negative.", line.id));
    }

    // A real captured 0 is a real price of zero and stays PRICED. Sentinel
    // amounts are forbidden — the same rule M4 states.
    if (tariffLineOffering(line) === "PRICED" && line.amount === undefined) {
      issues.push(
        err(
          "priced_without_amount",
          "A line declared PRICED carries no amount. Declaring a price and recording none is the one state that cannot be true.",
          line.id,
        ),
      );
    }

    if (isPricedLineLocal(line.offering, line.amount)) priced += 1;
  }

  /* -- conditional charges -- */

  const chargeIds = new Set<string>();
  for (const charge of tariff.charges) {
    if (chargeIds.has(charge.id)) {
      issues.push(err("duplicate_charge_ids", "Two conditional charges share an id.", charge.id));
    }
    chargeIds.add(charge.id);

    if (blank(charge.triggerText)) {
      issues.push(
        err(
          "charge_trigger_missing",
          "A conditional charge records no condition. A charge with no stated trigger is indistinguishable from an unconditional one — which is exactly the misreading this type exists to prevent.",
          charge.id,
        ),
      );
    }
    if (charge.amount !== undefined && charge.amount < 0) {
      issues.push(err("charge_amount_negative", "A charge cannot be negative.", charge.id));
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return {
    ok: errors.length === 0,
    issues,
    errors,
    warnings,
    completeness:
      tariff.lines.length === 0 ? 0 : Math.round((priced / tariff.lines.length) * 100),
  };
}

/** Local mirror of `isPricedLine` that takes the two fields, to avoid a re-import cycle. */
function isPricedLineLocal(offering: string | undefined, amount: number | undefined): boolean {
  if (offering) return offering === "PRICED" && amount !== undefined;
  return amount !== undefined;
}

/* ------------------------------------------------------------------ *
 * Expiry
 * ------------------------------------------------------------------ */

export const TARIFF_EXPIRY_WARNING_DAYS = 60;

/** Whole days until validity ends. Null when no end date was captured. */
export function daysUntilTariffExpiry(
  tariff: Pick<TransportTariff, "validTo">,
  now: Date = new Date(),
): number | null {
  if (!tariff.validTo) return null;
  const end = new Date(tariff.validTo).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - now.getTime()) / (24 * 60 * 60 * 1000));
}

export function isTariffExpiringSoon(
  tariff: Pick<TransportTariff, "status" | "validTo">,
  now: Date = new Date(),
  withinDays: number = TARIFF_EXPIRY_WARNING_DAYS,
): boolean {
  if (tariff.status !== "active") return false;
  const days = daysUntilTariffExpiry(tariff, now);
  if (days === null) return false;
  return days >= 0 && days <= withinDays;
}

/* ------------------------------------------------------------------ *
 * Activation gate
 * ------------------------------------------------------------------ */

export type TariffActivationResult =
  | { ok: true; status: TariffStatus; humanApproval: true }
  | { ok: false; error: string };

/**
 * May this tariff be approved for commercial use?
 *
 * Approving a tariff is a commercial decision — it determines what BPT is
 * willing to pay and what a future option proposal may offer — so it requires a
 * named human and a clean validation pass. Mirrors `activateRateSheet` and
 * `activateOffer` in shape, in ordering and in what it declines to record.
 *
 * ⚠️ THE CONTRACT IS PASSED IN, AND IT IS REQUIRED FOR A CONTRACTED TARIFF.
 * The tariff holds a `contractId` string; resolving it would mean a repository
 * read inside a pure function, which this module does not do. It is REQUIRED
 * rather than optional because M8's audit established exactly this failure
 * mode: when a module gains a dimension that must not be omitted, making it
 * optional moves the failure silently to the caller. An absent contract refuses.
 *
 * ⚠️ RETURNS NO APPROVER AND NO TIMESTAMP. See the module header.
 * `approvedBy` must never be supplied by an automated caller to satisfy the gate.
 */
export function activateTariff(
  tariff: TransportTariff,
  options: { approvedBy?: string; contract?: ContractRecord; now?: Date } = {},
): TariffActivationResult {
  const now = options.now ?? new Date();

  if (tariff.status === "active") return { ok: false, error: "This tariff is already active." };
  if (tariff.status === "superseded") {
    return { ok: false, error: "A superseded tariff cannot be reactivated." };
  }
  // VALIDITY GATE. Checked against the DATES, not against the status.
  //
  // ⚠️ `isTariffLapsed` is deliberately active-only — it reports a status that
  // is overdue for a human decision, which a draft cannot be. Using it here
  // would let a DRAFT whose validity ended months ago be activated, because it
  // was never active to lapse. That is precisely the withdrawn-rate case this
  // gate exists to stop, so the gate reads the dates directly.
  const validTo = tariff.validTo ? new Date(tariff.validTo).getTime() : Number.NaN;
  if (tariff.status === "expired" || (!Number.isNaN(validTo) && validTo < now.getTime())) {
    return {
      ok: false,
      error:
        "The tariff's validity has passed. Activating it would put a withdrawn rate in front of an operation.",
    };
  }

  // AREA GATE. The dimension that must not be omitted — see the model header.
  if (blank(tariff.operatingAreaId)) {
    return {
      ok: false,
      error:
        "The transporter's operating area has not been resolved. The same vehicle carries different rates in different geographies, so activating this would let a rate be applied to the wrong one and report success.",
    };
  }

  // CURRENCY GATE. A number with no declared unit cannot be used.
  if (blank(tariff.currency)) {
    return {
      ok: false,
      error:
        "No currency is recorded. An amount whose currency nobody declared cannot be offered as a commercial option.",
    };
  }

  // CONDITIONS GATE. Not a claim about what the conditions say — only that a
  // person has read them.
  if (tariff.conditionsReviewed !== true) {
    return {
      ok: false,
      error:
        "The transporter's free-text conditions have not been reviewed by a human. Activating an unread tariff commits BPT to terms nobody has looked at.",
    };
  }

  // CONTRACT GATE. Only for a contracted tariff — a one-off quotation may
  // legitimately arrive from a transporter BPT has not yet signed.
  if (tariff.basis === "contracted") {
    if (blank(tariff.contractId)) {
      return {
        ok: false,
        error:
          "This contracted tariff records no agreement. Record the contract before activating — a standing rate implies terms somebody signed.",
      };
    }
    if (!options.contract) {
      return {
        ok: false,
        error:
          "The contract record was not supplied, so whether the agreement is in force could not be checked. Activation refuses rather than assuming it is.",
      };
    }
    if (options.contract.id !== tariff.contractId) {
      return {
        ok: false,
        error:
          "The contract supplied is not the one this tariff references. Checking the wrong agreement is worse than checking none.",
      };
    }
    if (!isInForce(options.contract, now)) {
      return {
        ok: false,
        error:
          "The agreement behind this tariff is not in force. Using it would buy on terms that are not currently agreed.",
      };
    }
  }

  // VALIDATION GATE.
  const validation = validateTariff(tariff, now);
  if (!validation.ok) {
    return {
      ok: false,
      error: `This tariff has ${validation.errors.length} unresolved error(s). Fix the capture before approving it for use.`,
    };
  }

  // HUMAN GATE. Last, so a caller cannot learn which other gates passed by
  // probing with an approver they do not have.
  if (blank(options.approvedBy)) {
    return {
      ok: false,
      error:
        "Activation requires a named human approver. A commercial rate that BPT will buy against is never approved automatically.",
    };
  }

  return { ok: true, status: "active", humanApproval: true };
}

/* ------------------------------------------------------------------ *
 * Supersession
 * ------------------------------------------------------------------ */

/**
 * May `replacement` supersede `existing`?
 *
 * Same transporter AND same operating area. Both halves matter: with
 * area-scoped tariffs, a renewal for Srinagar must leave the Jammu tariff
 * untouched — the same reasoning M4 applies to property-scoped sheets, where
 * superseding on supplier alone would silently withdraw rates for every other
 * property.
 *
 * Comparison is on the RESOLVED area id, never the supplier's free text: two
 * spellings of the same place are the same area, and two areas that happen to
 * share wording are not.
 */
export function canSupersede(existing: TransportTariff, replacement: TransportTariff): boolean {
  if (existing.id === replacement.id) return false;
  if (existing.vendorId !== replacement.vendorId) return false;
  if (blank(existing.operatingAreaId) || blank(replacement.operatingAreaId)) return false;
  if (existing.operatingAreaId !== replacement.operatingAreaId) return false;
  return existing.status === "active" || existing.status === "draft";
}
