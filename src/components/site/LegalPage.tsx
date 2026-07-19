import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

/** Shared shell for long-form legal/policy documents. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="bg-ink px-6 pb-12 pt-36 text-cream sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
              Last updated {updated}
            </p>
          </div>
        </header>

        <section className="bg-bone px-6 py-14 sm:px-10 lg:px-16">
          <div
            className="mx-auto max-w-3xl
              [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-text first:[&_h2]:mt-0
              [&_p]:mb-4 [&_p]:text-[14.5px] [&_p]:leading-relaxed [&_p]:text-ink-text-2
              [&_li]:mb-2 [&_li]:text-[14.5px] [&_li]:leading-relaxed [&_li]:text-ink-text-2
              [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5
              [&_a]:text-gold-dim [&_a]:underline hover:[&_a]:text-ink-text"
          >
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
