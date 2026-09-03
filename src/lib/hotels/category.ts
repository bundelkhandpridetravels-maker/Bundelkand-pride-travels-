/**
 * Category resolution — package category → candidate properties.
 *
 * A BPT package sells a STANDARD ("4-star similar"), not a property. This module
 * is the join between the standard that was sold and the properties that could
 * satisfy it. It is the first of the four selection steps: FILTER eligibility →
 * PROVE availability → VALIDATE rate → RANK. Only the first happens here, and
 * nothing this module returns is a promise that a room exists.
 *
 * THE ASYMMETRY THIS MODULE EXISTS TO SURFACE
 *
 * The two enums do not match, and the mismatch is in the applied migration:
 *
 *   enum_hotels_star_category     3 · 4 · 5 · premium · boutique
 *   enum_packages_hotel_category  3 · 4 · 5 · premium
 *
 * So the mapping is directional. Package → hotel is total. Hotel → package is
 * PARTIAL: a boutique property has no package category to belong to, and the
 * honest answer is UNMAPPABLE.
 *
 * ⚠️ WHY BOUTIQUE IS NOT QUIETLY CALLED "PREMIUM"
 * Coercing it would put a homestay into premium-category candidate sets, where
 * it would eventually be allocated to a customer who bought a premium hotel.
 * The alternative — widening `enum_packages_hotel_category` — is a database
 * migration, which M8 does not have. Founder decision of record: surface it as
 * unmappable, do not widen the enum. That is what this module does.
 *
 * Pure functions over data passed in. No I/O, no repository, no invented rules.
 */
import {
  HOTEL_STAR_CATEGORIES,
  PACKAGE_HOTEL_CATEGORIES,
  type HotelRecord,
  type HotelStarCategory,
  type PackageHotelCategory,
} from "@/lib/hotels/model";

/* ------------------------------------------------------------------ *
 * The unmappable set
 * ------------------------------------------------------------------ */

/**
 * Hotel categories with no package equivalent, derived from the two enums
 * rather than hand-listed — so if either enum ever legitimately changes, this
 * set follows instead of silently going stale.
 */
export const UNMAPPABLE_HOTEL_CATEGORIES: readonly HotelStarCategory[] =
  HOTEL_STAR_CATEGORIES.filter(
    (c): c is HotelStarCategory => !(PACKAGE_HOTEL_CATEGORIES as readonly string[]).includes(c),
  );

export function isUnmappableHotelCategory(category: HotelStarCategory): boolean {
  return UNMAPPABLE_HOTEL_CATEGORIES.includes(category);
}

/* ------------------------------------------------------------------ *
 * Package category → candidate hotel categories
 * ------------------------------------------------------------------ */

/**
 * Which hotel categories satisfy a package category.
 *
 * ⚠️ IDENTITY ONLY, AND THAT IS DELIBERATE. Whether a 5-star property may be
 * offered against a 4-star package (an upgrade BPT absorbs), or a premium
 * package accepts a 5-star property, is a COMMERCIAL SUBSTITUTION POLICY. It is
 * real business data owned by the founder, it does not exist anywhere in the
 * repository, and a plausible-looking default here would invent BPT's
 * upgrade economics — the same reason M7's `MARKUP_RULES` is empty.
 *
 * The extension point is `CATEGORY_SUBSTITUTIONS` below: supply it and every
 * consumer of this module widens at once, with no code change.
 */
export const CATEGORY_EQUIVALENCE: Record<PackageHotelCategory, readonly HotelStarCategory[]> = {
  "3": ["3"],
  "4": ["4"],
  "5": ["5"],
  premium: ["premium"],
};

/**
 * Additional hotel categories accepted against a package category — an
 * INTENTIONALLY EMPTY extension point, exactly like M1's `TYPE_REQUIREMENTS`.
 *
 * Empty means "no substitution policy has been configured", which is not the
 * same as "no substitution is ever allowed". It is the difference between a
 * business rule that has been decided and one that has not.
 */
export const CATEGORY_SUBSTITUTIONS: Partial<
  Record<PackageHotelCategory, readonly HotelStarCategory[]>
> = {};

