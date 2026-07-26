// Server-only: the document storage boundary.
import { randomUUID } from "node:crypto";
import type {
  DocumentProvider,
  DocumentUploadDescriptor,
  DocumentUploadResult,
} from "@/lib/documents/model";

/**
 * Storage providers implement DocumentProvider. The console stub records the
 * intent and reports `stored:false` — nothing leaves the server. Swap in a real
 * provider here; workflows, metadata, validation and UI never change:
 *
 *   - Cloudflare R2  (@aws-sdk/client-s3 against the R2 endpoint)
 *   - AWS S3
 *   - Google Cloud Storage
 *   - Azure Blob Storage
 *
 * No storage dependency is installed yet — this is the seam, by design.
 */
class ConsoleUploadProvider implements DocumentProvider {
  readonly name = "console";

  async upload(descriptor: DocumentUploadDescriptor): Promise<DocumentUploadResult> {
    console.info(
      "[document:queued]",
      JSON.stringify({
        kind: descriptor.kind,
        storedFilename: descriptor.metadata.storedFilename,
        size: descriptor.size,
        visibility: descriptor.metadata.visibility,
      }),
    );
    return {
      ok: true,
      id: `doc_${randomUUID()}`,
      storedFilename: descriptor.metadata.storedFilename,
      provider: this.name,
      stored: false,
      status: "pending_upload",
    };
  }

  getUrl(): string | null {
    return null; // no storage backing yet
  }
}

let provider: DocumentProvider | null = null;

export function getDocumentProvider(): DocumentProvider {
  if (!provider) provider = new ConsoleUploadProvider();
  return provider;
}
