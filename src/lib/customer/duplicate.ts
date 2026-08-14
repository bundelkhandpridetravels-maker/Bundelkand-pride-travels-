/**
 * Customer duplicate detection. Pure, deterministic, non-mutating, no I/O.
 *
 * Repeat business is the point of the CRM, so the same person WILL arrive twice
 * — a second enquiry months later, a booking made by phone after one made on the
 * site. There is no unique constraint on customer email or phone anywhere in the
 * schema (only `slug`, `referralCode` and `bookingRef` are unique), so nothing
 * currently stops that person becoming two records with half a history each.
 * This module finds the collision before it is made.
 *
 * WHY THIS IS NOT A COPY OF vendor-import/duplicate.ts:
 * that module matches BUSINESSES, where a shared name is strong evidence and a
 * substring match ("Himalaya Tours" inside "Himalaya Tours & Travels") is a
 * useful signal. People are not businesses. Two unrelated customers can easily
 * share a name, and substring matching on personal names would merge strangers.
 * So name is used only as a weak corroborating signal alongside a city, never
 * on its own, and never as a substring.
 *
 * PII: matches carry the customer's id and name (already needed to show a
 * result) and describe WHAT matched — never the matched email or phone value
 * itself. No normalized copy of any identifier is retained after comparison.
 */
import type { CustomerRecord } from "@/lib/customer/model";

export type DuplicateConfidence = "low" | "medium" | "high";

export type CustomerDuplicateMatch = {
  customerId: string;
  customerName: string;
  /** What matched — deliberately not the value that matched. */
  reason: string;
  matchedOn: "email" | "phone" | "national_phone" | "name_and_city";
  confidence: DuplicateConfidence;
  /**
   * Whether the NAME also matches. This is what separates "the same person
   * again" from "another traveller on the family's phone" — see the verdict
   * rules on `assessDuplicates`.
   */
  nameMatches: boolean;
};

/** The identity fields a comparison needs. Any may be absent. */
export type CustomerIdentity = {
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
};

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

/**
 * Trim and lowercase. Nothing else.
 *
 * Deliberately NOT applied: stripping dots and `+tags` from the local part.
 * That is Gmail-specific behaviour — `a.b@example.com` and `ab@example.com` are
 * different mailboxes at most providers — so "canonicalising" it would merge two
 * real people. Under-matching costs a duplicate; over-matching corrupts a record.
 */
export function normalizeEmail(email?: string): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Digits only, with a leading `+` collapsed away. `00` international prefixes
 * are reduced to nothing so `0091…` and `+91…` compare equal.
 */
export function normalizePhone(phone?: string): string {
  const digits = (phone ?? "").replace(/\D+/g, "");
  return digits.replace(/^00/, "");
}

/**
 * The last 10 digits — the national subscriber number in India, where the
 * business operates. Lets `+91 98765 43210`, `098765 43210` and `9876543210`
 * recognise each other despite different prefixes.
 *
 * Returns "" for anything shorter than 10 digits, so partial or malformed
 * numbers never match each other by accident.
 */
export function nationalPhone(phone?: string): string {
  const digits = normalizePhone(phone);
  return digits.length >= 10 ? digits.slice(-10) : "";
}

/** Lowercased, punctuation-free, whitespace-collapsed. For weak signals only. */
export function normalizeName(name?: string): string {
  return (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\s+/g, " ");
}

export function normalizeCity(city?: string): string {
  return normalizeName(city);
}

/** Every phone-ish channel on a record, normalised. */
function phoneChannels(identity: CustomerIdentity): string[] {
  return [normalizePhone(identity.phone), normalizePhone(identity.whatsapp)].filter(Boolean);
}

function nationalChannels(identity: CustomerIdentity): string[] {
  return [nationalPhone(identity.phone), nationalPhone(identity.whatsapp)].filter(Boolean);
}

/** Pull the comparable identity out of a stored customer. */
export function identityOf(customer: CustomerRecord): CustomerIdentity {
  return {
    name: customer.name,
    email: customer.contact.email,
    phone: customer.contact.phone,
    whatsapp: customer.contact.whatsapp,
    city: customer.address.city,
  };
}

/* ------------------------------------------------------------------ *
 * Detection
 * ------------------------------------------------------------------ */

/**
 * Compare one incoming identity against existing customers.
 *
 * At most one match is reported per existing customer — the strongest one — so a
 * person matching on both email and phone appears once, not twice.
 *
 * Confidence:
 *   high   same email, or the same full phone number
 *   medium same national (last-10) phone number
 *   low    same name AND same city, with no contact match at all
 *
 * An empty identifier never matches anything, including another empty one.
 */
