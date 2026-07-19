/**
 * Canonical company profile — single source of truth for brand copy,
 * stats, mission/vision and contact details used across the site.
 * Mirrors the official Bundelkhand Pride Travels company overview.
 */

export const company = {
  name: "Bundelkhand Pride Travels",
  /** Customer-facing brand promise */
  tagline: "Open the World Close to You",
  /** Supporting design/positioning descriptor */
  descriptor: "Plans like an engineer, cares like family",
  location: "Jhansi, Uttar Pradesh",
  serving: "Serving destinations across India",
  phone: "+91 92351 21325",
  phoneHref: "tel:+919235121325",
  whatsappHref: "https://wa.me/919235121325",

  about:
    "A premium travel company based in Jhansi, committed to memorable, safe and well-planned journeys across India — curated holiday packages, group departures, customised vacations, corporate and pilgrimage tours, adventure trips, hotels, transport and complete travel assistance.",

  mission:
    "To make travel simple, trustworthy and memorable through exceptional experiences backed by outstanding service, local expertise and innovative technology.",

  vision:
    "To become one of India's most trusted, customer-centric travel brands — connecting people with extraordinary destinations while delivering experiences that inspire confidence, adventure and lifelong memories.",

  promise:
    "Every journey is thoughtfully planned to deliver comfort, safety, value and unforgettable experiences — so you can travel with confidence and create memories that last a lifetime.",
} as const;

/** Headline trust metrics (from the official company overview). */
export const companyStats = [
  { value: "9,000+", label: "Happy travellers" },
  { value: "1,000+", label: "Tours planned" },
  { value: "20+", label: "Destinations" },
  { value: "24×7", label: "Trip support" },
] as const;

/** "Why choose us" pillars. */
export const whyChoose = [
  {
    title: "Curated holiday packages",
    body: "Domestic and international itineraries designed end to end — nothing generic, nothing left to chance.",
  },
  {
    title: "Weekly group departures",
    body: "Fixed-date group and seasonal tours you can join solo, as a couple, or as a family.",
  },
  {
    title: "Trusted hotels & transport",
    body: "Premium hotels and resorts, plus flights, buses, cabs and tempo travellers — all vetted.",
  },
  {
    title: "Group & corporate management",
    body: "Corporate, educational and large-group tours handled with dedicated coordination.",
  },
  {
    title: "Pilgrimage & adventure specialists",
    body: "From spiritual circuits to Himalayan treks — planned by people who run them.",
  },
  {
    title: "Transparent pricing",
    body: "Clear inclusions and exclusions, no hidden charges, dedicated travel experts throughout.",
  },
] as const;
