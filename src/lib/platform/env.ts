// Server-only: environment & secret validation. Reads PRESENCE and light FORMAT
// only — never the values themselves, never logged. Powers the Validation
// dashboard's secret/credential readiness.

export type SecretDescriptor = {
  key: string;
  label: string;
  requiredFor: string;
  /** Critical secrets block core go-live (console, database). */
  critical: boolean;
  /** Optional format check on the value (value never leaves this function). */
  validate?: (value: string) => boolean;
};

export const SECRETS: SecretDescriptor[] = [
  { key: "FOUNDER_DASHBOARD_PASSWORD", label: "Founder console password", requiredFor: "Console access", critical: true },
  { key: "DATABASE_URL", label: "Neon Postgres URL", requiredFor: "All repositories (Payload)", critical: true, validate: (v) => v.startsWith("postgres") },
  { key: "RESEND_API_KEY", label: "Resend API key", requiredFor: "Email delivery", critical: false, validate: (v) => v.startsWith("re_") },
  { key: "EMAIL_FROM", label: "Email from address", requiredFor: "Email delivery", critical: false, validate: (v) => v.includes("@") },
  { key: "EMAIL_INTERNAL", label: "Internal notification address", requiredFor: "Internal email routing", critical: false, validate: (v) => v.includes("@") },
  { key: "R2_ACCOUNT_ID", label: "Cloudflare R2 account id", requiredFor: "Document storage", critical: false },
  { key: "R2_ACCESS_KEY_ID", label: "R2 access key id", requiredFor: "Document storage", critical: false },
  { key: "R2_SECRET_ACCESS_KEY", label: "R2 secret access key", requiredFor: "Document storage", critical: false },
  { key: "R2_BUCKET", label: "R2 bucket", requiredFor: "Document storage", critical: false },
  { key: "RAZORPAY_KEY_ID", label: "Razorpay key id", requiredFor: "Payments", critical: false, validate: (v) => v.startsWith("rzp_") },
  { key: "RAZORPAY_KEY_SECRET", label: "Razorpay key secret", requiredFor: "Payments", critical: false },
  { key: "GOOGLE_CLIENT_ID", label: "Google OAuth client id", requiredFor: "Gmail vendor import", critical: false },
  { key: "GOOGLE_CLIENT_SECRET", label: "Google OAuth client secret", requiredFor: "Gmail vendor import", critical: false },
  { key: "GOOGLE_PLACE_ID", label: "Google Place ID", requiredFor: "Review handoff", critical: false },
  { key: "TURNSTILE_SECRET_KEY", label: "Cloudflare Turnstile secret", requiredFor: "Bot protection", critical: false },
  { key: "UPSTASH_REDIS_REST_URL", label: "Upstash Redis URL", requiredFor: "Rate limiting", critical: false },
  { key: "SENTRY_DSN", label: "Sentry DSN", requiredFor: "Monitoring", critical: false },
];

export type SecretStatus = {
  key: string;
  label: string;
  requiredFor: string;
  critical: boolean;
  present: boolean;
  /** true when present and (if a validator exists) well-formed. */
  valid: boolean;
};

export function getSecretStatuses(): SecretStatus[] {
  return SECRETS.map((s) => {
    const raw = process.env[s.key];
    const present = Boolean(raw && raw.length > 0);
    const valid = present ? (s.validate ? s.validate(raw as string) : true) : false;
    return { key: s.key, label: s.label, requiredFor: s.requiredFor, critical: s.critical, present, valid };
  });
}

export type EnvReadiness = {
  total: number;
  present: number;
  missingCritical: SecretStatus[];
  invalid: SecretStatus[];
  statuses: SecretStatus[];
};

export function getEnvReadiness(): EnvReadiness {
  const statuses = getSecretStatuses();
  return {
    total: statuses.length,
    present: statuses.filter((s) => s.present).length,
    missingCritical: statuses.filter((s) => s.critical && !s.present),
    invalid: statuses.filter((s) => s.present && !s.valid),
    statuses,
  };
}
