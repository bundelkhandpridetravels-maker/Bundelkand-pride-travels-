// Server-only: imported by the customers dashboard and the CRM repository.
import {
  emptyCustomerSummary,
  summarizeCustomers,
  type CustomerRecord,
  type CustomerStatus,
  type CustomerSummary,
} from "@/lib/customer/model";
import {
  normalizeEmail,
  nationalPhone,
  normalizeName,
} from "@/lib/customer/duplicate";

/**
 * Customer aggregation boundary — the seam the CRM layer was missing.
 *
 * `collections/Customers.ts` is authoritative and its tables are already in the
 * applied migration, but no app-layer reader existed: the CRM dashboard could
 * show leads and activities and had no way to reach a customer at all.
 *
 * Going live = implement PayloadCustomerRepository against the EXISTING
 * `customers` collection and swap it in `getCustomerRepository()`. The model,
 * duplicate detection, conversion logic and dashboard do not change.
 *
 * NOTE: this deliberately does not persist. The table exists; writing to it is
 * database activation, a separately gated decision.
 */

export type CustomerListFilter = {
  status?: CustomerStatus;
  /** Free-text query matched against name, email and phone. */
  query?: string;
  /** Only customers with more than one booking. */
  repeatOnly?: boolean;
};

export interface CustomerRepository {
  getSummary(): Promise<CustomerSummary>;
  list(filter?: CustomerListFilter): Promise<{ live: boolean; customers: CustomerRecord[] }>;
  getById(id: string): Promise<{ live: boolean; customer: CustomerRecord | null }>;
  search(query: string): Promise<{ live: boolean; customers: CustomerRecord[] }>;
}

/**
 * Default store until the Payload-backed repository is wired. Reads report
 * `live:false` so surfaces show "pending backend" honestly rather than an empty
 * customer list that looks like a real, empty CRM.
 *
 * PII DISCIPLINE: this repository logs NOTHING. The enquiry and booking
 * repositories log their full records (`[enquiry:new]`, `[booking:new]` carry
 * name, phone and email), which is a pre-existing PII-in-logs exposure worth
 * addressing before production but out of scope here. This seam does not add to
 * it: there is no customer log line at all, because there is no read or write
 * whose diagnostic value would justify putting a person's contact details into
 * a log aggregator.
 */
class ConsoleCustomerRepository implements CustomerRepository {
  async getSummary(): Promise<CustomerSummary> {
    return emptyCustomerSummary(false);
  }

  async list(): Promise<{ live: boolean; customers: CustomerRecord[] }> {
    return { live: false, customers: [] };
  }

  async getById(): Promise<{ live: boolean; customer: CustomerRecord | null }> {
    return { live: false, customer: null };
  }

  async search(): Promise<{ live: boolean; customers: CustomerRecord[] }> {
    return { live: false, customers: [] };
  }
}

let repo: CustomerRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getCustomerRepository(): CustomerRepository {
  if (!repo) repo = new ConsoleCustomerRepository();
  return repo;
}

/* ------------------------------------------------------------------ *
 * Pure query helpers
 * ------------------------------------------------------------------ */

/**
 * In-memory search. The Payload repository will push this into a query; keeping
 * the semantics here means both implementations agree on what "matching" means.
 *
 * Matches on name (substring), email (exact after normalisation) and phone
 * (national number). Email and phone are matched exactly rather than by
 * substring: a partial email match would surface unrelated people who merely
 * share a domain, which on a customer list is a privacy problem, not just noise.
 */
export function searchCustomers(
  customers: CustomerRecord[],
  query: string,
): CustomerRecord[] {
  const q = query.trim();
  if (!q) return [];

  const name = normalizeName(q);
  const email = normalizeEmail(q);
  const phone = nationalPhone(q);

  return customers.filter((c) => {
    if (name && normalizeName(c.name).includes(name)) return true;
    if (email.includes("@") && normalizeEmail(c.contact.email) === email) return true;
    if (phone) {
      if (nationalPhone(c.contact.phone) === phone) return true;
      if (nationalPhone(c.contact.whatsapp) === phone) return true;
    }
    return false;
  });
}

/** Apply a filter in memory. Pure; used by the repository and the console. */
export function applyCustomerFilter(
  customers: CustomerRecord[],
  filter: CustomerListFilter = {},
): CustomerRecord[] {
  let result = customers;
  if (filter.status) result = result.filter((c) => c.status === filter.status);
  if (filter.repeatOnly) result = result.filter((c) => c.bookingIds.length > 1);
  if (filter.query?.trim()) result = searchCustomers(result, filter.query);
  return result;
}

/** Re-exported so callers get the summary fold from one place. */
export { summarizeCustomers };
