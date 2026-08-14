/**
 * Lead → Customer conversion. Pure, deterministic, idempotent, non-mutating.
 *
 * THE RULE: a lead is converted because a CUSTOMER REFERENCES IT — not because
 * someone set a flag on the lead. `leads.stage` already has `won`; adding a
 * second "converted" boolean would create two answers to one question, and the
 * two would drift the first time one was updated without the other. This is the
 * same discipline `contracts/vendor-link.ts` applies to vendor agreement status.
 *
 * ⚠️ THE HONEST PART: the reference the rule depends on DOES NOT EXIST IN THE
 * SCHEMA. `collections/Customers.ts` has no `sourceLead` relation and
 * `collections/Leads.ts` has no `customer` relation. So the link modelled here
 * is app-layer only — it is computed and passed around, and it does not survive
 * a database write.
 *
 * That is stated in code (`LEAD_LINK_PERSISTENCE`) rather than worked around.
 * Persisting it is a schema change and therefore a separately approved
 * milestone; faking persistence would be worse than not having it, because a
 * conversion that silently vanishes is indistinguishable from one that never
 * happened.
 */
import type { CrmLead } from "@/lib/crm/model";
import {
  assessDuplicates,
  type CustomerDuplicateMatch,
  type CustomerIdentity,
} from "@/lib/customer/duplicate";
import type { CustomerRecord, CustomerSource } from "@/lib/customer/model";

/** Where a lead→customer link currently lives. Not a database column. */
export const LEAD_LINK_PERSISTENCE = "app_layer_only" as const;

export const LEAD_LINK_SCHEMA_GAP =
  "Persisting lead→customer requires adding a relation (customers.sourceLead or " +
  "leads.customer) — a schema change, and a separately approved milestone.";

/**
 * The link itself. `persisted: false` is a literal type, not a value someone can
 * optimistically flip: making it true requires the schema change above.
 */
export type CustomerLeadLink = {
  leadId: string;
  customerId: string;
  /** ISO timestamp supplied by the caller — never generated here (purity). */
  linkedAt: string;
  persisted: false;
};

export function makeLink(leadId: string, customerId: string, linkedAt: string): CustomerLeadLink {
  return { leadId, customerId, linkedAt, persisted: false };
}

/* ------------------------------------------------------------------ *
 * Reading the link
 * ------------------------------------------------------------------ */

/** Which customer came from this lead? Null for an unknown or unlinked lead. */
export function customerIdForLead(links: CustomerLeadLink[], leadId: string): string | null {
  return links.find((l) => l.leadId === leadId)?.customerId ?? null;
}

/** Which lead did this customer come from? Null when unknown or organic. */
export function leadIdForCustomer(links: CustomerLeadLink[], customerId: string): string | null {
  return links.find((l) => l.customerId === customerId)?.leadId ?? null;
}

/** Converted = a customer references it. Nothing else is consulted. */
export function isLeadConverted(links: CustomerLeadLink[], leadId: string): boolean {
  return customerIdForLead(links, leadId) !== null;
}

/** Resolve the actual customer record a lead became. */
export function customerForLead(
  links: CustomerLeadLink[],
  customers: CustomerRecord[],
  leadId: string,
): CustomerRecord | null {
  const id = customerIdForLead(links, leadId);
  if (!id) return null;
  return customers.find((c) => c.id === id) ?? null;
}

/**
 * Add a link. Returns a NEW array; the input is never mutated.
 *
 * Idempotent: re-linking the same pair returns an equivalent set rather than a
 * duplicate. Re-linking a lead to a DIFFERENT customer is refused — a lead
 * becoming two customers is the ambiguity this whole module exists to prevent.
 */
export function applyLink(
  links: CustomerLeadLink[],
  link: CustomerLeadLink,
): { ok: true; links: CustomerLeadLink[]; changed: boolean } | { ok: false; error: string } {
  const existing = links.find((l) => l.leadId === link.leadId);

  if (existing) {
    if (existing.customerId === link.customerId) {
      return { ok: true, links: [...links], changed: false };
    }
    return {
      ok: false,
      error: `Lead is already linked to customer ${existing.customerId}; a lead cannot become two customers.`,
    };
  }
  return { ok: true, links: [...links, link], changed: true };
}

/* ------------------------------------------------------------------ *
 * Source mapping
 * ------------------------------------------------------------------ */

/**
 * `enum_leads_source` → `enum_customers_source`. Four values exist in both.
 *
 * `phone` has no customer equivalent and becomes `other`, NOT `walk_in`: someone
 * who called is not someone who walked in, and inventing that would put a false
 * acquisition channel into the record that marketing would later read as fact.
 */
