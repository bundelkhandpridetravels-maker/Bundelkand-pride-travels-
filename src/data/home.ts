/**
 * Realistic placeholder content for the homepage sections.
 * Sourced from Bundelkhand Pride Travels' real destinations/packages.
 * Shapes mirror the future Payload CMS collections for a clean swap later.
 */

export type Category = {
  slug: string;
  title: string;
  count: number;
  gradient: string;
};

export const categories: Category[] = [
  { slug: "honeymoon", title: "Honeymoon & couples", count: 18, gradient: "linear-gradient(160deg,#6a3f52,#141b2c)" },
  { slug: "family", title: "Family & kids", count: 24, gradient: "linear-gradient(160deg,#356074,#141b2c)" },
  { slug: "group", title: "Group departures", count: 12, gradient: "linear-gradient(160deg,#8a6e34,#141b2c)" },
  { slug: "treks", title: "Himalayan treks", count: 9, gradient: "linear-gradient(160deg,#2f5d50,#141b2c)" },
  { slug: "school", title: "School & college tours", count: 6, gradient: "linear-gradient(160deg,#4a5a72,#141b2c)" },
  { slug: "international", title: "International", count: 5, gradient: "linear-gradient(160deg,#1f6a7a,#141b2c)" },
];

export type PackageCard = {
  slug: string;
  destination: string;
  title: string;
  summary: string;
  nights: number;
  days: number;
  priceFrom: number;
  priceUnit: string;
  badge?: string;
  rating: number;
  reviews: number;
  route: string;
  gradient: string;
  /** Pickup and drop locations shown on cards, detail pages and the booking form. */
  pickup: string;
  drop: string;
  /**
   * Business model split — see docs/architecture.md:
   * "fit"   = Free Independent Traveller: private, customisable, any date (the primary business)
   * "group" = intentionally scheduled fixed-date departures only
   */
  tourType: "fit" | "group";
};

