import type { ReactNode } from "react";
import { EmptyState } from "@/components/dashboard/States";

/**
 * Reusable table shell for console lists (leads, vendors, bookings, users…).
 * Renders headers always, and a full-width empty state when there are no rows —
 * so a scaffold shows real structure without inventing data.
 */

export type Column = { key: string; header: string; className?: string };

export default function DataTable({
  columns,
  rows,
  emptyTitle = "No records yet",
  emptyHint,
}: {
  columns: Column[];
  rows?: Record<string, ReactNode>[];
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const hasRows = rows && rows.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {hasRows && (
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/6 last:border-0 hover:bg-white/[0.02]">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-[13px] text-white/75 ${col.className ?? ""}`}>
                      {row[col.key] ?? <span className="text-white/25">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {!hasRows && (
        <div className="p-3">
          <EmptyState title={emptyTitle} hint={emptyHint} />
        </div>
      )}
    </div>
  );
}
