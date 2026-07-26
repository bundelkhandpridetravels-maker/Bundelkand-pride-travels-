import { Panel, PendingMetric, ScaffoldNote, DataTable } from "@/components/dashboard";

export const metadata = { title: "CRM" };

/**
 * CRM dashboard — shell only. Leads, customers, follow-ups and pipeline per the
 * blueprint. Enquiries already flow through the typed EnquiryRepository seam;
 * this surface lights up when that repository is backed by the database.
 */
export default function CrmDashboard() {
  const stages = ["New", "Contacted", "Quoted", "Won", "Lost"];

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        CRM is a scaffold. The enquiry pipeline (<code className="font-mono text-[11.5px]">src/lib/enquiry.ts</code>{" "}
        → <code className="font-mono text-[11.5px]">/api/enquiries</code>) is already wired; leads appear here once
        that repository is backed by the database.
      </ScaffoldNote>

      <Panel eyebrow="Pipeline" title="Leads by stage">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {stages.map((s) => (
            <PendingMetric key={s} label={s} reason="Needs lead database" />
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Leads" title="Recent enquiries">
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "trip", header: "Interest" },
            { key: "source", header: "Source" },
            { key: "stage", header: "Stage" },
            { key: "created", header: "Created" },
          ]}
          emptyTitle="No leads yet"
          emptyHint="Enquiries submitted through the site will be captured here with source attribution."
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Follow-ups" title="Due today">
          <DataTable
            columns={[
              { key: "customer", header: "Customer" },
              { key: "task", header: "Follow-up" },
              { key: "owner", header: "Owner" },
            ]}
            emptyTitle="No follow-ups scheduled"
          />
        </Panel>
        <Panel eyebrow="Customers" title="Directory">
          <div className="grid grid-cols-2 gap-3">
            <PendingMetric label="Total customers" reason="Needs database" />
            <PendingMetric label="Repeat travellers" reason="Needs booking history" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
