/**
 * Contract lifecycle state machine. Pure — no I/O, no storage.
 *
 * Mirrors the Payload `contracts.status` values exactly, so the register and the
 * database speak one language. The guards here are the platform's legal safety
 * rail: issuing a contract, recording a signature and terminating an agreement
 * are legal acts, so they are proposed and human-approved, never auto-executed
 * (security-architecture §12) — the same pattern M2 applies to vendor email.
 */
import {
  type ContractRecord,
  type ContractStatus,
  CONTRACT_STATUS_LABELS,
} from "@/lib/contracts/model";

/** Legal transitions. Anything not listed is refused by `canTransition`. */
export const CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  draft: ["sent", "terminated"],
  sent: ["signed", "draft", "terminated"],
  signed: ["expired", "terminated"],
  expired: ["draft", "terminated"],
  terminated: [],
};

export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
  return CONTRACT_TRANSITIONS[from].includes(to);
}

/**
 * Transitions a human must confirm. Every one of these either creates, ends or
 * records a legal obligation — Hermes may prepare them, never execute them.
 * `expired` is excluded: it is a factual consequence of the calendar, not a
 * decision, and is derived rather than chosen.
 */
const HUMAN_APPROVAL_STATUSES: readonly ContractStatus[] = ["sent", "signed", "terminated"];

export function requiresHumanApproval(to: ContractStatus): boolean {
  return HUMAN_APPROVAL_STATUSES.includes(to);
}

export type ContractTransitionResult =
  | { ok: true; status: ContractStatus; humanApproval: boolean }
  | { ok: false; error: string };

/**
 * Guarded transition. Enforces the preconditions that protect the register's
 * integrity — a contract cannot be marked signed without a signed document on
 * file, and cannot be issued without an expiry date to track.
 *
 * `approvedBy` is the human authorisation. Without it, an approval-gated
 * transition is refused. It must never be supplied by an automated caller to
 * satisfy the gate.
 */
export function transitionContract(
  contract: ContractRecord,
  to: ContractStatus,
  options: { approvedBy?: string; now?: Date } = {},
): ContractTransitionResult {
  const from = contract.status;

  if (from === to) {
    return { ok: false, error: `Contract is already "${CONTRACT_STATUS_LABELS[to]}".` };
  }
  if (!canTransition(from, to)) {
    return {
      ok: false,
      error: `Cannot move a contract from "${CONTRACT_STATUS_LABELS[from]}" to "${CONTRACT_STATUS_LABELS[to]}".`,
    };
  }

  const approver = options.approvedBy?.trim();
  if (requiresHumanApproval(to) && !approver) {
    return {
      ok: false,
      error: `Moving a contract to "${CONTRACT_STATUS_LABELS[to]}" is a legal action and requires human approval.`,
    };
  }

  // Preconditions — integrity of the register, not business policy.
  if (to === "sent" && !contract.expiryDate) {
    return {
      ok: false,
      error: "Set an expiry date before issuing a contract, so renewal can be tracked.",
    };
  }
  if (to === "signed") {
    if (contract.documentRefs.length === 0) {
      return {
        ok: false,
        error: "Attach the signed document before marking a contract signed.",
      };
    }
    if (!contract.signedBy?.trim()) {
      return { ok: false, error: "Record who signed before marking a contract signed." };
    }
  }

  return { ok: true, status: to, humanApproval: requiresHumanApproval(to) };
}

/** Statuses that mean the agreement is currently in force. */
export function isInForce(contract: ContractRecord, now: Date = new Date()): boolean {
  if (contract.status !== "signed") return false;
  if (!contract.expiryDate) return true;
  return new Date(contract.expiryDate).getTime() >= now.getTime();
}
