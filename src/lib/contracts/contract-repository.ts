// Server-only: imported by the contracts dashboard + /api/contracts.
import { randomUUID } from "node:crypto";
import {
  emptyContractSummary,
  type ContractRecord,
  type ContractStatus,
  type ContractSummary,
  type ContractType,
} from "@/lib/contracts/model";
import { summarizeContracts } from "@/lib/contracts/renewal";

/**
 * Contract persistence + aggregation boundary — the same pattern as every other
 * module. Callers depend on this interface, never a concrete store.
 *
 * Going live = implement PayloadContractRepository against the existing
 * `contracts` collection (which is already schema-complete) and swap it in
 * `getContractRepository()`. The register, lifecycle, renewal maths, dashboard
 * and API do not change.
 */
export type CreateContractInput = {
  title: string;
  contractType: ContractType;
  party: ContractRecord["party"];
  effectiveDate?: string;
  expiryDate?: string;
  value?: ContractRecord["value"];
  notes?: string;
};

export interface ContractRepository {
  getSummary(): Promise<ContractSummary>;
  list(filter?: { types?: ContractType[] }): Promise<{ live: boolean; contracts: ContractRecord[] }>;
  create(input: CreateContractInput): Promise<ContractRecord>;
  /** Records a status decision. Guarded by transitionContract() upstream. */
  setStatus(
    id: string,
    status: ContractStatus,
    meta?: { approvedBy?: string; signedBy?: string; signedAt?: string },
  ): Promise<{ live: boolean }>;
  /** Links an uploaded document (e.g. the signed copy) to a contract. */
  attachDocument(id: string, documentRef: string): Promise<{ live: boolean }>;
}

/**
 * Default store until the database is connected.
 *
 * Reads report `live:false` so surfaces honestly show "pending backend" rather
 * than an empty-looking real register. Writes are stamped and logged (the
 * ConsoleBookingRepository precedent) so nothing an operator enters is lost —
 * but they are NOT persisted, and `create` says so.
 */
class ConsoleContractRepository implements ContractRepository {
  async getSummary(): Promise<ContractSummary> {
    return emptyContractSummary(false);
  }

  async list(): Promise<{ live: boolean; contracts: ContractRecord[] }> {
    return { live: false, contracts: [] };
  }

  async create(input: CreateContractInput): Promise<ContractRecord> {
    const now = new Date().toISOString();
    const record: ContractRecord = {
      id: `ctr_${randomUUID()}`,
      title: input.title,
      contractType: input.contractType,
      party: input.party,
      // Every contract starts as a draft — issuing it is a separate human act.
      status: "draft",
      effectiveDate: input.effectiveDate,
      expiryDate: input.expiryDate,
      documentRefs: [],
      value: input.value,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    // Commercial terms are never written to the log.
    console.info(
      "[contract:new]",
      JSON.stringify({
        id: record.id,
        title: record.title,
        contractType: record.contractType,
        party: record.party.name,
        status: record.status,
        expiryDate: record.expiryDate ?? null,
        hasValue: record.value !== undefined,
      }),
    );
    return record;
  }

  async setStatus(
    id: string,
    status: ContractStatus,
    meta: { approvedBy?: string; signedBy?: string; signedAt?: string } = {},
  ): Promise<{ live: boolean }> {
    console.info(
      "[contract:status]",
      JSON.stringify({ id, status, approvedBy: meta.approvedBy ?? null }),
    );
    return { live: false };
  }

  async attachDocument(id: string, documentRef: string): Promise<{ live: boolean }> {
    console.info("[contract:document]", JSON.stringify({ id, documentRef }));
    return { live: false };
  }
}

let repo: ContractRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getContractRepository(): ContractRepository {
  if (!repo) repo = new ConsoleContractRepository();
  return repo;
}

export { summarizeContracts };
