// Server-only: imported by the onboarding dashboard + /api/vendors/onboarding.
import { randomUUID } from "node:crypto";
import {
  deriveStage,
  emptyOnboardingSummary,
  summarize,
  type OnboardingChannel,
  type OnboardingStage,
  type OnboardingSummary,
  type VendorOnboardingProfile,
  type VendorOnboardingRecord,
} from "@/lib/vendor/onboarding";

/**
 * Vendor onboarding persistence + aggregation boundary — the same pattern as
 * VendorRepository / VendorImportRepository / BookingRepository. Callers depend
 * on this interface, never a concrete store.
 *
 * Going live = implement PayloadVendorOnboardingRepository against the existing
 * `vendors` collection (onboarding writes the SAME record the vendor register
 * reads — no separate table, no duplicate model) and swap it in
 * `getVendorOnboardingRepository()`. The dashboard, API route and state machine
 * do not change.
 */
export interface VendorOnboardingRepository {
  getSummary(): Promise<OnboardingSummary>;
  list(): Promise<{ live: boolean; records: VendorOnboardingRecord[] }>;
  create(input: {
    profile: VendorOnboardingProfile;
    channel: OnboardingChannel;
    assignedTo?: string;
  }): Promise<VendorOnboardingRecord>;
  /** Records a human-approved stage decision. Guarded by advanceStage() upstream. */
  setStage(id: string, stage: OnboardingStage): Promise<{ live: boolean }>;
}

/**
 * Default store until the database is connected.
 *
 * Reads report `live:false` so every surface honestly shows "pending backend"
 * rather than an empty-looking real list. Writes are stamped and logged (the
 * ConsoleBookingRepository precedent) so nothing an operator enters is silently
 * lost pre-backend — but they are NOT persisted, and `create` says so via the
 * returned record's id prefix and the log line.
 */
class ConsoleVendorOnboardingRepository implements VendorOnboardingRepository {
  async getSummary(): Promise<OnboardingSummary> {
    return emptyOnboardingSummary(false);
  }

  async list(): Promise<{ live: boolean; records: VendorOnboardingRecord[] }> {
    return { live: false, records: [] };
  }

  async create(input: {
    profile: VendorOnboardingProfile;
    channel: OnboardingChannel;
    assignedTo?: string;
  }): Promise<VendorOnboardingRecord> {
    const now = new Date().toISOString();
    const record: VendorOnboardingRecord = {
      id: `vno_${randomUUID()}`,
      channel: input.channel,
      profile: input.profile,
      stage: deriveStage(input.profile),
      createdAt: now,
      updatedAt: now,
      assignedTo: input.assignedTo,
    };
    console.info("[vendor-onboarding:new]", JSON.stringify(record));
    return record;
  }

  async setStage(id: string, stage: OnboardingStage): Promise<{ live: boolean }> {
    console.info("[vendor-onboarding:stage]", JSON.stringify({ id, stage }));
    return { live: false };
  }
}

let repo: VendorOnboardingRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getVendorOnboardingRepository(): VendorOnboardingRepository {
  if (!repo) repo = new ConsoleVendorOnboardingRepository();
  return repo;
}

/** Re-exported for dashboards that fold a live list themselves. */
export { summarize };
