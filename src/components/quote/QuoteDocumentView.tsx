import { formatINR } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Eyebrow from "@/components/ui/Eyebrow";
import type { QuoteDocument } from "@/lib/quote/quote";

/**
 * Reusable, responsive, print-friendly quote document. Presentational only — the
 * same component renders on /quote, in a future PDF export, and in the CRM quote
 * preview. No UI is duplicated elsewhere.
 */

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hair py-2 text-[13.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink-text">{value}</dd>
    </div>
  );
}

export default function QuoteDocumentView({ doc }: { doc: QuoteDocument }) {
  const { travellers } = doc;
  const travellersLabel = `${travellers.adults} adult${travellers.adults !== 1 ? "s" : ""}${
    travellers.children > 0 ? `, ${travellers.children} child${travellers.children !== 1 ? "ren" : ""}` : ""
  }`;

  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-bone">
      {/* Branded header */}
      <header className="flex flex-wrap items-start justify-between gap-4 bg-ink px-6 py-6 text-cream sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold font-mono text-sm font-bold text-ink">
            BPT
          </span>
          <span>
            <span className="block font-display text-lg font-semibold">{doc.company.name}</span>
            <span className="block font-display text-[12px] italic text-cream/80">{doc.company.tagline}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-gold-bright">Quotation</span>
          <span className="block font-mono text-base font-bold">{doc.reference}</span>
          <span className="block text-[11px] text-cream/70">Generated {fmtDate(doc.generatedDate)}</span>
        </div>
      </header>

      <div className="px-6 py-7 sm:px-8">
        <p className="text-[14px] text-ink-text-2">
          {doc.customerName ? `Prepared for ${doc.customerName}` : "Prepared for you"} — here is your indicative
          quote for a trip to <span className="font-semibold text-ink-text">{doc.destination}</span>.
        </p>

        {/* Trip summary */}
        <section className="mt-6">
          <Eyebrow>Trip summary</Eyebrow>
          <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <Row label="Package" value={doc.packageTitle} />
            <Row label="Destination" value={doc.destination} />
            <Row label="Duration" value={doc.durationLabel} />
            <Row label="Travel dates" value={doc.travelDates} />
            <Row label="Travellers" value={travellersLabel} />
            {doc.pickup && <Row label="Pickup / drop" value={`${doc.pickup}${doc.drop && doc.drop !== doc.pickup ? ` → ${doc.drop}` : ""}`} />}
          </dl>
        </section>

        {/* Stay (hotels by category) */}
        {doc.stays.length > 0 && (
          <section className="mt-7">
            <Eyebrow>Hotels &amp; category</Eyebrow>
            <ul className="mt-3 space-y-2">
              {doc.stays.map((s, i) => (
                <li key={i} className="rounded-lg border border-line bg-paper px-4 py-2.5 text-[13.5px]">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-ink-text">{s.name}</span>
                    {typeof s.nights === "number" && (
                      <span className="font-mono text-[12px] text-muted">{s.nights}N</span>
                    )}
                  </div>
                  {(s.location || s.note) && (
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-text-2">
                      {[s.location, s.note].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11.5px] text-muted">{doc.hotelCategoryNote}</p>
          </section>
        )}

        {/* Transport */}
        {doc.transport.length > 0 && (
          <section className="mt-7">
            <Eyebrow>Transport</Eyebrow>
            <ul className="mt-3 space-y-1.5 text-[13.5px]">
              {doc.transport.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-medium text-ink-text">{t.mode}:</span>
                  <span className="text-ink-text-2">{t.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Inclusions / Exclusions */}
        <section className="mt-7 grid gap-6 sm:grid-cols-2">
          {doc.inclusions.length > 0 && (
            <div>
              <Eyebrow>Inclusions</Eyebrow>
              <ul className="mt-3 space-y-1.5 text-[13px] text-ink-text-2">
                {doc.inclusions.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-pine" aria-hidden="true">✓</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {doc.exclusions.length > 0 && (
            <div>
              <Eyebrow>Exclusions</Eyebrow>
              <ul className="mt-3 space-y-1.5 text-[13px] text-ink-text-2">
                {doc.exclusions.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-muted" aria-hidden="true">×</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Price summary */}
        <section className="mt-7 rounded-xl border border-line bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Price summary</Eyebrow>
            <Badge variant="outline">Indicative</Badge>
          </div>
          <ul className="space-y-1.5 text-[13.5px]">
            {doc.price.lines.map((l) => (
              <li key={l.label} className="flex justify-between">
                <span className="text-ink-text-2">{l.label} · {l.qty} × {formatINR(l.unitPrice)}</span>
                <span className="font-medium tabular-nums text-ink-text">{formatINR(l.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-hair pt-1.5">
              <span className="text-ink-text-2">Subtotal</span>
              <span className="font-medium tabular-nums text-ink-text">{formatINR(doc.price.subtotal)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">GST</span>
              <span className="text-[12px] text-muted">{doc.gstStatus}</span>
            </li>
            <li className="flex justify-between border-t border-hair pt-2 text-[15px]">
              <span className="font-semibold text-ink-text">Indicative total</span>
              <span className="font-mono font-bold tabular-nums text-ink-text">{formatINR(doc.price.total)}</span>
            </li>
          </ul>
        </section>

        {/* Cancellation + terms */}
        <section className="mt-7">
          <Eyebrow>Cancellation</Eyebrow>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-text-2">{doc.cancellationSummary}</p>
        </section>
        <section className="mt-5">
          <Eyebrow>Terms &amp; conditions</Eyebrow>
          <ul className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-ink-text-2">
            {doc.terms.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 text-gold-dim" aria-hidden="true">•</span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Validity footer */}
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] px-4 py-3">
          <span className="text-[12.5px] text-ink-text-2">
            Valid until <span className="font-semibold text-ink-text">{fmtDate(doc.validUntil)}</span>
          </span>
          <span className="text-[12.5px] text-ink-text-2">
            {doc.company.name} · {doc.company.location} · {doc.company.phone}
          </span>
        </footer>
      </div>
    </article>
  );
}
