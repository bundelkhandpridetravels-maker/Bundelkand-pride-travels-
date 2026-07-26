import { z } from "zod";
import { featuredPackages, type PackageCard } from "@/data/home";
import { packageDetails } from "@/data/packages";
import { company } from "@/data/company";
import { buildQuote, type Quote as PriceQuote } from "@/lib/booking/quote";
import {
  CANCELLATION_SUMMARY,
  DEFAULT_VALIDITY_DAYS,
  GST_STATUS,
  QUOTE_TERMS,
} from "@/lib/quote/policy";

/**
 * The Quote model — funnel-leading and reusable. Composed entirely from existing
 * package data + company branding + the policy config; invents nothing. Designed
 * so that accepting a quote can later create a Booking (and flow to Payments /
 * Vendor confirmation) directly, once the CRM/DB is connected:
 *
 *   Quote → Booking → Payment → Vendor confirmation → Trip → Review
 */

export const QUOTE_REF_PREFIX = "QT";

export type QuoteTravellers = { adults: number; children: number };
export type QuoteStay = { name: string; location?: string; nights?: number; note?: string };

export type QuoteDocument = {
  reference: string;
  generatedDate: string; // ISO
  validUntil: string; // ISO
  /** Populated from the CRM later; omitted from shareable URLs (no PII). */
  customerName?: string;
  packageSlug: string;
  packageTitle: string;
  destination: string;
  durationLabel: string;
  travelDates: string;
  travellers: QuoteTravellers;
  pickup?: string;
  drop?: string;
  hotelCategoryNote: string;
  stays: QuoteStay[];
  transport: { mode: string; detail: string }[];
  inclusions: string[];
  exclusions: string[];
  cancellationSummary: string;
  terms: string[];
  price: PriceQuote;
  gstStatus: string;
  company: {
    name: string;
    tagline: string;
    phone: string;
    whatsappHref: string;
    location: string;
  };
};

/**
 * Stable, non-sequential reference. Derived from the trip seed so the same trip
 * always yields the same QT- code without needing a database. Not a secret.
 */
export function makeQuoteReference(seed?: string): string {
  const s = seed && seed.length > 0 ? seed : Math.random().toString(36).slice(2);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  const code = h.toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `${QUOTE_REF_PREFIX}-${code}`;
}

/** Shareable URL params — trip specifics only, never customer PII. */
export const quoteParamsSchema = z.object({
  package: z.string().trim().min(1).max(80),
  adults: z.coerce.number().int().min(1).max(40).default(2),
  children: z.coerce.number().int().min(0).max(40).default(0),
  dates: z.string().trim().max(40).optional().default(""),
  gen: z.string().trim().max(40).optional(),
});
export type QuoteParams = z.infer<typeof quoteParamsSchema>;

export function findQuotePackage(slug: string): PackageCard | undefined {
  return featuredPackages.find((p) => p.slug === slug);
}

/** Build a full quote document from URL/CRM params. Returns null for unknown package. */
export function buildQuoteDocument(params: QuoteParams): QuoteDocument | null {
  const card = findQuotePackage(params.package);
  if (!card) return null;

  const detail = packageDetails[params.package];
  const price = buildQuote(card, params.adults, params.children);

  const genParsed = params.gen ? new Date(params.gen) : new Date();
  const generated = Number.isNaN(genParsed.getTime()) ? new Date() : genParsed;
  const validUntil = new Date(generated);
  validUntil.setDate(validUntil.getDate() + DEFAULT_VALIDITY_DAYS);

  const seed = `${params.package}|${params.adults}|${params.children}|${params.dates}`;

  return {
    reference: makeQuoteReference(seed),
    generatedDate: generated.toISOString(),
    validUntil: validUntil.toISOString(),
    packageSlug: card.slug,
    packageTitle: card.title,
    destination: card.destination,
    durationLabel: `${card.nights}N / ${card.days}D`,
    travelDates: params.dates || "To be confirmed",
    travellers: { adults: params.adults, children: params.children },
    pickup: card.pickup,
    drop: card.drop,
    hotelCategoryNote: "Hotels offered by category — the specific hotel is confirmed on availability.",
    stays: (detail?.hotels ?? []).map((h) => ({
      name: h.name,
      location: h.location,
      nights: h.nights,
      note: h.note,
    })),
    transport: detail?.transport ?? [],
    inclusions: detail?.inclusions ?? [],
    exclusions: detail?.exclusions ?? [],
    cancellationSummary: CANCELLATION_SUMMARY,
    terms: QUOTE_TERMS,
    price,
    gstStatus: GST_STATUS,
    company: {
      name: company.name,
      tagline: company.tagline,
      phone: company.phone,
      whatsappHref: company.whatsappHref,
      location: company.location,
    },
  };
}

/** Serialize a quote back to shareable URL params (no PII). */
export function quoteToParams(doc: QuoteDocument): URLSearchParams {
  const p = new URLSearchParams();
  p.set("package", doc.packageSlug);
  p.set("adults", String(doc.travellers.adults));
  p.set("children", String(doc.travellers.children));
  if (doc.travelDates && doc.travelDates !== "To be confirmed") p.set("dates", doc.travelDates);
  p.set("gen", doc.generatedDate);
  return p;
}
