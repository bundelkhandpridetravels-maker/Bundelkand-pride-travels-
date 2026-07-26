// Server-only: builds document metadata (uses node:crypto for checksums, no I/O).
import { createHash, randomUUID } from "node:crypto";
import {
  defaultVisibilityFor,
  documentGroup,
  documentOwner,
  type DocumentKind,
  type DocumentMetadata,
  type DocumentOwnerType,
  type DocumentVisibility,
} from "@/lib/documents/model";
import { fileExtension, normalizeFilename } from "@/lib/documents/validation";

export type BuildMetadataInput = {
  kind: DocumentKind;
  filename: string;
  mimeType: string;
  ownerId?: string;
  bookingId?: string;
  vendorId?: string;
  customerId?: string;
  createdBy?: string;
  /** Content hash if the caller already computed one. */
  hash?: string;
  visibility?: DocumentVisibility;
  version?: number;
};

/** Deterministic path: group/kind/<safe-base>-<short>.<ext>. */
function storedPath(kind: DocumentKind, filename: string): string {
  const normalized = normalizeFilename(filename);
  const ext = fileExtension(normalized);
  const base = ext ? normalized.slice(0, normalized.length - ext.length - 1) : normalized;
  const short = randomUUID().slice(0, 8);
  const name = ext ? `${base}-${short}.${ext}` : `${base}-${short}`;
  return `${documentGroup(kind)}/${kind}/${name}`;
}

/** Build metadata for a document. Owner is derived from the kind unless given. */
export function buildDocumentMetadata(input: BuildMetadataInput): DocumentMetadata {
  const owner: DocumentOwnerType = documentOwner(input.kind);
  const uploadedAt = new Date().toISOString();
  const storedFilename = storedPath(input.kind, input.filename);
  const version = input.version ?? 1;
  const visibility = input.visibility ?? defaultVisibilityFor(input.kind);

  const meta: Omit<DocumentMetadata, "checksum"> = {
    owner,
    ownerId: input.ownerId,
    bookingId: input.bookingId,
    vendorId: input.vendorId,
    customerId: input.customerId,
    fileType: input.mimeType,
    visibility,
    createdBy: input.createdBy,
    uploadedAt,
    hash: input.hash,
    originalFilename: (input.filename.split(/[\\/]/).pop() ?? input.filename).slice(0, 160),
    storedFilename,
    version,
  };

  // Integrity checksum over the metadata itself (stable, verifiable).
  const checksum = createHash("sha256").update(JSON.stringify(meta)).digest("hex").slice(0, 32);

  return { ...meta, checksum };
}