export function detectCustomerDuplicates(
  identity: CustomerIdentity,
  existing: CustomerRecord[],
): CustomerDuplicateMatch[] {
  const email = normalizeEmail(identity.email);
  const phones = phoneChannels(identity);
  const nationals = nationalChannels(identity);
  const name = normalizeName(identity.name);
  const city = normalizeCity(identity.city);

  const matches: CustomerDuplicateMatch[] = [];

  for (const candidate of existing) {
    const other = identityOf(candidate);
    const nameMatches = Boolean(name && normalizeName(other.name) === name);
    const base = { customerId: candidate.id, customerName: candidate.name, nameMatches };

    if (email && normalizeEmail(other.email) === email) {
      matches.push({
        ...base,
        reason: nameMatches
          ? "Same email address and same name"
          : "Same email address, different name — may be a shared family address",
        matchedOn: "email",
        confidence: "high",
      });
      continue;
    }

    const otherPhones = phoneChannels(other);
    if (phones.some((p) => otherPhones.includes(p))) {
      matches.push({
        ...base,
        reason: nameMatches
          ? "Same phone number and same name"
          : "Same phone number, different name — may be a shared family or group contact",
        matchedOn: "phone",
        confidence: "high",
      });
      continue;
    }

    const otherNationals = nationalChannels(other);
    if (nationals.some((n) => otherNationals.includes(n))) {
      matches.push({
        ...base,
        reason: nameMatches
          ? "Same national phone number and same name"
          : "Same national phone number, different name — may be a shared family or group contact",
        matchedOn: "national_phone",
        confidence: "medium",
      });
      continue;
    }

    // Weakest signal, and only when BOTH parts are present. Never name alone:
    // two different people genuinely share a name.
    if (nameMatches && city && normalizeCity(other.city) === city) {
      matches.push({
        ...base,
        reason: "Same name and city, no matching contact details",
        matchedOn: "name_and_city",
        confidence: "low",
      });
    }
  }

  return matches;
}

/** Highest-confidence match, or null. Ordering is deterministic. */
export function strongestMatch(
  matches: CustomerDuplicateMatch[],
): CustomerDuplicateMatch | null {
  const rank: Record<DuplicateConfidence, number> = { high: 3, medium: 2, low: 1 };
  return (
    [...matches].sort(
      (a, b) => rank[b.confidence] - rank[a.confidence] || a.customerId.localeCompare(b.customerId),
    )[0] ?? null
  );
}

/** Is there enough identity to compare at all? */
export function hasComparableIdentity(identity: CustomerIdentity): boolean {
  return Boolean(
    normalizeEmail(identity.email) ||
      phoneChannels(identity).length > 0 ||
      (normalizeName(identity.name) && normalizeCity(identity.city)),
  );
}

/**
 * What a caller should DO about the matches.
 *
 *   block       almost certainly the same person — do not create silently
 *   warning     a real signal that a human must clear before creating
 *   unique      compared, nothing found
 *   unjudgeable not enough identity to compare — NOT the same as unique
 */
export type DuplicateVerdict = "block" | "warning" | "unique" | "unjudgeable";

export type DuplicateAssessment = {
  verdict: DuplicateVerdict;
  /** False when there is not enough identity to judge — NOT the same as "unique". */
  comparable: boolean;
  matches: CustomerDuplicateMatch[];
  strongest: CustomerDuplicateMatch | null;
  /** Convenience mirrors of the verdict. */
  blocksCreation: boolean;
  requiresReview: boolean;
};

/**
 * One pass over the matches, turning evidence into a decision.
 *
 * WHY CONTACT ALONE NO LONGER BLOCKS:
 * this is a family and group travel business in India. One phone number and one
 * email routinely cover a couple, a parent booking for a child, or an entire
 * group. Blocking creation on a shared contact would have made a wife
 * unregisterable because her husband is already a customer — the CRM refusing to
 * record a real, paying traveller.
 *
 * So the NAME is what turns a contact match into a blocking decision:
 *
 *   same email + same name   → block    (same person, re-entered)
 *   same phone + same name   → block    (same person, re-entered)
 *   same email, other name   → warning  (shared family address)
 *   same phone, other name   → warning  (shared family or group contact)
 *   same name + city only    → warning  (weak; two people genuinely share names)
 *   name only / nothing      → no match
 *
 * Nothing is ever merged automatically, at any verdict. `block` means "do not
 * create without a human deciding", not "discard".
 */
export function assessDuplicates(
  identity: CustomerIdentity,
  existing: CustomerRecord[],
): DuplicateAssessment {
  const comparable = hasComparableIdentity(identity);
  const matches = comparable ? detectCustomerDuplicates(identity, existing) : [];
  const strongest = strongestMatch(matches);

  // A contact match only blocks when the name corroborates it.
  const blocking = matches.some(
    (m) => m.nameMatches && (m.matchedOn === "email" || m.matchedOn === "phone" || m.matchedOn === "national_phone"),
  );

  const verdict: DuplicateVerdict = !comparable
    ? "unjudgeable"
    : blocking
      ? "block"
      : matches.length > 0
        ? "warning"
        : "unique";

  return {
    verdict,
    comparable,
    matches,
    strongest,
    blocksCreation: verdict === "block",
    requiresReview: verdict === "warning",
  };
}
