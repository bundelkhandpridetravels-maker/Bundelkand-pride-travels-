// Server-only: imported by the vendor dashboard + future vendor API routes.
import {
  emptyVerificationSummary,
  type VendorAssignmentProposal,
  type VendorRecord,
  type VendorVerificationSummary,
} from "@/lib/vendor/model";

/**
 * Vendor aggregation boundary. Dashboards + (later) Hermes and the assignment
 * engine depend on this interface, never a concrete store. Console stub reports
 * `live:false` today; swap PayloadVendorRepository / NeonVendorRepository — which
 * will score vendors via ranking.ts and rank via assignment.ts — with no UI change.
 */
export interface VendorRepository {
  getVerificationSummary(): Promise<VendorVerificationSummary>;
  listVendors(): Promise<{ live: boolean; vendors: VendorRecord[] }>;
  listAssignments(): Promise<{ live: boolean; assignments: VendorAssignmentProposal[] }>;
}

class ConsoleVendorRepository implements VendorRepository {
  async getVerificationSummary(): Promise<VendorVerificationSummary> {
    return emptyVerificationSummary(false);
  }
  async listVendors(): Promise<{ live: boolean; vendors: VendorRecord[] }> {
    return { live: false, vendors: [] };
  }
  async listAssignments(): Promise<{ live: boolean; assignments: VendorAssignmentProposal[] }> {
    return { live: false, assignments: [] };
  }
}

let repo: VendorRepository | null = null;

export function getVendorRepository(): VendorRepository {
  if (!repo) repo = new ConsoleVendorRepository();
  return repo;
}
