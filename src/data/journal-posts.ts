/**
 * Journal article bodies, keyed by slug.
 * Card-level metadata (title, category, read time) lives in `journal`
 * in data/home.ts. Mirrors the future Payload "BlogPosts" collection.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type JournalPostBody = {
  slug: string;
  excerpt: string;
  author: string;
  published: string;
  body: Block[];
};

export const journalPosts: Record<string, JournalPostBody> = {
  "best-time-kashmir": {
    slug: "best-time-kashmir",
    excerpt:
      "Kashmir is beautiful year-round, but the valley you get in April is a completely different trip from the one you get in December. Here's how to pick.",
    author: "Bundelkhand Pride Travels",
    published: "12 July 2026",
    body: [
      { type: "p", text: "The single most common question we get about Kashmir isn't about price or hotels. It's when to go. And the honest answer is that there isn't one best month — there are four distinct valleys, and the one you want depends on what you're going for." },
      { type: "h2", text: "March to May — blossom and tulips" },
      { type: "p", text: "The Indira Gandhi Memorial Tulip Garden opens for roughly three weeks between late March and mid-April, and it's genuinely worth planning around. The almond and cherry blossom arrives just before it. Days sit around 15–20°C, evenings drop sharply, and the crowds haven't peaked yet." },
      { type: "p", text: "The catch: the tulip window moves every year with the weather, and it's short. If tulips are the reason you're going, build in flexibility and be prepared for the garden to be a week early or late." },
      { type: "h2", text: "June to August — the escape from the plains" },
      { type: "p", text: "This is peak season, and for good reason. While the rest of North India is at 45°C, Srinagar is at 30°C and Gulmarg is cool enough for a jacket in the evening. Everything is green, every road is open, and Gulmarg is at its best." },
      { type: "p", text: "The trade-off is company. Hotels are fullest and priciest, the gondola queue is longest, and Pahalgam's meadows are busy. Book earlier than you think you need to." },
      { type: "h2", text: "September to November — our quiet favourite" },
      { type: "p", text: "If you asked our coordinators to pick one window personally, most would say October. The chinars turn gold, the light goes long and clean, the crowds thin out, and the air is crisp without being cold. Photographers should stop reading and book this one." },
      { type: "h2", text: "December to February — snow, properly" },
      { type: "p", text: "Real snow, real skiing at Gulmarg, and a valley that looks like a different country. It's also genuinely cold — nights below freezing, occasional road and flight disruption, and some Pahalgam routes closed." },
      { type: "p", text: "Go in winter if snow is the point. Don't go in winter expecting to also tick off every valley — you can't, and pretending otherwise is how trips get disappointing." },
      { type: "h2", text: "So what do we recommend?" },
      { type: "ul", items: [
        "First time, want everything open: June or September.",
        "Photographers and honeymooners: October.",
        "Tulips: the first two weeks of April, with flexibility.",
        "Snow and skiing: January.",
        "Best value: late September or early March, shoulder either side of peak.",
      ]},
      { type: "p", text: "Whichever window you pick, book the houseboat night. Every single one of our travellers says the same thing about it afterwards." },
    ],
  },

  "himalayan-trek-packing": {
    slug: "himalayan-trek-packing",
    excerpt:
      "Most first-time trekkers carry too much of the wrong thing and not enough of the right thing. This is the list we actually send our Chopta and Churdhar groups.",
    author: "Bundelkhand Pride Travels",
    published: "5 July 2026",
    body: [
      { type: "p", text: "We've watched a lot of people discover, at 3,500 metres, that their brand-new shoes don't fit and their cotton hoodie doesn't dry. Packing for a Himalayan trek isn't about buying expensive gear — it's about bringing the right handful of things and leaving the rest at home." },
      { type: "h2", text: "The three things that actually matter" },
      { type: "p", text: "If you get nothing else right, get these right: your shoes, your layers, and staying dry." },
      { type: "ul", items: [
        "Trekking shoes with ankle support — worn in for at least two weeks before the trek. Not new. Not sneakers.",
        "Layers, not one thick coat. A base layer, a fleece, and a windproof outer beat any single heavy jacket.",
        "A rain shell, even in a dry month. Mountain weather doesn't consult the forecast.",
      ]},
      { type: "h2", text: "Clothing" },
      { type: "ul", items: [
        "2 quick-dry t-shirts (avoid cotton — it holds sweat and chills you)",
        "1 fleece or light down jacket",
        "1 windproof/waterproof outer shell",
        "2 pairs of trekking trousers (not jeans)",
        "3 pairs of wool or synthetic socks",
        "Thermal base layer for nights",
        "Warm hat, gloves, and a sun hat or cap",
      ]},
      { type: "h2", text: "Kit" },
      { type: "ul", items: [
        "Headtorch with spare batteries — camps have limited power",
        "1-litre water bottle (we refill along the way)",
        "Sunscreen SPF 40+ and lip balm — the sun at altitude is brutal, even when it's cold",
        "Sunglasses, ideally UV-rated",
        "Personal medication and a small blister kit",
        "Power bank — charging points are scarce and cold kills batteries",
      ]},
      { type: "h2", text: "What to leave at home" },
      { type: "p", text: "Jeans, cotton hoodies, a second pair of shoes, hair dryers, and the large suitcase. You'll carry a daypack; the rest goes in one duffel. Every extra kilo is one you notice on the ascent." },
      { type: "h2", text: "A note on fitness" },
      { type: "p", text: "Chopta and Churdhar are moderate trails, not technical climbs — but they are steady ascents at altitude. If you can walk briskly for 45 minutes without stopping, you'll be fine. If you can't yet, start four weeks out. That's genuinely all it takes." },
      { type: "p", text: "We send a trek-specific version of this list after booking, with the actual temperatures for your dates." },
    ],
  },

  "school-tour-checklist": {
    slug: "school-tour-checklist",
    excerpt:
      "Planning a trip for 45 students is a different job from planning a holiday. Here's the checklist we work through with school coordinators.",
    author: "Bundelkhand Pride Travels",
    published: "28 June 2026",
    body: [
      { type: "p", text: "A school tour has one requirement that outranks everything else: every child comes home safe, and every parent knows they will. Cost, itinerary and photos all matter — but they matter after that. This is the checklist we work through with coordinators, in the order we work through it." },
      { type: "h2", text: "Before you approach any operator" },
      { type: "ul", items: [
        "Confirm your final headcount range and the student:staff ratio your school requires",
        "Confirm the age group — it changes the destination shortlist entirely",
        "Get the dates cleared against the academic calendar and exam schedule",
        "Know your per-student budget ceiling before you ask for quotes",
      ]},
      { type: "h2", text: "Questions worth asking the operator" },
      { type: "ul", items: [
        "Who exactly travels with the group, and what are they trained for?",
        "Are vehicles GPS-tracked, and can parents see that?",
        "What's the plan if a student falls ill mid-trip? Where's the nearest hospital at each stop?",
        "Are the hotels used for school groups specifically, and have they been inspected?",
        "What is genuinely included, and what will students be asked to pay for on the ground?",
      ]},
      { type: "p", text: "That last one catches people out. A quote that excludes entry tickets and activities looks cheaper on paper and costs more in practice — and asking fourteen-year-olds to carry cash for it is nobody's idea of a good day." },
      { type: "h2", text: "Communication with parents" },
      { type: "ul", items: [
        "Send the full itinerary and hotel names in writing, well before departure",
        "Share a single emergency contact number that is answered 24/7",
        "Set expectations on phone use and daily check-in times",
        "Collect medical information and consent forms early, not the night before",
      ]},
      { type: "h2", text: "On the trip itself" },
      { type: "ul", items: [
        "Headcount at every single boarding — not just the big ones",
        "Room lists distributed to staff on arrival, not improvised in the lobby",
        "One staff member holds all documents; one holds the medical kit",
        "A fixed nightly check-in time with school and parents",
      ]},
      { type: "h2", text: "Our own standard" },
      { type: "p", text: "For every school group we run, a dedicated coordinator travels with the group, vehicles are GPS-tracked, hotels are inspected before we use them, and our support line is answered around the clock for the length of the trip. Parents can reach a human being at 2am. That's the bar — and it should be the bar you hold any operator to, including us." },
    ],
  },
};

export const journalSlugs = Object.keys(journalPosts);
