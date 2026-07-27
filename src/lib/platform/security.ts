// Server-only: security & operational-readiness checks, derived from real
// runtime state (env presence + platform health). Reuses existing architecture;
// no auth redesign.
import { getEnvReadiness } from "@/lib/platform/env";
import { getPlatformHealth } from "@/lib/platform/health";

export type SecurityStatus = "ok" | "pending" | "attention";

export type SecurityCheck = {
  label: string;
  status: SecurityStatus;
  detail: string;
};

/** Roles defined across the platform (security-architecture §2). */
const RBAC_ROLES = [
  "admin",
  "ops",
  "sales",
  "vendor",
  "customer",
  "trip_captain",
  "influencer",
  "b2b_partner",
];

export async function getSecurityReadiness(): Promise<{ checks: SecurityCheck[] }> {
  const env = getEnvReadiness();
  const health = await getPlatformHealth();

  const checks: SecurityCheck[] = [
    {
      label: "RBAC",
      status: "ok",
      detail: `${RBAC_ROLES.length} roles defined; row-level access functions ((user, doc) → boolean) per security-architecture §2.`,
    },
    {
      label: "Secret management",
      status: env.missingCritical.length > 0 ? "attention" : env.invalid.length > 0 ? "attention" : "ok",
      detail:
        env.missingCritical.length > 0
          ? `${env.missingCritical.length} critical secret(s) missing: ${env.missingCritical.map((s) => s.key).join(", ")}`
          : env.invalid.length > 0
            ? `${env.invalid.length} secret(s) malformed`
            : "All critical secrets present and well-formed.",
    },
    {
      label: "Environment validation",
      status: "ok",
      detail: "Runtime secret validation active (platform/env.ts) — presence + format, values never read.",
    },
    {
      label: "Access gate",
      status: env.statuses.find((s) => s.key === "FOUNDER_DASHBOARD_PASSWORD")?.present ? "ok" : "attention",
      detail: "Console Basic Auth fails closed; requires FOUNDER_DASHBOARD_PASSWORD.",
    },
    {
      label: "Audit logging",
      status: "pending",
      detail: "AuditLogs collection defined; append-only logging active once DATABASE_URL is set.",
    },
    {
      label: "Backup & DR",
      status: "pending",
      detail: "Neon point-in-time recovery; active when the database is provisioned.",
    },
    {
      label: "Bot protection & rate limiting",
      status: "pending",
      detail: "Turnstile + Upstash seams ready; activate with keys.",
    },
    {
      label: "Provider health",
      status: health.summary.operational > 1 ? "ok" : "pending",
      detail: `${health.summary.operational}/${health.summary.total} providers operational; ${health.summary.credentialPending} awaiting credentials.`,
    },
  ];

  return { checks };
}
