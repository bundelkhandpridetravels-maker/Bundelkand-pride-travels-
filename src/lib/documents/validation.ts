/**
 * Central document validation. Pure, dependency-free. Every upload path runs
 * through here so limits and safety rules live in one place.
 */
import type { DocumentRecord } from "@/lib/documents/model";

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PDF_MIME_TYPES = ["application/pdf"] as const;
export const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...PDF_MIME_TYPES] as const;
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

export type UploadCandidate = {
  filename: string;
  mimeType: string;
  size: number;
};

export type ValidationOutcome = { ok: boolean; errors: string[] };

export function fileExtension(filename: string): string {
  const clean = filename.split(/[\\/]/).pop() ?? filename;
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1).toLowerCase();
}

export function isImage(mimeType: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isPdf(mimeType: string): boolean {
  return (PDF_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Core validation: type, extension and size. */
export function validateUpload(candidate: UploadCandidate): ValidationOutcome {
  const errors: string[] = [];

  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(candidate.mimeType)) {
    errors.push(`Unsupported file type: ${candidate.mimeType || "unknown"}.`);
  }
  const ext = fileExtension(candidate.filename);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    errors.push(`Unsupported file extension: ${ext ? `.${ext}` : "none"}.`);
  }
  if (!Number.isFinite(candidate.size) || candidate.size <= 0) {
    errors.push("File appears to be empty.");
  } else if (candidate.size > MAX_DOCUMENT_SIZE_BYTES) {
    errors.push(`File exceeds the ${Math.round(MAX_DOCUMENT_SIZE_BYTES / 1024 / 1024)} MB limit.`);
  }

  return { ok: errors.length === 0, errors };
}

export function validateImageUpload(candidate: UploadCandidate): ValidationOutcome {
  const base = validateUpload(candidate);
  if (base.ok && !isImage(candidate.mimeType)) {
    return { ok: false, errors: ["An image (JPEG/PNG/WebP) is required here."] };
  }
  return base;
}

export function validatePdfUpload(candidate: UploadCandidate): ValidationOutcome {
  const base = validateUpload(candidate);
  if (base.ok && !isPdf(candidate.mimeType)) {
    return { ok: false, errors: ["A PDF is required here."] };
  }
  return base;
}

/** Confidential docs must not be publicly visible. */
export function validateConfidential(record: Pick<DocumentRecord, "confidential" | "metadata">): ValidationOutcome {
  const errors: string[] = [];
  if (record.confidential && record.metadata.visibility === "public") {
    errors.push("A confidential document cannot have public visibility.");
  }
  return { ok: errors.length === 0, errors };
}

/** Path-stripping, lowercased, safe slug that preserves the extension. */
export function normalizeFilename(filename: string): string {
  const clean = (filename.split(/[\\/]/).pop() ?? filename).trim();
  const ext = fileExtension(clean);
  const base = ext ? clean.slice(0, clean.length - ext.length - 1) : clean;
  const safeBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "document";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

/** Duplicate detection by content hash. */
export function isDuplicateHash(hash: string | undefined, existingHashes: string[]): boolean {
  if (!hash) return false;
  return existingHashes.includes(hash);
}
