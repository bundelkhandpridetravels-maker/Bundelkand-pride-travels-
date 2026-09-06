// Server-only: the seam a future capture path and console surface read through.
import {
  emptyDmcOfferSummary,
  isOfferLapsed,
  isUnboundQuotation,
  type DmcOffer,
  type DmcOfferSummary,
  type OfferBasis,
  type OfferStatus,
} from "@/lib/dmc/model";
import { validateOffer } from "@/lib/dmc/validation";

/**
 * DMC offer aggregation boundary — the same pattern as every other module.
 * Callers depend on this interface, never a concrete store.
 *
 * Going live = implement `PayloadDmcOfferRepository` and swap it in
 * `getDmcOfferRepository()`. The model, derivations, validation, activation gate
 * and any future surface do not change.
 *
 * ⚠️ NON-LIVE BY DESIGN. Reads report `live:false` and return empty, so a surface
 * says "pending backend" honestly rather than showing an empty list that looks
 * like a business with no supplier offers. This module makes NO database
 * contact: no connection, no credential, no query, and no seeded data.
 *
 * NOTE: no Payload collection exists for DMC offers, and creating one is a
 * schema change requiring a migration against the live database. That is
 * deliberately held back as its own reviewed step rather than bundled into this
 * milestone — the same position M4 takes for rate sheets.
 *
 * ⚠️ THIS REPOSITORY LOGS NOTHING, AND THAT DIVERGES FROM M4 DELIBERATELY.
 * M4's console store logs a status change with its approver. Doing the same here
 * would write `approvedBy` into a log aggregator and thereby create a partial,
 * uncontrolled approval trail — in a platform that has no audit log and has
 * explicitly decided not to claim approval history. A half-trail nobody can
 * verify, append to, or rely on is worse than none, because it looks like proof.
 * The gate enforces that a human was required; nothing here records who.
 */
export interface DmcOfferRepository {
  getSummary(): Promise<DmcOfferSummary>;
  list(filter?: {
    dmcId?: string;
    basis?: OfferBasis;
    status?: OfferStatus;
  }): Promise<{ live: boolean; offers: DmcOffer[] }>;
  /** One offer by id. Null when absent — never a fabricated placeholder. */
  getById(id: string): Promise<{ live: boolean; offer: DmcOffer | null }>;
  /**
   * Records an activation or supersession decision. Guarded upstream by
   * `activateOffer` / `canSupersede` — this seam enforces nothing itself and
   * must never be treated as the gate.
   */
  setStatus(id: string, status: OfferStatus): Promise<{ live: boolean; persisted: false }>;
}

class ConsoleDmcOfferRepository implements DmcOfferRepository {
  async getSummary(): Promise<DmcOfferSummary> {
    return emptyDmcOfferSummary(false);
  }

  async list(): Promise<{ live: boolean; offers: DmcOffer[] }> {
    return { live: false, offers: [] };
  }

  async getById(): Promise<{ live: boolean; offer: DmcOffer | null }> {
    return { live: false, offer: null };
  }

  async setStatus(): Promise<{ live: boolean; persisted: false }> {
    // Reports `persisted: false` rather than a bare acknowledgement. A seam that
    // appeared to save an activation decision while discarding it would be worse
    // than one that says plainly it did not.
    return { live: false, persisted: false };
  }
}

let repo: DmcOfferRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getDmcOfferRepository(): DmcOfferRepository {
  if (!repo) repo = new ConsoleDmcOfferRepository();
  return repo;
}

/** Fold offers into the register summary. Pure; used by the repository and any UI. */
export function summarizeDmcOffers(
  offers: DmcOffer[],
  live: boolean,
  now: Date = new Date(),
): DmcOfferSummary {
  const summary = emptyDmcOfferSummary(live);
  summary.total = offers.length;

  for (const offer of offers) {
    summary.counts[offer.status] += 1;
    summary.byBasis[offer.basis] += 1;
    if (offer.status === "active" && isOfferLapsed(offer, now)) summary.lapsed += 1;
    if (isUnboundQuotation(offer)) summary.unboundQuotations += 1;
    if (!validateOffer(offer, now).ok) summary.withErrors += 1;
  }

  return summary;
}