/** Every hotel category acceptable for a package category, policy included. */
export function acceptableHotelCategories(
  category: PackageHotelCategory,
): readonly HotelStarCategory[] {
  const base = CATEGORY_EQUIVALENCE[category];
  const extra = CATEGORY_SUBSTITUTIONS[category] ?? [];
  return [...new Set([...base, ...extra])];
}

/* ------------------------------------------------------------------ *
 * Hotel category → package category
 * ------------------------------------------------------------------ */

export type CategoryMappingFailure = "unmappable" | "not_categorised";

export type CategoryMapping =
  | { ok: true; category: PackageHotelCategory }
  | { ok: false; code: CategoryMappingFailure; reason: string };

/**
 * Which package category a property belongs to — or an explicit refusal.
 *
 * `boutique` returns `unmappable`. A property with no category at all returns
 * `not_categorised`: unknown is not the same as unmappable, and collapsing the
 * two would hide a data-entry gap behind an architectural decision.
 */
export function packageCategoryForHotel(category?: HotelStarCategory): CategoryMapping {
  if (category === undefined) {
    return {
      ok: false,
      code: "not_categorised",
      reason: "The property has no star category recorded, so no package category can be resolved.",
    };
  }
  if (isUnmappableHotelCategory(category)) {
    return {
      ok: false,
      code: "unmappable",
      reason: `Hotel category "${category}" has no package equivalent. It is surfaced as unmappable rather than coerced — widening the package category enum is a database migration.`,
    };
  }
  // Safe by construction: anything not in UNMAPPABLE is in both enums.
  return { ok: true, category: category as unknown as PackageHotelCategory };
}

/* ------------------------------------------------------------------ *
 * Explicit package → hotel mapping
 * ------------------------------------------------------------------ */

/**
 * Packages that name specific properties rather than a category.
 *
 * ⚠️ NOT PERSISTED AND INTENTIONALLY EMPTY. No relation exists between
 * `packages` and `hotels` in the applied schema — adding one is a migration. A
 * package that genuinely promises named hotels is an EXACT commitment, and
 * which packages those are is founder business data.
 *
 * Registered here so the resolver already consults it: when the relation lands,
 * this constant is replaced by a read and nothing downstream changes.
 */
export const EXPLICIT_PACKAGE_HOTELS: Record<string, readonly string[]> = {};

export const EXPLICIT_PACKAGE_HOTEL_PERSISTENCE = "none" as const;

export function explicitHotelsForPackage(packageId: string): readonly string[] {
  return EXPLICIT_PACKAGE_HOTELS[packageId] ?? [];
}

/* ------------------------------------------------------------------ *
 * Candidate resolution
 * ------------------------------------------------------------------ */

/** What the caller is looking for. Only fields the schema can actually answer. */
export type CandidateQuery = {
  category: PackageHotelCategory;
  /** Restrict to one destination when the requirement names one. */
  destinationId?: string;
  /** When set, only this package's explicitly named properties are eligible. */
  packageId?: string;
};

export const CANDIDATE_EXCLUSION_REASONS = [
  "not_published",
  "wrong_destination",
  "category_mismatch",
  "category_unmappable",
  "not_categorised",
  "no_supplier",
  "not_explicitly_mapped",
] as const;
export type CandidateExclusionReason = (typeof CANDIDATE_EXCLUSION_REASONS)[number];

export type ExcludedCandidate = {
  hotelId: string;
  reason: CandidateExclusionReason;
};

export type CandidateResolution = {
  category: PackageHotelCategory;
  /** Eligible properties. Eligible is NOT available — nothing here is secured. */
  candidates: HotelRecord[];
  /** Every property considered and rejected, with the reason. Internal data. */
  excluded: ExcludedCandidate[];
  /** Eligible properties that are ALSO flagged representative. */
  representative: HotelRecord[];
};

/**
 * Filter properties down to the eligible set for a category.
 *
 * Elimination, in order — each one a way an allocation could be wrong:
 *   1. published (a draft or archived property is not sellable)
 *   2. destination matches, when one was asked for
 *   3. the property has a category at all
 *   4. that category is mappable (boutique is not)
 *   5. that category is acceptable for the package category
 *   6. a supplier is attached (an orphan cannot be asked anything)
 *   7. when the package names explicit properties, membership of that list
 *
 * These are HARD eliminations, not demotions. A preferred supplier that fails
 * any of them is removed. Ranking happens afterwards and only breaks ties.
 */
