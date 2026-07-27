/**
 * Barrel for the internal console. New dashboards import everything from
 * `@/components/dashboard` — the shared atoms are currently re-exported from the
 * founder module so nothing there had to be rewritten; they can be physically
 * relocated here later without touching any consumer.
 */
export {
  Panel,
  Metric,
  PendingMetric,
  ProgressBar,
  ProgressRing,
  StatusPill,
} from "@/components/founder/Primitives";

export { EmptyState, LoadingState, ScaffoldNote } from "./States";
export { default as DataTable, type Column } from "./DataTable";
export { default as DashboardShell } from "./DashboardShell";
export { default as PipelineBoard } from "./PipelineBoard";
export { default as HermesPanel } from "./HermesPanel";
export { default as VendorOnboardingForm } from "./VendorOnboardingForm";
