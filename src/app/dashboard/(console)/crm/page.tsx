import {
  Panel,
  PipelineBoard,
  ScaffoldNote,
  DataTable,
  EmptyState,
} from "@/components/dashboard";
import { getCrmRepository } from "@/lib/crm/crm-repository";
import {
  LEAD_STAGES,
  LIFECYCLE_STAGES,
  LIFECYCLE_LABELS,
} from "@/lib/crm/model";

export const metadata = { title: "CRM" };

/**
 * CRM — the operational brain. Renders from the CrmRepository seam (console stub
 * today → Payload/Neon later). The seam aggregates leads/bookings/quotes via
 * src/lib/crm/adapters.ts, so this surface lights up with no UI change once the
 * DB is connected.
 */
export default async function CrmDashboard() {
  const crm = getCrmRepository();
  const [summary, leads, activities] = await Promise.all([
    crm.getPipelineSummary(),
    crm.listLeads(),
    crm.listActivities(),
  ]);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        CRM runs on the unified pipeline model (`src/lib/crm`). The read seam is
        wired; leads, bookings and quotes populate here once the database backs the
        repository — nothing is invented.
      </ScaffoldNote>

      {/* Pipeline */}
      <Panel eyebrow="Pipeline" title="Leads by stage">
        <PipelineBoard counts={summary.counts} stages={[...LEAD_STAGES]} live={summary.live} />
      </Panel>

      {/* Full lifecycle — the brain the CRM is built around */}
      <Panel eyebrow="Lifecycle" title="Customer journey the CRM orchestrates">
        <ol className="flex flex-wrap gap-2">
          {LIFECYCLE_STAGES.map((stage, i) => (
            <li
              key={stage}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60"
            >
              <span className="font-mono text-[9px] text-white/30">{i + 1}</span>
              {LIFECYCLE_LABELS[stage]}
            </li>
          ))}
        </ol>
      </Panel>

      {/* Leads */}
      <Panel eyebrow="Leads" title="All leads">
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "stage", header: "Stage" },
            { key: "source", header: "Source" },
            { key: "package", header: "Interest" },
            { key: "created", header: "Created" },
          ]}
          rows={leads.leads.map((l) => ({
            name: l.contact.name,
            stage: l.stage,
            source: l.source,
            package: l.packageTitle ?? "—",
            created: new Date(l.createdAt).toLocaleDateString("en-IN"),
          }))}
          emptyTitle={leads.live ? "No leads yet" : "Lead feed pending backend"}
          emptyHint="Enquiries, bookings and quotes will appear here as one unified pipeline."
        />
      </Panel>

      {/* Activity feed */}
      <Panel eyebrow="Activity" title="Unified activity feed">
        {activities.live && activities.activities.length > 0 ? (
          <ul className="space-y-2">
            {activities.activities.map((a) => (
              <li key={a.id} className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-white/85">{a.subject}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">{a.type}</span>
                </div>
                {a.body && <p className="mt-1 text-[12px] text-white/45">{a.body}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No activity yet"
            hint="Every enquiry, quote, booking, call and note flows into one timeline here."
          />
        )}
      </Panel>
    </div>
  );
}
