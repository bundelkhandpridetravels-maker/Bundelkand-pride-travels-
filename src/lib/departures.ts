import { fixedDepartures, type Departure } from "@/data/home";

/**
 * Group-departure schedule builder.
 *
 * The Jaisalmer season opens on a fixed launch date (13 October) and then runs
 * every Friday after it. Dates are generated here rather than hand-listed, so
 * the board stays correct without anyone editing data, and rolls to next season
 * automatically once this one has passed.
 *
 * Computed at build time (static pages) and again on each deploy / revalidation.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function label(date: Date): { when: string; cadence: string } {
  return { when: `${MONTHS[date.getMonth()]} ${date.getDate()}`, cadence: String(date.getFullYear()) };
}

/** Fridays strictly after `from`, `count` of them. */
function fridaysAfter(from: Date, count: number): Date[] {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() !== 5); // 5 = Friday
  const out: Date[] = [];
  for (let i = 0; i < count; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

/** Jaisalmer: launch on 13 October, then every Friday. */
function jaisalmerDepartures(weeklyCount = 4): Departure[] {
  const now = new Date();
  let launch = new Date(now.getFullYear(), 9, 13); // 13 Oct (month index 9)
  // If this season's run is already well behind us, plan next year's.
  if (now.getTime() - launch.getTime() > 240 * 24 * 3600 * 1000) {
    launch = new Date(now.getFullYear() + 1, 9, 13);
  }

  const make = (date: Date, status: Departure["status"]): Departure => ({
    ...label(date),
    title: "Jhansi → Jaisalmer Desert Weekend",
    duration: "2N / 3D",
    price: "₹8,999 /person",
    status,
  });

  return [
    make(launch, "Filling"), // the 13 October launch departure
    ...fridaysAfter(launch, weeklyCount).map((d) => make(d, "Open")),
  ];
}

/** Everything the departures board shows: generated Jaisalmer run + hand-scheduled batches. */
export function getDepartures(): Departure[] {
  return [...jaisalmerDepartures(4), ...fixedDepartures];
}
