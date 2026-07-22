import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * Standard page frame: fixed Navbar + main + Footer. New pages use this instead
 * of repeating the shell. (Existing pages keep their inline shells for now;
 * they can migrate incrementally.)
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

/** Ink hero header — eyebrow + display title + optional intro. */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="relative isolate bg-ink px-6 pb-16 pt-36 text-cream sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <Eyebrow tone="dark">{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">{intro}</p>}
      </div>
    </header>
  );
}
