import { z } from "zod";
import { VENDOR_TYPES } from "@/lib/vendor/model";
import type { VendorOnboardingProfile } from "@/lib/vendor/onboarding";

/**
 * Staff intake contract — what an operations-team member submits when onboarding
 * a supplier from the console.
 *
 * Field shapes mirror the Payload `vendors` collection so the backend swap is a
 * drop-in, and the GST/PAN/phone/email formats reuse the SAME expressions the
 * import validator applies (src/lib/vendor-import/validation.ts) so a supplier is
 * held to one standard whichever channel they arrive through.
 *
 * Phase 4 self-service applications and Phase 5 bulk import will reuse this
 * schema rather than define their own.
 */

// India GST and PAN formats — identical to the import validator.
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^[+0-9 ()-]{7,20}$/;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const vendorOnboardingIntakeSchema = z
  .object({
    // Identity
    businessName: z.string().trim().min(2, "Enter the registered business name.").max(160),
    type: z.enum(VENDOR_TYPES),
    ownerName: optionalText(120),

    // Contact — at least one of phone/email is enforced below.
    phone: z
      .string()
      .trim()
      .max(20)
      .regex(PHONE_RE, "Enter a valid phone number.")
      .optional()
      .or(z.literal("")),
    email: z.string().trim().max(160).email("Enter a valid email.").optional().or(z.literal("")),
    city: optionalText(80),
    state: optionalText(80),

    // Coverage — destination slugs; free text until the DB supplies real ones.
    destinations: z.array(z.string().trim().min(1).max(80)).max(40).default([]),

    // Compliance
    gst: z
      .string()
      .trim()
      .toUpperCase()
      .regex(GST_RE, "GST number format looks invalid.")
      .optional()
      .or(z.literal("")),
    pan: z
      .string()
      .trim()
      .toUpperCase()
      .regex(PAN_RE, "PAN format looks invalid.")
      .optional()
      .or(z.literal("")),
    businessAgeYears: z.coerce.number().int().min(0).max(200).optional(),
    googleReviewsUrl: z.string().trim().max(300).url("Enter a valid URL.").optional().or(z.literal("")),

    // Operations
    notes: optionalText(2000),
    assignedTo: optionalText(80),
  })
  .refine((v) => Boolean(v.phone) || Boolean(v.email), {
    message: "Provide at least a phone number or an email.",
    path: ["phone"],
  });

export type VendorOnboardingIntake = z.infer<typeof vendorOnboardingIntakeSchema>;

/** Blank string → undefined, so completeness checks aren't fooled by "". */
const clean = (v?: string): string | undefined => {
  const t = v?.trim();
  return t ? t : undefined;
};

/**
 * Map validated intake onto the canonical onboarding profile.
 *
 * A newly captured supplier is `unverified` with no agreement — the state
 * machine derives the stage from there. Verification is never granted at intake;
 * it is a separate human decision.
 */
export function intakeToProfile(input: VendorOnboardingIntake): VendorOnboardingProfile {
  return {
    businessName: input.businessName.trim(),
    type: input.type,
    ownerName: clean(input.ownerName),
    phone: clean(input.phone),
    email: clean(input.email),
    city: clean(input.city),
    state: clean(input.state),
    destinations: input.destinations,
    gst: clean(input.gst),
    pan: clean(input.pan),
    businessAgeYears: input.businessAgeYears,
    googleReviewsUrl: clean(input.googleReviewsUrl),
    notes: clean(input.notes),

    // Trust state at capture — deliberately the lowest.
    verificationStatus: "unverified",
    agreementStatus: "none",
    qualityScore: null,
    active: false,
    documentRefs: [],
    photoRefs: [],
  };
}
