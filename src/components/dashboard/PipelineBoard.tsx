import { LEAD_STAGE_LABELS, type LeadStage } from "@/lib/crm/model";
import { cn } from "@/lib/cn";

/**
 * Reusable CRM pipeline board — stage columns with counts. Renders the same for
 * an empty (pre-backend) pipeline and a live one; data comes from the
 * CrmRepository seam. Dark console theme.
 */

const stageAccent: Record<LeadStage, string> = {
  new: "text-sky-300 border-sky-400/30",
  contacted: "text-gold border-gold/30",
  quoted: "text-amber-300 border-amber-400/30",
  won: "text-emerald-300 border-emerald-400/30",
  lost: "text-white/40 border-white/12",
};

export default function PipelineBoard({
  counts,
  stages,
  live,
}: {
  counts: Record<LeadStage, number>;
  stages: LeadStage[];
  live: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stages.map((stage) => (
        <div
          key={stage}
          className={cn(
            "rounded-xl border bg-white/[0.02] px-4 py-4",
            stageAccent[stage],
          )}
        >
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] opacity-80">
            {LEAD_STAGE_LABELS[stage]}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {live ? counts[stage] : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
