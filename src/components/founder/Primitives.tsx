import type { ReactNode } from "react";

/** Shared building blocks for the founder dashboard (dark, glass, premium). */

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6 ${className}`}
    >
      {(title || eyebrow) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-[15px] font-semibold text-white/90">{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** A number the scanner actually measured. */
export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}

/** Explicit "we cannot measure this yet" state — never a fake number. */
export function PendingMetric({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 bg-transparent px-4 py-3.5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-sm font-medium text-white/25">Pending</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">{reason}</p>
    </div>
  );
}

export function ProgressBar({ value, tone = "gold" }: { value: number; tone?: "gold" | "pine" | "amber" }) {
  const bg =
    tone === "pine" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-gold";
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/** SVG progress ring for the headline completion figure. */
export function ProgressRing({
  value,
  size = 148,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  label: string;
  sublabel?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C9A24D"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <span className="block font-mono text-3xl font-semibold tabular-nums text-white">
          {Math.round(pct)}%
        </span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
          {label}
        </span>
        {sublabel && <span className="mt-0.5 block text-[10px] text-white/35">{sublabel}</span>}
      </div>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  live: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  active: "border-gold/40 bg-gold/10 text-gold",
  blocked: "border-red-400/30 bg-red-400/10 text-red-300",
  next: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  scaffolded: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  planned: "border-white/12 bg-white/5 text-white/45",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${
        statusStyles[status] ?? statusStyles.planned
      }`}
    >
      {status}
    </span>
  );
}
