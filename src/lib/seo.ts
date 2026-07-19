import { absoluteUrl, siteName, siteUrl, socialProfiles } from "@/lib/site";
import { company } from "@/data/company";

/**
 * JSON-LD builders.
 *
 * Only facts we can stand behind go in here. Fields that need verified business
 * data (street address, opening hours, aggregate ratings) are deliberately
 * omitted rather than guessed — Google penalises structured data that doesn't
 * match the page or reality. See docs/DEPLOYMENT.md for what to fill in once the
 * Google Business Profile is confirmed.
 */

type Json = Record<string, unknown>;

/** Organization-level identity. Rendered once, in the root layout. */
export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    description: company.about,
    slogan: company.tagline,
    telephone: company.phone,
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jhansi",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    sameAs: socialProfiles,
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function touristTripJsonLd(input: {
  name: string;
  description: string;
  path: string;
  priceFrom: number;
  days: number;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@id": `${siteUrl}/#organization` },
    itinerary: { "@type": "ItemList", numberOfItems: input.days },
    offers: {
      "@type": "Offer",
      price: input.priceFrom,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(input.path),
    },
  };
}

export function touristDestinationJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    touristType: "Leisure travellers",
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  author: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    author: { "@type": "Organization", name: input.author },
    publisher: { "@id": `${siteUrl}/#organization` },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
