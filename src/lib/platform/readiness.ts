// Server-only: Go-Live readiness report, derived from real platform health.
import { getPlatformHealth } from "@/lib/platform/health";

export type ReadinessBucket =
  | "architecture_complete"
  | "provider_pending"
  | "credential_pending"
  | "business_pending";

export type ReadinessItem = {
  label: string;
  detail?: string;
};

export type GoLiveReadiness = {
  architectureComplete: ReadinessItem[];
  providerPending: ReadinessItem[];
  credentialPending: ReadinessItem[];
  businessPending: ReadinessItem[];
  /** 0–100: share of modules operational. */
  operationalPct: number;
};

/**
 * Business-data blockers — real, known items that need founder-supplied data
 * (not code). Kept explicit so they never masquerade as "done".
 */
const BUSINESS_PENDING: ReadinessItem[] = [
  { label: "Google Place ID", detail: "Enables Google review handoff (reviews/google.ts)." },
  { label: "Real vendor data", detail: "Verified hotels/DMCs/transport to seed the vendor network." },
  { label: "Partner hotel names per destination × category", detail: "For category-based stays." },
  { label: "Per-departure operational details", detail: "Dates/reporting/transport/hotel/seats/price/inclusions." },
  { label: "GST rate", detail: "Applied to quotes/invoices once GST registration completes." },
  { label: "Licensed hero media", detail: "Photos/video for the cinematic hero + galleries." },
];

export async function getGoLiveReadiness(): Promise<GoLiveReadiness> {
  const health = await getPlatformHealth();

  const architectureComplete: ReadinessItem[] = health.modules.map((m) => ({
    label: m.label,
    detail: m.live ? "Operational" : `Architecture complete · provider: ${m.provider}`,
  }));

  const providerPending: ReadinessItem[] = health.modules
    .filter((m) => m.readiness === "provider_pending")
    .map((m) => ({ label: m.label, detail: `Implement provider (${m.provider} stub).` }));

  const credentialPending: ReadinessItem[] = health.modules
    .filter((m) => m.readiness === "credential_pending")
    .map((m) => ({ label: m.label, detail: `Missing: ${m.missingEnv.join(", ")}` }));

  const operationalPct = Math.round((health.summary.operational / health.summary.total) * 100);

  return {
    architectureComplete,
    providerPending,
    credentialPending,
    businessPending: BUSINESS_PENDING,
    operationalPct,
  };
}
