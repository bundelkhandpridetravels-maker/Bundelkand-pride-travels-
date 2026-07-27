// Server-only: the import pipeline. Fetch → map → validate → dedupe → score.
import { randomUUID } from "node:crypto";
import { getVendorRepository } from "@/lib/vendor/vendor-repository";
import type { ImportSourceProvider } from "@/lib/vendor-import/source-provider";
import type { VendorImportCandidate } from "@/lib/vendor-import/model";
import { mapRawToVendor } from "@/lib/vendor-import/mapping";
import { validateImport } from "@/lib/vendor-import/validation";
import { detectDuplicates } from "@/lib/vendor-import/duplicate";
import { computeReadiness, deriveImportStatus } from "@/lib/vendor-import/readiness";

/**
 * Run an import from a source provider. Deduplicates against the EXISTING
 * VendorRepository (no parallel store), validates and scores each record. Pure
 * orchestration over interfaces — swapping in a Gmail/OCR/PDF provider needs no
 * change here.
 */
export async function runVendorImport(
  provider: ImportSourceProvider,
): Promise<{ candidates: VendorImportCandidate[] }> {
  const [raws, existing] = await Promise.all([
    provider.fetchRaw(),
    getVendorRepository().listVendors(),
  ]);

  const candidates = raws.map((raw): VendorImportCandidate => {
    const vendor = mapRawToVendor(raw);
    const validation = validateImport(raw, vendor);
    const duplicates = detectDuplicates(vendor, raw, existing.vendors);
    const readiness = computeReadiness(validation, duplicates);
    const status = deriveImportStatus(validation, duplicates);

    return {
      id: `imp_${randomUUID()}`,
      sourceType: raw.sourceType,
      sourceRef: raw.sourceRef,
      vendor,
      status,
      validation,
      duplicates,
      readiness,
      createdAt: new Date().toISOString(),
    };
  });

  return { candidates };
}
