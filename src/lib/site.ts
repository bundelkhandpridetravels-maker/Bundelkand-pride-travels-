/**
 * Single source of truth for site-level constants.
 * Anything that needs the production URL imports it from here — never inline it.
 */

export const siteUrl = "https://www.bundelkhandpridetravels.com";

export const siteName = "Bundelkhand Pride Travels";

export const siteDescription =
  "Premium holiday packages, curated itineraries, trusted hotels and seamless travel across India — Kashmir, Kerala, Manali, Goa, Rajasthan and beyond.";

/** Build an absolute URL for canonicals, OG tags and structured data. */
export function absoluteUrl(path = ""): string {
  if (!path || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Social profiles — used for `sameAs` in structured data.
 * TODO: confirm/extend once the Google Business Profile is available.
 */
export const socialProfiles = [
  "https://www.instagram.com/bundelkhand_pridetravels/",
  "https://www.youtube.com/@BundelkhandPridetravels/",
];
