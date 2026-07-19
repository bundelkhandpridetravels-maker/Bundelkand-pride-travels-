import { z } from "zod";

/**
 * The single typed enquiry path for the whole site.
 *
 * Every "Book Now" / "Reserve Your Seat" / "Plan my trip" action funnels through
 * this model and `submitEnquiry()`. When the CRM / Neon / Payload backend lands,
 * only the API route's sink changes — no form or button is touched.
 *
 * Shape mirrors the planned Payload "Inquiries" collection (see docs/architecture.md)
 * and captures attribution (source, package, campaign) from day one so lead
 * analytics never has to be retrofitted.
 */

export const BUDGET_RANGES = [
  "Under ₹10,000 pp",
  "₹10,000 – ₹20,000 pp",
  "₹20,000 – ₹35,000 pp",
  "₹35,000 – ₹60,000 pp",
  "₹60,000+ pp",
  "Not sure yet",
] as const;

/** Where the enquiry originated — for attribution / future sales dashboard. */
export const ENQUIRY_SOURCES = [
  "package_page",
  "departure_board",
  "contact_page",
  "hero_search",
  "general",
] as const;

export type EnquirySource = (typeof ENQUIRY_SOURCES)[number];

/** Client → server payload. Validated identically on both sides. */
export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number, including country code.")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Enter a valid phone number."),
  email: z
    .string()
    .trim()
    .max(120)
    .email("Enter a valid email, or leave it blank.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  adults: z.coerce.number().int().min(1, "At least one adult.").max(40),
  children: z.coerce.number().int().min(0).max(40),
  preferredDate: z.string().trim().max(40).optional().or(z.literal("")),
  packageSlug: z.string().trim().max(80).optional().or(z.literal("")),
  packageTitle: z.string().trim().max(160).optional().or(z.literal("")),
  budgetRange: z.enum(BUDGET_RANGES).optional(),
  specialRequirements: z.string().trim().max(1000).optional().or(z.literal("")),
  // Attribution — never shown to the user, always captured.
  source: z.enum(ENQUIRY_SOURCES).default("general"),
  campaign: z.string().trim().max(120).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

/** Persisted enquiry — what the repository/CRM stores. */
export type Enquiry = EnquiryInput & {
  id: string;
  status: "new" | "contacted" | "quoted" | "converted" | "closed";
  createdAt: string;
};

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors?: Partial<Record<keyof EnquiryInput, string>>; error?: string };

/**
 * Client-side submit. Posts to the one API route. UI never calls fetch directly
 * or knows where the data lands — swapping the backend is invisible here.
 */
type ApiResponse = {
  ok?: boolean;
  id?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof EnquiryInput, string>>;
};

export async function submitEnquiry(input: EnquiryInput): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse;
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        fieldErrors: data.fieldErrors,
        error: data.error ?? "Something went wrong. Please try again.",
      };
    }
    return { ok: true, id: data.id ?? "" };
  } catch {
    return {
      ok: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

/**
 * Secondary channel — WhatsApp deep link with the enquiry context prefilled.
 * Kept as a fallback/support action, not the primary flow.
 */
export function whatsappEnquiryUrl(
  whatsappHref: string,
  input: Partial<EnquiryInput>,
): string {
  const lines = [
    "Trip enquiry — Bundelkhand Pride Travels",
    "",
    input.name && `Name: ${input.name}`,
    input.phone && `Phone: ${input.phone}`,
    input.packageTitle && `Package: ${input.packageTitle}`,
    input.preferredDate && `Preferred date: ${input.preferredDate}`,
    (input.adults || input.children) &&
      `Travellers: ${input.adults ?? 0} adult(s), ${input.children ?? 0} child(ren)`,
    input.budgetRange && `Budget: ${input.budgetRange}`,
    input.specialRequirements && `Notes: ${input.specialRequirements}`,
  ].filter(Boolean);
  return `${whatsappHref}?text=${encodeURIComponent(lines.join("\n"))}`;
}
