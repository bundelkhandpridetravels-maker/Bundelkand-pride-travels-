import { Panel } from "@/components/founder/Primitives";
import type { HermesInsightsResult } from "@/lib/hermes/insights";
import type { HermesInsightKind } from "@/lib/hermes/contract";

/**
 * Reusable Hermes insights panel — consumed by every dashboard. Presentational:
 * the dashboard fetches via getHermesInsights(module) and passes the result in.
 * Renders a "learning" state while Hermes is disabled, insights when live.
 */

const kindAccent: Record<HermesInsightKind, string> = {
  recommendation: "border-gold/30 text-gold",
  summary: "border-sky-400/30 text-sky-300",
  risk: "border-red-400/30 text-red-300",
  metric: "border-emerald-400/30 text-emerald-300",
  approval: "border-amber-400/30 text-amber-300",
};

export default function HermesPanel({
  result,
  title = "Recommendations",
}: {
  result: HermesInsightsResult;
  title?: string;
}) {
  return (
    <Panel eyebrow="Hermes AI" title={title}>
      {!result.enabled ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-gold/25 bg-gold/[0.04] px-4 py-4">
          <span className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-medium text-white/80">Hermes is not connected yet</p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/45">
              Once enabled, Hermes will surface prioritised leads, vendor recommendations,
              summaries and risks here — drawing on the same repositories these dashboards use.
              Critical actions will always require your approval.
            </p>
          </div>
        </div>
      ) : result.insights.length === 0 ? (
        <p className="text-[13px] text-white/45">No recommendations right now.</p>
      ) : (
        <ul className="space-y-2.5">
          {result.insights.map((i) => (
            <li key={i.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-medium text-white/90">{i.title}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${kindAccent[i.kind]}`}>
                  {i.kind}
                </span>
              </div>
              {i.detail && <p className="mt-1 text-[12.5px] leading-relaxed text-white/50">{i.detail}</p>}
              {i.action && (
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-amber-300/80">
                  → {i.action.label}{i.action.requiresApproval ? " · needs approval" : ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
