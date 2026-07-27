/**
 * Vendor onboarding — the staff-managed workflow that moves a supplier from
 * first contact to an active, verified partner.
 *
 * Phase 3 policy (founder, 2026-07): **staff-managed onboarding only**. BPT runs
 * a curated, verified-supplier ecosystem — every hotel, DMC, transport operator,
 * guide and activity partner is reviewed by the internal operations team before
 * becoming active. Supplier self-service applications arrive in Phase 4; the
 * bulk import pipeline (Excel/Gmail/OCR/business cards) in Phase 5. Both plug
 * into THIS state machine rather than replacing it — see ONBOARDING_CHANNELS.
 *
 * Design rule: onboarding adds NO new persisted status field. A stage is DERIVED
 * from fields the Payload `vendors` collection already defines
 * (`verificationStatus`, `agreementStatus`, `status`) plus profile completeness.
 * There is one vendor vocabulary (src/lib/vendor/model.ts) and one schema; this
 * module is the workflow on top of them, never a parallel model.
 */
import type { VendorRecord, VendorType, VerificationStatus } from "@/lib/vendor/model";

/* ------------------------------------------------------------------ *
 * Stages
 * ------------------------------------------------------------------ */

/**
 * Forward pipeline. Ordered — index doubles as progress. These are derived
 * views, not stored values.
 */
export const ONBOARDING_PIPELINE = [
  "identified",
  "profile",
  "documents",
  "verification",
  "agreement",
  "active",
] as const;

/** Off-ramps. A supplier can leave the pipeline at any point. */
export const ONBOARDING_EXITS = ["rejected", "suspended"] as const;

export const ONBOARDING_STAGES = [...ONBOARDING_PIPELINE, ...ONBOARDING_EXITS] as const;

export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];
export type OnboardingPipelineStage = (typeof ONBOARDING_PIPELINE)[number];

export const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  identified: "Identified",
  profile: "Profile",
  documents: "Documents",
  verification: "Verification",
  agreement: "Agreement",
  active: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const ONBOARDING_STAGE_DESCRIPTIONS: Record<OnboardingStage, string> = {
  identified: "Supplier captured by the operations team. Profile not yet complete.",
  profile: "Business, contact and destination details being captured.",
  documents: "Compliance documents and identifiers outstanding.",
  verification: "Submitted for internal review — awaiting a human verification decision.",
  agreement: "Verified. Commercial agreement to be issued and signed.",
  active: "Verified, contracted and available for allocation.",
  rejected: "Did not pass verification. Retained for the record.",
  suspended: "Previously active, temporarily withdrawn from allocation.",
};

/**
 * How a supplier can enter onboarding. Phase 3 ships `staff` only; the others
 * are declared so the roadmap is visible in code and so Phase 4/5 add a channel
 * without touching the state machine.
 */
export const ONBOARDING_CHANNELS = [
  { key: "staff", label: "Staff-managed", phase: 3, enabled: true },
  { key: "self_service", label: "Supplier application", phase: 4, enabled: false },
  { key: "import", label: "Bulk import", phase: 5, enabled: false },
] as const;

export type OnboardingChannel = (typeof ONBOARDING_CHANNELS)[number]["key"];

export function isChannelEnabled(channel: OnboardingChannel): boolean {
  return ONBOARDING_CHANNELS.some((c) => c.key === channel && c.enabled);
}

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */

/**
 * What the operations team captures during onboarding.
 *
 * Extends the canonical `VendorRecord` (reuse, not redefinition) with the
 * compliance fields the Payload `vendors` collection already declares —
 * ownerName, contact, address, gst, pan, businessAgeYears, googleReviewsUrl,
 * documents, photos. Nothing here is a new business concept.
 */
export type VendorOnboardingProfile = Partial<VendorRecord> & {
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  gst?: string;
  pan?: string;
  businessAgeYears?: number;
  googleReviewsUrl?: string;
  /** Refs into the Documents layer (src/lib/documents) — never file blobs. */
  documentRefs?: string[];
  photoRefs?: string[];
  /** Free-form operations notes captured during review. */
  notes?: string;
};

/** An onboarding record as dashboards and the repository see it. */
export type VendorOnboardingRecord = {
  id: string;
  channel: OnboardingChannel;
  profile: VendorOnboardingProfile;
  /** Derived — persisted only as a cache, never as the source of truth. */
  stage: OnboardingStage;
  createdAt: string;
  updatedAt: string;
  /** Who on the operations team owns this onboarding. */
  assignedTo?: string;
};

/* ------------------------------------------------------------------ *
 * Requirements
 * ------------------------------------------------------------------ */

export type RequirementGroup = "profile" | "compliance" | "documents" | "agreement";

