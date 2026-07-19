/**
 * Full package detail content, keyed by slug.
 * Summary/price/rating live in `featuredPackages` (data/home.ts); this adds the
 * deep detail a package page needs. Mirrors the future Payload "Packages" collection.
 */

export type ItineraryDay = {
  day: string;
  title: string;
  activities: string[];
};

export type Hotel = {
  name: string;
  location: string;
  nights: number;
  rating: number;
  note: string;
  gradient: string;
};

export type PackageDetail = {
  slug: string;
  heroGradient: string;
  gallery: { id: string; caption: string; gradient: string }[];
  highlights: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  transport: { mode: string; detail: string }[];
  inclusions: string[];
  exclusions: string[];
  bestTime: string;
  weather: { season: string; months: string; temp: string; note: string }[];
  /** Used to build the map link/embed */
  mapQuery: string;
  faqs: { q: string; a: string }[];
  minPax: string;
  pickup: string;
  /** Drop-off location. Defaults to pickup for round-trip tours. */
  drop: string;
};

export const packageDetails: Record<string, PackageDetail> = {
  "kashmir-romance": {
    slug: "kashmir-romance",
    heroGradient: "linear-gradient(150deg,#3a5f86 0%,#173a4a 45%,#0a0e1a 100%)",
    gallery: [
      { id: "k1", caption: "Dal Lake at sunrise", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "k2", caption: "Gulmarg Gondola", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { id: "k3", caption: "Betaab Valley, Pahalgam", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "k4", caption: "Mughal Gardens", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "k5", caption: "Houseboat evening", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    highlights: [
      "One night on a traditional Dal Lake houseboat",
      "Gulmarg Gondola — one of the world's highest cable cars",
      "Betaab & Aru Valley at Pahalgam",
      "Mughal Gardens: Nishat, Shalimar & Chashme Shahi",
      "Private sedan throughout, no shared transfers",
      "Shikara ride at golden hour",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Srinagar — Mughal Gardens", activities: ["Airport pickup and transfer to your hotel", "Chashme Shahi, Nishat Bagh and Shalimar Bagh", "Evening at leisure by Dal Lake", "Dinner and overnight in Srinagar"] },
      { day: "Day 2", title: "Gulmarg — meadow of flowers", activities: ["Drive to Gulmarg via Tangmarg", "Gondola cable car ride (tickets own cost)", "Optional horse riding at the golf course", "Return to Srinagar for dinner and overnight"] },
      { day: "Day 3", title: "Sonmarg — meadow of gold", activities: ["Full-day excursion to Sonmarg via Gagangir", "Thajiwas glacier area (local pony/taxi own cost)", "Paddy fields and the Sindh river en route", "Return to Srinagar for dinner and overnight"] },
      { day: "Day 4", title: "Pahalgam — Betaab & Aru", activities: ["Drive to Pahalgam through saffron fields and apple orchards", "Betaab Valley, Aru Valley and Chandanwari (union cabs own cost)", "Walk along the Lidder river", "Dinner and overnight in Pahalgam"] },
      { day: "Day 5", title: "Return Srinagar — houseboat night", activities: ["Drive back to Srinagar", "One-hour Shikara ride on Dal Lake at sunset", "Check in to a traditional houseboat", "Kashmiri dinner and overnight on the houseboat"] },
      { day: "Day 6", title: "Departure", activities: ["Breakfast on the houseboat", "Transfer to Srinagar airport", "Tour concludes"] },
    ],
    hotels: [
      { name: "Deluxe hotel, Srinagar", location: "Near Dal Lake", nights: 3, rating: 4.5, note: "3-star deluxe, lake-side location, breakfast and dinner included", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { name: "Riverside hotel, Pahalgam", location: "Lidder valley", nights: 1, rating: 4.4, note: "3-star, river-facing, an unhurried night in the mountains", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Traditional houseboat", location: "Dal Lake", nights: 1, rating: 4.7, note: "Hand-carved cedar interiors, the classic Kashmir experience", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    transport: [
      { mode: "Private sedan", detail: "Dedicated non-AC sedan for all five days with driver" },
      { mode: "Airport transfers", detail: "Pickup and drop at Srinagar airport included" },
      { mode: "Shikara", detail: "One-hour Shikara ride on Dal Lake included" },
    ],
    inclusions: ["3 nights Srinagar hotel + 1 night Pahalgam + 1 night houseboat", "Breakfast and dinner daily (MAP plan)", "Private sedan for the full itinerary", "One-hour Shikara ride", "All tolls, taxes and driver allowances"],
    exclusions: ["Airfare to/from Srinagar", "Gulmarg Gondola tickets and pony rides", "Union cabs at Gulmarg / Pahalgam", "Lunch and personal expenses", "5% GST"],
    bestTime: "March to October. April–May for tulips and blossom, June–August for cool escape, September–October for autumn chinars.",
    weather: [
      { season: "Spring", months: "Mar – May", temp: "8–20°C", note: "Tulip season, blossom, mild days" },
      { season: "Summer", months: "Jun – Aug", temp: "15–30°C", note: "Warmest, greenest, best for Gulmarg" },
      { season: "Autumn", months: "Sep – Nov", temp: "5–20°C", note: "Golden chinars, crisp and clear" },
      { season: "Winter", months: "Dec – Feb", temp: "−2–8°C", note: "Snow, skiing at Gulmarg, very cold" },
    ],
    mapQuery: "Srinagar, Jammu and Kashmir",
    faqs: [
      { q: "Is the houseboat night safe and comfortable?", a: "Yes — we use long-standing, personally inspected houseboats with private bathrooms, heating and 24/7 staff. It's the most loved night of the trip for most couples." },
      { q: "Are the Gondola tickets included?", a: "No. Gondola tickets are bought on the day and are excluded so you only pay for the phases you actually ride. We help you book them." },
      { q: "Why are union cabs extra?", a: "At Gulmarg, Sonmarg and Pahalgam, local taxi unions hold exclusive rights to the last stretch. It's a local regulation — we're transparent about it rather than hiding it in the price." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Srinagar airport",
    drop: "Srinagar airport",
  },

  "manali-volvo": {
    slug: "manali-volvo",
    heroGradient: "linear-gradient(150deg,#4a5a72 0%,#242f45 45%,#0a0e1a 100%)",
    gallery: [
      { id: "m1", caption: "Solang Valley", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "m2", caption: "Atal Tunnel", gradient: "linear-gradient(150deg,#5a6a82,#1b2436)" },
      { id: "m3", caption: "Hadimba Temple", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "m4", caption: "Sissu, Lahaul", gradient: "linear-gradient(150deg,#6a7a96,#242f45)" },
      { id: "m5", caption: "Mall Road evenings", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    highlights: [
      "Overnight AC semi-sleeper Volvo, both ways",
      "Private Dzire cab for all sightseeing",
      "Solang Valley adventure hub",
      "Drive through the Atal Tunnel to Sissu",
      "Hadimba Devi Temple and Vashisht hot springs",
      "Kullu Valley and Naggar Castle",
    ],
    itinerary: [
      { day: "Day 1", title: "Delhi → Manali (overnight Volvo)", activities: ["Evening departure from Delhi by luxury AC semi-sleeper Volvo", "Comfortable overnight journey into the mountains", "Dinner stop en route"] },
      { day: "Day 2", title: "Arrive Manali — local sightseeing", activities: ["Morning arrival, met by your private Dzire cab", "Check in to a 3-star hotel and freshen up", "Hadimba Devi Temple, Vashisht Temple and hot springs", "Van Vihar and Mall Road; dinner and overnight"] },
      { day: "Day 3", title: "Solang · Atal Tunnel · Sissu", activities: ["Full day by private cab", "Solang Valley — skiing, zip-line, paragliding (own cost)", "Drive the Atal Tunnel to Sissu in Lahaul", "Return for dinner and overnight in Manali"] },
      { day: "Day 4", title: "Kullu Valley · Manikaran", activities: ["Day excursion down the Kullu valley", "Manikaran Sahib gurudwara and hot springs", "Optional river rafting on the Beas (own cost)", "Return for dinner and overnight in Manali"] },
      { day: "Day 5", title: "Naggar Castle — return Volvo", activities: ["Breakfast and check-out", "Naggar Castle and the Roerich Art Gallery", "Evening drop at Manali Volvo stand (5–6 PM)", "Overnight Volvo back to Delhi"] },
      { day: "Day 6", title: "Arrive Delhi", activities: ["Morning arrival in Delhi", "Tour concludes"] },
    ],
    hotels: [
      { name: "Budget deluxe 3-star, Manali", location: "Manali town", nights: 3, rating: 4.3, note: "Double sharing, 3 breakfasts and 3 dinners included", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
    ],
    transport: [
      { mode: "AC semi-sleeper Volvo", detail: "Delhi–Manali–Delhi return tickets, overnight both ways" },
      { mode: "Private Dzire cab", detail: "Dedicated cab for all three days of Manali sightseeing" },
      { mode: "Stand transfers", detail: "Volvo stand ↔ hotel pickup and drop included" },
    ],
    inclusions: ["Delhi–Manali–Delhi AC Volvo tickets (both ways)", "Private Dzire cab for all sightseeing", "3 nights 3-star hotel (double sharing)", "3 breakfasts and 3 dinners", "Volvo stand pickup and drop"],
    exclusions: ["Lunch meals", "Adventure activities at Solang (own cost)", "Sightseeing entry tickets", "Hotel heater charges if applicable", "Personal expenses"],
    bestTime: "October to June. December–February for snow, March–June for pleasant weather and full access to Rohtang/Atal Tunnel.",
    weather: [
      { season: "Spring", months: "Mar – May", temp: "10–25°C", note: "Pleasant, blossom, best all-round" },
      { season: "Summer", months: "Jun – Aug", temp: "15–28°C", note: "Warm days; monsoon later in the season" },
      { season: "Autumn", months: "Sep – Nov", temp: "5–20°C", note: "Clear skies, fewer crowds" },
      { season: "Winter", months: "Dec – Feb", temp: "−4–10°C", note: "Snow at Solang, very cold nights" },
    ],
    mapQuery: "Manali, Himachal Pradesh",
    faqs: [
      { q: "Where does the Volvo leave from in Delhi?", a: "Departures are from Akshardham Metro, Gate 1, at around 10 PM. We share exact boarding details and your seat numbers before departure." },
      { q: "Is the Atal Tunnel always open?", a: "It's open year-round in normal conditions, but can close briefly during heavy snow. If it's shut we substitute an equivalent sightseeing route on the day." },
      { q: "Are adventure activities included?", a: "No — skiing, zip-lining and paragliding are paid directly at Solang so you only pay for what you choose to do." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Akshardham Metro, Gate 1, Delhi · 10 PM",
    drop: "Akshardham Metro, Delhi",
  },

  "chopta-tungnath": {
    slug: "chopta-tungnath",
    heroGradient: "linear-gradient(150deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)",
    gallery: [
      { id: "c1", caption: "Chandrashila summit", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { id: "c2", caption: "Tungnath temple", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { id: "c3", caption: "Chopta meadows", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "c4", caption: "Deoriatal reflection", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "c5", caption: "Rhododendron forest", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
    ],
    highlights: [
      "Tungnath — the world's highest Shiva temple (3,680 m)",
      "Chandrashila summit sunrise at 4,000 m",
      "Views of Trishul, Nanda Devi and Chaukhamba",
      "Deoriatal, the mirror lake",
      "Devprayag — the Ganges confluence",
      "Campfire night in the meadows",
    ],
    itinerary: [
      { day: "Day 0", title: "Delhi → Chopta (overnight)", activities: ["Depart Akshardham Metro around 10 PM", "Overnight drive by Tempo Traveller"] },
      { day: "Day 1", title: "Devprayag → Chopta", activities: ["Stop at Devprayag — Bhagirathi and Alaknanda confluence", "Arrive Chopta (2,680 m), the 'mini Switzerland' of Uttarakhand", "Acclimatisation walk through rhododendron forest", "Campfire, dinner and overnight"] },
      { day: "Day 2", title: "Tungnath & Chandrashila", activities: ["Early trek to Tungnath temple (3,680 m)", "Continue to Chandrashila summit (4,000 m) for the panorama", "Descend to Chopta", "Dinner and overnight"] },
      { day: "Day 3", title: "Deoriatal → Delhi", activities: ["Short trek to Deoriatal lake for the reflection view", "Begin the drive back to Delhi", "Arrive Delhi late night"] },
    ],
    hotels: [
      { name: "Alpine camps / homestay", location: "Chopta", nights: 2, rating: 4.4, note: "Twin sharing camps or homestay with all meals and campfire", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
    ],
    transport: [
      { mode: "Tempo Traveller", detail: "Delhi ↔ Delhi round trip, overnight both ways" },
      { mode: "Trek support", detail: "Certified guide and support staff throughout the trek" },
    ],
    inclusions: ["Delhi ↔ Delhi transport by Tempo Traveller/Volvo", "2 nights camps or homestay", "All meals from Day 0 dinner to Day 3", "Experienced trek guide and support staff", "Basic first aid and safety equipment"],
    exclusions: ["Personal trekking gear (boots, poles, layers)", "Travel insurance", "Personal expenses", "5% GST"],
    bestTime: "April to June and September to November. December–March is a snow trek for experienced trekkers.",
    weather: [
      { season: "Spring", months: "Apr – Jun", temp: "5–18°C", note: "Rhododendrons in bloom, clearest views" },
      { season: "Monsoon", months: "Jul – Aug", temp: "8–18°C", note: "Lush but slippery; we avoid peak monsoon" },
      { season: "Autumn", months: "Sep – Nov", temp: "0–15°C", note: "Crisp air, best summit visibility" },
      { season: "Winter", months: "Dec – Mar", temp: "−8–8°C", note: "Deep snow; experienced trekkers only" },
    ],
    mapQuery: "Chopta, Uttarakhand",
    faqs: [
      { q: "How difficult is this trek?", a: "Moderate. The Tungnath climb is about 3.5 km of steady ascent on a paved trail, then a steeper final push to Chandrashila. Reasonable fitness is enough — no technical climbing." },
      { q: "What should I carry?", a: "Broken-in trekking shoes, warm layers, a windproof jacket, a rain shell, a headtorch and a personal water bottle. We send a full packing list after booking." },
      { q: "Is there mobile network?", a: "Patchy. Expect network at Chopta on some carriers and none on the summit trail — part of the appeal." },
    ],
    minPax: "Minimum 4 travellers",
    pickup: "Akshardham Metro, Gate 1, Delhi · 10 PM",
    drop: "Akshardham Metro, Delhi",
  },

  jaisalmer: {
    slug: "jaisalmer",
    heroGradient: "linear-gradient(150deg,#8a6e34 0%,#4a3520 45%,#0a0e1a 100%)",
    gallery: [
      { id: "j1", caption: "Jaisalmer Fort at golden hour", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "j2", caption: "Sam sand dunes", gradient: "linear-gradient(150deg,#a3803a,#3a2a15)" },
      { id: "j3", caption: "Patwon ki Haveli", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "j4", caption: "Desert camp folk night", gradient: "linear-gradient(150deg,#4a3520,#0a0e1a)" },
      { id: "j5", caption: "Gadisar Lake", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    highlights: [
      "Fixed Friday departures through the desert season",
      "The living fort — Sonar Quila at golden hour",
      "Camel safari over the Sam sand dunes at sunset",
      "Folk music and dance night at a desert camp",
      "Patwon ki Haveli and the old city lanes",
      "Gadisar Lake ghats at sunrise",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Jaisalmer — the golden city", activities: ["Morning arrival and hotel check-in", "Jaisalmer Fort — palaces, Jain temples and rampart views", "Patwon ki Haveli and the old city bazaars", "Dinner and overnight in Jaisalmer"] },
      { day: "Day 2", title: "Sam dunes — desert camp night", activities: ["Gadisar Lake and Bada Bagh cenotaphs", "Afternoon drive to the Sam dunes (45 km)", "Camel safari over the dunes at sunset", "Folk music, dance and dinner at the desert camp; overnight in Swiss tents"] },
      { day: "Day 3", title: "Desert sunrise — departure", activities: ["Sunrise over the dunes and breakfast at camp", "Drive back to Jaisalmer", "Drop at Jaisalmer railway station — tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Jaisalmer", location: "Near the fort", nights: 1, rating: 4.4, note: "Double sharing, rooftop fort views, breakfast and dinner included", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { name: "Desert camp, Sam dunes", location: "Sam", nights: 1, rating: 4.6, note: "Swiss tents with attached bath, bonfire and cultural evening", gradient: "linear-gradient(150deg,#4a3520,#0a0e1a)" },
    ],
    transport: [
      { mode: "Group coach", detail: "AC coach with the group throughout, Jaisalmer ↔ Sam included" },
      { mode: "Camel safari", detail: "Sunset camel ride at Sam dunes included" },
      { mode: "Trip captain", detail: "A dedicated coordinator travels with every Friday batch" },
    ],
    inclusions: ["1 night 3-star hotel + 1 night Swiss-tent desert camp", "Breakfast and dinner daily", "Camel safari at Sam dunes", "Folk night with bonfire at the camp", "AC coach and all transfers with the group", "Trip captain throughout"],
    exclusions: ["Train/flight tickets to Jaisalmer", "Monument entry tickets", "Lunch meals", "Jeep safari and paramotoring at Sam (own cost)", "Personal expenses", "5% GST"],
    bestTime: "The Friday batches run through the desert season, starting after 15 September. October to February is ideal — warm days, cold clear nights, and the dunes at their best.",
    weather: [
      { season: "Season opening", months: "Sep – Oct", temp: "20–35°C", note: "Warm days, pleasant evenings" },
      { season: "Peak winter", months: "Nov – Jan", temp: "5–24°C", note: "Ideal — pack a warm layer for the camp night" },
      { season: "Season close", months: "Feb – Mar", temp: "12–30°C", note: "Warming up, still comfortable" },
      { season: "Off season", months: "Apr – Aug", temp: "28–45°C", note: "Desert summer — batches don't run" },
    ],
    mapQuery: "Jaisalmer, Rajasthan",
    faqs: [
      { q: "How do the Friday departures work?", a: "Batches leave every Friday through the desert season, which opens after 15 September. You reserve a seat for a specific Friday; a dedicated trip captain travels with the group." },
      { q: "Is the desert camp comfortable?", a: "Yes — Swiss tents with proper beds and attached bathrooms, not bare camping. Nights get genuinely cold in winter; blankets are provided, but bring a warm layer." },
      { q: "Can I join solo?", a: "Absolutely. Group departures are the easiest way to travel solo — seats are priced per person and you'll share the camp evening with the batch." },
      { q: "How do I reach Jaisalmer?", a: "Direct trains run from Jhansi, Delhi and Jaipur. Tell us where you're starting and we'll suggest the best connection; train tickets are excluded so you can use your preferred class." },
    ],
    minPax: "Join solo, as a couple, or as a group",
    pickup: "Jaisalmer railway station · Friday morning",
    drop: "Jaisalmer railway station",
  },

  goa: {
    slug: "goa",
    heroGradient: "linear-gradient(150deg,#8a6e34 0%,#4a3520 45%,#0a0e1a 100%)",
    gallery: [
      { id: "g1", caption: "Palolem beach, South Goa", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { id: "g2", caption: "Fort Aguada at sunset", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "g3", caption: "Basilica of Bom Jesus", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "g4", caption: "Fontainhas, Panjim", gradient: "linear-gradient(150deg,#a3803a,#3a2a15)" },
      { id: "g5", caption: "Mandovi river cruise", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    highlights: [
      "North Goa beaches — Calangute, Baga and Anjuna",
      "Fort Aguada and a Sinquerim sunset",
      "Old Goa: Basilica of Bom Jesus and Se Cathedral",
      "Panjim's Latin quarter, Fontainhas",
      "Sunset cruise on the Mandovi",
      "A quiet South Goa beach day — Palolem or Colva",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Goa — North beaches", activities: ["Airport/station pickup and hotel check-in", "Calangute, Baga and Anjuna beaches at your own pace", "Fort Aguada and Sinquerim sunset", "Evening free on the beach strip; overnight in North Goa"] },
      { day: "Day 2", title: "Old Goa & Panjim", activities: ["Basilica of Bom Jesus and Se Cathedral", "Panjim's Latin-quarter lanes at Fontainhas", "Optional Mandovi sunset cruise with live music", "Dinner and overnight in North Goa"] },
      { day: "Day 3", title: "South Goa — the quiet coast", activities: ["Drive south to Colva or Palolem", "Optional Dudhsagar falls or a spice-plantation lunch", "Beach time, water sports (own cost)", "Return for dinner and overnight"] },
      { day: "Day 4", title: "Leisure & departure", activities: ["Breakfast and check-out", "Last-minute market or beach time", "Transfer to Goa airport/station — tour concludes"] },
    ],
    hotels: [
      { name: "3-star resort, North Goa", location: "Candolim / Calangute belt", nights: 3, rating: 4.4, note: "Pool, walkable to the beach, breakfast included", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    transport: [
      { mode: "Private cab", detail: "Dedicated AC cab for all sightseeing and transfers" },
      { mode: "Airport transfers", detail: "Pickup and drop within Goa included" },
    ],
    inclusions: ["3 nights 3-star resort (double sharing)", "Daily breakfast", "Private AC cab for sightseeing and transfers", "North + South Goa sightseeing per itinerary", "All tolls, parking and driver allowances"],
    exclusions: ["Airfare/train tickets to Goa", "Lunch and dinner", "Water sports, cruise and entry tickets", "Personal expenses", "5% GST"],
    bestTime: "November to February is peak — warm days, cool evenings, calm sea. October and March are pleasant and quieter; the monsoon (June–September) is green, dramatic and cheap but many shacks close.",
    weather: [
      { season: "Peak", months: "Nov – Feb", temp: "21–32°C", note: "Warm, dry, calm sea — ideal" },
      { season: "Shoulder", months: "Oct & Mar", temp: "24–33°C", note: "Pleasant, fewer crowds" },
      { season: "Summer", months: "Apr – May", temp: "27–35°C", note: "Hot and humid" },
      { season: "Monsoon", months: "Jun – Sep", temp: "24–30°C", note: "Heavy rain, lush, many shacks shut" },
    ],
    mapQuery: "Goa, India",
    faqs: [
      { q: "North Goa or South Goa — which is better?", a: "North is livelier — beach shacks, markets, nightlife. South is quieter and cleaner, better for couples and families. This itinerary stays in the North and takes a day trip south so you see both." },
      { q: "Is a cab included the whole time?", a: "Yes — a dedicated AC cab covers all sightseeing and transfers. Goa is spread out and scooters aren't for everyone, so private transport makes the trip far smoother." },
      { q: "Can you add water sports or a Dudhsagar trip?", a: "Absolutely — both are easy add-ons. We keep them excluded so you only pay for what you actually choose to do." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Goa",
    drop: "Goa",
  },

  kerala: {
    slug: "kerala",
    heroGradient: "linear-gradient(150deg,#2f5d50 0%,#173a30 45%,#0a0e1a 100%)",
    gallery: [
      { id: "ke1", caption: "Alleppey backwaters", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "ke2", caption: "Munnar tea gardens", gradient: "linear-gradient(150deg,#3a6d50,#12332a)" },
      { id: "ke3", caption: "Fort Kochi fishing nets", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "ke4", caption: "Periyar, Thekkady", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "ke5", caption: "Houseboat sunset", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    highlights: [
      "A private houseboat night on the Alleppey backwaters",
      "Munnar's tea gardens and Eravikulam park",
      "Periyar boat safari at Thekkady",
      "A spice-plantation walk",
      "Fort Kochi — Chinese nets and colonial lanes",
      "An evening Kathakali performance",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Kochi → Munnar", activities: ["Kochi pickup and scenic drive to Munnar (hill country)", "Waterfalls and viewpoints en route", "Check in, evening at leisure", "Dinner and overnight in Munnar"] },
      { day: "Day 2", title: "Munnar sightseeing", activities: ["Tea gardens and a tea-factory visit", "Eravikulam National Park / Mattupetty dam", "Echo Point and tea-museum", "Dinner and overnight in Munnar"] },
      { day: "Day 3", title: "Munnar → Thekkady", activities: ["Drive to Thekkady (Periyar)", "Periyar reservoir boat safari", "Spice-plantation walk", "Optional Kathakali or Kalaripayattu show; overnight in Thekkady"] },
      { day: "Day 4", title: "Thekkady → Alleppey houseboat", activities: ["Drive to Alleppey", "Board a private houseboat around noon", "Cruise the paddy-lined backwaters, onboard lunch and dinner", "Overnight on the houseboat"] },
      { day: "Day 5", title: "Alleppey → Fort Kochi", activities: ["Disembark after breakfast", "Drive to Fort Kochi", "Chinese fishing nets, Jew Town and the Dutch Palace", "Dinner and overnight in Kochi"] },
      { day: "Day 6", title: "Departure", activities: ["Breakfast and check-out", "Transfer to Kochi airport/station — tour concludes"] },
    ],
    hotels: [
      { name: "Hill resort, Munnar", location: "Tea country", nights: 2, rating: 4.5, note: "Valley-facing rooms, cool nights, breakfast and dinner", gradient: "linear-gradient(150deg,#3a6d50,#12332a)" },
      { name: "Jungle resort, Thekkady", location: "Near Periyar", nights: 1, rating: 4.4, note: "Close to the reserve gate, breakfast and dinner", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Private houseboat, Alleppey", location: "Backwaters", nights: 1, rating: 4.7, note: "En-suite cabin, onboard chef, all meals", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { name: "Heritage hotel, Fort Kochi", location: "Old quarter", nights: 1, rating: 4.5, note: "Restored colonial townhouse, breakfast", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    transport: [
      { mode: "Private cab", detail: "Dedicated AC cab across Munnar, Thekkady, Alleppey and Kochi" },
      { mode: "Houseboat", detail: "Private overnight houseboat on the Alleppey backwaters" },
      { mode: "Airport transfers", detail: "Kochi pickup and drop included" },
    ],
    inclusions: ["5 nights across Munnar, Thekkady, an Alleppey houseboat and Fort Kochi", "Breakfast daily; dinner in the hills and full board on the houseboat", "Private AC cab for the full circuit", "Periyar boat safari and spice-plantation walk", "All tolls, taxes and driver allowances"],
    exclusions: ["Airfare/train to Kochi", "Lunches (except on the houseboat)", "Entry tickets and cultural shows", "Personal expenses", "5% GST"],
    bestTime: "September to March is dry, green and comfortable — October to February is peak. The monsoon (June–August) is dramatic and the best window for Ayurvedic treatments.",
    weather: [
      { season: "Peak", months: "Dec – Feb", temp: "22–32°C", note: "Dry, warm, ideal" },
      { season: "Summer", months: "Mar – May", temp: "26–36°C", note: "Hot on the coast; Munnar stays cool" },
      { season: "Monsoon", months: "Jun – Aug", temp: "23–30°C", note: "Heavy rain, lush, best for Ayurveda" },
      { season: "Post-monsoon", months: "Sep – Nov", temp: "23–32°C", note: "Fresh, green, fewer crowds" },
    ],
    mapQuery: "Alleppey, Kerala",
    faqs: [
      { q: "Is one houseboat night enough?", a: "Yes — it's the perfect length. A full day and night of cruising is magical; two becomes a lot of sitting. We pair it with land nights so the trip stays varied." },
      { q: "How far apart are the stops?", a: "Munnar to Thekkady is ~3 hours, Thekkady to Alleppey ~3.5, Alleppey to Kochi ~1.5. All scenic drives; we treat travel days as part of the experience, not errands." },
      { q: "Are the hill roads difficult?", a: "The Munnar road is a long series of hairpins. If anyone gets carsick, tell us and we'll pace the drive and seat you up front." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Kochi",
    drop: "Kochi",
  },

  andaman: {
    slug: "andaman",
    heroGradient: "linear-gradient(150deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)",
    gallery: [
      { id: "a1", caption: "Radhanagar beach, Havelock", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { id: "a2", caption: "Cellular Jail, Port Blair", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "a3", caption: "Neil Island lagoon", gradient: "linear-gradient(150deg,#2f8a7a,#0c2e36)" },
      { id: "a4", caption: "Snorkelling reefs", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "a5", caption: "Bharatpur beach", gradient: "linear-gradient(150deg,#4a7a8a,#0c2e36)" },
    ],
    highlights: [
      "Radhanagar — one of Asia's best beaches",
      "Cellular Jail and the evening light-and-sound show",
      "Snorkelling over living coral at Elephant Beach",
      "Neil Island's lagoons and natural bridge",
      "Glass-bottom boat or scuba (own cost)",
      "Island ferries across turquoise water",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Port Blair", activities: ["Airport pickup and hotel check-in", "Corbyn's Cove beach", "Cellular Jail and the evening light-and-sound show", "Dinner and overnight in Port Blair"] },
      { day: "Day 2", title: "Port Blair → Havelock", activities: ["Morning ferry to Havelock (Swaraj Dweep)", "Check in and freshen up", "Radhanagar beach for sunset", "Dinner and overnight in Havelock"] },
      { day: "Day 3", title: "Havelock — Elephant Beach", activities: ["Boat to Elephant Beach", "Snorkelling over the reef; optional sea walk / jet-ski (own cost)", "Beach time and leisure", "Overnight in Havelock"] },
      { day: "Day 4", title: "Havelock → Neil Island", activities: ["Ferry to Neil (Shaheed Dweep)", "Bharatpur and Laxmanpur beaches", "Natural Bridge at low tide", "Overnight in Neil"] },
      { day: "Day 5", title: "Neil → Port Blair", activities: ["Morning at leisure", "Ferry back to Port Blair", "Chidiya Tapu sunset point or local market", "Overnight in Port Blair"] },
      { day: "Day 6", title: "Departure", activities: ["Breakfast and check-out", "Transfer to Port Blair airport — tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Port Blair", location: "Port Blair", nights: 2, rating: 4.3, note: "Central, breakfast included", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { name: "Beach resort, Havelock", location: "Swaraj Dweep", nights: 2, rating: 4.5, note: "Near the beach, breakfast included", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { name: "Island resort, Neil", location: "Shaheed Dweep", nights: 1, rating: 4.3, note: "Quiet, walkable to the lagoon, breakfast", gradient: "linear-gradient(150deg,#2f8a7a,#0c2e36)" },
    ],
    transport: [
      { mode: "Private cab", detail: "AC cab for all island sightseeing and transfers" },
      { mode: "Ferries", detail: "Air-conditioned private/cruise ferries between islands included" },
      { mode: "Airport transfers", detail: "Port Blair pickup and drop included" },
    ],
    inclusions: ["5 nights across Port Blair, Havelock and Neil", "Daily breakfast", "AC cab sightseeing and transfers", "Inter-island ferry tickets (AC)", "Cellular Jail entry; all permits", "Tolls, taxes and driver allowances"],
    exclusions: ["Airfare to/from Port Blair", "Lunch and dinner", "Scuba, sea walk, water sports", "Elephant Beach boat and snorkelling gear", "Personal expenses", "GST"],
    bestTime: "October to May is the sweet spot — calm sea, clear water, reliable ferries. Avoid the peak monsoon (June–September) when crossings are rougher and some activities pause.",
    weather: [
      { season: "Peak", months: "Nov – Feb", temp: "23–30°C", note: "Calm sea, clearest water" },
      { season: "Warm", months: "Mar – May", temp: "26–33°C", note: "Hot but good visibility for diving" },
      { season: "Monsoon", months: "Jun – Sep", temp: "24–30°C", note: "Rough crossings, some activities pause" },
      { season: "Post-monsoon", months: "Oct", temp: "24–31°C", note: "Settling down, fewer crowds" },
    ],
    mapQuery: "Havelock Island, Andaman",
    faqs: [
      { q: "Do I need to book flights before the tour?", a: "Yes — Port Blair is reached by air (usually via Chennai, Kolkata or Bengaluru). Book flights first, then tell us your arrival time and we'll align the ferries." },
      { q: "Is it good for non-swimmers?", a: "Very — the beaches are calm and shallow in places, and sea walks/glass-bottom boats let non-swimmers see the reef without swimming. Snorkelling is guided with life jackets." },
      { q: "Why are ferries important to lock in?", a: "Inter-island ferries sell out in season. We pre-book AC ferries so your Havelock and Neil legs are secured before you arrive." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Port Blair",
    drop: "Port Blair",
  },

  "darjeeling-gangtok": {
    slug: "darjeeling-gangtok",
    heroGradient: "linear-gradient(150deg,#3a5f86 0%,#12233a 45%,#0a0e1a 100%)",
    gallery: [
      { id: "d1", caption: "Kanchenjunga from Tiger Hill", gradient: "linear-gradient(150deg,#3a5f86,#12233a)" },
      { id: "d2", caption: "Darjeeling toy train", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "d3", caption: "Tsomgo Lake, Sikkim", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "d4", caption: "Tea gardens", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "d5", caption: "Rumtek Monastery", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    highlights: [
      "Sunrise over Kanchenjunga from Tiger Hill",
      "The Darjeeling Himalayan Railway toy train",
      "A working tea garden and tasting",
      "Tsomgo Lake and Baba Mandir (permit trip)",
      "Gangtok's monasteries — Rumtek and Enchey",
      "MG Marg evenings in Gangtok",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Bagdogra/NJP → Darjeeling", activities: ["Pickup and scenic drive up to Darjeeling", "Tea-garden views en route", "Evening on the Mall and Chowrasta", "Dinner and overnight in Darjeeling"] },
      { day: "Day 2", title: "Tiger Hill sunrise & Darjeeling", activities: ["Pre-dawn drive to Tiger Hill for the Kanchenjunga sunrise", "Ghoom Monastery and Batasia Loop", "Himalayan Mountaineering Institute, zoo and tea garden", "Toy-train joy ride (own cost); overnight in Darjeeling"] },
      { day: "Day 3", title: "Darjeeling → Gangtok", activities: ["Drive to Gangtok (Sikkim)", "Check in and freshen up", "Evening on MG Marg", "Dinner and overnight in Gangtok"] },
      { day: "Day 4", title: "Tsomgo Lake & Baba Mandir", activities: ["Permit day-trip to Tsomgo Lake (12,400 ft)", "Baba Harbhajan Singh Mandir", "Optional yak ride at the lake (own cost)", "Return to Gangtok; overnight"] },
      { day: "Day 5", title: "Gangtok sightseeing", activities: ["Rumtek Monastery and Enchey Monastery", "Namgyal Institute of Tibetology and Do-Drul Chorten", "Handicraft centre and ropeway", "Dinner and overnight in Gangtok"] },
      { day: "Day 6", title: "Departure", activities: ["Drive down to Bagdogra/NJP", "Transfer to airport/station — tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Darjeeling", location: "Near the Mall", nights: 2, rating: 4.3, note: "Walkable to Chowrasta, breakfast and dinner", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { name: "3-star hotel, Gangtok", location: "Near MG Marg", nights: 3, rating: 4.4, note: "Central, breakfast and dinner", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    transport: [
      { mode: "Private cab", detail: "Dedicated hill-driver cab across Darjeeling and Gangtok" },
      { mode: "Permit vehicle", detail: "Separate registered vehicle for the Tsomgo Lake permit day, as required by law" },
      { mode: "Transfers", detail: "Bagdogra/NJP pickup and drop included" },
    ],
    inclusions: ["2 nights Darjeeling + 3 nights Gangtok (3-star)", "Breakfast and dinner daily", "Private cab for all sightseeing and transfers", "Tsomgo Lake permit and registered permit vehicle", "All tolls, taxes and driver allowances"],
    exclusions: ["Airfare/train to Bagdogra/NJP", "Lunch and personal expenses", "Toy train, ropeway, yak ride and entry tickets", "Nathula Pass (extra permit, subject to availability)", "5% GST"],
    bestTime: "March–May for clear skies and blossom, and October–early December for the sharpest Kanchenjunga views. Monsoon (June–September) brings landslides on the hill roads; deep winter is cold with occasional snow.",
    weather: [
      { season: "Spring", months: "Mar – May", temp: "8–20°C", note: "Clear, blooming, great views" },
      { season: "Monsoon", months: "Jun – Sep", temp: "13–22°C", note: "Rain and landslide risk" },
      { season: "Autumn", months: "Oct – Nov", temp: "6–18°C", note: "Sharpest mountain views — best time" },
      { season: "Winter", months: "Dec – Feb", temp: "1–12°C", note: "Cold, crisp, occasional snow" },
    ],
    mapQuery: "Gangtok, Sikkim",
    faqs: [
      { q: "Will I definitely see Kanchenjunga?", a: "Views depend on weather — clearest in autumn and spring. Tiger Hill at sunrise gives the best odds. We plan it early in the trip so there's a second chance if day one is cloudy." },
      { q: "What's the deal with the Tsomgo Lake permit?", a: "Sikkim requires a permit and a registered local vehicle for the lake, arranged a day ahead with your ID. We handle the paperwork; just carry original photo ID and passport-size photos." },
      { q: "Can we add Nathula Pass?", a: "Sometimes — Nathula needs a separate permit, is closed some days, and isn't guaranteed. If it's open and available for your dates we'll add it at extra cost." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Bagdogra / NJP",
    drop: "Bagdogra / NJP",
  },

  "leh-ladakh": {
    slug: "leh-ladakh",
    heroGradient: "linear-gradient(150deg,#4a5a72 0%,#242f45 45%,#0a0e1a 100%)",
    gallery: [
      { id: "l1", caption: "Pangong Tso", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
      { id: "l2", caption: "Nubra dunes, Hunder", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "l3", caption: "Khardung La", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "l4", caption: "Thiksey Monastery", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "l5", caption: "Leh old town", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
    ],
    highlights: [
      "Pangong Tso — the lake that changes colour",
      "Nubra Valley dunes and double-humped camels",
      "Khardung La, one of the world's highest motorable passes",
      "Thiksey and Diskit monasteries",
      "Shanti Stupa and Leh's old town",
      "A properly paced acclimatisation plan",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrive Leh — acclimatise", activities: ["Airport pickup and hotel check-in", "Complete rest to adjust to 3,500 m — this matters", "Short easy stroll in the evening if you feel well", "Dinner and overnight in Leh"] },
      { day: "Day 2", title: "Leh monasteries & Sangam", activities: ["Shey, Thiksey and Hemis monasteries", "Sangam — the Indus–Zanskar confluence", "Magnetic Hill and Gurudwara Pathar Sahib", "Shanti Stupa at sunset; overnight in Leh"] },
      { day: "Day 3", title: "Leh → Nubra via Khardung La", activities: ["Drive over Khardung La (18,380 ft)", "Descend to the Nubra Valley", "Hunder sand dunes and double-humped camel ride", "Overnight in a Nubra camp/hotel"] },
      { day: "Day 4", title: "Nubra → Pangong", activities: ["Diskit Monastery and the giant Maitreya Buddha", "Long, scenic drive to Pangong Tso via Shyok", "Sunset over the lake", "Overnight in a Pangong camp"] },
      { day: "Day 5", title: "Pangong → Leh", activities: ["Sunrise at Pangong", "Drive back to Leh via Chang La", "Evening free in Leh market", "Dinner and overnight in Leh"] },
      { day: "Day 6", title: "Departure", activities: ["Early transfer to Leh airport", "Tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Leh", location: "Leh town", nights: 3, rating: 4.4, note: "Oxygen support on call, breakfast and dinner", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { name: "Deluxe camp, Nubra", location: "Hunder", nights: 1, rating: 4.3, note: "Twin tents with attached bath, breakfast and dinner", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { name: "Lakeside camp, Pangong", location: "Pangong Tso", nights: 1, rating: 4.2, note: "Basic but well-run camp by the lake, breakfast and dinner", gradient: "linear-gradient(150deg,#1f6a7a,#0c2e36)" },
    ],
    transport: [
      { mode: "SUV (Innova/Xylo)", detail: "Dedicated SUV suited to Ladakh's terrain, with an experienced high-altitude driver" },
      { mode: "Inner-line permits", detail: "Permits for Nubra, Pangong and Khardung La arranged" },
      { mode: "Airport transfers", detail: "Leh pickup and drop included" },
    ],
    inclusions: ["3 nights Leh + 1 night Nubra camp + 1 night Pangong camp", "Breakfast and dinner daily", "Dedicated SUV for the full circuit", "Inner-line permits for Nubra, Pangong and Khardung La", "All tolls, taxes and driver allowances"],
    exclusions: ["Airfare to/from Leh", "Lunch and personal expenses", "Monastery entry, camel ride, activities", "Oxygen cylinders if required", "5% GST"],
    bestTime: "Mid-May to September, when the passes and lake roads are open and the weather is stable. Roads to Nubra and Pangong are typically shut by snow the rest of the year.",
    weather: [
      { season: "Early season", months: "May – Jun", temp: "5–25°C", note: "Passes opening, fresh snow lingering" },
      { season: "Peak", months: "Jul – Aug", temp: "10–30°C", note: "Warmest, all roads open — busiest" },
      { season: "Late season", months: "Sep", temp: "3–22°C", note: "Clear, golden, quieter — lovely" },
      { season: "Closed", months: "Oct – Apr", temp: "−15–10°C", note: "Passes snowed shut; most tours don't run" },
    ],
    mapQuery: "Leh, Ladakh",
    faqs: [
      { q: "How serious is altitude sickness here?", a: "Real, and we plan around it. Day 1 is deliberately rest-only to acclimatise at Leh before going higher. Hydrate, avoid alcohol the first two days, and tell your driver early if you feel unwell — hotels keep oxygen on call." },
      { q: "Is a full day of rest on arrival really necessary?", a: "Yes. Leh sits at ~3,500 m and most people fly in from sea level. Skipping acclimatisation is the number-one reason trips go wrong. It's built in on purpose." },
      { q: "Are the Pangong/Nubra camps comfortable?", a: "Comfortable but simple — twin tents with attached bathrooms, heavy blankets, and hot dinner. Nights are cold; that's part of the experience. Leh nights are in proper hotels." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Leh",
    drop: "Leh",
  },

  "manali-kasol": {
    slug: "manali-kasol",
    heroGradient: "linear-gradient(150deg,#2f5d50 0%,#12332a 45%,#0a0e1a 100%)",
    gallery: [
      { id: "mk1", caption: "Parvati river, Kasol", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "mk2", caption: "Atal Tunnel", gradient: "linear-gradient(150deg,#5a6a82,#1b2436)" },
      { id: "mk3", caption: "Chalal forest trail", gradient: "linear-gradient(150deg,#3a6d50,#12332a)" },
      { id: "mk4", caption: "Manikaran Sahib", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
      { id: "mk5", caption: "Riverside bonfire", gradient: "linear-gradient(150deg,#4a3520,#0a0e1a)" },
    ],
    highlights: [
      "Solang Valley and a drive through the Atal Tunnel",
      "Kasol and the Parvati Valley cafés",
      "The Chalal forest-and-river walk",
      "Manikaran Sahib gurudwara and hot springs",
      "A riverside bonfire evening",
      "Your dates, your pace — a private tour",
    ],
    itinerary: [
      { day: "Day 1", title: "Delhi → Manali (overnight)", activities: ["Evening departure from Delhi by AC transport", "Comfortable overnight journey into the mountains", "Dinner stop en route"] },
      { day: "Day 2", title: "Arrive Manali — local & bonfire", activities: ["Morning arrival and hotel check-in", "Hadimba Devi Temple and Old Manali cafés", "Mall Road at leisure", "Bonfire dinner and overnight in Manali"] },
      { day: "Day 3", title: "Solang · Atal Tunnel · Sissu", activities: ["Full day by private cab", "Solang Valley — skiing/zip-line/paragliding (own cost)", "Drive the Atal Tunnel to Sissu in Lahaul", "Return for dinner and overnight in Manali"] },
      { day: "Day 4", title: "Manali → Kasol", activities: ["Drive to Kasol via the Parvati Valley", "Check in; riverside cafés and market", "Evening by the Parvati river", "Bonfire dinner and overnight in Kasol"] },
      { day: "Day 5", title: "Manikaran · Chalal trek → Delhi", activities: ["Manikaran Sahib gurudwara and hot springs", "Chalal forest-and-river walk", "Evening departure back to Delhi (overnight)"] },
      { day: "Day 6", title: "Arrive Delhi", activities: ["Morning arrival in Delhi", "Tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Manali", location: "Manali town", nights: 2, rating: 4.3, note: "Double sharing, breakfast and dinner, bonfire night", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { name: "Riverside stay, Kasol", location: "Parvati Valley", nights: 1, rating: 4.4, note: "By the river, breakfast and dinner, bonfire", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
    ],
    transport: [
      { mode: "AC transport", detail: "Delhi–Manali–Delhi overnight AC coach/tempo, both ways" },
      { mode: "Private cab", detail: "Cab for Manali and Kasol sightseeing" },
    ],
    inclusions: ["Delhi ↔ Delhi AC transport (both ways)", "2 nights Manali + 1 night Kasol", "Breakfast and dinner daily", "Solang, Atal Tunnel, Manikaran and Kasol sightseeing", "Bonfire nights; all tolls, taxes and driver allowances"],
    exclusions: ["Adventure activities at Solang (own cost)", "Lunch and personal expenses", "Entry tickets", "Hotel heater charges if applicable", "5% GST"],
    bestTime: "October to June. December–February for snow at Solang; March–June for pleasant weather and full Atal Tunnel access. Monsoon (July–August) is landslide-prone on the Chandigarh road.",
    weather: [
      { season: "Spring", months: "Mar – May", temp: "10–25°C", note: "Pleasant, best all-round" },
      { season: "Summer", months: "Jun – Aug", temp: "15–28°C", note: "Warm; monsoon later" },
      { season: "Autumn", months: "Sep – Nov", temp: "5–20°C", note: "Clear, quiet" },
      { season: "Winter", months: "Dec – Feb", temp: "−4–10°C", note: "Snow at Solang, cold nights" },
    ],
    mapQuery: "Kasol, Himachal Pradesh",
    faqs: [
      { q: "How is this different from the Manali Volvo package?", a: "This one adds Kasol and the Parvati Valley, with a riverside night and the Chalal trek. The Volvo package stays around Manali. Both are private and customisable." },
      { q: "Is the Chalal trek hard?", a: "No — it's an easy, mostly flat forest-and-river walk of about an hour each way. Anyone reasonably mobile can do it." },
      { q: "Can you start from another city?", a: "Yes. Delhi is the standard start, but tell us where you're coming from and we'll adjust the transport." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Delhi (Akshardham Metro)",
    drop: "Delhi (Akshardham Metro)",
  },

  "shimla-manali": {
    slug: "shimla-manali",
    heroGradient: "linear-gradient(150deg,#6a3f52 0%,#2a1a22 45%,#0a0e1a 100%)",
    gallery: [
      { id: "sm1", caption: "The Ridge, Shimla", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { id: "sm2", caption: "Kufri", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { id: "sm3", caption: "Solang Valley", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
      { id: "sm4", caption: "Hadimba Temple", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "sm5", caption: "Naggar Castle", gradient: "linear-gradient(150deg,#8a6e34,#2b2213)" },
    ],
    highlights: [
      "Shimla's Ridge, Mall Road and Christ Church",
      "Kufri and the Himalayan Nature Park",
      "Hadimba Temple and Old Manali",
      "Solang Valley snow and adventure",
      "Naggar Castle and the Kullu valley",
      "Family-paced, with easy driving days",
    ],
    itinerary: [
      { day: "Day 1", title: "Chandigarh → Shimla", activities: ["Pickup at Chandigarh and drive up to Shimla", "Foothill and valley views en route", "Evening on the Ridge and Mall Road", "Dinner and overnight in Shimla"] },
      { day: "Day 2", title: "Shimla & Kufri", activities: ["Kufri — Himalayan Nature Park and viewpoints", "Jakhu Temple and the Ridge", "Christ Church and Scandal Point", "Dinner and overnight in Shimla"] },
      { day: "Day 3", title: "Shimla → Manali", activities: ["Scenic drive to Manali along the Beas", "Sundernagar lake and Pandoh dam stops", "Check in; evening at leisure", "Dinner and overnight in Manali"] },
      { day: "Day 4", title: "Manali local", activities: ["Hadimba Devi Temple and Vashisht springs", "Old Manali and Mall Road", "Naggar Castle and the Kullu valley", "Dinner and overnight in Manali"] },
      { day: "Day 5", title: "Solang Valley & Atal Tunnel", activities: ["Solang Valley — snow and adventure (own cost)", "Drive through the Atal Tunnel to Sissu", "Return for dinner and overnight in Manali"] },
      { day: "Day 6", title: "Manali → Chandigarh", activities: ["Breakfast and check-out", "Drive down to Chandigarh", "Drop at airport/station — tour concludes"] },
    ],
    hotels: [
      { name: "3-star hotel, Shimla", location: "Near the Mall", nights: 2, rating: 4.3, note: "Walkable to the Ridge, breakfast and dinner", gradient: "linear-gradient(150deg,#6a3f52,#2a1a22)" },
      { name: "3-star hotel, Manali", location: "Manali town", nights: 3, rating: 4.4, note: "Family rooms, breakfast and dinner", gradient: "linear-gradient(150deg,#4a5a72,#141b2c)" },
    ],
    transport: [
      { mode: "Private cab", detail: "Dedicated hill-driver cab for the full Shimla–Manali circuit" },
      { mode: "Transfers", detail: "Chandigarh pickup and drop included" },
    ],
    inclusions: ["2 nights Shimla + 3 nights Manali (3-star)", "Breakfast and dinner daily", "Private cab for all sightseeing and transfers", "Shimla, Kufri, Manali, Solang and Naggar sightseeing", "All tolls, taxes and driver allowances"],
    exclusions: ["Adventure activities and ropeways (own cost)", "Rohtang permit (if opted, subject to availability)", "Lunch and personal expenses", "Entry tickets", "5% GST"],
    bestTime: "March to June for pleasant weather and blossom, and December–February for snow. The monsoon (July–September) can bring landslides on the hill roads.",
    weather: [
      { season: "Spring", months: "Mar – May", temp: "10–24°C", note: "Pleasant, blossom, best for families" },
      { season: "Summer", months: "Jun", temp: "15–28°C", note: "Warm, green" },
      { season: "Monsoon", months: "Jul – Sep", temp: "14–24°C", note: "Rain and landslide risk" },
      { season: "Winter", months: "Dec – Feb", temp: "−2–14°C", note: "Snow, cold, festive" },
    ],
    mapQuery: "Shimla, Himachal Pradesh",
    faqs: [
      { q: "Is this suitable for elderly parents or young kids?", a: "Yes — it's our most family-friendly Himachal trip. Driving days are moderate, hotels are central, and there's no trekking. We can slow the pace further on request." },
      { q: "Will we get snow?", a: "December to February gives the best chance, mostly at Kufri and Solang rather than in the towns. Tell us if snow is the priority and we'll time and route accordingly." },
      { q: "Can we start from Delhi instead of Chandigarh?", a: "Yes — we'll add the Delhi–Chandigarh leg and adjust the itinerary and price." },
    ],
    minPax: "Minimum 2 travellers",
    pickup: "Chandigarh",
    drop: "Chandigarh",
  },

  "corbett-nainital": {
    slug: "corbett-nainital",
    heroGradient: "linear-gradient(150deg,#3a5f86 0%,#12233a 45%,#0a0e1a 100%)",
    gallery: [
      { id: "c1", caption: "Jungle jeep safari", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { id: "c2", caption: "Kosi river, Corbett", gradient: "linear-gradient(150deg,#356074,#0f2a3a)" },
      { id: "c3", caption: "Naini Lake", gradient: "linear-gradient(150deg,#3a5f86,#12233a)" },
      { id: "c4", caption: "Snow View, Nainital", gradient: "linear-gradient(150deg,#5a7a96,#1b3454)" },
      { id: "c5", caption: "Resort bonfire", gradient: "linear-gradient(150deg,#4a3520,#0a0e1a)" },
    ],
    highlights: [
      "Guided jungle jeep safari in Jim Corbett",
      "Riverside resort with supervised activities",
      "Naini Lake and Nainital's Mall Road",
      "Bonfire and wildlife-education session",
      "GPS-tracked coaches and a dedicated coordinator",
      "Built for schools, colleges and large groups",
    ],
    itinerary: [
      { day: "Day 1", title: "Jhansi → Jim Corbett", activities: ["Depart Jhansi by train/coach with the group coordinator", "Arrive Corbett; resort check-in and welcome briefing", "Kosi river and Garjiya Devi temple", "Bonfire and overnight at the resort"] },
      { day: "Day 2", title: "Jeep safari & resort day", activities: ["Early-morning guided jeep safari in the reserve", "Breakfast back at the resort", "Supervised games, nature walk and swimming", "Evening wildlife-education session; overnight"] },
      { day: "Day 3", title: "Corbett → Nainital", activities: ["Drive to Nainital", "Naina Devi temple and Naini Lake", "Snow View Point and Mall Road", "Optional boating (own cost); overnight in Nainital"] },
      { day: "Day 4", title: "Nainital → Jhansi", activities: ["Breakfast and check-out", "Return journey to Jhansi with the coordinator", "Tour concludes"] },
    ],
    hotels: [
      { name: "Riverside resort, Corbett", location: "Near the reserve", nights: 2, rating: 4.3, note: "Quad-sharing for students, all meals, bonfire, pool", gradient: "linear-gradient(150deg,#2f5d50,#12332a)" },
      { name: "Group hotel, Nainital", location: "Near the lake", nights: 1, rating: 4.2, note: "Quad-sharing, all meals, walkable to the Mall", gradient: "linear-gradient(150deg,#3a5f86,#12233a)" },
    ],
    transport: [
      { mode: "GPS-tracked coach", detail: "Air-conditioned coach with the group throughout; parents can track it" },
      { mode: "Safari jeeps", detail: "Guided jeep safari in Jim Corbett included" },
      { mode: "Coordinator", detail: "A dedicated trip coordinator travels with the group start to finish" },
    ],
    inclusions: ["3 nights accommodation (quad sharing)", "All meals from Day 1 dinner to Day 4 breakfast", "GPS-tracked coach and all transfers", "One guided jeep safari in Jim Corbett", "Bonfire, wildlife-education session, coordinator, first-aid support"],
    exclusions: ["Train tickets Jhansi ↔ base (if by train)", "Boating and optional activities", "Personal expenses", "Anything not listed as included", "GST"],
    bestTime: "October to March is ideal — pleasant days and reliable safari sightings. Jim Corbett's core zones are closed during the monsoon (mid-June to mid-October); we plan around the open zones and dates.",
    weather: [
      { season: "Winter", months: "Nov – Feb", temp: "5–22°C", note: "Cool, clear, best for safari" },
      { season: "Spring", months: "Mar – Apr", temp: "15–30°C", note: "Warm, active wildlife" },
      { season: "Summer", months: "May – Jun", temp: "22–38°C", note: "Hot; good sightings near water" },
      { season: "Monsoon", months: "Jul – Sep", temp: "24–32°C", note: "Core zones closed, heavy rain" },
    ],
    mapQuery: "Jim Corbett National Park, Uttarakhand",
    faqs: [
      { q: "How is student safety handled?", a: "A dedicated coordinator travels with the group throughout, coaches are GPS-tracked so parents/school can follow, hotels are inspected before use, and a first-aid kit and 24/7 support line are in place for the trip." },
      { q: "What group size do you take?", a: "This is built for groups — schools, colleges and large parties. Pricing is per student on quad sharing; tell us your headcount and we'll tailor rooms, coaches and coordinators." },
      { q: "Can the itinerary or destination change?", a: "Yes. We run custom educational tours to many destinations and can adjust duration, stops and academic focus to your requirements." },
    ],
    minPax: "Minimum 20 students",
    pickup: "Jhansi",
    drop: "Jhansi",
  },
};

/** Packages with a full detail page today. Others fall back to the index. */
export const detailedSlugs = Object.keys(packageDetails);
