"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  dashboardNav,
  dashboardFuture,
  resolveActive,
  type DashboardNavItem,
} from "@/lib/dashboard/nav";
import { cn } from "@/lib/cn";

/**
 * Shared console shell — sidebar + topbar chrome for every /dashboard/(console)
 * surface. Kept deliberately generic so future BPT units drop in via the nav
 * config alone. The completed standalone Founder page lives outside this group
 * and is unaffected.
 */

/** Minimal line-icon set (no icon dependency). */
const icons: Record<string, ReactNode> = {
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  compass: <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM16 8l-2.5 5.5L8 16l2.5-5.5z" />,
  truck: <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18.5A1.5 1.5 0 107 15.5 1.5 1.5 0 007 18.5zM17.5 18.5A1.5 1.5 0 1017.5 15.5 1.5 1.5 0 0017.5 18.5z" />,
  funnel: <path d="M3 5h18l-7 8v6l-4-2v-4z" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  users: <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0zM17 11a3 3 0 10-1-5.8M21 20a6 6 0 00-4-5.6" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-[18px] w-[18px]", className)}
      aria-hidden="true"
    >
      {icons[name] ?? icons.grid}
    </svg>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: DashboardNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const disabled = item.status === "planned";

  const inner = (
    <>
      <Icon name={item.icon} className={active ? "text-gold" : "text-white/45"} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.status === "scaffold" && (
        <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-sky-300">
          scaffold
        </span>
      )}
      {item.status === "planned" && (
        <span className="rounded-full border border-white/12 bg-white/5 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-white/40">
          soon
        </span>
      )}
    </>
  );

  const classes = cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-white/[0.06] text-white"
      : disabled
        ? "cursor-not-allowed text-white/30"
        : "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true" title="Planned — not built yet">
        {inner}
      </span>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={classes} aria-current={active ? "page" : undefined}>
      {inner}
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-mono text-xs font-bold text-ink">
          BPT
        </span>
        <span className="leading-tight">
          <span className="block text-[12.5px] font-bold tracking-wide text-white">Operating System</span>
          <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/40">
            Internal console
          </span>
        </span>
      </Link>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
        {dashboardNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={resolveActive(pathname)?.href === item.href}
            onNavigate={onNavigate}
          />
        ))}

        <p className="px-3 pb-1 pt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
          Future units
        </p>
        {dashboardFuture.map((item) => (
          <NavLink key={item.href} item={item} active={false} />
        ))}
      </nav>

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/12 px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:bg-white/5"
      >
        View live site →
      </Link>
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = resolveActive(pathname);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white/90">
      {/* ambient wash — matches the founder dashboard language */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 18% 0%, rgba(201,162,77,0.09), transparent 55%), radial-gradient(ellipse at 88% 15%, rgba(47,93,80,0.11), transparent 50%)",
        }}
        aria-hidden="true"
      />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/8 bg-white/[0.02] px-4 py-6 backdrop-blur-xl lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/8 bg-[#0B0F1C] px-4 py-6">
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/8 bg-[#0A0E1A]/85 px-5 py-3.5 backdrop-blur-xl sm:px-8">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/70 lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold/70">
              BPT Console
            </p>
            <h1 className="truncate text-[15px] font-semibold text-white">
              {active?.label ?? "Dashboard"}
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
