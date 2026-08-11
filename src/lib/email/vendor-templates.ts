/**
 * Pure vendor email renderers — the supply-side counterpart of templates.ts,
 * which is unchanged. Each takes the onboarding profile (the canonical model, not
 * a copy) and returns a typed EmailMessage from the same registry.
 *
 * Deliberately PROCESS communication only. No rates, commission, margins,
 * payment terms, cancellation policy or contract clauses appear here — those are
 * real commercial terms and belong to the founder, not to a template. The
 * agreement email points to the document rather than restating any term.
 *
 * Plain-text, no templating dependency — identical approach to templates.ts, so
 * both sets map into React Email together later.
 */
import { company } from "@/data/company";
import type { EmailMessage } from "@/lib/email/model";
import { VENDOR_TYPE_LABELS } from "@/lib/vendor/model";
import {
  evaluateOnboarding,
  type VendorOnboardingProfile,
} from "@/lib/vendor/onboarding";

const footer = `\n\n— ${company.name}\n${company.location} · ${company.phone}\n${company.tagline}`;

/** Supplier-facing greeting: owner name if captured, else the business. */
function greeting(p: VendorOnboardingProfile): string {
  const who = p.ownerName?.trim() || p.businessName?.trim();
  return who ? `Hi ${who},` : "Hello,";
}

function categoryLabel(p: VendorOnboardingProfile): string {
  return p.type ? VENDOR_TYPE_LABELS[p.type].toLowerCase() : "partner";
}

/** Outstanding required items, as a bulleted list. Empty string when none. */
function outstandingList(p: VendorOnboardingProfile): string {
  const { blockers } = evaluateOnboarding(p);
  if (blockers.length === 0) return "";
  return blockers.map((b) => `  · ${b}`).join("\n");
}

const to = (p: VendorOnboardingProfile) => p.email || undefined;

export function renderVendorOnboardingInvite(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `Thank you for your interest in partnering with ${company.name} as a ${categoryLabel(p)} partner.\n\n` +
    `We work with a curated network of verified suppliers, so every partner goes through a short ` +
    `review by our operations team before going live. To begin, we'll need your business details ` +
    `and a few compliance documents.\n\n` +
    `Our team will be in touch with the specifics. If you have questions, reach us on ${company.phone}.` +
    footer;
  return {
    template: "vendor_onboarding_invite",
    to: to(p),
    subject: `Partnering with ${company.name}`,
    text,
  };
}

export function renderVendorDetailsRequest(p: VendorOnboardingProfile): EmailMessage {
  const outstanding = outstandingList(p);
  const text =
    `${greeting(p)}\n\n` +
    `We're progressing your onboarding with ${company.name}.\n\n` +
    (outstanding
      ? `To move forward, we still need:\n${outstanding}\n\n`
      : `We're just confirming a few remaining details.\n\n`) +
    `You can send these across by replying to this email or on ${company.phone}.` +
    footer;
  return {
    template: "vendor_details_request",
    to: to(p),
    subject: `A few details needed — ${company.name} onboarding`,
    text,
  };
}

export function renderVendorDocumentsRequest(p: VendorOnboardingProfile): EmailMessage {
  const outstanding = outstandingList(p);
  const text =
    `${greeting(p)}\n\n` +
    `Thank you for the details shared so far. The last step before verification is your ` +
    `supporting documentation.\n\n` +
    (outstanding ? `Outstanding:\n${outstanding}\n\n` : "") +
    `Once received, our operations team will complete the verification review.` +
    footer;
  return {
    template: "vendor_documents_request",
    to: to(p),
    subject: `Documents needed to complete verification — ${company.name}`,
    text,
  };
}

export function renderVendorVerificationApproved(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `Good news — your business has been verified by the ${company.name} operations team.\n\n` +
    `The next step is our partnership agreement, which we'll share separately for your review ` +
    `and signature. You'll be listed in our supplier network once that is in place.\n\n` +
    `Thank you for working with us through the review.` +
    footer;
  return {
    template: "vendor_verification_approved",
    to: to(p),
    subject: `Your verification is complete — ${company.name}`,
    text,
  };
}

export function renderVendorVerificationRejected(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `Thank you for taking the time to go through our supplier review.\n\n` +
    `After consideration, we're not able to move forward with a partnership at this time. ` +
    `This is not a reflection of the quality of your business — our network is curated around ` +
    `specific destinations and capacity needs, which change over time.\n\n` +
    `We're grateful for your interest and would welcome revisiting this in future.` +
    footer;
  return {
    template: "vendor_verification_rejected",
    to: to(p),
    subject: `Update on your application — ${company.name}`,
    text,
  };
}

export function renderVendorAgreementSent(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `Please find our partnership agreement shared for your review and signature.\n\n` +
    `We'd ask you to read it in full — the commercial terms, service standards and ` +
    `cancellation terms are set out in the document itself. If anything needs clarifying ` +
    `before you sign, our team is happy to walk through it with you.\n\n` +
    `Once signed, we'll activate your listing in our supplier network.` +
    footer;
  return {
    template: "vendor_agreement_sent",
    to: to(p),
    subject: `Partnership agreement for signature — ${company.name}`,
    text,
  };
}

export function renderVendorActivated(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `Welcome to the ${company.name} supplier network — your partnership is now active.\n\n` +
    `Our operations team will be in touch as requirements come up for the destinations you serve. ` +
    `Please keep your availability and contact details current with us so we can reach you quickly.\n\n` +
    `We're glad to have you with us.` +
    footer;
  return {
    template: "vendor_activated",
    to: to(p),
    subject: `You're live with ${company.name}`,
    text,
  };
}

export function renderVendorSuspended(p: VendorOnboardingProfile): EmailMessage {
  const text =
    `${greeting(p)}\n\n` +
    `We're writing to let you know that your listing in the ${company.name} supplier network ` +
    `has been paused, and we won't be sending new requirements your way for the moment.\n\n` +
    `Our operations team will be in contact to discuss this with you directly.\n\n` +
    `If you'd like to speak with us sooner, reach us on ${company.phone}.` +
    footer;
  return {
    template: "vendor_suspended",
    to: to(p),
    subject: `Update on your listing — ${company.name}`,
    text,
  };
}
