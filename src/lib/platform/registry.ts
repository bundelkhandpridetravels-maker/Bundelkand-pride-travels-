// Server-only: introspects the real state of every existing module. No fake
// data — each descriptor reads the actual repository/provider and required env.
import { getCrmRepository } from "@/lib/crm/crm-repository";
import { getVendorRepository } from "@/lib/vendor/vendor-repository";
import { getMarketingRepository } from "@/lib/marketing/marketing-repository";
import { getReviewRepository } from "@/lib/reviews/review-repository";
import { getVendorImportRepository } from "@/lib/vendor-import/import-repository";
import { getEmailProvider } from "@/lib/email/email-provider";
import { getDocumentProvider } from "@/lib/documents/provider";
import { HERMES_ENABLED } from "@/lib/hermes";

export type PlatformLayer = "customer" | "business" | "platform";

export type PlatformModuleId =
  | "booking"
  | "quote"
  | "reviews"
  | "payments"
  | "crm"
  | "vendor"
  | "vendor_import"
  | "marketing"
  | "documents"
  | "email"
  | "hermes";

export interface ModuleDescriptor {
  id: PlatformModuleId;
  label: string;
  layer: PlatformLayer;
  /** Env vars required to make this module operational (presence checked, never values). */
  requiredEnv: string[];
  /** Current provider/seam name. */
  provider: string;
  /** True when the module is backed by real, live data. */
  checkLive: () => Promise<boolean>;
}

/**
 * The single registry of platform modules. Aggregates existing repositories and
 * providers — reuses them, never re-implements. Adding a future module means one
 * entry here.
 */
export const platformModules: ModuleDescriptor[] = [
  {
    id: "quote",
    label: "Quote generation",
    layer: "customer",
    requiredEnv: [],
    provider: "stateless",
    checkLive: async () => true, // stateless — fully operational today
  },
  {
    id: "booking",
    label: "Booking journey",
    layer: "customer",
    requiredEnv: ["DATABASE_URL"],
    provider: "console",
    checkLive: async () => false, // ConsoleBookingRepository — not persisted
  },
  {
    id: "reviews",
    label: "Review collection",
    layer: "customer",
    requiredEnv: ["DATABASE_URL"],
    provider: "console",
    checkLive: async () => (await getReviewRepository().getSummary()).live,
  },
  {
    id: "payments",
    label: "Payments",
    layer: "customer",
    requiredEnv: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
    provider: "pending",
    checkLive: async () => false, // intentionally postponed (GST/merchant)
  },
  {
    id: "crm",
    label: "CRM brain",
    layer: "business",
    requiredEnv: ["DATABASE_URL"],
    provider: "console",
    checkLive: async () => (await getCrmRepository().getPipelineSummary()).live,
  },
  {
    id: "vendor",
    label: "Vendor management",
    layer: "business",
    requiredEnv: ["DATABASE_URL"],
    provider: "console",
    checkLive: async () => (await getVendorRepository().getVerificationSummary()).live,
  },
  {
    id: "vendor_import",
    label: "Vendor import",
    layer: "business",
    requiredEnv: ["DATABASE_URL", "GOOGLE_CLIENT_ID"],
    provider: "manual",
    checkLive: async () => (await getVendorImportRepository().getBatchSummary()).live,
  },
  {
    id: "marketing",
    label: "Marketing & partnerships",
    layer: "business",
    requiredEnv: ["DATABASE_URL"],
    provider: "console",
    checkLive: async () => (await getMarketingRepository().getSummary()).live,
  },
  {
    id: "documents",
    label: "Document management",
    layer: "platform",
    requiredEnv: ["DATABASE_URL", "R2_ACCESS_KEY_ID"],
    provider: getDocumentProvider().name,
    checkLive: async () => getDocumentProvider().name !== "console",
  },
  {
    id: "email",
    label: "Email workflows",
    layer: "platform",
    requiredEnv: ["RESEND_API_KEY"],
    provider: getEmailProvider().name,
    checkLive: async () => getEmailProvider().name !== "console",
  },
  {
    id: "hermes",
    label: "Hermes AI",
    layer: "platform",
    requiredEnv: [],
    provider: "contract",
    checkLive: async () => HERMES_ENABLED,
  },
];
