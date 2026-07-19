import Link from "next/link";

/** On-brand placeholder for routes being built in later modules. */
export default function ComingSoon({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-cream">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/80">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        {eyebrow}
      </div>
      <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-cream/70">{blurb}</p>
      <Link
        href="/"
        className="mt-8 rounded-lg border border-cream/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-cream/10"
      >
        ← Back to home
      </Link>
    </section>
  );
}
