import { LoadingState } from "@/components/dashboard/States";

/** Shown inside the console shell while a page streams in. */
export default function ConsoleLoading() {
  return <LoadingState rows={5} />;
}