export const featuredPackages: PackageCard[] = [
  {
    slug: "kashmir-romance",
    destination: "Kashmir · Private tour",
    title: "Srinagar, Gulmarg & Pahalgam",
    summary: "Houseboat evening on Dal Lake, Gondola at Gulmarg, meadows of Pahalgam — fully customisable.",
    nights: 5, days: 6, priceFrom: 15999, priceUnit: "per person",
    badge: "Featured", rating: 4.9, reviews: 186, route: "DEL → SXR",
    gradient: "linear-gradient(160deg,#356074,#0f2a3a)", tourType: "fit",
    pickup: "Srinagar airport", drop: "Srinagar airport",
  },
  {
    slug: "manali-volvo",
    destination: "Himachal · Private tour",
    title: "Manali Volvo Package",
    summary: "Delhi–Manali by AC Volvo with private cab sightseeing — flexible departure any day.",
    nights: 5, days: 6, priceFrom: 9999, priceUnit: "per person",
    badge: "Popular", rating: 4.8, reviews: 214, route: "DEL → KUU",
    gradient: "linear-gradient(160deg,#4a5a72,#141b2c)", tourType: "fit",
    pickup: "Delhi (Akshardham Metro)", drop: "Delhi (Akshardham Metro)",
  },
  {
    slug: "goa",
    destination: "Goa · Private tour",
    title: "Goa Beaches & Heritage",
    summary: "North beaches, old Goa churches, a sunset cruise and your pick of coastline pace.",
    nights: 3, days: 4, priceFrom: 10999, priceUnit: "per person",
    rating: 4.7, reviews: 118, route: "DEL → GOI",
    gradient: "linear-gradient(160deg,#8a6e34,#2b2213)", tourType: "fit",
    pickup: "Goa", drop: "Goa",
  },
  {
    slug: "darjeeling-gangtok",
    destination: "Bengal & Sikkim · Private tour",
    title: "Darjeeling & Gangtok",
    summary: "Tiger Hill sunrise, toy train, Tsomgo Lake and monastery mornings across two hill capitals.",
    nights: 5, days: 6, priceFrom: 16999, priceUnit: "per person",
    rating: 4.8, reviews: 87, route: "IXB → DAR",
    gradient: "linear-gradient(160deg,#3a5f86,#12233a)", tourType: "fit",
    pickup: "Bagdogra / NJP", drop: "Bagdogra / NJP",
  },
  {
    slug: "kerala",
    destination: "Kerala · Private tour",
    title: "Munnar, Alleppey & Kochi",
    summary: "Tea country, a private houseboat night on the backwaters and a Fort Kochi finish.",
    nights: 5, days: 6, priceFrom: 18999, priceUnit: "per person",
    rating: 4.9, reviews: 98, route: "COK → ALP",
    gradient: "linear-gradient(160deg,#2f5d50,#12332a)", tourType: "fit",
    pickup: "Kochi", drop: "Kochi",
  },
  {
    slug: "andaman",
    destination: "Andaman · Private tour",
    title: "Port Blair, Havelock & Neil",
    summary: "Radhanagar beach, Cellular Jail, snorkelling and island ferries — honeymoon favourite.",
    nights: 5, days: 6, priceFrom: 24999, priceUnit: "per person",
    rating: 4.9, reviews: 74, route: "DEL → IXZ",
    gradient: "linear-gradient(160deg,#1f6a7a,#0c2e36)", tourType: "fit",
    pickup: "Port Blair", drop: "Port Blair",
  },
  {
    slug: "leh-ladakh",
    destination: "Ladakh · Private tour",
    title: "Leh, Nubra & Pangong",
    summary: "Khardung La, Nubra dunes and a night by Pangong — acclimatisation planned properly.",
    nights: 5, days: 6, priceFrom: 21999, priceUnit: "per person",
    badge: "Adventure", rating: 4.8, reviews: 66, route: "DEL → IXL",
    gradient: "linear-gradient(160deg,#4a5a72,#141b2c)", tourType: "fit",
    pickup: "Leh", drop: "Leh",
  },
  {
    slug: "jaisalmer",
    destination: "Rajasthan · Fixed departure",
    title: "Jaisalmer Desert Weekend",
    summary: "Golden fort, Sam dunes camel safari, folk night at a desert camp — every Friday.",
    nights: 2, days: 3, priceFrom: 8999, priceUnit: "per person",
    badge: "Every Friday", rating: 4.8, reviews: 92, route: "JHS → JSA",
    gradient: "linear-gradient(160deg,#6a3f52,#2a1a22)", tourType: "group",
    pickup: "Jaisalmer", drop: "Jaisalmer",
  },
  {
    slug: "manali-kasol",
    destination: "Himachal · Private tour",
    title: "Manali + Kasol Adventure",
    summary: "Atal Tunnel, Kasol cafés, Chalal trek and a riverside bonfire — your dates, your pace.",
    nights: 5, days: 6, priceFrom: 14999, priceUnit: "per person",
    rating: 4.8, reviews: 132, route: "DEL → KSL",
    gradient: "linear-gradient(160deg,#2f5d50,#12332a)", tourType: "fit",
    pickup: "Delhi (Akshardham Metro)", drop: "Delhi (Akshardham Metro)",
  },
  {
    slug: "shimla-manali",
    destination: "Himachal · Private tour",
    title: "Shimla + Manali Family Holiday",
    summary: "Kufri, Jakhu Hill, Rohtang snow and Solang Valley — paced for families.",
    nights: 5, days: 6, priceFrom: 13999, priceUnit: "per person",
    rating: 4.7, reviews: 96, route: "IXC → SLV",
    gradient: "linear-gradient(160deg,#6a3f52,#2a1a22)", tourType: "fit",
    pickup: "Chandigarh", drop: "Chandigarh",
  },
  {
    slug: "chopta-tungnath",
    destination: "Uttarakhand · Trek",
    title: "Chopta & Tungnath Summit",
    summary: "World's highest Shiva temple and a Chandrashila sunrise panorama.",
    nights: 2, days: 3, priceFrom: 6999, priceUnit: "per person",
    badge: "Trek", rating: 4.9, reviews: 78, route: "RSH → TGN",
    gradient: "linear-gradient(160deg,#1f6a7a,#0c2e36)", tourType: "fit",
    pickup: "Delhi (Akshardham Metro)", drop: "Delhi (Akshardham Metro)",
  },
  {
    slug: "corbett-nainital",
    destination: "Uttarakhand · School & groups",
    title: "Jim Corbett + Nainital School Tour",
    summary: "Jungle jeep safari, Naini Lake and supervised, GPS-tracked travel.",
    nights: 3, days: 4, priceFrom: 12000, priceUnit: "per student",
    badge: "School", rating: 4.9, reviews: 54, route: "JHS → CBT",
    gradient: "linear-gradient(160deg,#3a5f86,#12233a)", tourType: "fit",
    pickup: "Jhansi", drop: "Jhansi",
  },
];

