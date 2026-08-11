// Server-only: vendor lifecycle email orchestration (resolve → gate → send).
import type { EmailMessage, EmailSendResult, EmailTemplateId } from "@/lib/email/model";
import { getEmailProvider } from "@/lib/email/email-provider";
import {
  renderVendorActivated,
  renderVendorAgreementSent,
  renderVendorDetailsRequest,
  renderVendorDocumentsRequest,
  renderVendorOnboardingInvite,
  renderVendorSuspended,
  renderVendorVerificationApproved,
  renderVendorVerificationRejected,
} from "@/lib/email/vendor-templates";
import {
  deriveStage,
  type OnboardingStage,
  type VendorOnboardingProfile,
} from "@/lib/vendor/onboarding";

/**
 * Vendor email automation — the supply-side counterpart of workflow.ts, which is
 * unchanged. Driven by the M1 onboarding state machine: a stage IS the trigger,
 * so there is no second source of truth about where a supplier stands.
 *
 * The safety rule is enforced HERE, in code, not merely documented: routine
 * process nudges may auto-send, but anything that communicates a trust, legal or
 * relationship decision (verification approved/declined, agreement dispatch,
 * activation, suspension) is DRAFTED and returned for a human to approve —
 * security-architecture §12 ApprovalQueue. Hermes may prepare these; it can
 * never cause one to leave the building.
 *
 * Delivery goes through the existing getEmailProvider(): the console stub logs
 * today and Resend delivers the moment RESEND_API_KEY + EMAIL_FROM are set — no
 * change to this file or the templates.
 */

export type VendorEmailTemplateId = Extract<EmailTemplateId, `vendor_${string}`>;

/** Per-template automation policy. */
export type VendorEmailPolicy = {
  template: VendorEmailTemplateId;
  /** May the platform send this without a human pressing send? */
  autoSend: boolean;
  /** Why — shown in the console so the policy is legible, not buried. */
  rationale: string;
  /**
   * Reminder cadence in days for auto-send chasers, or null for one-shot mails.
   * DEFAULTS pending founder confirmation — a scheduler is not wired yet (no cron
   * or queue infrastructure), so nothing fires on a timer today. When one lands,
   * it reads these values; they are not baked into any template.
   */
  reminderAfterDays: number | null;
};

export const VENDOR_EMAIL_POLICIES: Record<VendorEmailTemplateId, VendorEmailPolicy> = {
  vendor_onboarding_invite: {
    template: "vendor_onboarding_invite",
    autoSend: true,
    rationale: "Introductory process email — commits BPT to nothing.",
    reminderAfterDays: null,
  },
  vendor_details_request: {
    template: "vendor_details_request",
    autoSend: true,
    rationale: "Chaser for missing profile fields — routine operations.",
    reminderAfterDays: 3,
  },
  vendor_documents_request: {
    template: "vendor_documents_request",
    autoSend: true,
    rationale: "Chaser for outstanding documents — routine operations.",
    reminderAfterDays: 3,
  },
  vendor_verification_approved: {
    template: "vendor_verification_approved",
    autoSend: false,
    rationale: "Communicates a trust decision about a real business.",
    reminderAfterDays: null,
  },
  vendor_verification_rejected: {
    template: "vendor_verification_rejected",
    autoSend: false,
    rationale: "Declines a business relationship — must be a human decision.",
    reminderAfterDays: null,
  },
  vendor_agreement_sent: {
    template: "vendor_agreement_sent",
    autoSend: false,
    rationale: "Dispatches a legal document for signature.",
    reminderAfterDays: null,
  },
  vendor_activated: {
    template: "vendor_activated",
    autoSend: false,
    rationale: "Confirms a live commercial relationship.",
    reminderAfterDays: null,
  },
  vendor_suspended: {
    template: "vendor_suspended",
    autoSend: false,
    rationale: "Withdraws a partner from allocation — relationship-affecting.",
    reminderAfterDays: null,
  },
};

