/**
 * Season window maths for rate sheets. Pure and deterministic — every function
 * takes an explicit `now` or explicit dates, so results never depend on when a
 * page happened to render.
 *
 * No season is defined here. Names and dates come from the supplier's own rate
 * sheet; this module only reasons about the windows they gave us.
 */
import type { RateSeason, RateSheet } from "@/lib/rates/model";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Floor an ISO date to UTC midnight so comparisons are calendar-day accurate. */
function dayStart(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Both ends inclusive — a one-day season is valid. */
export function isValidWindow(startDate: string, endDate: string): boolean {
  const s = dayStart(startDate);
  const e = dayStart(endDate);
  return s !== null && e !== null && e >= s;
}

/** Whole days a window covers, inclusive of both ends. Null if unparseable. */
export function windowLengthDays(startDate: string, endDate: string): number | null {
  const s = dayStart(startDate);
  const e = dayStart(endDate);
  if (s === null || e === null) return null;
  return Math.round((e - s) / MS_PER_DAY) + 1;
}

/** Does a date fall inside the season (inclusive)? */
export function isDateInSeason(season: RateSeason, date: Date = new Date()): boolean {
  const s = dayStart(season.startDate);
  const e = dayStart(season.endDate);
  const d = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  if (s === null || e === null) return false;
  return d >= s && d <= e;
}

/** Do two seasons overlap on any calendar day? */
export function seasonsOverlap(a: RateSeason, b: RateSeason): boolean {
  const aStart = dayStart(a.startDate);
  const aEnd = dayStart(a.endDate);
  const bStart = dayStart(b.startDate);
  const bEnd = dayStart(b.endDate);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

export type SeasonOverlap = { a: RateSeason; b: RateSeason };

/**
 * Every overlapping pair on a sheet. Overlaps are a real problem: two seasons
 * covering the same day means a booking on that day has two different prices,
 * and the pricing engine would have no defensible way to choose.
 */
export function findSeasonOverlaps(seasons: RateSeason[]): SeasonOverlap[] {
  const overlaps: SeasonOverlap[] = [];
  for (let i = 0; i < seasons.length; i++) {
    for (let j = i + 1; j < seasons.length; j++) {
      if (seasonsOverlap(seasons[i], seasons[j])) {
        overlaps.push({ a: seasons[i], b: seasons[j] });
      }
    }
  }
  return overlaps;
}

/** The season covering a date, or null. Returns the FIRST match — callers should
 * resolve overlaps first (see findSeasonOverlaps), not rely on ordering. */
export function seasonForDate(
  seasons: RateSeason[],
  date: Date = new Date(),
): RateSeason | null {
  return seasons.find((s) => isDateInSeason(s, date)) ?? null;
}

/**
 * Days inside the sheet's validity period that no season covers.
 *
 * Reported as uncovered RANGES rather than a day count, so an operator can see
 * exactly which dates a supplier forgot to price. Returns [] when the sheet has
 * no validity period or no seasons — there is nothing to check against, and
 * assuming a default period would be inventing business data.
 */
export type UncoveredRange = { startDate: string; endDate: string; days: number };

export function findUncoveredDates(sheet: RateSheet): UncoveredRange[] {
  if (!sheet.validFrom || !sheet.validTo || sheet.seasons.length === 0) return [];

  const from = dayStart(sheet.validFrom);
  const to = dayStart(sheet.validTo);
  if (from === null || to === null || to < from) return [];

  const gaps: UncoveredRange[] = [];
  let runStart: number | null = null;

  for (let day = from; day <= to; day += MS_PER_DAY) {
    const covered = sheet.seasons.some((s) => isDateInSeason(s, new Date(day)));
    if (!covered) {
      if (runStart === null) runStart = day;
    } else if (runStart !== null) {
      gaps.push({
        startDate: new Date(runStart).toISOString().slice(0, 10),
        endDate: new Date(day - MS_PER_DAY).toISOString().slice(0, 10),
        days: Math.round((day - MS_PER_DAY - runStart) / MS_PER_DAY) + 1,
      });
      runStart = null;
    }
  }

  if (runStart !== null) {
    gaps.push({
      startDate: new Date(runStart).toISOString().slice(0, 10),
      endDate: new Date(to).toISOString().slice(0, 10),
      days: Math.round((to - runStart) / MS_PER_DAY) + 1,
    });
  }

  return gaps;
}