export type OnboardingRequirement = {
  key: string;
  label: string;
  group: RequirementGroup;
  /** Blocks verification when unmet. Advisory items are `false`. */
  required: boolean;
  met: (p: VendorOnboardingProfile) => boolean;
};

const has = (v: unknown): boolean =>
  typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null;

/**
 * The baseline checklist every supplier must satisfy, derived from fields that
 * already exist in the Payload schema.
 *
 * NOTE: category-specific requirements (e.g. which certificates a hotel vs. a
 * transport operator must supply) are deliberately NOT invented here — see
 * `typeRequirements` below. The operations team supplies those rules.
 */
export const BASE_REQUIREMENTS: OnboardingRequirement[] = [
  { key: "businessName", label: "Registered business name", group: "profile", required: true, met: (p) => has(p.businessName) },
  { key: "type", label: "Supplier category", group: "profile", required: true, met: (p) => has(p.type) },
  { key: "contact", label: "Contact (phone or email)", group: "profile", required: true, met: (p) => has(p.phone) || has(p.email) },
  { key: "ownerName", label: "Owner / primary contact name", group: "profile", required: true, met: (p) => has(p.ownerName) },
  { key: "destinations", label: "Destinations served", group: "profile", required: true, met: (p) => (p.destinations?.length ?? 0) > 0 },
  { key: "address", label: "City / state", group: "profile", required: false, met: (p) => has(p.city) && has(p.state) },

  { key: "gst", label: "GST number", group: "compliance", required: false, met: (p) => has(p.gst) },
  { key: "pan", label: "PAN", group: "compliance", required: true, met: (p) => has(p.pan) },
  { key: "businessAge", label: "Years in business", group: "compliance", required: false, met: (p) => typeof p.businessAgeYears === "number" },
  { key: "googleReviews", label: "Google reviews profile", group: "compliance", required: false, met: (p) => has(p.googleReviewsUrl) },

  { key: "documents", label: "Supporting documents uploaded", group: "documents", required: true, met: (p) => (p.documentRefs?.length ?? 0) > 0 },
  { key: "photos", label: "Property / fleet photos", group: "documents", required: false, met: (p) => (p.photoRefs?.length ?? 0) > 0 },

  { key: "agreement", label: "Signed agreement on file", group: "agreement", required: true, met: (p) => p.agreementStatus === "signed" },
];

/**
 * Extension point for category-specific rules (hotel star-rating proof, transport
 * permits/insurance, guide licences…). Empty by design: these are real business
 * compliance rules and must come from the operations team, not be guessed.
 * Populate per VendorType when the founder supplies them — every consumer below
 * picks them up automatically.
 */
export const TYPE_REQUIREMENTS: Partial<Record<VendorType, OnboardingRequirement[]>> = {};

export function requirementsFor(type?: VendorType): OnboardingRequirement[] {
  return type ? [...BASE_REQUIREMENTS, ...(TYPE_REQUIREMENTS[type] ?? [])] : BASE_REQUIREMENTS;
}

export type RequirementStatus = {
  key: string;
  label: string;
  group: RequirementGroup;
  required: boolean;
  met: boolean;
};

export type OnboardingEvaluation = {
  stage: OnboardingStage;
  requirements: RequirementStatus[];
  /** 0–100 across required items only. */
  completeness: number;
  /** Unmet required items — what blocks the next human decision. */
  blockers: string[];
  /** True when every required item except the agreement is satisfied. */
  readyForVerification: boolean;
};

/* ------------------------------------------------------------------ *
 * Derivation
 * ------------------------------------------------------------------ */

/**
 * Derive the stage from the vendor's own fields. Pure and deterministic — the
 * same record always yields the same stage, so a cached `stage` can be
 * recomputed and never drifts from the schema.
 */
export function deriveStage(profile: VendorOnboardingProfile): OnboardingStage {
  const verification: VerificationStatus | undefined = profile.verificationStatus;

  // Terminal states win — they are explicit human decisions.
  if (verification === "rejected") return "rejected";
  if (verification === "suspended") return "suspended";

  if (verification === "verified") {
    if (profile.agreementStatus === "signed") {
      return profile.active === false ? "agreement" : "active";
    }
    return "agreement";
  }

  if (verification === "pending") return "verification";

  // Not yet submitted for review — position by what is still missing.
  const reqs = requirementsFor(profile.type);
  const profileDone = reqs
    .filter((r) => r.required && r.group === "profile")
    .every((r) => r.met(profile));
  const docsDone = reqs
    .filter((r) => r.required && (r.group === "documents" || r.group === "compliance"))
    .every((r) => r.met(profile));

  if (!profileDone) return has(profile.businessName) ? "profile" : "identified";
  if (!docsDone) return "documents";
  return "verification";
}

