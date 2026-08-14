import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  HermesPanel,
} from "@/components/dashboard";
import { getHermesInsights } from "@/lib/hermes";
import { getCrmRepository } from "@/lib/crm/crm-repository";
import {
  CUSTOMER_STATUSES,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_SOURCE_LABELS,
  CUSTOMER_UNPERSISTED_FIELDS,
  deriveCustomer,
  redactCustomers,
} from "@/lib/customer/model";
import { BOOKING_STATUSES } from "@/lib/booking/status";
import { CRM_ACTIVITY_TYPES } from "@/lib/crm/model";
import {
  describeActivityTypeFidelity,
  describeBookingStatusFidelity,
  isUnmappableBookingStatus,
  toDbBookingStatus,
} from "@/lib/crm/crm-schema-mapping";
import { CRM_CHAIN_PERSISTENCE } from "@/lib/crm/enquiry-link";
import { LEAD_LINK_SCHEMA_GAP } from "@/lib/crm/conversion";
import { describeRoleBridge } from "@/lib/platform/roles";
import type { CustomerActor } from "@/lib/customer/model";

export const metadata = { title: "Customers" };

/**
 * Customer register — the CRM's missing reader. Renders from the CustomerRepository
 * seam via the CRM repository; populates once a store backs it. Nothing invented,
 * no customer fabricated, no contact detail exposed beyond the data layer's RBAC.
 *
 * The console's Basic Auth is a single shared credential, so the actor is `admin`
 * here — a PAYLOAD role, because customer contact is gated on who the signed-in
 * user is rather than on a document visibility level. Redaction runs in the data
 * layer, so it is already enforced for the day real staff sessions arrive.
 */
const CONSOLE_ACTOR: CustomerActor = { role: "admin" };

const ROLE_BRIDGE = describeRoleBridge();

const BOOKING_FIDELITY = describeBookingStatusFidelity(BOOKING_STATUSES);
const ACTIVITY_FIDELITY = describeActivityTypeFidelity(CRM_ACTIVITY_TYPES);

