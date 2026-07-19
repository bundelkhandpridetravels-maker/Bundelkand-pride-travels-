import type { ReactNode } from "react";

type Tone = "bone" | "paper" | "ink";

const toneClass: Record<Tone, string> = {
  bone: "bg-bone text-ink-text",
  paper: "bg-paper text-ink-text",
  ink: "bg-ink text-cream",
};

/** Consistent full-width section band with a centered max-width container. */
export function Section({
  id,
  tone = "bone",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${toneClass[tone]} px-6 py-20 sm:px-10 sm:py-24 lg:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/** Eyebrow + heading + optional lede, with optional trailing action. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "light",
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  tone?: "light" | "dark";
  action?: ReactNode;
}) {
  const heading = tone === "dark" ? "text-cream" : "text-ink-text";
  const ledeColor = tone === "dark" ? "text-mist" : "text-ink-text-2";
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim">
          <span className="h-px w-5 bg-gold-dim" />
          {eyebrow}
        </div>
        <h2 className={`font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl ${heading}`}>
          {title}
        </h2>
        {lede && <p className={`mt-3 text-[15px] leading-relaxed ${ledeColor}`}>{lede}</p>}
      </div>
      {action}
    </div>
  );
}