const LEAD_TO_CUSTOMER_SOURCE: Record<string, CustomerSource> = {
  website: "website",
  whatsapp: "whatsapp",
  instagram: "instagram",
  referral: "referral",
  phone: "other",
  other: "other",
};

/**
 * `CrmLead.source` is free text carrying prefixed origins such as
 * `enquiry:package_page` or `booking_journey`, so the prefix is stripped before
 * lookup and anything unrecognised falls to `other` rather than guessing.
 */
export function customerSourceFromLead(leadSource: string): CustomerSource {
  const head = leadSource.split(":")[0]?.trim().toLowerCase() ?? "";
  if (head === "enquiry" || head === "booking_journey" || head === "quote") return "website";
  return LEAD_TO_CUSTOMER_SOURCE[head] ?? "other";
}

/* ------------------------------------------------------------------ *
 * Planning a conversion
 * ------------------------------------------------------------------ */

/** The identity a lead offers for duplicate comparison. */
export function identityFromLead(lead: CrmLead): CustomerIdentity {
  return {
    name: lead.contact.name,
    email: lead.contact.email,
    phone: lead.contact.phone,
    city: lead.contact.city,
  };
}

/**
 * The customer a lead would become. A DRAFT — never a record: it has no id, no
 * timestamps and is not persisted. Only fields the lead actually carries are
 * populated; nothing is filled in to look complete.
 */
export type CustomerDraft = Omit<CustomerRecord, "id" | "createdAt" | "updatedAt">;

export function customerDraftFromLead(lead: CrmLead): CustomerDraft {
  return {
    name: lead.contact.name.trim(),
    contact: {
      ...(lead.contact.phone ? { phone: lead.contact.phone } : {}),
      ...(lead.contact.email ? { email: lead.contact.email } : {}),
    },
    address: {
      ...(lead.contact.city ? { city: lead.contact.city } : {}),
    },
    source: customerSourceFromLead(lead.source),
    tags: [],
    bookingIds: [],
    documentRefs: [],
    // Consent is never inherited. A trip enquiry is not marketing permission.
    consentMarketing: false,
    status: "active",
  };
}

export type ConversionPlan =
  | { outcome: "already_converted"; customerId: string }
  | { outcome: "blocked_duplicate"; matches: CustomerDuplicateMatch[]; existingCustomerId: string }
  | { outcome: "not_convertible"; reason: string }
  | { outcome: "ready"; draft: CustomerDraft; warnings: string[] };

/**
 * Decide what converting this lead would mean. Computes only — creates nothing,
 * writes nothing, mutates nothing. Calling it twice with the same inputs gives
 * the same answer.
 *
 * Order matters: an existing link wins over a duplicate check, so a lead already
 * converted never re-reports as a duplicate of the very customer it produced.
 */
export function planConversion(
  lead: CrmLead,
  existingCustomers: CustomerRecord[],
  links: CustomerLeadLink[] = [],
): ConversionPlan {
  const linkedId = customerIdForLead(links, lead.id);
  if (linkedId) return { outcome: "already_converted", customerId: linkedId };

  if (!lead.contact.name?.trim()) {
    return {
      outcome: "not_convertible",
      reason: "A customer requires a name; the collection marks it required.",
    };
  }

  const assessment = assessDuplicates(identityFromLead(lead), existingCustomers);
  if (assessment.blocksCreation && assessment.strongest) {
    return {
      outcome: "blocked_duplicate",
      matches: assessment.matches,
      existingCustomerId: assessment.strongest.customerId,
    };
  }

  const warnings: string[] = [];
  if (lead.stage === "lost") {
    warnings.push("Lead is marked lost — confirm before creating a customer from it.");
  }
  if (!assessment.comparable) {
    warnings.push(
      "Too little identity to check for duplicates — this is not a guarantee of uniqueness.",
    );
  }
  if (assessment.matches.length > 0) {
    warnings.push(`${assessment.matches.length} weaker possible match(es) — review before creating.`);
  }

  return { outcome: "ready", draft: customerDraftFromLead(lead), warnings };
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export type ConversionStats = {
  totalLeads: number;
  converted: number;
  unconverted: number;
  /** Won leads with no customer behind them — the follow-up worth chasing. */
  wonButUnconverted: number;
  /** Always false in M6. */
  linksPersisted: boolean;
};

export function conversionStats(leads: CrmLead[], links: CustomerLeadLink[]): ConversionStats {
  let converted = 0;
  let wonButUnconverted = 0;

  for (const lead of leads) {
    const isConverted = isLeadConverted(links, lead.id);
    if (isConverted) converted += 1;
    else if (lead.stage === "won") wonButUnconverted += 1;
  }

  return {
    totalLeads: leads.length,
    converted,
    unconverted: leads.length - converted,
    wonButUnconverted,
    linksPersisted: false,
  };
}
