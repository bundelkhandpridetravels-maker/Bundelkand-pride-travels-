import Link from "next/link";
import { Panel, StatusPill } from "@/components/dashboard";
import { dashboardNav, dashboardFuture } from "@/lib/dashboard/nav";

export const metadata = { title: "Overview" };

/** Console home — a directory of every operating surface. */
export default function ConsoleHome() {
  const surfaces = dashboardNav.filter((i) => i.href !== "/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">
          Bundelkhand Pride · Operating System
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Every operating surface, one console
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-white/50">
          The internal command layer for BPT. Dashboards are being built shell-first;
          each connects to real data as the backend and each destination come online.
        </p>
      </div>

      <Panel eyebrow="Dashboards" title="Active surfaces">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {surfaces.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-white/90">{item.label}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/45">{item.description}</p>
              <span className="mt-3 inline-block font-mono text-[10.5px] uppercase tracking-[0.1em] text-gold/70 group-hover:text-gold">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Roadmap" title="Future units">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardFuture.map((item) => (
            <div key={item.href} className="rounded-xl border border-dashed border-white/10 bg-transparent p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-white/70">{item.label}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/35">{item.description}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