export type Departure = {
  when: string;
  cadence: string;
  title: string;
  duration: string;
  price: string;
  status: "Open" | "Filling" | "Limited" | "Seasonal";
};

/**
 * Hand-scheduled fixed-date batches. Recurring weekly departures (Jaisalmer
 * Fridays) are generated in src/lib/departures.ts — don't list them here.
 */
export const fixedDepartures: Departure[] = [
  { when: "OCT 13", cadence: "2026", title: "Jammu → Kashmir group batch", duration: "4N / 5D", price: "₹13,000 /person", status: "Filling" },
  { when: "DEC 28", cadence: "2026", title: "Jammu → Kashmir New Year batch", duration: "5N / 6D", price: "₹13,000 /person", status: "Limited" },
];

export type Testimonial = {
  quote: string;
  name: string;
  trip: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  { quote: "Kashmir with Bundelkhand Pride was a dream — the houseboat, the Gulmarg gondola, the Shikara at sunset. Every detail was handled.", name: "Priya Sharma", trip: "Kashmir Honeymoon", initials: "PS" },
  { quote: "Our school group of 45 went to Jim Corbett — the safari was thrilling, the coordinator was exceptional. Highly recommend for school tours.", name: "Mrs. Deepa Gupta", trip: "School Tour — Jim Corbett", initials: "DG" },
  { quote: "Manali and Kasol in one trip, planned entirely around our dates. Every transfer just worked, and the bonfire nights were unforgettable.", name: "Rahul Verma", trip: "Manali + Kasol", initials: "RV" },
  { quote: "Fantastic value for a family package. The kids loved the Rohtang snow, we loved Kufri and Hadimba. Zero hassle, start to finish.", name: "Amit Agarwal", trip: "Shimla + Manali Family", initials: "AA" },
  { quote: "Chopta Tungnath was life-changing — standing at the world's highest Shiva temple with the Himalayan panorama. Knowledgeable, supportive guide.", name: "Neha Tiwari", trip: "Chopta Tungnath Trek", initials: "NT" },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  { q: "What's included in the package price?", a: "Each package lists full inclusions and exclusions before you pay — typically accommodation, listed meals, transport and sightseeing per the itinerary. Flights and personal expenses are called out separately, with no hidden charges." },
  { q: "What's your cancellation and refund policy?", a: "Cancellation terms depend on the package and how close to departure you cancel. We share the exact policy in writing at the time of booking so there are no surprises." },
  { q: "Do you offer group, school or corporate discounts?", a: "Yes. We specialise in group, educational and corporate tours with pricing designed for the group size, dedicated coordination and custom itineraries." },
  { q: "How do the fixed Friday departures work?", a: "Group batches leave on set dates (many every Friday) with a fixed price per person or couple and a dedicated trip captain. You simply reserve a seat — no need to plan the logistics yourself." },
  { q: "Can you handle flights, hotels and transport together?", a: "Absolutely. We book flights, premium hotels and resorts, and ground transport — cabs, buses and tempo travellers — as one seamless, coordinated trip." },
];

export type JournalPost = {
  slug: string;
  category: string;
  title: string;
  readMins: number;
  gradient: string;
};

export const journal: JournalPost[] = [
  { slug: "best-time-kashmir", category: "Planning", title: "Best time to visit Kashmir, month by month", readMins: 6, gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
  { slug: "himalayan-trek-packing", category: "Trekking", title: "What to actually pack for a Himalayan trek", readMins: 8, gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
  { slug: "school-tour-checklist", category: "Groups", title: "Planning a school tour: a coordinator's checklist", readMins: 5, gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
];

/** Instagram / social gallery tiles (placeholder gradients). */
export const gallery: { id: string; gradient: string }[] = [
  { id: "g1", gradient: "linear-gradient(160deg,#356074,#0a0e1a)" },
  { id: "g2", gradient: "linear-gradient(160deg,#2f5d50,#0a0e1a)" },
  { id: "g3", gradient: "linear-gradient(160deg,#8a6e34,#0a0e1a)" },
  { id: "g4", gradient: "linear-gradient(160deg,#6a3f52,#0a0e1a)" },
  { id: "g5", gradient: "linear-gradient(160deg,#4a5a72,#0a0e1a)" },
  { id: "g6", gradient: "linear-gradient(160deg,#1f6a7a,#0a0e1a)" },
];
