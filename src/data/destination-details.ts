/**
 * Deep content for destination landing pages, keyed by slug.
 * Card-level summary (price, rating, duration) lives in `featuredDestinations`
 * in data/destinations.ts. Mirrors the future Payload "Destinations" collection.
 */

export type DestinationDetail = {
  slug: string;
  tagline: string;
  overview: string[];
  heroGradient: string;
  bestTime: { window: string; why: string };
  attractions: { name: string; blurb: string; gradient: string }[];
  activities: string[];
  hotels: { name: string; area: string; rating: number; note: string }[];
  weather: { season: string; months: string; temp: string; note: string }[];
  tips: string[];
  gallery: { id: string; caption: string; gradient: string }[];
  /** Slugs from featuredPackages that belong to this destination */
  packageSlugs: string[];
  mapQuery: string;
};

export const destinationDetails: Record<string, DestinationDetail> = {
  kashmir: {
    slug: "kashmir",
    tagline: "The valley that earns every superlative",
    heroGradient: "linear-gradient(150deg,#3a5f86 0%,#173a4a 45%,#0a0e1a 100%)",
    overview: [
      "Kashmir is the trip most of our travellers have been quietly saving for. A valley ringed by the Pir Panjal, floored with chinar and saffron, and stitched together by lakes you travel across rather than around.",
      "It works for almost everyone: honeymooners take the houseboats and Pahalgam meadows, families take the Gulmarg gondola and the gardens, and photographers take the light. We run it as a private-car itinerary — no shared coaches, no rushed mornings.",
    ],
    bestTime: {
      window: "March – October",
      why: "April–May brings tulips and blossom, June–August is the cool escape from the plains, and September–October turns the chinars gold. December–February is deep snow and skiing at Gulmarg — beautiful, but bring serious layers.",
    },
    attractions: [
      { name: "Dal Lake & the houseboats", blurb: "Shikara at golden hour, floating vegetable markets at dawn, and a night on carved cedar.", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { name: "Gulmarg", blurb: "The meadow of flowers, and one of the world's highest cable cars up Apharwat.", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { name: "Pahalgam", blurb: "Betaab and Aru valleys, the Lidder river, and horseback rides to Baisaran.", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Sonmarg", blurb: "The meadow of gold, and the Thajiwas glacier at the head of the valley.", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { name: "Mughal Gardens", blurb: "Nishat, Shalimar and Chashme Shahi — terraced 17th-century waterworks.", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { name: "Srinagar old city", blurb: "Hazratbal, Jamia Masjid, and the copper and pashmina workshops around them.", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    activities: [
      "Shikara ride on Dal Lake at sunset",
      "Gulmarg gondola — phase 1 and 2",
      "Horse riding to Baisaran, Pahalgam",
      "Snow activities and skiing (Dec–Feb)",
      "Trout fishing on the Lidder",
      "Pashmina and papier-mâché workshop visits",
    ],
    hotels: [
      { name: "Deluxe lakeside hotels", area: "Srinagar", rating: 4.5, note: "3-star deluxe near Dal Lake, breakfast and dinner included" },
      { name: "Traditional houseboats", area: "Dal Lake", rating: 4.7, note: "Hand-carved cedar interiors, private bathrooms, 24/7 staff" },
      { name: "Riverside resorts", area: "Pahalgam", rating: 4.4, note: "Lidder-facing rooms, quiet, ideal for a slower second half" },
    ],
    weather: [
      { season: "Spring", months: "Mar – May", temp: "8–20°C", note: "Tulips, blossom, mild days" },
      { season: "Summer", months: "Jun – Aug", temp: "15–30°C", note: "Warmest and greenest; best for Gulmarg" },
      { season: "Autumn", months: "Sep – Nov", temp: "5–20°C", note: "Golden chinars, crisp and clear" },
      { season: "Winter", months: "Dec – Feb", temp: "−2–8°C", note: "Snow and skiing; very cold nights" },
    ],
    tips: [
      "Carry a warm layer even in June — evenings by the lake drop fast.",
      "Gondola tickets sell out. We help you book the day before rather than queuing.",
      "Local taxi unions hold exclusive rights on the last stretch at Gulmarg, Sonmarg and Pahalgam. It's a genuine local rule, so we price it separately instead of hiding it.",
      "Mobile data works on postpaid connections; prepaid SIMs from outside J&K often won't.",
      "Buy pashmina only from the workshops we point you to — the roadside 'deals' rarely are.",
    ],
    gallery: [
      { id: "k1", caption: "Dal Lake at sunrise", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "k2", caption: "Gulmarg gondola", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { id: "k3", caption: "Betaab Valley", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "k4", caption: "Mughal Gardens", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "k5", caption: "Houseboat evening", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    packageSlugs: ["kashmir-romance"],
    mapQuery: "Srinagar, Jammu and Kashmir",
  },

  manali: {
    slug: "manali",
    tagline: "The mountains, three hundred miles from Delhi",
    heroGradient: "linear-gradient(150deg,#4a5a72 0%,#242f45 45%,#0a0e1a 100%)",
    overview: [
      "Manali is the Himalaya you can reach on a Friday night bus and be standing in by breakfast. That accessibility is exactly why it works — for first-timers, for families, and for groups who want snow without a week of leave.",
      "The Atal Tunnel changed the trip entirely: Lahaul's high desert is now a day trip rather than a season-dependent expedition. We pair Manali with either Kasol's pine-and-river calm or Shimla's colonial ridge, depending on the pace you want.",
    ],
    bestTime: {
      window: "October – June",
      why: "December–February for snow at Solang, March–June for pleasant days and full access through the Atal Tunnel and Rohtang. July–August is monsoon — green, but landslide-prone on the Chandigarh road.",
    },
    attractions: [
      { name: "Solang Valley", blurb: "The adventure hub — paragliding, zip-lines, and snow in season.", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { name: "Atal Tunnel & Sissu", blurb: "Nine kilometres under the Rohtang, into Lahaul's high desert.", gradient: "linear-gradient(150deg,#5a6a82,#1b2436)" },
      { name: "Hadimba Devi Temple", blurb: "A 16th-century cedar pagoda in a deodar grove.", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Old Manali & Mall Road", blurb: "Cafés, bakeries and the evening walk everyone ends up doing.", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { name: "Naggar Castle", blurb: "A 500-year-old timber-and-stone fort with the Kullu valley below.", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { name: "Vashisht hot springs", blurb: "Natural sulphur springs above the Beas, best on a cold morning.", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    activities: [
      "Paragliding at Solang Valley",
      "Skiing and snow scooters (Dec–Feb)",
      "River rafting on the Beas",
      "Zip-line and ropeway at Solang",
      "Day drive through the Atal Tunnel to Sissu",
      "Chalal forest trek from Kasol",
    ],
    hotels: [
      { name: "Budget deluxe 3-star", area: "Manali town", rating: 4.3, note: "Walkable to Mall Road, breakfast and dinner included" },
      { name: "Riverside resorts", area: "Old Manali / Beas", rating: 4.5, note: "Quieter, river-facing, good for couples" },
      { name: "Kasol camps & cottages", area: "Parvati Valley", rating: 4.4, note: "Bonfire nights by the river, used on the 5N6D group trip" },
    ],
    weather: [
      { season: "Spring", months: "Mar – May", temp: "10–25°C", note: "Pleasant, blossom, best all-round" },
      { season: "Summer", months: "Jun – Aug", temp: "15–28°C", note: "Warm; monsoon arrives late in the season" },
      { season: "Autumn", months: "Sep – Nov", temp: "5–20°C", note: "Clear skies, fewest crowds" },
      { season: "Winter", months: "Dec – Feb", temp: "−4–10°C", note: "Snow at Solang, very cold nights" },
    ],
    tips: [
      "Snow at Manali town itself is rare — it's Solang and beyond that deliver. Don't book December expecting a white Mall Road.",
      "Rohtang Pass needs a permit and is closed much of the year; the Atal Tunnel doesn't and isn't.",
      "The overnight Volvo is genuinely comfortable, but take the lower deck if you're prone to motion sickness.",
      "Adventure activities are paid on the spot at Solang — we exclude them so you only pay for what you actually do.",
      "Hotel heaters are often charged extra in winter. We flag it upfront rather than at checkout.",
    ],
    gallery: [
      { id: "m1", caption: "Solang Valley", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "m2", caption: "Atal Tunnel", gradient: "linear-gradient(150deg,#5a6a82,#1b2436)" },
      { id: "m3", caption: "Hadimba Temple", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "m4", caption: "Sissu, Lahaul", gradient: "linear-gradient(150deg,#6a7a96,#242f45)" },
      { id: "m5", caption: "Mall Road evenings", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    packageSlugs: ["manali-volvo", "manali-kasol", "shimla-manali"],
    mapQuery: "Manali, Himachal Pradesh",
  },

  kerala: {
    slug: "kerala",
    tagline: "Slow travel, done properly",
    heroGradient: "linear-gradient(150deg,#2f5d50 0%,#173a30 45%,#0a0e1a 100%)",
    overview: [
      "Kerala is the antidote to a packed itinerary. Backwaters you drift through on a houseboat, tea country that smells like the inside of a teapot, and a coastline that has been trading with the world for two thousand years.",
      "We build it as a three-part trip — Munnar's hills, Alleppey's water, and a coastal finish at Kochi or Kovalam — with enough space between them that you actually rest.",
    ],
    bestTime: {
      window: "September – March",
      why: "Post-monsoon through winter is dry, green and comfortable. October–February is peak. June–August is monsoon — dramatic and cheap, and genuinely the best window for Ayurvedic treatments.",
    },
    attractions: [
      { name: "Alleppey backwaters", blurb: "A night on a private houseboat through the paddy-lined canals.", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Munnar tea country", blurb: "Endless clipped tea gardens, Eravikulam park, and cool mornings.", gradient: "linear-gradient(150deg,#3a6d50,#12332a)" },
      { name: "Fort Kochi", blurb: "Chinese fishing nets, Jew Town, and Portuguese-Dutch-British layers.", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { name: "Thekkady / Periyar", blurb: "Spice plantations and a boat safari on the reservoir.", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { name: "Kovalam & Varkala", blurb: "Lighthouse beach, red cliffs, and the Arabian Sea sunset.", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { name: "Kathakali & Kalaripayattu", blurb: "Classical dance-drama and the world's oldest martial art, performed nightly.", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
    ],
    activities: [
      "Overnight private houseboat, Alleppey",
      "Tea estate and factory walk, Munnar",
      "Periyar boat safari",
      "Spice plantation tour, Thekkady",
      "Ayurvedic massage and treatments",
      "Kathakali performance in Fort Kochi",
    ],
    hotels: [
      { name: "Tea-estate resorts", area: "Munnar", rating: 4.6, note: "Valley-facing rooms in the plantations, cool nights" },
      { name: "Private houseboats", area: "Alleppey", rating: 4.7, note: "En-suite cabins, onboard chef, one night on the water" },
      { name: "Heritage homestays", area: "Fort Kochi", rating: 4.5, note: "Restored colonial townhouses in the old quarter" },
    ],
    weather: [
      { season: "Winter", months: "Dec – Feb", temp: "22–32°C", note: "Peak season — dry, warm, ideal" },
      { season: "Summer", months: "Mar – May", temp: "26–36°C", note: "Hot and humid on the coast; Munnar stays cool" },
      { season: "Monsoon", months: "Jun – Aug", temp: "23–30°C", note: "Heavy rain, lush, best for Ayurveda" },
      { season: "Post-monsoon", months: "Sep – Nov", temp: "23–32°C", note: "Green, fresh, fewer crowds" },
    ],
    tips: [
      "One night on the houseboat is plenty — two is a lot of sitting. We pair it with a land night instead.",
      "Munnar is 4–5 hours of hairpins from Kochi. Take it as a travel day, not a morning errand.",
      "Alcohol rules in Kerala are stricter than most of India — licensed hotels only, and dry days exist.",
      "Mosquito repellent for backwater nights is non-negotiable.",
      "Book Ayurvedic treatments through the hotel we recommend — unlicensed 'centres' are common near beaches.",
    ],
    gallery: [
      { id: "ke1", caption: "Alleppey backwaters", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "ke2", caption: "Munnar tea gardens", gradient: "linear-gradient(150deg,#3a6d50,#12332a)" },
      { id: "ke3", caption: "Chinese fishing nets, Kochi", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "ke4", caption: "Periyar reservoir", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "ke5", caption: "Kovalam sunset", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
    ],
    packageSlugs: [],
    mapQuery: "Alleppey, Kerala",
  },
};

export const detailedDestinationSlugs = Object.keys(destinationDetails);
