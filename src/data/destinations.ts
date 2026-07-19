/**
 * Placeholder content for the homepage hero.
 * Shape is intentionally close to the future Payload CMS "Destinations"
 * collection so swapping dummy data for a real fetch is a drop-in change.
 */

/** Weather/light mood rendered over a scene by HeroAtmosphere. */
export type Atmosphere = "snow" | "rain" | "sun" | "mist";

export type HeroScene = {
  id: string;
  /** Short place label shown in the ambient destination ticker */
  label: string;
  /** Cinematic fallback gradient, used until real drone footage is supplied */
  gradient: string;
  /** Drives the live weather layer — snow in the mountains, rain in Kerala, etc. */
  atmosphere: Atmosphere;
};

/** Optional real background footage. Drop files in /public/hero and list them here. */
export type VideoSource = { src: string; type: string };

export type FeaturedDestination = {
  slug: string;
  name: string;
  region: string;
  priceFrom: number;
  nights: number;
  days: number;
  rating: number;
  reviews: number;
  gradient: string;
  /**
   * Optional real photograph. When present it renders instead of the gradient
   * placeholder (see components/ui/DestinationImage). Drop a file in
   * /public/images/destinations and reference it here — no component changes.
   */
  image?: string;
  /** Alt text for the photo. Required whenever `image` is set. */
  imageAlt?: string;
};

/**
 * Ambient background sequence. These gradients stand in for the licensed
 * drone footage of Gulmarg, Dal Lake, Kerala, etc. — see /public/hero/README.md.
 */
export const heroScenes: HeroScene[] = [
  { id: "gulmarg", label: "Gulmarg, Kashmir", gradient: "linear-gradient(155deg,#3a5f86 0%,#1b3454 45%,#0a0e1a 100%)", atmosphere: "snow" },
  { id: "dal-lake", label: "Dal Lake, Srinagar", gradient: "linear-gradient(155deg,#356074 0%,#173a4a 45%,#0a0e1a 100%)", atmosphere: "mist" },
  { id: "kerala", label: "Backwaters, Kerala", gradient: "linear-gradient(155deg,#2f5d50 0%,#173a30 45%,#0a0e1a 100%)", atmosphere: "rain" },
  { id: "manali", label: "Solang Valley, Manali", gradient: "linear-gradient(155deg,#4a5a72 0%,#242f45 45%,#0a0e1a 100%)", atmosphere: "snow" },
  { id: "jaisalmer", label: "Sam dunes, Jaisalmer", gradient: "linear-gradient(155deg,#8a6e34 0%,#3a2f1c 45%,#0a0e1a 100%)", atmosphere: "sun" },
  { id: "goa", label: "Palolem, Goa", gradient: "linear-gradient(155deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)", atmosphere: "sun" },
];

/**
 * Real footage goes here once licensed/produced. Leaving this empty makes the
 * hero use the cinematic gradient fallback automatically — no code change needed.
 */
export const heroVideoSources: VideoSource[] = [];
export const heroPoster = "/hero/hero-poster.jpg";

/** Destinations shown as premium cards inside the hero. */
export const featuredDestinations: FeaturedDestination[] = [
  { slug: "manali", name: "Manali", region: "Himachal Pradesh", priceFrom: 9999, nights: 5, days: 6, rating: 4.8, reviews: 214, gradient: "linear-gradient(160deg,#4a5a72,#141b2c)" },
  { slug: "kashmir", name: "Kashmir", region: "Srinagar · Gulmarg", priceFrom: 15999, nights: 5, days: 6, rating: 4.9, reviews: 186, gradient: "linear-gradient(160deg,#356074,#0f2a3a)", image: "/images/destinations/kashmir.png", imageAlt: "A shikara boat on Dal Lake at golden hour with the Pir Panjal mountains behind" },
  { slug: "goa", name: "Goa", region: "North & South", priceFrom: 10999, nights: 3, days: 4, rating: 4.7, reviews: 132, gradient: "linear-gradient(160deg,#8a6e34,#2b2213)" },
  { slug: "kerala", name: "Kerala", region: "Munnar · Alleppey", priceFrom: 18999, nights: 5, days: 6, rating: 4.9, reviews: 98, gradient: "linear-gradient(160deg,#2f5d50,#12332a)" },
  { slug: "rajasthan", name: "Rajasthan", region: "Jaisalmer · Jaipur · Udaipur", priceFrom: 8999, nights: 2, days: 3, rating: 4.8, reviews: 121, gradient: "linear-gradient(160deg,#6a3f52,#2a1a22)", image: "/images/destinations/jaisalmer.png", imageAlt: "A camel caravan silhouetted on the Sam sand dunes near Jaisalmer at sunset" },
  { slug: "andaman", name: "Andaman", region: "Havelock · Neil", priceFrom: 24999, nights: 5, days: 6, rating: 4.9, reviews: 74, gradient: "linear-gradient(160deg,#1f6a7a,#0c2e36)" },
];

/** Smart-search dropdown options. */
export const searchDestinations = [
  "Kashmir", "Manali & Kasol", "Shimla & Himachal", "Goa", "Kerala",
  "Rajasthan", "Andaman", "Himalayan Treks", "Anywhere in India",
];

export const searchMonths = [
  "Flexible", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const searchBudgets = [
  "Any budget", "Under ₹10,000", "₹10,000 – ₹20,000",
  "₹20,000 – ₹40,000", "₹40,000+",
];

export const searchTravellers = [
  "1 traveller", "2 travellers", "3–4 travellers",
  "5–8 travellers", "Group (9+)",
];
