import { Panel, PendingMetric, EmptyState, ScaffoldNote, DataTable } from "@/components/dashboard";

export const metadata = { title: "Admin" };

/**
 * Admin dashboard — shell only. Users/roles, content, audit logs and settings
 * per the blueprint + security architecture (RBAC, append-only AuditLogs).
 */
export default function AdminDashboard() {
  const settings = [
    "Payment policy (advance %) — configurable",
    "Season definitions & rate multipliers",
    "Vendor scoring weights",
    "Roles & permissions (RBAC)",
    "Integrations (Razorpay, WhatsApp, Resend)",
  ];

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        Admin is a scaffold. Users, roles, content collections and audit logs bind to
        Payload/RBAC when the backend lands (see <code className="font-mono text-[11.5px]">docs/security-architecture.md</code>).
      </ScaffoldNote>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PendingMetric label="Users" reason="Needs auth" />
        <PendingMetric label="Vendors" reason="Needs vendor collection" />
        <PendingMetric label="Content items" reason="Needs CMS" />
        <PendingMetric label="Audit events (24h)" reason="Needs audit log" />
      </div>

      <Panel eyebrow="Access" title="Users & roles">
        <DataTable
          columns={[
            { key: "user", header: "User" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "lastActive", header: "Last active" },
          ]}
          emptyTitle="No users yet"
          emptyHint="Admin/Sales/Ops/Vendor accounts will be managed here once auth is active."
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Security" title="Audit log">
          <EmptyState
            title="No audit events"
            hint="Append-only create/update/delete/login events will stream here from day one of the backend."
          />
        </Panel>
        <Panel eyebrow="Configuration" title="Platform settings">
          <ul className="space-y-2">
            {settings.map((s) => (
              <li
                key={s}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 text-[12.5px] text-white/70"
              >
                <span>{s}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
                  pending
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
