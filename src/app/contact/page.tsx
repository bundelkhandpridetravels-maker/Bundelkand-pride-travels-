import type { Metadata } from "next";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import InquiryForm from "@/components/contact/InquiryForm";
import { company, companyStats } from "@/data/company";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Plan your trip with Bundelkhand Pride Travels. Call, WhatsApp or send an enquiry — we reply with a written itinerary and full pricing.",
};

const contactItems = [
  {
    label: "Phone & WhatsApp",
    value: company.phone,
    href: company.phoneHref,
    note: "9 AM – 10 PM daily",
    icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  },
  {
    label: "Office",
    value: company.location,
    note: company.serving,
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate bg-ink px-6 pb-14 pt-36 text-cream sm:px-10 lg:px-16">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(201,162,77,0.14), transparent 55%)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              <span className="h-px w-5 bg-gold" />
              Get in touch
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Let&apos;s plan your <em className="italic text-gold">next journey</em>
            </h1>
            <p className="mt-4 max-w-xl text-cream/70">{company.promise}</p>
          </div>
        </header>

        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <ul className="space-y-5">
                {contactItems.map((item) => (
                  <li key={item.label} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-ink">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-[13px] font-bold text-ink-text">{item.label}</h2>
                      {item.href ? (
                        <a href={item.href} className="mt-0.5 block text-[13px] text-ink-text-2 hover:text-ink-text">
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-[13px] text-ink-text-2">{item.value}</p>
                      )}
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                        {item.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                {companyStats.map((s) => (
                  <div key={s.label} className="bg-paper px-5 py-6 text-center">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="block font-display text-2xl font-semibold text-ink-text tabular-nums">
                        {s.value}
                      </span>
                      <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                        {s.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 rounded-2xl border border-line bg-paper p-6">
                <p className="font-display text-lg italic text-ink-text">{company.tagline}.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-text-2">{company.about}</p>
              </div>
            </div>

            <InquiryForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
