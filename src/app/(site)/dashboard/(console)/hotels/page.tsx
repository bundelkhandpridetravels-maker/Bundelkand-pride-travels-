import { DataTable, EmptyState, Panel, ScaffoldNote } from "@/components/dashboard";
import { getHotelRepository } from "@/lib/hotels/hotel-repository";
import {
  ALLOCATION_STATES,
  ALLOCATION_STATE_DESCRIPTIONS,
  COMMITMENT_TYPES,
  COMMITMENT_TYPE_DESCRIPTIONS,
  DEFAULT_COMMITMENT_TYPE,
  HOTEL_STAR_CATEGORIES,
  HOTEL_STAR_CATEGORY_LABELS,
  PACKAGE_HOTEL_CATEGORIES,
} from "@/lib/hotels/model";
import {
  CATEGORY_SUBSTITUTIONS,
  EXPLICIT_PACKAGE_HOTEL_PERSISTENCE,
  UNMAPPABLE_HOTEL_CATEGORIES,
  acceptableHotelCategories,
  describeCategoryCoverage,
} from "@/lib/hotels/category";
import {
  AVAILABILITY_PERSISTENCE,
  AVAILABILITY_STATUSES,
  AVAILABILITY_STATUS_DESCRIPTIONS,
  describeCapacity,
} from "@/lib/hotels/capacity";
import {
  AI_ENABLED,
  AI_PREREQUISITES,
  AUTO_COMPLETE_GATES,
  GATES_EVALUABLE_IN_M8,
  SUPPLIER_REQUEST_PERSISTENCE,
  SUPPLY_CHANNELS_ENABLED,
  SUPPLY_KINDS,
  SUPPLY_KINDS_IMPLEMENTED,
  SUPPLY_REQUIREMENT_PERSISTENCE,
  SUPPLY_UNIT_LABELS,
  PROVIDERS_REGISTERED,
} from "@/lib/hotels/supply";
import { summariseRateReadiness } from "@/lib/hotels/rate-reference";

export const metadata = { title: "Hotels" };

/**
 * Hotel readiness console — M8 Hotel Foundation.
 *
 * This is a READINESS surface, not hotel management. It shows what the
 * application can now do with hotel supply, and far more usefully, exactly what
 * is missing before a property can be allocated to a booking.
 *
 * ⚠️ WHAT IS NOT HERE, AND MUST NOT ARRIVE HERE:
 * no availability value, no room-level stock, no supplier net rate, no BPT
 * margin, no allocation controls, no supplier portal and no AI operations. The
 * platform has no availability at all, and a console that implied otherwise
 * would be the most expensive kind of wrong.
 *
 * Every figure below is either a structural constant or a count of rows read
 * through the repository seam, so this page is safe for any staff role.
 */
const CAPACITY_NOTE =
  "A room count is a fact about the building. Availability is a fact about dates. The schema carries the first and nothing carries the second.";

