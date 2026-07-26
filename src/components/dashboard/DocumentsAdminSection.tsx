import { Panel } from "@/components/founder/Primitives";
import {
  DOCUMENT_KINDS,
  DOCUMENT_STATUSES,
  documentGroup,
  labelForKind,
  isConfidentialKind,
  type DocumentGroup,
} from "@/lib/documents/model";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/documents/validation";
import { getDocumentProvider } from "@/lib/documents/provider";

/**
 * Additive Admin "Documents" section — surfaces the Document Management
 * architecture (types, provider, validation, statuses). Presentational; nothing
 * uploads. Reused by the Admin dashboard.
 */

const GROUP_LABELS: Record<DocumentGroup, string> = {
  customer: "Customer",
  vendor: "Vendor",
  booking: "Booking",
};

export default function DocumentsAdminSection() {
  const provider = getDocumentProvider().name;
  const groups: DocumentGroup[] = ["customer", "vendor", "booking"];

  return (
    <div className="space-y-6">
      {/* Supported types */}
      <Panel eyebrow="Documents" title="Supported document types">
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                {GROUP_LABELS[g]}
              </p>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_KINDS.filter((k) => documentGroup(k) === g).map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11.5px] text-white/65"
                  >
                    {labelForKind(k)}
                    {isConfidentialKind(k) && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-amber-300/80" title="Confidential">
                        conf
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Provider + validation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Storage" title="Upload provider">
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Active provider</span>
              <span className="font-mono text-white/85">{provider}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Status</span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300">
                logs only — not stored
              </span>
            </div>
            <p className="pt-1 text-[11.5px] leading-relaxed text-white/40">
              Seam ready for Cloudflare R2 / AWS S3 / GCS / Azure. No storage dependency installed yet.
            </p>
          </div>
        </Panel>

        <Panel eyebrow="Validation" title="Upload rules">
          <ul className="space-y-2 text-[13px]">
            <li className="flex justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Max size</span>
              <span className="font-mono text-white/85">{Math.round(MAX_DOCUMENT_SIZE_BYTES / 1024 / 1024)} MB</span>
            </li>
            <li className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Allowed types</span>
              <p className="mt-1 font-mono text-[11px] text-white/50">{ALLOWED_MIME_TYPES.join(", ")}</p>
            </li>
            <li className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
              <span className="text-white/70">Extensions</span>
              <p className="mt-1 font-mono text-[11px] text-white/50">.{ALLOWED_EXTENSIONS.join(", .")}</p>
            </li>
          </ul>
        </Panel>
      </div>

      {/* Workflow statuses */}
      <Panel eyebrow="Workflow" title="Document lifecycle">
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_STATUSES.map((s, i) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60"
            >
              <span className="font-mono text-[9px] text-white/30">{i + 1}</span>
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
