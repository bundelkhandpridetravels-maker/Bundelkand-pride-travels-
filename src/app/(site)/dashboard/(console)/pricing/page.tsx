import {
  Panel,
  DataTable,
  EmptyState,
  ScaffoldNote,
  HermesPanel,
} from "@/components/dashboard";
import { getHermesInsights } from "@/lib/hermes";
import {
  getPricingReadiness,
  getPricingRepository,
} from "@/lib/pricing/pricing-repository";
import {
  CURRENCIES,
  MINOR_UNITS_PER_MAJOR,
  ROUNDING_POLICY,
  formatBasisPoints,
} from "@/lib/pricing/money";
import { COMPONENT_KIND_LABELS, COMPONENT_KINDS, RATE_RESOLVABLE_KINDS } from "@/lib/pricing/model";
import { MARKUP_BASES, MARKUP_BASIS_LABELS } from "@/lib/pricing/rules";
import {
  GST_ENABLED,
  GST_RATE_BASIS_POINTS,
  GST_STATUS_NOTE,
  TAX_INCLUSION,
  TAX_TREATMENTS,
  TAX_TREATMENT_LABELS,
  taxHeadsFor,
} from "@/lib/pricing/tax";
import { describeRoleBridge } from "@/lib/platform/roles";
import { RATE_EXPIRY_WARNING_DAYS } from "@/lib/rates/validation";

export const metadata = { title: "Pricing" };

/**
 * Pricing engine console — structure only.
 *
 * Renders from the PricingRepository seam. There are no prices here, and there
 * cannot be: no markup rule is configured (rates are founder business data) and
 * no rate sheet is persisted (M4's repository is live:false). This surface
 * exists to show the machine and, more usefully, exactly what is missing before
 * it can quote anything.
 *
 * Nothing on this page discloses a supplier cost or a margin — every figure is
 * a structural constant, so it is safe for any staff role.
 */
const ROLE_BRIDGE = describeRoleBridge();
const READINESS = getPricingReadiness();

