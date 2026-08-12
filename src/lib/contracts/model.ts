/**
 * Contract domain model — the agreement register for the whole platform.
 *
 * Mirrors the stable Payload schema (src/payload/collections/Contracts.ts): one
 * vocabulary, no parallel model. `party` is polymorphic there, so this register
 * is NOT vendor-only — vendors are simply its first consumer. Influencer,
 * employment, freelancer and NDA contracts reuse this without a rebuild.
 *
 * Nothing in this module contains legal text, clauses, commercial terms,
 * commission rates, payment terms or standard durations. Those are real legal
 * and business content supplied by the founder; the platform stores, tracks and
 * reminds on the agreement — it never authors one.
 */
import type { DocumentActor, DocumentActorRole } from "@/lib/documents/permissions";

/* ------------------------------------------------------------------ *
 * Types & statuses (mirror the Payload collection exactly)
 * ------------------------------------------------------------------ */

export const CONTRACT_TYPES = [
  "vendor",
  "hotel",
  "dmc",
  "influencer",
  "employment",
  "freelancer",
  "developer",
  "nda",
  "other",
] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  vendor: "Vendor",
  hotel: "Hotel",
  dmc: "DMC",
  influencer: "Influencer",
  employment: "Employment",
  freelancer: "Freelancer",
  developer: "Developer",
  nda: "NDA",
  other: "Other",
};

/**
 * Contract types that describe a SUPPLY relationship. The dashboard filters to
 * these by design decision (vendor-first UI) while the model stays general.
 */
export const SUPPLY_CONTRACT_TYPES: ContractType[] = ["vendor", "hotel", "dmc"];

export const CONTRACT_STATUSES = ["draft", "sent", "signed", "expired", "terminated"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Draft",
  sent: "Sent for signature",
  signed: "Signed",
  expired: "Expired",
  terminated: "Terminated",
};

export const CONTRACT_STATUS_DESCRIPTIONS: Record<ContractStatus, string> = {
  draft: "Being prepared internally. Not yet shared with the counterparty.",
  sent: "Issued for signature. Awaiting the counterparty's signed copy.",
  signed: "Executed and in force.",
  expired: "Past its expiry date. No longer in force.",
  terminated: "Ended before expiry by either party.",
};

/** The entities a contract can be with — mirrors the polymorphic `party`. */
export const CONTRACT_PARTY_KINDS = [
  "vendor",
  "influencer",
  "user",
  "dmc",
  "transport_provider",
] as const;
export type ContractPartyKind = (typeof CONTRACT_PARTY_KINDS)[number];

export type ContractParty = {
  kind: ContractPartyKind;
  id: string;
  /** Display name captured for the register; the party record remains canonical. */
  name: string;
};

/* ------------------------------------------------------------------ *
 * Value (commercially sensitive)
 * ------------------------------------------------------------------ */

/** Mirrors the schema's `moneyGroup` — amount + currency, nothing invented. */
export type ContractValue = {
  amount: number;
  currency: string;
};

/**
 * Contract values are commercial terms. Founder decision (Phase 3 M3): visible
 * on founder surfaces only. Reuses the platform's existing visibility level and
 * role vocabulary from the documents layer rather than inventing a second RBAC.
 */
export const CONTRACT_VALUE_VISIBILITY = "founder_only" as const;

const VALUE_ROLES: DocumentActorRole[] = ["founder"];

export function canViewContractValue(actor: DocumentActor): boolean {
  return VALUE_ROLES.includes(actor.role);
}

/* ------------------------------------------------------------------ *
 * Record
 * ------------------------------------------------------------------ */

export type ContractRecord = {
  id: string;
  title: string;
  contractType: ContractType;
  party: ContractParty;
  status: ContractStatus;
  /** ISO date strings — absent until the contract reaches that point. */
  effectiveDate?: string;
  expiryDate?: string;
  /** Who signed on the counterparty side. */
  signedBy?: string;
  signedAt?: string;
  /** Refs into the Documents layer (`vend_agreement` etc.) — never file bytes. */
  documentRefs: string[];
  /** Commercial terms — founder-visible only. Absent when not captured. */
  value?: ContractValue;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * A contract as a given actor may see it. Identical to the record, except that
 * `value` is present ONLY when the actor is permitted commercial terms, and
 * `valueRedacted` says plainly whether something was withheld.
 *
 * Redaction happens here in the data layer, not in a template, so a future
 * surface cannot leak the value by forgetting to hide a column. The key is
 * physically absent for unauthorised actors — not merely blanked — so it cannot
 * survive JSON serialisation either.
 */
export type ContractView = Omit<ContractRecord, "value"> & {
  value?: ContractValue;
  valueRedacted: boolean;
};

export function redactContract(contract: ContractRecord, actor: DocumentActor): ContractView {
  const { value, ...rest } = contract;

  if (canViewContractValue(actor)) {
    // Authorised: keep the terms, and record that nothing was withheld.
    return value === undefined
      ? { ...rest, valueRedacted: false }
      : { ...rest, value, valueRedacted: false };
  }

  // Unauthorised: `value` is dropped from the object entirely.
  return { ...rest, valueRedacted: value !== undefined };
}

export function redactContracts(
  contracts: ContractRecord[],
  actor: DocumentActor,
): ContractView[] {
  return contracts.map((c) => redactContract(c, actor));
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type ContractSummary = {
  live: boolean;
  total: number;
  counts: Record<ContractStatus, number>;
  /** Signed contracts inside the expiry-warning window. */
  expiringSoon: number;
  /** Signed contracts already past expiry but not yet marked expired. */
  lapsed: number;
};

export function emptyContractSummary(live = false): ContractSummary {
  return {
    live,
    total: 0,
    counts: { draft: 0, sent: 0, signed: 0, expired: 0, terminated: 0 },
    expiringSoon: 0,
    lapsed: 0,
  };
}