export function resolveHotelCandidates(
  hotels: HotelRecord[],
  query: CandidateQuery,
): CandidateResolution {
  const acceptable = acceptableHotelCategories(query.category);
  const explicit = query.packageId ? explicitHotelsForPackage(query.packageId) : [];

  const candidates: HotelRecord[] = [];
  const excluded: ExcludedCandidate[] = [];

  for (const hotel of hotels) {
    const reject = (reason: CandidateExclusionReason) => excluded.push({ hotelId: hotel.id, reason });

    if (hotel.status !== "published") {
      reject("not_published");
      continue;
    }
    if (query.destinationId && hotel.destinationId !== query.destinationId) {
      reject("wrong_destination");
      continue;
    }

    const mapping = packageCategoryForHotel(hotel.starCategory);
    if (!mapping.ok) {
      reject(mapping.code === "unmappable" ? "category_unmappable" : "not_categorised");
      continue;
    }
    if (!acceptable.includes(hotel.starCategory as HotelStarCategory)) {
      reject("category_mismatch");
      continue;
    }
    if (!hotel.vendorId) {
      reject("no_supplier");
      continue;
    }
    if (explicit.length > 0 && !explicit.includes(hotel.id)) {
      reject("not_explicitly_mapped");
      continue;
    }

    candidates.push(hotel);
  }

  return {
    category: query.category,
    candidates,
    excluded,
    representative: candidates.filter((h) => h.representative),
  };
}

/* ------------------------------------------------------------------ *
 * Representative selection
 * ------------------------------------------------------------------ */

/**
 * The properties shown BEFORE booking to illustrate a standard.
 *
 * ⚠️ THIS IS NOT A CANDIDATE SET AND MUST NEVER BE USED AS ONE. It answers
 * "what does a 4-star BPT hotel look like?", not "where will this customer
 * stay?". It deliberately ignores supplier linkage and availability, because a
 * representative property is an illustration; and it is published-only, because
 * an unpublished property must not appear on a customer-facing page.
 */
export function selectRepresentativeHotels(
  hotels: HotelRecord[],
  category: PackageHotelCategory,
  options: { destinationId?: string; limit?: number } = {},
): HotelRecord[] {
  const acceptable = acceptableHotelCategories(category);
  const matches = hotels.filter(
    (h) =>
      h.representative &&
      h.status === "published" &&
      h.starCategory !== undefined &&
      acceptable.includes(h.starCategory) &&
      (!options.destinationId || h.destinationId === options.destinationId),
  );
  return options.limit === undefined ? matches : matches.slice(0, options.limit);
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export type CategoryCoverageRow = {
  category: PackageHotelCategory;
  /** Published, supplier-linked properties that could be allocated. */
  candidates: number;
  /** Properties illustrating the category pre-booking. */
  representative: number;
};

export type CategoryCoverage = {
  rows: CategoryCoverageRow[];
  /** Properties whose category has no package equivalent — boutique today. */
  unmappable: { hotelId: string; category: HotelStarCategory }[];
  /** Properties with no star category recorded at all. */
  uncategorised: string[];
};

/**
 * Which categories BPT can actually serve, and what is stranded.
 *
 * Reports COUNTS OF PROPERTIES only. It reports no room counts, because a room
 * count would read like availability on a console, and it is not.
 */
export function describeCategoryCoverage(
  hotels: HotelRecord[],
  destinationId?: string,
): CategoryCoverage {
  const scoped = destinationId ? hotels.filter((h) => h.destinationId === destinationId) : hotels;

  const rows = PACKAGE_HOTEL_CATEGORIES.map((category) => {
    const resolution = resolveHotelCandidates(scoped, { category, destinationId });
    return {
      category,
      candidates: resolution.candidates.length,
      representative: selectRepresentativeHotels(scoped, category, { destinationId }).length,
    };
  });

  const unmappable = scoped
    .filter((h) => h.starCategory !== undefined && isUnmappableHotelCategory(h.starCategory))
    .map((h) => ({ hotelId: h.id, category: h.starCategory as HotelStarCategory }));

  const uncategorised = scoped.filter((h) => h.starCategory === undefined).map((h) => h.id);

  return { rows, unmappable, uncategorised };
}
