// Server-only: imported by the rate sheets dashboard.
import {
  emptyRateSheetSummary,
  type RateSheet,
  type RateSheetStatus,
  type RateSheetSummary,
} from "@/lib/rates/model";
import {
  isRateSheetExpiringSoon,
  isRateSheetLapsed,
  validateRateSheet,
} from "@/lib/rates/validation";

/**
 * Rate sheet aggregation boundary — the same pattern as every other module.
 * Callers depend on this interface, never a concrete store.
 *
 * Going live = implement PayloadRateSheetRepository and swap it in
 * `getRateSheetRepository()`. The model, season maths, validation, activation
 * gate and dashboard do not change.
 *
 * NOTE: no Payload collection exists for rates yet — that is a schema change
 * requiring a migration against the live database, and is deliberately held
 * back as its own reviewed step rather than bundled into this milestone.
 */
export interface RateSheetRepository {
  getSummary(): Promise<RateSheetSummary>;
  list(filter?: { vendorId?: string; status?: RateSheetStatus }): Promise<{
    live: boolean;
    sheets: RateSheet[];
  }>;
  /** Records an activation decision. Guarded by activateRateSheet() upstream. */
  setStatus(
    id: string,
    status: RateSheetStatus,
    meta?: { approvedBy?: string },
  ): Promise<{ live: boolean }>;
}

/**
 * Default store until a rate collection is wired. Reads report `live:false` so
 * surfaces honestly show "pending backend" rather than an empty-looking real
 * register. Writes are logged, never silently persisted, and amounts are never
 * written to the log.
 */
class ConsoleRateSheetRepository implements RateSheetRepository {
  async getSummary(): Promise<RateSheetSummary> {
    return emptyRateSheetSummary(false);
  }

  async list(): Promise<{ live: boolean; sheets: RateSheet[] }> {
    return { live: false, sheets: [] };
  }

  async setStatus(
    id: string,
    status: RateSheetStatus,
    meta: { approvedBy?: string } = {},
  ): Promise<{ live: boolean }> {
    console.info(
      "[rate-sheet:status]",
      JSON.stringify({ id, status, approvedBy: meta.approvedBy ?? null }),
    );
    return { live: false };
  }
}

let repo: RateSheetRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getRateSheetRepository(): RateSheetRepository {
  if (!repo) repo = new ConsoleRateSheetRepository();
  return repo;
}

/** Fold sheets into the register summary. Pure; used by the repository and UI. */
export function summarizeRateSheets(
  sheets: RateSheet[],
  live: boolean,
  now: Date = new Date(),
): RateSheetSummary {
  const summary = emptyRateSheetSummary(live);
  summary.total = sheets.length;

  for (const sheet of sheets) {
    summary.counts[sheet.status] += 1;
    if (isRateSheetExpiringSoon(sheet, now)) summary.expiringSoon += 1;
    if (isRateSheetLapsed(sheet, now)) summary.lapsed += 1;
    if (!validateRateSheet(sheet, now).ok) summary.withErrors += 1;
  }

  return summary;
}
