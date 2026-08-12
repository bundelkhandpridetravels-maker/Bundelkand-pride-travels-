// Server-only: the signature-collection boundary.
import type { ContractRecord } from "@/lib/contracts/model";

/**
 * Signature collection boundary — the same provider pattern as
 * getEmailProvider() / getDocumentProvider().
 *
 * Phase 3 decision (founder): signing is MANUAL. Operations sends the agreement,
 * the counterparty signs and returns it, and a staff member uploads the signed
 * copy through the existing documents layer (`uploadAgreement`, kind
 * `vend_agreement`). No third-party dependency, no account, no cost — and it
 * matches the staff-managed model M1 established.
 *
 * This interface exists so DocuSign / Zoho Sign / Adobe Sign later become one
 * implementation swapped in `getESignatureProvider()`, with no change to the
 * lifecycle, the register, the dashboard or the API. An electronic provider
 * would implement `requestSignature` (create envelope) and `getStatus` (poll or
 * webhook reconciliation); the manual provider implements neither, and says so
 * rather than pretending.
 */

export type SignatureRequestResult = {
  ok: boolean;
  provider: string;
  /** Whether a signature request was actually transmitted (false when manual). */
  dispatched: boolean;
  /** Provider-side envelope/reference id, when one exists. */
  envelopeId?: string;
  /** What a human must now do — the manual provider's real output. */
  instruction?: string;
  error?: string;
};

export type SignatureStatus =
  | { state: "not_tracked"; provider: string; reason: string }
  | { state: "pending" | "completed" | "declined"; provider: string; envelopeId?: string };

export interface ESignatureProvider {
  readonly name: string;
  /** True when the provider can transmit a signature request electronically. */
  readonly electronic: boolean;
  requestSignature(contract: ContractRecord): Promise<SignatureRequestResult>;
  getStatus(contract: ContractRecord): Promise<SignatureStatus>;
}

/**
 * Manual signing. Records the intent and returns the operational instruction;
 * it never claims to have sent anything. Completion is recorded by a human
 * marking the contract signed — which the lifecycle already guards behind an
 * attached document and a named signatory.
 */
class ManualSignatureProvider implements ESignatureProvider {
  readonly name = "manual";
  readonly electronic = false;

  async requestSignature(contract: ContractRecord): Promise<SignatureRequestResult> {
    console.info(
      "[contract:signature-requested]",
      JSON.stringify({ id: contract.id, party: contract.party.name, type: contract.contractType }),
    );
    return {
      ok: true,
      provider: this.name,
      dispatched: false,
      instruction:
        "Send the agreement to the counterparty, then upload the returned signed copy against this contract.",
    };
  }

  async getStatus(contract: ContractRecord): Promise<SignatureStatus> {
    void contract;
    return {
      state: "not_tracked",
      provider: this.name,
      reason: "Manual signing — status is recorded by operations, not by a signature service.",
    };
  }
}

let provider: ESignatureProvider | null = null;

/**
 * Single accessor. Swap the constructed provider here when an e-signature
 * service is adopted; nothing else changes.
 */
export function getESignatureProvider(): ESignatureProvider {
  if (!provider) provider = new ManualSignatureProvider();
  return provider;
}
