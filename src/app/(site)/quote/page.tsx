import type { Metadata } from "next";
import Link from "next/link";
import PageShell, { PageHero } from "@/components/site/PageShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import QuoteDocumentView from "@/components/quote/QuoteDocumentView";
import { buildQuoteDocument, quoteParamsSchema } from "@/lib/quote/quote";
import { quoteMailtoUrl, quoteWhatsappUrl } from "@/lib/quote/share";
import { featuredPackages } from "@/data/home";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/quote" },
  title: "Your quote",
  description:
    "View, share and accept your indicative Bundelkhand Pride Travels quote. Final pricing is confirmed by our team before payment.",
  robots: { index: false, follow: false },
};

const shareBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-text/20 px-5 py-2.5 text-sm font-semibold text-ink-text transition-all duration-200 hover:border-gold hover:text-ink";

/** Quote view + delivery actions. `?package=<slug>&adults=&children=&dates=&gen=`. */
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = quoteParamsSchema.safeParse(sp);
  const doc = parsed.success ? buildQuoteDocument(parsed.data) : null;

  // No / unknown package → let the user pick one to quote.
  if (!doc) {
    return (
      <PageShell>
        <PageHero
          eyebrow="Quotation"
          title="Start a quote"
          intro="Choose a package to generate an indicative quote you can view, share and accept."
        />
        <section className="bg-bone px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {featuredPackages.map((p) => (
              <Link
                key={p.slug}
                href={`/quote?package=${p.slug}`}
                className="group flex items-center justify-between rounded-xl border border-line bg-bone px-4 py-3 transition-colors hover:border-gold/50"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-ink-text">{p.title}</span>
                  <span className="block text-[12px] text-muted">{p.destination}</span>
                </span>
                <span className="font-mono text-[12px] text-ink-text">{formatINR(p.priceFrom)}</span>
              </Link>
            ))}
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Quotation"
        title="Your quote"
        intro="An indicative quote you can share or accept. Our team confirms availability and final pricing before any payment."
      />
      <section className="bg-bone px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
        {/* Delivery actions */}
        <Card className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <span className="text-[13px] text-ink-text-2">
            Ref <span className="font-mono font-semibold text-ink-text">{doc.reference}</span>
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Button href={`/book?package=${doc.packageSlug}`} variant="primary" size="sm">
              Accept &amp; book
            </Button>
            <a
              href={quoteWhatsappUrl(doc)}
              target="_blank"
              rel="noopener noreferrer"
              className={shareBtn}
            >
              Share on WhatsApp
            </a>
            <a href={quoteMailtoUrl(doc)} className={shareBtn}>
              Email
            </a>
            <Button variant="ghost" size="sm" disabled title="PDF download coming soon">
              Download PDF (soon)
            </Button>
          </div>
        </Card>

        <QuoteDocumentView doc={doc} />

        <p className="mx-auto mt-5 max-w-3xl text-center text-[12px] text-muted">
          Accepting takes you to booking. Your booking is held as{" "}
          <span className="font-medium text-ink-text-2">Payment pending</span> until our team confirms.
        </p>
      </section>
    </PageShell>
  );
}