export default async function HotelsDashboard() {
  const repo = getHotelRepository();
  const [summary, list] = await Promise.all([repo.getSummary(), repo.list()]);

  const coverage = describeCategoryCoverage(list.hotels);
  const capacity = describeCapacity(list.hotels);
  const rateReadiness = summariseRateReadiness([], list.hotels);

  return (
    <div className="space-y-6">
      <ScaffoldNote>
        The hotel tables have been migrated since the initial schema; until now no code
        could read one. This foundation adds the reader, resolves a package category to
        candidate properties, ranks those candidates with the supplier quality engine
        that already exists — and then refuses to allocate, because availability cannot
        be established by anything in the platform. The refusal is the feature.
      </ScaffoldNote>

      {/* Register */}
      <Panel eyebrow="Register" title="Properties by category">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {HOTEL_STAR_CATEGORIES.map((c) => (
            <div
              key={c}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
              title={HOTEL_STAR_CATEGORY_LABELS[c]}
            >
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
                {HOTEL_STAR_CATEGORY_LABELS[c]}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {summary.live ? summary.byCategory[c] : "—"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Counts are PROPERTIES, never rooms. A room total on this page would read as
          inventory, and there is no inventory.
        </p>
      </Panel>

      {/* The distinction */}
      <Panel eyebrow="Core rule" title="Capacity is not availability">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              Capacity — known
            </p>
            <p className="mt-1.5 text-[13px] text-white/85">
              Room types per property, occupancy and meal plan. Static, and stored.
            </p>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-200/70">
              Availability — unknown
            </p>
            <p className="mt-1.5 text-[13px] text-amber-100/80">
              No date dimension exists on any supply table. Persistence:{" "}
              <span className="font-mono">{AVAILABILITY_PERSISTENCE}</span>.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {AVAILABILITY_STATUSES.map((s) => (
            <li
              key={s}
              className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
            >
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/70">
                {s}
              </span>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">
                {AVAILABILITY_STATUS_DESCRIPTIONS[s]}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          {CAPACITY_NOTE} Every property currently reads UNKNOWN:{" "}
          <span className="font-mono">
            {capacity.availabilityUnknownForAll ? "confirmed" : "CHECK FAILED"}
          </span>
          . UNKNOWN is never converted to AVAILABLE, so allocation refuses rather than
          promising a room nobody has confirmed exists.
        </p>
      </Panel>

      {/* Category resolution */}
      <Panel eyebrow="Resolution" title="Package category → candidate properties">
        <DataTable
          columns={[
            { key: "category", header: "Package category" },
            { key: "accepts", header: "Accepts hotel categories" },
            { key: "candidates", header: "Candidates" },
            { key: "representative", header: "Representative" },
          ]}
          rows={PACKAGE_HOTEL_CATEGORIES.map((category) => {
            const row = coverage.rows.find((r) => r.category === category);
            return {
              category: HOTEL_STAR_CATEGORY_LABELS[category],
              accepts: acceptableHotelCategories(category)
                .map((c) => HOTEL_STAR_CATEGORY_LABELS[c])
                .join(", "),
              candidates: list.live ? (row?.candidates ?? 0) : "—",
              representative: list.live ? (row?.representative ?? 0) : "—",
            };
          })}
          emptyTitle="Category coverage pending backend"
          emptyHint="Once the hotel reader is backed by a store, this shows how many properties can actually serve each category BPT sells."
        />
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Mapping is identity only. Whether a 5-star property may be offered against a
          4-star package is a commercial substitution policy owned by the founder — the
          extension point is configured (
          <span className="font-mono">{Object.keys(CATEGORY_SUBSTITUTIONS).length}</span>{" "}
          rules) rather than guessed. Explicit package→hotel mapping persistence:{" "}
          <span className="font-mono">{EXPLICIT_PACKAGE_HOTEL_PERSISTENCE}</span> — no
          relation exists between packages and hotels in the schema.
        </p>
      </Panel>

      {/* Unmappable */}
      <Panel eyebrow="Blocker" title="Categories with no package equivalent">
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3.5 py-3">
          <p className="text-[13px] text-amber-100/85">
            {UNMAPPABLE_HOTEL_CATEGORIES.map((c) => HOTEL_STAR_CATEGORY_LABELS[c]).join(
              ", ",
            )}
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-amber-100/60">
            Hotels support these categories and packages do not. They are surfaced as
            UNMAPPABLE and excluded from every candidate set — never quietly relabelled
            as premium, which would eventually put a homestay in front of a customer who
            bought a premium hotel. Widening the package category enum is a database
            migration and is deliberately not in this foundation.
          </p>
        </div>
        {list.live && coverage.unmappable.length === 0 ? (
          <p className="mt-3 text-[11.5px] text-white/40">
            No property currently carries an unmappable category.
          </p>
        ) : null}
      </Panel>

      {/* Representative vs allocated */}
      <Panel eyebrow="Core rule" title="Representative hotel vs allocated hotel">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              Representative — pre-booking
            </p>
            <p className="mt-1.5 text-[13px] text-white/85">
              Illustrates a standard. Promises a category, not a property.
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">
              {summary.live ? summary.representative : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              Allocated — post-confirmation
            </p>
            <p className="mt-1.5 text-[13px] text-white/85">
              The property a customer actually gets. Named only once confirmed.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {ALLOCATION_STATES.map((s) => (
            <li key={s} className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/70">
                {s}
              </span>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">
                {ALLOCATION_STATE_DESCRIPTIONS[s]}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          The allocated property&rsquo;s identity is removed in the DATA layer — the key
          is physically absent for actors who may not see it, using the same technique
          M4 uses for rate amounts, so it cannot survive serialisation into a browser
          payload. Rejected attempts stay internal to operations for all time: a customer
          learns the outcome, never the attempts.
        </p>
      </Panel>

      {/* Commitment */}
      <Panel eyebrow="Commitment" title="What was actually sold">
        <ul className="space-y-2">
          {COMMITMENT_TYPES.map((c) => (
            <li key={c} className="rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/70">
                  {c}
                </span>
                {c === DEFAULT_COMMITMENT_TYPE ? (
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                    default
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">
                {COMMITMENT_TYPE_DESCRIPTIONS[c]}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          No column stores a commitment type today. It is represented here so that when
          substitution logic is eventually written, the concept it must respect already
          exists — an EXACT promise cannot be varied operationally, only by the founder.
        </p>
      </Panel>

      {/* Blockers */}
      <Panel eyebrow="Readiness" title="What stands between here and allocation">
        <DataTable
          columns={[
            { key: "blocker", header: "Blocker" },
            { key: "state", header: "State" },
            { key: "gate", header: "Gate" },
          ]}
          rows={[
            {
              blocker: "Availability — no source, no record, no persistence",
              state: "Absent",
              gate: "Own migration gate",
            },
            {
              blocker: "Supplier request / response records",
              state: `Persistence: ${SUPPLIER_REQUEST_PERSISTENCE}`,
              gate: "Own migration gate",
            },
            {
              blocker: "Supply requirement records",
              state: `Persistence: ${SUPPLY_REQUIREMENT_PERSISTENCE}`,
              gate: "Own migration gate",
            },
            {
              blocker: "Approval queue and audit trail",
              state: "Referenced in code, not built",
              gate: "Prerequisite milestone",
            },
            {
              blocker: "Properties with no supplier relation",
              state: summary.live ? `${summary.orphans}` : "—",
              gate: "Operational data",
            },
            {
              blocker: "Properties with no room types recorded",
              state: summary.live ? `${summary.withoutRoomTypes}` : "—",
              gate: "Operational data",
            },
            {
              blocker: "Contracted rate reference",
              state: list.live
                ? `${rateReadiness.blocked} of ${rateReadiness.hotels} blocked`
                : "Rate register is not persisted",
              gate: "M4 / M7 boundary",
            },
            {
              blocker: "Hotels are not vendor-scoped",
              state: "Blocks the supplier portal",
              gate: "Access-control change",
            },
          ]}
          emptyTitle="No blockers recorded"
          emptyHint=""
        />
      </Panel>

      {/* Shared supply */}
      <Panel eyebrow="Foundation" title="One supply chain, three supply units">
        <DataTable
          columns={[
            { key: "kind", header: "Kind" },
            { key: "unit", header: "Supply unit" },
            { key: "state", header: "Modelled" },
          ]}
          rows={SUPPLY_KINDS.map((kind) => ({
            kind,
            unit: SUPPLY_UNIT_LABELS[kind],
            state: SUPPLY_KINDS_IMPLEMENTED.includes(kind) ? "Yes" : "Later milestone",
          }))}
          emptyTitle=""
          emptyHint=""
        />
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Hotel, activity and transport follow the identical chain — only the unit
          changes. Three separate systems would implement the capacity-versus-availability
          distinction three times and get it wrong in at least one. Providers registered:{" "}
          <span className="font-mono">{PROVIDERS_REGISTERED.length}</span>; channels
          enabled: <span className="font-mono">{SUPPLY_CHANNELS_ENABLED.length}</span>.
        </p>
      </Panel>

      {/* Gates */}
      <Panel eyebrow="Future" title="The ten auto-complete gates">
        <ol className="space-y-1.5">
          {AUTO_COMPLETE_GATES.map((gate, i) => (
            <li key={gate} className="flex items-start gap-2.5 text-[12px] text-white/70">
              <span className="mt-0.5 font-mono text-[10px] text-white/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono">{gate}</span>
              {GATES_EVALUABLE_IN_M8.includes(gate) ? (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                  evaluable now
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3">
          <p className="text-[11.5px] leading-relaxed text-white/45">
            All ten must hold before a confirmation could complete without a human, and a
            single failure routes to a person. Nothing evaluates them today: AI is{" "}
            <span className="font-mono">{AI_ENABLED ? "enabled" : "not enabled"}</span>,
            and auto-completion depends on prerequisites that do not exist —{" "}
            {AI_PREREQUISITES.join("; ")}. Without an append-only audit event written
            before the state advances, an auto-confirmed booking carries no record of the
            evidence that justified it.
          </p>
        </div>
      </Panel>

      {/* Register table */}
      <Panel eyebrow="Supply" title="Hotel register">
        <DataTable
          columns={[
            { key: "name", header: "Property" },
            { key: "category", header: "Category" },
            { key: "representative", header: "Representative" },
            { key: "roomTypes", header: "Room types" },
            { key: "supplier", header: "Supplier" },
          ]}
          rows={list.hotels.map((h) => ({
            name: h.name,
            category: h.starCategory ? HOTEL_STAR_CATEGORY_LABELS[h.starCategory] : "—",
            representative: h.representative ? "Yes" : "—",
            roomTypes: h.roomTypes.length || "—",
            supplier: h.vendorId ?? "Not linked",
          }))}
          emptyTitle={list.live ? "No properties yet" : "Hotel register pending backend"}
          emptyHint="The hotel tables are migrated and waiting. This register populates when the repository seam is backed by a store — reads report live:false today, and nothing here writes."
        />
        {list.live ? null : (
          <EmptyState
            title="Non-live by design"
            hint="M8 makes no database contact: no connection, no credential, no query, and no seeding of hotel or rate data. Going live is a separate, reviewed step."
          />
        )}
      </Panel>
    </div>
  );
}
