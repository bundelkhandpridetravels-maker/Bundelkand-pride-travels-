import { Panel, PendingMetric, EmptyState, ScaffoldNote, DataTable } from "@/components/dashboard";

export const metadata = { title: "Vendor" };

/**
 * Vendor dashboard — shell only. Reflects the blueprint's verified-supplier
 * model (availability, tasks, payments, quality score). No invented data.
 */
export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Vendor management is a scaffold. Metrics, tasks and payments populate once
        the Payload/DB backend and vendor onboarding are live — nothing here is invented.
      </ScaffoldNote>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PendingMetric label="Verified vendors" reason="Needs vendor onboarding" />
        <PendingMetric label="Avg quality score" reason="Needs ranking engine" />
        <PendingMetric label="Avg response time" reason="Needs vendor activity" />
        <PendingMetric label="Open tasks" reason="Needs task engine" />
      </div>

      <Panel eyebrow="Supply" title="Vendor tasks">
        <DataTable
          columns={[
            { key: "vendor", header: "Vendor" },
            { key: "type", header: "Task" },
            { key: "booking", header: "Booking" },
            { key: "due", header: "Due" },
            { key: "status", header: "Status" },
          ]}
          emptyTitle="No vendor tasks yet"
          emptyHint="Availability confirmations, service confirmations and invoice requests will appear here."
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Availability" title="Calendar">
          <EmptyState
            title="No availability data"
            hint="Vendors will update room/vehicle availability here once the vendor portal is active."
          />
        </Panel>
        <Panel eyebrow="Finance" title="Payments & payables">
          <div className="grid grid-cols-2 gap-3">
            <PendingMetric label="Payables (held)" reason="Needs finance module" />
            <PendingMetric label="Scheduled" reason="Needs finance module" />
            <PendingMetric label="Paid" reason="Needs finance module" />
            <PendingMetric label="This month" reason="Needs finance module" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
