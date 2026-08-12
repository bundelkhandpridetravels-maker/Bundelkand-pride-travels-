import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: { default: "BPT Console", template: "%s · BPT Console" },
  // Internal tooling — never index the console.
  robots: { index: false, follow: false },
};

/**
 * Console route group layout. Wraps every /dashboard/(console) surface in the
 * shared shell. The standalone Founder page lives outside this group and keeps
 * its own full-page layout untouched.
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
