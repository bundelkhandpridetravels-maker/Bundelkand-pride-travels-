// Server-only: the seam a future capture path and console surface read through.
import {
  emptyTransportSummary,
  isTariffLapsed,
  type TariffBasis,
  type TariffStatus,
  type TransportSummary,
  type TransportTariff,
} from "@/lib/transport/model";
import { validateTariff } from "@/lib/transport/validation";

/**
 * Transport commercial aggregation boundary — the same pattern as every other
 * module. Callers depend on this interface, never a concrete store.
 *
 * Going live = implement `PayloadTransportRepository` and swap it in
 * `getTransportRepository()`. The model, derivations, validation, activation
 * gate, option proposal and any future surface do not change.
 *
 * ⚠️ NON-LIVE BY DESIGN. Reads report `live:false` and return empty, so a
 * surface says "pending backend" honestly rather than showing an empty list
 * that looks like a business with no transport partners. This module makes NO
 * database contact: no connection, no credential, no query, and no seeded data.
 *
 * NOTE: no Payload collection exists for transport tariffs, and creating one is
 * a schema change requiring a migration against the live database. That is
 * deliberately held back as its own reviewed step rather than bundled into this
 * milestone — the position M4, M8 and M9 all take.
 *
 * ⚠️ THIS REPOSITORY LOGS NOTHING.
 * M4's console store logs a status change with its approver. Doing the same
 * here would write `approvedBy` into a log aggregator and thereby create a
 * partial, uncontrolled approval trail — in a platform that has no audit log
 * and has explicitly decided not to claim approval history. A half-trail nobody
 * can verify, append to or rely on is worse than none, because it looks like
 * proof. The gate enforces that a human was required; nothing here records who.
 *
 * A single log line would also be a disclosure risk in its own right: a
 * transporter, an operating area and an amount together are the commercial
 * terms of a supplier relationship. M9 diverges from M4 the same way and for
 * the same reason.
 */
export interface TransportRepository {
  getSummary(): Promise<TransportSummary>;
  list(filter?: {
    vendorId?: string;
    basis?: TariffBasis;
    status?: TariffStatus;
    /** A resolved `destinations.id`. Never the supplier's free text. */
    operatingAreaId?: string;
  }): Promise<{ live: boolean; tariffs: TransportTariff[] }>;
  /** One tariff by id. Null when absent — never a fabricated placeholder. */
  getById(id: string): Promise<{ live: boolean; tariff: TransportTariff | null }>;
  /**
   * Records an activation or supersession decision. Guarded upstream by
   * `activateTariff` / `canSupersede` — this seam enforces nothing itself and
   * must never be treated as the gate.
   */
  setStatus(id: string, status: TariffStatus): Promise<{ live: boolean; persisted: false }>;
}

class ConsoleTransportRepository implements TransportRepository {
  async getSummary(): Promise<TransportSummary> {
    return emptyTransportSummary(false);
  }

  async list(): Promise<{ live: boolean; tariffs: TransportTariff[] }> {
    return { live: false, tariffs: [] };
  }

  async getById(): Promise<{ live: boolean; tariff: TransportTariff | null }> {
    return { live: false, tariff: null };
  }

  async setStatus(): Promise<{ live: boolean; persisted: false }> {
    // Reports `persisted: false` rather than a bare acknowledgement. A seam that
    // appeared to save an activation decision while discarding it would be worse
    // than one that says plainly it did not.
    return { live: false, persisted: false };
  }
}

let repo: TransportRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getTransportRepository(): TransportRepository {
  if (!repo) repo = new ConsoleTransportRepository();
  return repo;
}

/** Fold tariffs into the register summary. Pure; used by the repository and any UI. */
export function summarizeTransport(
  tariffs: TransportTariff[],
  live: boolean,
  now: Date = new Date(),
): TransportSummary {
  const summary = emptyTransportSummary(live);
  summary.total = tariffs.length;

  for (const tariff of tariffs) {
    summary.counts[tariff.status] += 1;
    summary.byBasis[tariff.basis] += 1;
    if (isTariffLapsed(tariff, now)) summary.lapsed += 1;
    if (!tariff.operatingAreaId || tariff.operatingAreaId.trim() === "") {
      summary.areaUnresolved += 1;
    }
    if (!validateTariff(tariff, now).ok) summary.withErrors += 1;
  }

  return summary;
}
