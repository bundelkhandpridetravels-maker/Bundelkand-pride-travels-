/**
 * Contract → Vendor link. The seam that keeps ONE source of truth.
 *
 * The vendor record carries `agreementStatus` (none/draft/signed/expired) and
 * the contract register carries `status` (draft/sent/signed/expired/terminated).
 * Left alone, those are two answers to the same question. So:
 *
 *   `contracts.status` is the truth; a vendor's `agreementStatus` is DERIVED
 *   from that vendor's contracts — never hand-set, never stored as a rival fact.
 *
 * This is the same discipline M1 applied to onboarding stages, and it means M1's
 * activation guard ("no activation without a signed agreement") starts consulting
 * the real contract without M1 changing at all.
 *
 * Known, deliberate information loss: the vendor summary has no `terminated`
 * value, so a terminated contract summarises as `expired`. The register keeps the
 * true status; only the four-value summary field is coarser. Widening the vendor
 * enum would mean editing a stable, shipped model for no operational gain.
 *
 * Pure — no I/O.
 */
import type { VendorRecord } from "@/lib/vendor/model";
import type { ContractRecord } from "@/lib/contracts/model";
import { isInForce } from "@/lib/contracts/lifecycle";
import { daysUntilExpiry } from "@/lib/contracts/renewal";

export type VendorAgreementStatus = NonNullable<VendorRecord["agreementStatus"]>;

/** Contracts belonging to one vendor. Matches on the polymorphic party id. */
export function contractsForVendor(
  contracts: ContractRecord[],
  vendorId: string,
): ContractRecord[] {
  return contracts.filter((c) => c.party.kind === "vendor" && c.party.id === vendorId);
}

/**
 * The contract that represents a vendor's current standing.
 *
 * Preference order: in force → sent → draft → most recently expired/terminated.
 * Among equals the latest expiry wins, so a renewal supersedes the contract it
 * replaces without anything being deleted.
 */
export function activeContractFor(
  contracts: ContractRecord[],
  vendorId: string,
  now: Date = new Date(),
): ContractRecord | null {
  const mine = contractsForVendor(contracts, vendorId);
  if (mine.length === 0) return null;

  const rank = (c: ContractRecord): number => {
    if (isInForce(c, now)) return 4;
    if (c.status === "sent") return 3;
    if (c.status === "draft") return 2;
    return 1; // signed-but-lapsed, expired, terminated
  };

  return [...mine].sort((a, b) => {
    const byRank = rank(b) - rank(a);
    if (byRank !== 0) return byRank;
    const aExp = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
    const bExp = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
    if (bExp !== aExp) return bExp - aExp;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  })[0];
}

/**
 * Derive the vendor's agreement summary from their contracts.
 *
 * Mapping (contract → vendor summary):
 *   none on file        → "none"
 *   draft               → "draft"
 *   sent                → "draft"    (issued, not yet executed)
 *   signed & in force   → "signed"
 *   signed but lapsed   → "expired"  (past its date — not a valid agreement)
 *   expired | terminated→ "expired"
 */
export function deriveAgreementStatus(
  contracts: ContractRecord[],
  vendorId: string,
  now: Date = new Date(),
): VendorAgreementStatus {
  const contract = activeContractFor(contracts, vendorId, now);
  if (!contract) return "none";

  switch (contract.status) {
    case "draft":
    case "sent":
      return "draft";
    case "signed":
      return isInForce(contract, now) ? "signed" : "expired";
    case "expired":
    case "terminated":
      return "expired";
  }
}

export type VendorAgreementView = {
  vendorId: string;
  agreementStatus: VendorAgreementStatus;
  contract: ContractRecord | null;
  daysUntilExpiry: number | null;
  /** True when the vendor may be allocated work — a valid agreement is in force. */
  contractValid: boolean;
};

/** Everything a vendor surface needs about a vendor's contract standing. */
export function vendorAgreementView(
  contracts: ContractRecord[],
  vendorId: string,
  now: Date = new Date(),
): VendorAgreementView {
  const contract = activeContractFor(contracts, vendorId, now);
  return {
    vendorId,
    agreementStatus: deriveAgreementStatus(contracts, vendorId, now),
    contract,
    daysUntilExpiry: contract ? daysUntilExpiry(contract, now) : null,
    contractValid: contract ? isInForce(contract, now) : false,
  };
}

/**
 * Vendors marked active whose agreement is NOT actually in force — the
 * allocation risk this milestone exists to surface. Reads the vendor register
 * and the contract register together; neither is modified.
 */
export function vendorsWithoutValidContract(
  vendors: VendorRecord[],
  contracts: ContractRecord[],
  now: Date = new Date(),
): { vendor: VendorRecord; view: VendorAgreementView }[] {
  return vendors
    .filter((v) => v.active)
    .map((vendor) => ({ vendor, view: vendorAgreementView(contracts, vendor.id, now) }))
    .filter(({ view }) => !view.contractValid);
}
