import type { Metadata } from "next";
import Link from "next/link";
import { scanProject } from "@/lib/founder/scan";
import { sprints, phases, founderBlockers } from "@/data/founder/roadmap";
import {
  Panel,
  Metric,
  PendingMetric,
  ProgressBar,
  ProgressRing,
  StatusPill,
} from "@/components/founder/Primitives";

export const metadata: Metadata = {
  title: "Founder Dashboard",
  robots: { index: false, follow: false }, // internal tool — keep it out of search
};

// Reads the filesystem on every request so the numbers are always live.
export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function FounderDashboard() {
  const scan = scanProject();

  // Overall progress is the mean of declared sprint progress — shown with its
  // own basis so it can never be mistaken for a measured fact.
  const overall = Math.round(
    sprints.reduce((sum, s) => sum + s.progress, 0) / sprints.length,
  );
  const phase1 = phases[0];
  const phase1Done = phase1.checklist.filter((c) => c.done).length;
  const phase1Pct = Math.round((phase1Done / phase1.checklist.length) * 100);

  const active = sprints.filter((s) => s.status === "active");
  const blocked = sprints.filter((s) => s.status === "blocked");
  const mediaPct =
    scan.media.clipsTotal > 0
      ? Math.round((scan.media.clipsReady / scan.media.clipsTotal) * 100)
      : 0;

  // Insights derived from the real numbers above — not canned motivation.
  const insights: string[] = [];
  if (scan.media.clipsReady === 0)
    insights.push(
      `Highest-impact unblock: media. ${scan.media.clipsTotal} clip slots are wired and waiting — the first real hero video converts the whole cinematic layer from architecture into experience.`,
    );
  if (!scan.gitBranch)
    insights.push(
      "No git repository yet. Everything built so far exists only on this machine — initialising git and pushing to GitHub is the cheapest risk reduction available right now.",
    );
  if (phase1Pct >= 80 && phase1Pct < 100)
    insights.push(
      `Phase 1 is ${phase1Pct}% complete — ${phase1.checklist.length - phase1Done} items from shipping. Finish these before opening Phase 2; a launched site compounds, a half-built one doesn't.`,
    );
  if (blocked.length > 0)
    insights.push(
      `${blocked.length} sprint${blocked.length > 1 ? "s are" : " is"} blocked on decisions only you can make. Those are worth an hour today — they gate more work than any coding task.`,
    );

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white/90">
      {/* ambient wash */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(201,162,77,0.10), transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(47,93,80,0.12), transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">
              Founder Operating System
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Bundelkhand Pride Travels
            </h1>
            <p className="mt-1.5 text-[13px] text-white/45">
              Command centre · scanned live at {fmtDate(scan.scannedAt)}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-white/70 transition-colors hover:bg-white/5"
          >
            View live site →
          </Link>
        </header>

        {/* Overview */}
        <div className="mb-6 grid gap-5 lg:grid-cols-[auto_1fr]">
          <Panel className="flex items-center justify-center">
            <div className="text-center">
              <ProgressRing value={overall} label="Overall" />
              <p className="mt-3 max-w-[190px] text-[11px] leading-relaxed text-white/35">
                Mean of {sprints.length} declared sprint values — a planning
                estimate, not a measurement.
              </p>
            </div>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Current phase" value={`Phase ${phase1.n}`} hint={phase1.name} />
            <Metric label="Phase 1 complete" value={`${phase1Pct}%`} hint={`${phase1Done}/${phase1.checklist.length} items shipped`} />
            <Metric label="Active sprints" value={active.length} hint={active.map((s) => s.name).join(", ")} />
            <Metric
              label="Biggest blocker"
              value={blocked.length > 0 ? blocked[0].name : "None"}
              hint={blocked[0]?.note ?? "Nothing blocked"}
            />
            <Metric label="Last build" value={scan.lastBuild?.ok ? "Passing" : scan.lastBuild ? "Unknown" : "—"} hint={scan.lastBuild ? fmtDate(scan.lastBuild.at) : "No build output found"} />
            {scan.gitBranch ? (
              <Metric label="Git branch" value={scan.gitBranch} />
            ) : (
              <PendingMetric label="Git branch" reason="No repository initialised yet" />
            )}
          </div>
        </div>

        {/* Founder blockers — the things only you can unblock */}
        <Panel eyebrow="Needs you" title="Decisions and inputs blocking progress" className="mb-6">
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {founderBlockers.map((b) => (
              <li key={b.label} className="rounded-xl border border-red-400/15 bg-red-400/[0.04] p-4">
                <p className="text-[13.5px] font-semibold text-white/90">{b.label}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/45">{b.why}</p>
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold/80">
                  → {b.action}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Insights */}
        {insights.length > 0 && (
          <Panel eyebrow="Insights" title="Derived from the numbers on this page" className="mb-6">
            <ul className="space-y-3">
              {insights.map((i) => (
                <li key={i.slice(0, 40)} className="flex gap-3 text-[13.5px] leading-relaxed text-white/70">
                  <span className="mt-0.5 shrink-0 font-mono text-gold" aria-hidden="true">→</span>
                  {i}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sprints */}
          <Panel eyebrow="Sprints" title={`${sprints.length} workstreams`}>
            <ul className="space-y-3">
              {sprints.map((s) => (
                <li key={s.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-white/90">{s.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/35">
                        {s.priority}
                        {s.started && ` · started ${s.started}`}
                        {s.dependsOn?.length ? ` · needs ${s.dependsOn.join(", ")}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="font-mono text-[12px] tabular-nums text-white/70">{s.progress}%</span>
                      <StatusPill status={s.status} />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar
                      value={s.progress}
                      tone={s.status === "blocked" ? "amber" : s.progress === 100 ? "pine" : "gold"}
                    />
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">{s.note}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-6">
            {/* Codebase — all measured */}
            <Panel eyebrow="Codebase" title="Measured from the repository">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric label="Components" value={scan.code.components} />
                <Metric label="Pages" value={scan.code.pages} />
                <Metric label="API routes" value={scan.code.apiRoutes} />
                <Metric label="Client comps" value={scan.code.clientComponents} />
                <Metric label="Data modules" value={scan.code.dataModules} />
                <Metric label="Lib modules" value={scan.code.libModules} />
                <Metric label="Dependencies" value={scan.code.dependencies} />
                <Metric label="Dev deps" value={scan.code.devDependencies} />
                <Metric label="Lines of code" value={scan.code.linesOfCode.toLocaleString("en-IN")} />
                <Metric label="TODOs" value={scan.code.todos} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <PendingMetric label="TS errors" reason="Run `npx tsc --noEmit`; not tracked at runtime yet" />
                <PendingMetric label="ESLint errors" reason="Run `npm run lint`; wire to CI to surface here" />
                <PendingMetric label="Dead code" reason="Needs a knip/ts-prune pass" />
              </div>
            </Panel>

            {/* Content — measured */}
            <Panel eyebrow="Content" title="Live on the site">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric label="Packages" value={scan.content.packages} />
                <Metric label="With detail pages" value={scan.content.packagesWithDetail} />
                <Metric label="Destinations" value={scan.content.destinations} />
                <Metric label="Destination guides" value={scan.content.destinationGuides} />
                <Metric label="Journal posts" value={scan.content.journalPosts} />
              </div>
            </Panel>
          </div>
        </div>

        {/* Media */}
        <Panel eyebrow="Media" title="Cinematic asset readiness" className="mt-6">
          <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex justify-center">
              <ProgressRing value={mediaPct} label="Ready" sublabel={`${scan.media.clipsReady}/${scan.media.clipsTotal} clips`} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Video folders" value={scan.media.videoFolders} />
              <Metric label="Clip slots wired" value={scan.media.clipsTotal} />
              <Metric label="Clips ready" value={scan.media.clipsReady} hint="Marked ready in media.ts" />
              <Metric label="Placeholders" value={scan.media.placeholders} hint="Awaiting real files" />
              <Metric label="Real video files" value={scan.media.realVideos} />
              <Metric label="Real images" value={scan.media.realImages} hint="AI-generated so far" />
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-[12.5px] leading-relaxed text-amber-200/80">
            The media architecture is complete and wired — every slot resolves
            video → poster → gradient. It is empty by fact, not by bug: drop real
            files into <code className="font-mono text-[11.5px]">public/videos/…</code> and
            flip <code className="font-mono text-[11.5px]">ready: true</code> in{" "}
            <code className="font-mono text-[11.5px]">src/data/media.ts</code>.
          </p>
        </Panel>

        {/* Roadmap */}
        <Panel eyebrow="Roadmap" title="10 phases to the full platform" className="mt-6">
          <ol className="grid gap-3 md:grid-cols-2">
            {phases.map((p) => {
              const done = p.checklist.filter((c) => c.done).length;
              const pct = Math.round((done / p.checklist.length) * 100);
              return (
                <li key={p.n} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-white/90">
                      <span className="font-mono text-white/35">P{p.n}</span> {p.name}
                    </p>
                    <StatusPill status={p.status} />
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar value={pct} tone={pct === 100 ? "pine" : "gold"} />
                  </div>
                  <ul className="mt-3 space-y-1">
                    {p.checklist.map((c) => (
                      <li key={c.label} className="flex items-center gap-2 text-[12px]">
                        <span
                          className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                            c.done ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300" : "border-white/15"
                          }`}
                          aria-hidden="true"
                        >
                          {c.done ? "✓" : ""}
                        </span>
                        <span className={c.done ? "text-white/55 line-through decoration-white/20" : "text-white/70"}>
                          {c.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* Integrations */}
        <Panel eyebrow="Integrations" title="What's connected" className="mt-6">
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scan.integrations.map((i) => (
              <li key={i.name} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-white/90">{i.name}</p>
                  <StatusPill status={i.state} />
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/40">{i.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Business — explicitly not connected */}
        <Panel
          eyebrow="Business"
          title="Awaiting backend — nothing here is invented"
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <PendingMetric label="Visitors" reason="Needs analytics" />
            <PendingMetric label="Leads" reason="Needs database" />
            <PendingMetric label="Bookings" reason="Needs booking engine" />
            <PendingMetric label="Revenue" reason="Needs payments" />
            <PendingMetric label="Profit" reason="Needs accounting input" />
            <PendingMetric label="Package popularity" reason="Needs analytics" />
            <PendingMetric label="Google reviews" reason="Needs Places API" />
            <PendingMetric label="Satisfaction" reason="Needs post-trip surveys" />
            <PendingMetric label="Marketing perf." reason="Needs campaign data" />
            <PendingMetric label="Expenses" reason="Needs accounting input" />
          </div>
        </Panel>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-white/25">
          Measured values are read from the repository at request time. Sprint and
          roadmap percentages are declared in{" "}
          <code className="font-mono">src/data/founder/roadmap.ts</code> and maintained
          by hand. Anything unmeasurable is shown as “pending” rather than estimated.
        </p>
      </div>
    </div>
  );
}
