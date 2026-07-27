// Server-only: aggregation seam for the Vendor Import dashboard.
import {
  emptyImportSummary,
  type ImportBatchSummary,
  type VendorImportCandidate,
} from "@/lib/vendor-import/model";

/**
 * Vendor import aggregation boundary. Same pattern as every other module.
 * Console stub reports `live:false` (no source connected). When Gmail/OCR/PDF
 * providers + a store land, this repository runs the pipeline and persists
 * candidates — the dashboard never changes.
 */
export interface VendorImportRepository {
  getBatchSummary(): Promise<ImportBatchSummary>;
  listCandidates(): Promise<{ live: boolean; candidates: VendorImportCandidate[] }>;
}

class ConsoleVendorImportRepository implements VendorImportRepository {
  async getBatchSummary(): Promise<ImportBatchSummary> {
    return emptyImportSummary(false);
  }
  async listCandidates(): Promise<{ live: boolean; candidates: VendorImportCandidate[] }> {
    return { live: false, candidates: [] };
  }
}

let repo: VendorImportRepository | null = null;

export function getVendorImportRepository(): VendorImportRepository {
  if (!repo) repo = new ConsoleVendorImportRepository();
  return repo;
}
