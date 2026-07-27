/**
 * Single source of truth for the internal console (/dashboard/*) navigation.
 *
 * This is intentionally data, not markup: the shell, the hub and any future
 * unit (Influencer / Trip-Captain, Analytics, Hermes AI) render from here, and
 * role-based visibility can later filter this list without touching the shell.
 * Long-term, each BPT business unit can contribute its own nav section.
 */

export type DashboardStatus = "live" | "scaffold" | "planned";

export type DashboardNavItem = {
  label: string;
  href: string;
  /** Icon key resolved by the shell's icon map. */
  icon: string;
  description: string;
  status: DashboardStatus;
};

/** Active, navigable console surfaces. */
export const dashboardNav: DashboardNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "grid",
    description: "Console home — every BPT operating surface in one place.",
    status: "live",
  },
  {
    label: "Founder",
    href: "/dashboard/founder",
    icon: "compass",
    description: "Founder operating system — roadmap, blockers, live project scan.",
    status: "live",
  },
  {
    label: "Operations",
    href: "/dashboard/operations",
    icon: "grid",
    description: "Unified operational view — aggregates every module repository.",
    status: "live",
  },
  {
    label: "Validation",
    href: "/dashboard/validation",
    icon: "shield",
    description: "Platform validation — module/repository/provider/credential readiness.",
    status: "live",
  },
  {
    label: "Vendor",
    href: "/dashboard/vendor",
    icon: "truck",
    description: "Verified supplier network — availability, tasks, payments, scores.",
    status: "scaffold",
  },
  {
    label: "Vendor Import",
    href: "/dashboard/vendor-import",
    icon: "grid",
    description: "Founder — import & validate real vendor data (Gmail, cards, rate sheets…).",
    status: "scaffold",
  },
  {
    label: "CRM",
    href: "/dashboard/crm",
    icon: "funnel",
    description: "Leads, customers, follow-ups and the sales pipeline.",
    status: "scaffold",
  },
  {
    label: "Marketing",
    href: "/dashboard/marketing",
    icon: "chart",
    description: "Campaigns, channels and creator / Trip-Captain partnerships.",
    status: "scaffold",
  },
  {
    label: "Admin",
    href: "/dashboard/admin",
    icon: "shield",
    description: "Users, roles, content, audit logs and platform settings.",
    status: "scaffold",
  },
];

/**
 * Future units named in the founder vision. Shown disabled in the shell so the
 * long-term shape is visible without pretending they're built.
 */
export const dashboardFuture: DashboardNavItem[] = [
  {
    label: "Trip Captains",
    href: "/dashboard/trip-captains",
    icon: "users",
    description: "Influencers as trip leaders — trips, commission, content, referrals.",
    status: "planned",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: "chart",
    description: "Cross-unit analytics and reporting.",
    status: "planned",
  },
  {
    label: "Hermes AI",
    href: "/dashboard/hermes",
    icon: "spark",
    description: "The operating intelligence layer — support, CRM, ops, content.",
    status: "planned",
  },
];

/** Resolve the active nav item for a pathname (longest matching href wins). */
export function resolveActive(pathname: string): DashboardNavItem | undefined {
  const all = [...dashboardNav, ...dashboardFuture];
  const matches = all
    .filter((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0];
}