export default async function CustomersDashboard() {
  const crm = getCrmRepository();
  const [summary, list, hermes] = await Promise.all([
    crm.getCustomerSummary(),
    crm.listCustomers(),
    getHermesInsights("crm"),
  ]);

  // Redaction happens in the data layer, not the template.
  const visible = redactCustomers(list.customers, CONSOLE_ACTOR);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        The customers collection is the source of truth and already exists in the database
        schema — what was missing was any way for the CRM to read it. This register is that
        reader. No customer is stored or created here, and no contact detail is shown that
        the data layer has not already permitted.
      </ScaffoldNote>

      {/* Status board */}
      <Panel eyebrow="Register" title="Customer status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CUSTOMER_STATUSES.map((s) => (
            <div key={s} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {CUSTOMER_STATUS_LABELS[s]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.counts[s] : "—"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Repeat", value: summary.repeat },
            { label: "Marketable", value: summary.marketable },
            { label: "No contact channel", value: summary.withoutContactChannel },
            { label: "With documents", value: summary.withDocuments },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {m.label}
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {summary.live ? m.value : "—"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          &ldquo;Marketable&rdquo; counts only customers who are contactable and have recorded
          marketing consent. Asking for a trip is not permission to market to someone.
        </p>
      </Panel>

      {/* The chain, honestly */}
      <Panel eyebrow="Pipeline" title="Where the CRM chain is actually persisted">
        <ul className="space-y-2">
          {CRM_CHAIN_PERSISTENCE.map((step) => (
            <li
              key={step.step}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5"
            >
              <span className="text-[13px] text-white/85">{step.step}</span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-white/35">
                  {step.collection ?? "no collection"}
                </span>
                <span
                  className={
                    step.persisted
                      ? "rounded-full border border-white/12 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/55"
                      : "rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300"
                  }
                >
                  {step.persisted ? "schema exists" : "not persisted"}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Enquiries and quotations have no collection: an enquiry is validated and logged, a
          quote is computed on demand. Neither can be recalled later. Storing them needs a
          new collection and a migration — a separately approved milestone.
        </p>
      </Panel>

      {/* Vocabulary reconciliation — the M6 core */}
      <Panel eyebrow="Schema" title="Application vocabulary vs database vocabulary">
        <div className="grid gap-3 sm:grid-cols-2">
          {[BOOKING_FIDELITY, ACTIVITY_FIDELITY].map((f) => (
            <div key={f.domain} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {f.domain.replace(/_/g, " ")}
              </p>
              <p className="mt-1.5 text-[13px] text-white/75">
                app {f.appValues} · db {f.dbValues}
              </p>
              <p className="mt-1 font-mono text-[11px] text-white/45">
                {f.exact} exact · {f.lossy} lossy ·{" "}
                <span className={f.unmappable > 0 ? "text-red-300/80" : ""}>
                  {f.unmappable} unmappable
                </span>
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-3 space-y-1.5">
          {BOOKING_STATUSES.filter(isUnmappableBookingStatus).map((s) => {
            const result = toDbBookingStatus(s);
            return (
              <li
                key={s}
                className="rounded-lg border border-red-400/25 bg-red-400/[0.05] px-3.5 py-2.5"
              >
                <p className="font-mono text-[11px] text-red-300/90">{s} → no safe database value</p>
                {!result.ok && (
                  <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{result.reason}</p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Every online booking is created <span className="font-mono">payment_pending</span>, and
          the database enum has no equivalent. Rather than coerce it into a state that would
          claim a confirmation or a payment that never happened, the mapping refuses. Widening
          the enum is a migration and is deliberately not part of this work.
        </p>
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Customer assistance" />

      {/* Register */}
      <Panel eyebrow="Records" title="Customer register">
        <DataTable
          columns={[
            { key: "name", header: "Customer" },
            { key: "city", header: "City" },
            { key: "source", header: "Source" },
            { key: "bookings", header: "Bookings" },
            { key: "documents", header: "Documents" },
            { key: "status", header: "Status" },
          ]}
          rows={visible.map((c) => {
            const derived = deriveCustomer({
              ...c,
              contact: c.contact ?? {},
              address: c.address ?? {},
            });
            return {
              name: c.name,
              city: c.address?.city ?? "—",
              source: c.source ? CUSTOMER_SOURCE_LABELS[c.source] : "—",
              bookings: derived.bookingCount || "—",
              documents: derived.documentCount || "—",
              status: CUSTOMER_STATUS_LABELS[c.status],
            };
          })}
          emptyTitle={list.live ? "No customers yet" : "Customer register pending backend"}
          emptyHint="Customers appear here with their booking history, attached documents and status. Search matches name, exact email and phone number."
        />
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Contact details are PII and are removed in the data layer for roles not permitted to
          see them — not merely hidden in this table.
        </p>
      </Panel>

      {/* Role bridge — two axes, kept separate */}
      <Panel eyebrow="Access" title="Who can see customer contact details">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/8">
                {["Role", "Customer contact", "Document access"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_BRIDGE.map((entry) => (
                <tr key={entry.role} className="border-b border-white/6 last:border-0">
                  <td className="px-3 py-2 font-mono text-[12px] text-white/75">{entry.role}</td>
                  <td className="px-3 py-2 text-[12px]">
                    {entry.customerContact ? (
                      <span className="text-emerald-300/80">yes</span>
                    ) : (
                      <span className="text-white/30">no</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-white/50">
                    {entry.documentRole}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Two independent axes. Sales can reach a customer&apos;s phone and email because that
          is the job, while acting as <span className="font-mono">employee</span> for documents —
          so supplier rate sheets and signed agreements stay out of reach. No role is promoted to{" "}
          <span className="font-mono">founder</span>: founder-only commercial data is granted
          deliberately, never inherited from a user record.
        </p>
      </Panel>

      {/* Honest gaps */}
      <Panel eyebrow="Gaps" title="Not yet persistable">
        {CUSTOMER_UNPERSISTED_FIELDS.length > 0 ? (
          <ul className="space-y-2">
            {CUSTOMER_UNPERSISTED_FIELDS.map((gap) => (
              <li key={gap.field} className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[12px] text-white/80">{gap.field}</span>
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300">
                    app-layer only
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/50">{gap.need}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/35">{gap.blocker}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No known gaps" />
        )}
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">{LEAD_LINK_SCHEMA_GAP}</p>
      </Panel>
    </div>
  );
}