export default async function PricingDashboard() {
  const repo = getPricingRepository();
  const [summary, rules, marginPolicy, hermes] = await Promise.all([
    repo.getSummary(),
    repo.listMarkupRules(),
    repo.getMarginPolicy(),
    getHermesInsights("finance"),
  ]);

  const blocked = READINESS.filter((r) => !r.ready);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        The pricing engine is built and exact — integer minor units, explicit currency,
        one rounding policy — but it cannot price anything yet, and it refuses to pretend
        otherwise. No markup rule is configured and no supplier rate sheet is stored, so
        every calculation below would return an explicit refusal rather than a number.
      </ScaffoldNote>

      {/* Readiness */}
      <Panel eyebrow="Status" title="What the engine can do today">
        <ul className="space-y-2">
          {READINESS.map((item) => (
            <li
              key={item.capability}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5"
            >
              <span className="text-[13px] text-white/80">{item.capability}</span>
              <span className="flex items-center gap-3">
                {item.blocker && (
                  <span className="max-w-[30rem] text-right text-[11.5px] leading-relaxed text-white/40">
                    {item.blocker}
                  </span>
                )}
                <span
                  className={
                    item.ready
                      ? "rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-emerald-300/90"
                      : "rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-300"
                  }
                >
                  {item.ready ? "ready" : "blocked"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Money model */}
      <Panel eyebrow="Foundation" title="Canonical money model">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Storage", value: "integer minor units" },
            { label: "Rounding", value: ROUNDING_POLICY.replace(/_/g, " ") },
            { label: "Currencies", value: String(CURRENCIES.length) },
            { label: "Minor units / INR", value: String(MINOR_UNITS_PER_MAJOR.INR) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">{m.label}</p>
              <p className="mt-1.5 font-mono text-[13px] text-white/85">{m.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Amounts are whole paise, never floating point, and a currency is always required —
          it is never assumed to be INR. Percentages are carried as whole basis points
          (1% = 100), so a rate is never a float either. Rounding is half-up away from zero,
          applied once per calculation boundary, so error cannot compound.
        </p>
      </Panel>

      {/* Calculation pipeline */}
      <Panel eyebrow="Engine" title="Calculation structure">
        <ol className="flex flex-wrap gap-2">
          {["components", "cost", "markup", "price before tax", "tax", "total", "margin"].map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60"
            >
              <span className="font-mono text-[9px] text-white/30">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Margin is measured against the price before tax, not the total — tax is collected
          for the government and was never the business&apos;s to keep. Every step fails
          explicitly on a missing currency, a currency mismatch, a missing rate or a missing
          rule; none of them silently defaults.
        </p>
      </Panel>

      {/* Rule shapes */}
      <Panel eyebrow="Rules" title="Markup rule shapes">
        <DataTable
          columns={[
            { key: "id", header: "Rule" },
            { key: "basis", header: "Basis" },
            { key: "rate", header: "Rate" },
            { key: "scope", header: "Scope" },
          ]}
          rows={rules.rules.map((r) => ({
            id: r.label,
            basis: MARKUP_BASIS_LABELS[r.basis],
            rate: formatBasisPoints(r.basisPoints),
            scope: r.scope ? "scoped" : "all",
          }))}
          emptyTitle="No markup rule configured"
          emptyHint="Markup and margin rates are founder business data. The engine refuses to price without an explicit rule rather than assuming one — a default markup would be an invented commercial decision."
        />
        <div className="mt-3 space-y-2">
          {MARKUP_BASES.map((basis) => (
            <div key={basis} className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <p className="font-mono text-[11px] text-white/70">{basis}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">
                {MARKUP_BASIS_LABELS[basis]}
              </p>
            </div>
          ))}
          <p className="text-[11.5px] leading-relaxed text-white/40">
            Minimum-margin policy:{" "}
            <span className="font-mono text-white/60">
              {marginPolicy.policy.minimumBasisPoints === null
                ? "not configured"
                : formatBasisPoints(marginPolicy.policy.minimumBasisPoints)}
            </span>{" "}
            — an unconfigured floor is not a satisfied one, so nothing is enforced today.
          </p>
        </div>
      </Panel>

      {/* Rate resolution */}
      <Panel eyebrow="Supply" title="Rate resolution">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Rate sheets", value: summary.live ? summary.rateSheetsAvailable : "—" },
            { label: "Rules configured", value: summary.rulesConfigured },
            { label: "Expiry horizon", value: `${RATE_EXPIRY_WARNING_DAYS}d` },
            { label: "Priceable kinds", value: `${RATE_RESOLVABLE_KINDS.length}/${COMPONENT_KINDS.length}` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">{m.label}</p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMPONENT_KINDS.map((kind) => (
            <span
              key={kind}
              className={
                RATE_RESOLVABLE_KINDS.includes(kind)
                  ? "rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-[11.5px] text-white/70"
                  : "rounded-full border border-white/8 bg-white/[0.01] px-3 py-1 text-[11.5px] text-white/30"
              }
            >
              {COMPONENT_KIND_LABELS[kind]}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Only accommodation can be resolved from a rate sheet — M4 rate lines are room type,
          meal plan and occupancy shaped. Transport, activities and guides have no rate
          structure anywhere yet, so a component from those sources is recorded honestly as
          manual rather than mislabelled as supplier-backed. A rate is refused outright if the
          sheet is inactive, invalid, lapsed, outside its validity for the travel date, has
          overlapping seasons, or carries an amount with no currency.
        </p>
      </Panel>

      {/* Hermes */}
      <HermesPanel result={hermes} title="Pricing assistance" />

      {/* Tax */}
      <Panel eyebrow="Tax" title="GST structure (disabled)">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "GST enabled", value: GST_ENABLED ? "yes" : "no" },
            { label: "Rate configured", value: GST_RATE_BASIS_POINTS === null ? "none" : formatBasisPoints(GST_RATE_BASIS_POINTS) },
            { label: "Treatment", value: TAX_INCLUSION },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-200/70">{m.label}</p>
              <p className="mt-1.5 font-mono text-[13px] text-amber-200">{m.value}</p>
            </div>
          ))}
        </div>
        <ul className="mt-3 space-y-1.5">
          {TAX_TREATMENTS.map((treatment) => (
            <li
              key={treatment}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2"
            >
              <span className="text-[12px] text-white/70">{TAX_TREATMENT_LABELS[treatment]}</span>
              <span className="font-mono text-[11px] text-white/40">
                {taxHeadsFor(treatment).join(" + ") || "no tax heads"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">{GST_STATUS_NOTE}</p>
      </Panel>

      {/* Visibility boundary */}
      <Panel eyebrow="Access" title="Who can see cost and margin">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/8">
                {["Role", "Selling price", "Cost", "Margin", "Documents"].map((h) => (
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
                  <td className="px-3 py-2 text-[12px] text-emerald-300/70">yes</td>
                  <td className="px-3 py-2 text-[12px]">
                    {entry.pricingCost ? (
                      <span className="text-emerald-300/80">yes</span>
                    ) : (
                      <span className="text-white/30">no</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[12px]">
                    {entry.pricingMargin ? (
                      <span className="text-emerald-300/80">yes</span>
                    ) : (
                      <span className="text-white/30">no</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-white/50">{entry.documentRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          A third independent axis. Operations and Finance run margin control and see cost;
          Sales quotes the selling price and never needs the supplier&apos;s number. Granting
          cost visibility here widens nothing on the document axis — no role is promoted to{" "}
          <span className="font-mono">founder</span>, and M4&apos;s founder-only rate-sheet
          amounts remain reachable only by the explicit founder actor. Cost and margin are
          removed in the data layer before a quote can reach a customer-facing surface.
        </p>
      </Panel>

      {/* Gaps */}
      <Panel eyebrow="Gaps" title="Before this engine can quote">
        {blocked.length > 0 ? (
          <ul className="space-y-2">
            {blocked.map((item) => (
              <li key={item.capability} className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3">
                <p className="text-[13px] text-white/80">{item.capability}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{item.blocker}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No blockers" />
        )}
      </Panel>
    </div>
  );
}