/**
 * Which email belongs to which onboarding stage. `identified` has no mail — a
 * supplier captured from a site visit is not emailed until operations chooses to
 * invite them, so `vendor_onboarding_invite` is dispatched explicitly.
 */
export const STAGE_EMAIL: Record<OnboardingStage, VendorEmailTemplateId | null> = {
  identified: null,
  profile: "vendor_details_request",
  documents: "vendor_documents_request",
  verification: null,
  agreement: "vendor_agreement_sent",
  active: "vendor_activated",
  rejected: "vendor_verification_rejected",
  suspended: "vendor_suspended",
};

const RENDERERS: Record<
  VendorEmailTemplateId,
  (p: VendorOnboardingProfile) => EmailMessage
> = {
  vendor_onboarding_invite: renderVendorOnboardingInvite,
  vendor_details_request: renderVendorDetailsRequest,
  vendor_documents_request: renderVendorDocumentsRequest,
  vendor_verification_approved: renderVendorVerificationApproved,
  vendor_verification_rejected: renderVendorVerificationRejected,
  vendor_agreement_sent: renderVendorAgreementSent,
  vendor_activated: renderVendorActivated,
  vendor_suspended: renderVendorSuspended,
};

/** Render without sending — safe for previews and the approval queue. */
export function renderVendorEmail(
  profile: VendorOnboardingProfile,
  template: VendorEmailTemplateId,
): EmailMessage {
  return RENDERERS[template](profile);
}

export type VendorEmailDispatch =
  | { status: "sent"; template: VendorEmailTemplateId; result: EmailSendResult }
  | {
      /** Drafted and held. The message is returned so a human can review and approve it. */
      status: "requires_approval";
      template: VendorEmailTemplateId;
      message: EmailMessage;
      reason: string;
    }
  | { status: "skipped"; template: VendorEmailTemplateId; reason: string };

/**
 * Dispatch one vendor email.
 *
 * `approvedBy` is the human authorisation. Without it, an approval-gated
 * template is drafted and returned — never sent. Passing `approvedBy` is only
 * legitimate when a real person has confirmed the action in the console; it must
 * never be supplied by an automated caller to satisfy the gate.
 */
export async function dispatchVendorEmail(
  profile: VendorOnboardingProfile,
  template: VendorEmailTemplateId,
  options: { approvedBy?: string } = {},
): Promise<VendorEmailDispatch> {
  const policy = VENDOR_EMAIL_POLICIES[template];
  const message = renderVendorEmail(profile, template);

  // No recipient — never send blind, and say so rather than failing silently.
  if (!message.to) {
    return {
      status: "skipped",
      template,
      reason: "No email address captured for this supplier.",
    };
  }

  const approver = options.approvedBy?.trim();
  if (!policy.autoSend && !approver) {
    return {
      status: "requires_approval",
      template,
      message,
      reason: policy.rationale,
    };
  }

  const result = await getEmailProvider().send(message);
  return { status: "sent", template, result };
}

/**
 * The email (if any) due at a supplier's CURRENT stage — derived, so it cannot
 * disagree with the onboarding dashboard. Returns null when the stage has no
 * associated mail.
 */
export function pendingVendorEmail(
  profile: VendorOnboardingProfile,
): { template: VendorEmailTemplateId; policy: VendorEmailPolicy } | null {
  const template = STAGE_EMAIL[deriveStage(profile)];
  if (!template) return null;
  return { template, policy: VENDOR_EMAIL_POLICIES[template] };
}

/**
 * Dispatch whatever the supplier's current stage calls for. Convenience for the
 * console and, later, the CRM — the same gate still applies.
 */
export async function dispatchStageEmail(
  profile: VendorOnboardingProfile,
  options: { approvedBy?: string } = {},
): Promise<VendorEmailDispatch | null> {
  const pending = pendingVendorEmail(profile);
  if (!pending) return null;
  return dispatchVendorEmail(profile, pending.template, options);
}
