// Server-only: imported by the CRM dashboard + future CRM API routes.
import {
  emptyPipelineSummary,
  type CrmActivity,
  type CrmLead,
  type CrmPipelineSummary,
} from "@/lib/crm/model";

/**
 * CRM aggregation boundary — the operational brain's read model. Dashboards and
 * (later) Hermes depend on this interface, never on a concrete store. Today the
 * console stub reports `live: false` (no DB), so surfaces render an honest
 * "connect backend" state. Swap in PayloadCrmRepository / NeonCrmRepository —
 * which will aggregate leads/bookings/quotes via src/lib/crm/adapters.ts — and
 * every CRM surface lights up with zero UI change.
 */
export interface CrmRepository {
  getPipelineSummary(): Promise<CrmPipelineSummary>;
  listLeads(): Promise<{ live: boolean; leads: CrmLead[] }>;
  listActivities(): Promise<{ live: boolean; activities: CrmActivity[] }>;
}

class ConsoleCrmRepository implements CrmRepository {
  async getPipelineSummary(): Promise<CrmPipelineSummary> {
    return emptyPipelineSummary(false);
  }
  async listLeads(): Promise<{ live: boolean; leads: CrmLead[] }> {
    return { live: false, leads: [] };
  }
  async listActivities(): Promise<{ live: boolean; activities: CrmActivity[] }> {
    return { live: false, activities: [] };
  }
}

let repo: CrmRepository | null = null;

export function getCrmRepository(): CrmRepository {
  if (!repo) repo = new ConsoleCrmRepository();
  return repo;
}
