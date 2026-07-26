import { absoluteUrl } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { quoteToParams, type QuoteDocument } from "@/lib/quote/quote";

/** Delivery-method helpers for a quote (view link, WhatsApp, email). */

/** Absolute, shareable link to view the quote on the website. */
export function quoteViewUrl(doc: QuoteDocument): string {
  return absoluteUrl(`/quote?${quoteToParams(doc).toString()}`);
}

function summaryLines(doc: QuoteDocument, url: string): string[] {
  return [
    `Your quote from ${doc.company.name}`,
    `Ref: ${doc.reference}`,
    `${doc.packageTitle} — ${doc.destination} (${doc.durationLabel})`,
    `Travellers: ${doc.travellers.adults} adult(s)${doc.travellers.children ? `, ${doc.travellers.children} child(ren)` : ""}`,
    `Indicative total: ${formatINR(doc.price.total)} (${doc.gstStatus})`,
    "",
    `View full quote: ${url}`,
  ];
}

export function quoteWhatsappUrl(doc: QuoteDocument): string {
  const url = quoteViewUrl(doc);
  const text = summaryLines(doc, url).join("\n");
  return `${doc.company.whatsappHref}?text=${encodeURIComponent(text)}`;
}

export function quoteMailtoUrl(doc: QuoteDocument): string {
  const url = quoteViewUrl(doc);
  const subject = `Your ${doc.company.name} quote — ${doc.reference}`;
  const body = summaryLines(doc, url).join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