/** Full evaluation — stage, checklist, completeness and blockers. */
export function evaluateOnboarding(profile: VendorOnboardingProfile): OnboardingEvaluation {
  const reqs = requirementsFor(profile.type);
  const requirements: RequirementStatus[] = reqs.map((r) => ({
    key: r.key,
    label: r.label,
    group: r.group,
    required: r.required,
    met: r.met(profile),
  }));

  const required = requirements.filter((r) => r.required);
  const metCount = required.filter((r) => r.met).length;
  const completeness = required.length === 0 ? 0 : Math.round((metCount / required.length) * 100);

  const blockers = required.filter((r) => !r.met).map((r) => r.label);
  const readyForVerification = required
    .filter((r) => r.group !== "agreement")
    .every((r) => r.met);

  return {
    stage: deriveStage(profile),
    requirements,
    completeness,
    blockers,
    readyForVerification,
  };
}

/* ------------------------------------------------------------------ *
 * Transitions
 * ------------------------------------------------------------------ */

/** Legal stage moves. Anything not listed is rejected by `canAdvance`. */
export const ONBOARDING_TRANSITIONS: Record<OnboardingStage, OnboardingStage[]> = {
  identified: ["profile", "rejected"],
  profile: ["documents", "rejected"],
  documents: ["verification", "rejected"],
  verification: ["agreement", "rejected"],
  agreement: ["active", "rejected"],
  active: ["suspended"],
  rejected: [],
  suspended: ["active", "rejected"],
};

export function canAdvance(from: OnboardingStage, to: OnboardingStage): boolean {
  return ONBOARDING_TRANSITIONS[from].includes(to);
}

/**
 * Transitions that a human on the operations team must confirm.
 *
 * Verification, activation, rejection and suspension are trust decisions about a
 * real business — Hermes may prepare and recommend, but never executes these
 * (security-architecture §12 ApprovalQueue). This holds for every future channel,
 * including Phase 4 self-service applications.
 */
const HUMAN_APPROVAL_STAGES: readonly OnboardingStage[] = [
  "verification",
  "agreement",
  "active",
  "rejected",
  "suspended",
];

export function requiresHumanApproval(to: OnboardingStage): boolean {
  return HUMAN_APPROVAL_STAGES.includes(to);
}

export type TransitionResult =
  | { ok: true; stage: OnboardingStage; humanApproval: boolean }
  | { ok: false; error: string };

/**
 * Guarded transition. Refuses illegal moves and refuses to advance past
 * verification while required items are unmet — the checklist is enforced here,
 * not only in the UI.
 */
export function advanceStage(
  profile: VendorOnboardingProfile,
  to: OnboardingStage,
): TransitionResult {
  const from = deriveStage(profile);

  if (from === to) return { ok: false, error: `Already at "${ONBOARDING_STAGE_LABELS[to]}".` };
  if (!canAdvance(from, to)) {
    return {
      ok: false,
      error: `Cannot move from "${ONBOARDING_STAGE_LABELS[from]}" to "${ONBOARDING_STAGE_LABELS[to]}".`,
    };
  }

  // Rejection and suspension are always permitted exits — no completeness gate.
  if (to !== "rejected" && to !== "suspended") {
    const { readyForVerification, blockers } = evaluateOnboarding(profile);
    if (to === "agreement" && !readyForVerification) {
      return { ok: false, error: `Outstanding before verification: ${blockers.join(", ")}.` };
    }
    if (to === "active" && profile.agreementStatus !== "signed") {
      return { ok: false, error: "A signed agreement is required before activation." };
    }
  }

  return { ok: true, stage: to, humanApproval: requiresHumanApproval(to) };
}

/* ------------------------------------------------------------------ *
 * Aggregation
 * ------------------------------------------------------------------ */

export type OnboardingSummary = {
  live: boolean;
  total: number;
  counts: Record<OnboardingStage, number>;
  /** Average completeness across in-pipeline suppliers. */
  avgCompleteness: number;
};

export function emptyOnboardingSummary(live = false): OnboardingSummary {
  return {
    live,
    total: 0,
    counts: {
      identified: 0,
      profile: 0,
      documents: 0,
      verification: 0,
      agreement: 0,
      active: 0,
      rejected: 0,
      suspended: 0,
    },
    avgCompleteness: 0,
  };
}

/** Fold records into a summary. Used by the repository and the dashboard. */
export function summarize(records: VendorOnboardingRecord[], live: boolean): OnboardingSummary {
  const summary = emptyOnboardingSummary(live);
  summary.total = records.length;
  if (records.length === 0) return summary;

  let completenessTotal = 0;
  for (const record of records) {
    const { stage, completeness } = evaluateOnboarding(record.profile);
    summary.counts[stage] += 1;
    completenessTotal += completeness;
  }
  summary.avgCompleteness = Math.round(completenessTotal / records.length);
  return summary;
}
