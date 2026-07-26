// Server-only: providers read the module repositories.
import type { HermesContext } from "@/lib/crm/hermes";
import { buildLeadContext } from "@/lib/crm/hermes";
import { getCrmRepository } from "@/lib/crm/crm-repository";
import { buildVendorContext } from "@/lib/vendor/hermes";
import { getVendorRepository } from "@/lib/vendor/vendor-repository";
import type { HermesContextProvider, HermesInsight, HermesModule } from "@/lib/hermes/contract";

/**
 * Concrete Hermes providers. Each REUSES its module's existing repository +
 * context builder — no new data models, no parallel logic. Adding a future
 * module (marketing/finance/…) means adding one provider here that wraps that
 * module's repository; the contract and consumers never change.
 *
 * `getInsights()` returns [] today (Hermes disabled). When enabled, each provider
 * computes real insights from the same repository data the dashboards already use.
 */

const crmHermesProvider: HermesContextProvider = {
  module: "crm",
  async getContexts(): Promise<HermesContext[]> {
    const crm = getCrmRepository();
    const [{ leads }, { activities }] = await Promise.all([crm.listLeads(), crm.listActivities()]);
    return leads.map((lead) => buildLeadContext(lead, activities));
  },
  async getInsights(): Promise<HermesInsight[]> {
    return [];
  },
};

const vendorHermesProvider: HermesContextProvider = {
  module: "vendor",
  async getContexts(): Promise<HermesContext[]> {
    const { vendors } = await getVendorRepository().listVendors();
    return vendors.map((v) => buildVendorContext(v));
  },
  async getInsights(): Promise<HermesInsight[]> {
    return [];
  },
};

/** Registry of active providers. Future modules append here. */
export const hermesProviders: HermesContextProvider[] = [crmHermesProvider, vendorHermesProvider];

export function getHermesProvider(module: HermesModule): HermesContextProvider | undefined {
  return hermesProviders.find((p) => p.module === module);
}
