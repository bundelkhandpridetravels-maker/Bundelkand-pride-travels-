/**
 * Import source boundary. Each ingestion channel implements ImportSourceProvider
 * and returns RawVendorImport[]. Today only a manual/console stub exists (returns
 * nothing). Future providers drop in here WITHOUT redesign:
 *
 *   - GmailImportProvider        (Gmail API → parse enquiry/rate emails)
 *   - BusinessCardOcrProvider    (image OCR → contact fields)
 *   - PdfRateSheetProvider       (PDF parse → rates + contact)
 *   - BrochureImportProvider     (PDF/image → property details)
 *   - ContractImportProvider     (PDF parse → party + terms)
 *   - EmailSyncProvider          (IMAP/Graph sync)
 *
 * No external service is connected yet — this is the seam, by design.
 */
import type { ImportSourceType, RawVendorImport } from "@/lib/vendor-import/model";

export interface ImportSourceProvider {
  readonly sourceType: ImportSourceType;
  readonly name: string;
  /** Cheap, read-only fetch of raw captured records. */
  fetchRaw(): Promise<RawVendorImport[]>;
}

class ManualImportSourceProvider implements ImportSourceProvider {
  readonly sourceType: ImportSourceType = "manual";
  readonly name = "manual";
  async fetchRaw(): Promise<RawVendorImport[]> {
    return [];
  }
}

/** Registered providers. Future sources append here. */
export const importSourceProviders: ImportSourceProvider[] = [new ManualImportSourceProvider()];

export function getImportSourceProvider(type: ImportSourceType): ImportSourceProvider | undefined {
  return importSourceProviders.find((p) => p.sourceType === type);
}
