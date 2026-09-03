// Server-only: imported by the hotel readiness console and (later) the
// allocation workflow. Never by a customer-facing page.
import {
  emptyHotelSummary,
  findOrphanHotels,
  type HotelRecord,
  type HotelStarCategory,
  type HotelSummary,
} from "@/lib/hotels/model";
import { isUnmappableHotelCategory } from "@/lib/hotels/category";
import type { AllocationProposal } from "@/lib/hotels/allocation";

/**
 * Hotel aggregation boundary — the same seam every other module has.
 *
 * The `hotels` table, its room types and its supplier relation are migrated and
 * waiting. What has never existed is a reader, and this is it. Callers depend
 * on this interface, never on a concrete store, so going live means
 * implementing `PayloadHotelRepository` and swapping it in
 * `getHotelRepository()` — the model, category resolution, capacity rules,
 * allocation engine and console do not change.
 *
 * ⚠️ NON-LIVE BY DESIGN. Reads report `live:false` and return empty, so a
 * surface honestly says "pending backend" rather than showing an empty register
 * that looks like a real, empty business. M8 makes NO database contact: no
 * connection, no credential, no query, no seeding of hotel or rate data.
 *
 * ⚠️ WHAT THE LOG MAY NOT CARRY.
 * A hotel allocation log is unusually dangerous, because a single line can
 * disclose which customer is staying where. So the write log records the
 * decision and its shape — never a hotel name, a supplier's net rate, a BPT
 * margin, a commercial value or any customer detail. Property and supplier
 * appear as identifiers only, and only where an operator could not otherwise
 * reconstruct what happened. This follows M5, which deliberately omits a
 * document's filename because the filename discloses its subject.
 */
export interface HotelRepository {
  getSummary(): Promise<HotelSummary>;
  list(filter?: {
    destinationId?: string;
    starCategory?: HotelStarCategory;
    vendorId?: string;
  }): Promise<{ live: boolean; hotels: HotelRecord[] }>;
  /** One property by id. Null when absent — never a fabricated placeholder. */
  get(id: string): Promise<{ live: boolean; hotel: HotelRecord | null }>;
  /**
   * Records an allocation PROPOSAL for operational traceability.
   *
   * Deliberately not `saveAllocation`. M8 allocates nothing: an allocation
   * requires proven availability, and confirming one requires the approval
   * queue and audit trail that do not exist yet. Persisting a proposal as
   * though it were a decision is precisely the confusion this seam prevents.
   */
  recordProposal(proposal: AllocationProposal): Promise<{ live: boolean; persisted: false }>;
}

/**
 * The store until a Payload-backed reader is wired. Reads are honest about
 * being non-live; the write path logs a decision trace and persists nothing.
 */
class ConsoleHotelRepository implements HotelRepository {
  async getSummary(): Promise<HotelSummary> {
    return emptyHotelSummary(false);
  }

  async list(): Promise<{ live: boolean; hotels: HotelRecord[] }> {
    return { live: false, hotels: [] };
  }

  async get(): Promise<{ live: boolean; hotel: HotelRecord | null }> {
    return { live: false, hotel: null };
  }

  async recordProposal(
    proposal: AllocationProposal,
  ): Promise<{ live: boolean; persisted: false }> {
    // Counts and codes only. No hotel name, no supplier name, no score, no
    // rate, no margin, no customer detail — a proposal names every property
    // BPT is about to try, and that list is not log material.
    console.info(
      "[hotel:proposal]",
      JSON.stringify({
        requirementId: proposal.requirementId,
        commitmentType: proposal.commitmentType,
        candidates: proposal.candidates.length,
        excluded: proposal.excluded.length,
        slotFilled: proposal.slot.filled,
        refusal: proposal.refusal?.code ?? null,
        allocatable: proposal.allocatable,
      }),
    );
    return { live: false, persisted: false };
  }
}

let repo: HotelRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getHotelRepository(): HotelRepository {
  if (!repo) repo = new ConsoleHotelRepository();
  return repo;
}

/**
 * Fold properties into the register summary. Pure; used by the repository and
 * the console.
 *
 * ⚠️ COUNTS PROPERTIES, NEVER ROOMS. A room total on a readiness console would
 * read as inventory, and the platform has no inventory — see `capacity.ts`.
 */
export function summarizeHotels(
  hotels: HotelRecord[],
  live: boolean,
): HotelSummary {
  const summary = emptyHotelSummary(live);
  summary.total = hotels.length;
  summary.orphans = findOrphanHotels(hotels).length;

  for (const hotel of hotels) {
    if (hotel.starCategory) {
      summary.byCategory[hotel.starCategory] += 1;
      if (isUnmappableHotelCategory(hotel.starCategory)) summary.unmappableCategory += 1;
    }
    if (hotel.representative) summary.representative += 1;
    if (hotel.roomTypes.length === 0) summary.withoutRoomTypes += 1;
  }

  return summary;
}
