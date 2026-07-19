/**
 * Cinematic media manifest — the single source of truth for every video and
 * photograph on the site.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW TO GO LIVE WITH REAL FOOTAGE (no code changes needed)
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Drop your files into the folder named below, using the exact filenames.
 *      e.g.  public/videos/goa/hero.mp4   +   public/videos/goa/hero-poster.jpg
 * 2. That's it. The <CinematicMedia> component detects the file and plays it.
 *
 * Until a file exists the component falls back — video → poster image →
 * gradient — so the site never shows a broken frame. Nothing is faked: if the
 * footage isn't there, you get the graceful fallback, not a pretend player.
 *
 * ENCODING TARGETS (important for mobile users on 4G)
 *   - 1920x1080, H.264 .mp4 + VP9 .webm, no audio track, 8–12 seconds
 *   - Seamless loop (first and last frame should match)
 *   - Target < 3 MB per clip; poster JPG < 200 KB
 */

export type ClipSource = { src: string; type: string };

export type CinematicClip = {
  /** Folder-and-file base, e.g. "/videos/goa/hero" → hero.mp4 + hero.webm */
  base: string;
  /** Poster shown before/instead of the video. */
  poster?: string;
  /** Gradient of last resort, so a missing poster still looks intentional. */
  gradient: string;
  /** Human description of the shot we want here — brief for the videographer. */
  shot: string;
  /** Set true once the real file is in place; flips the component to video. */
  ready?: boolean;
};

export type DestinationMedia = {
  slug: string;
  hero: CinematicClip;
  /** Additional b-roll for the package/destination video gallery. */
  gallery: CinematicClip[];
};

const g = {
  kashmir: "linear-gradient(155deg,#3a5f86 0%,#173a4a 45%,#0a0e1a 100%)",
  manali: "linear-gradient(155deg,#4a5a72 0%,#242f45 45%,#0a0e1a 100%)",
  goa: "linear-gradient(155deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)",
  jaisalmer: "linear-gradient(155deg,#8a6e34 0%,#3a2f1c 45%,#0a0e1a 100%)",
  kerala: "linear-gradient(155deg,#2f5d50 0%,#173a30 45%,#0a0e1a 100%)",
  ladakh: "linear-gradient(155deg,#4a5a72 0%,#1b2436 45%,#0a0e1a 100%)",
  corbett: "linear-gradient(155deg,#2f5d50 0%,#12332a 45%,#0a0e1a 100%)",
  chopta: "linear-gradient(155deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)",
  darjeeling: "linear-gradient(155deg,#3a5f86 0%,#12233a 45%,#0a0e1a 100%)",
  andaman: "linear-gradient(155deg,#1f6a7a 0%,#0c2e36 45%,#0a0e1a 100%)",
} as const;

function clip(dir: keyof typeof g, name: string, shot: string): CinematicClip {
  return {
    base: `/videos/${dir}/${name}`,
    poster: `/videos/${dir}/${name}-poster.jpg`,
    gradient: g[dir],
    shot,
    ready: false,
  };
}

export const destinationMedia: Record<string, DestinationMedia> = {
  kashmir: {
    slug: "kashmir",
    hero: clip("kashmir", "hero", "Drone rising over Dal Lake at sunrise, shikaras cutting the mirror-still water"),
    gallery: [
      clip("kashmir", "shikara", "Slow shikara glide, oars dipping, houseboats behind"),
      clip("kashmir", "gulmarg-gondola", "Gondola cabin climbing over snow-laden pines"),
      clip("kashmir", "snowfall", "Heavy snowfall settling on a chinar-lined lane"),
      clip("kashmir", "meadows", "Wind moving across Pahalgam meadows, horses grazing"),
    ],
  },
  manali: {
    slug: "manali",
    hero: clip("manali", "hero", "Drone through pine forest into the Solang valley, snow peaks beyond"),
    gallery: [
      clip("manali", "snowfall-night", "Night snowfall under warm street lamps, Old Manali"),
      clip("manali", "mountain-road", "Car POV on a winding mountain road, valley below"),
      clip("manali", "river", "Beas river rapids over rocks, long lens"),
      clip("manali", "cafe", "Steam rising from chai on a wooden cafe table, mountains in bokeh"),
    ],
  },
  goa: {
    slug: "goa",
    hero: clip("goa", "hero", "Drone pushing out over waves at golden hour, palms in foreground"),
    gallery: [
      clip("goa", "waves", "Slow-motion waves breaking on wet sand"),
      clip("goa", "sunset", "Sun dropping into the Arabian Sea, silhouetted palms"),
      clip("goa", "cafe", "Beach shack lights flickering on at dusk"),
      clip("goa", "nightlife", "Warm night market lights, people moving, shallow depth"),
    ],
  },
  jaisalmer: {
    slug: "jaisalmer",
    hero: clip("jaisalmer", "hero", "Camel caravan cresting a dune ridge, low golden sun raking the sand"),
    gallery: [
      clip("jaisalmer", "camel-safari", "Camels walking toward camera, dust and backlight"),
      clip("jaisalmer", "dunes-sunset", "Wind lifting sand off a dune edge at sunset"),
      clip("jaisalmer", "desert-camp", "Camp lanterns and tents glowing at blue hour"),
      clip("jaisalmer", "folk-dance", "Kalbeliya dancers spinning by firelight"),
      clip("jaisalmer", "night-sky", "Star timelapse over the fort silhouette"),
    ],
  },
  kerala: {
    slug: "kerala",
    hero: clip("kerala", "hero", "Houseboat drifting through palm-lined backwaters, drone following"),
    gallery: [
      clip("kerala", "backwaters", "Water rippling past the houseboat deck"),
      clip("kerala", "rain", "Monsoon rain on broad green leaves, water running"),
      clip("kerala", "tea-gardens", "Mist rolling across Munnar tea terraces"),
      clip("kerala", "houseboat", "Interior of a houseboat, sunlight through slatted windows"),
    ],
  },
  ladakh: {
    slug: "ladakh",
    hero: clip("ladakh", "hero", "Drone over Pangong Tso, impossible blue against bare mountains"),
    gallery: [
      clip("ladakh", "mountain-pass", "Prayer flags whipping at Khardung La"),
      clip("ladakh", "monastery", "Monks crossing a Thiksey courtyard at dawn"),
      clip("ladakh", "motorcycle", "Motorcycle on an empty high-altitude road, dust trail"),
      clip("ladakh", "river", "Indus river braiding through the valley floor"),
    ],
  },
  corbett: {
    slug: "corbett",
    hero: clip("corbett", "hero", "Jeep moving through dappled sal forest, dust in shafts of light"),
    gallery: [
      clip("corbett", "safari", "Jeep POV on a forest track, early morning"),
      clip("corbett", "wildlife", "Deer alert in tall grass, then bounding away"),
      clip("corbett", "forest", "Mist between tall sal trunks at first light"),
    ],
  },
  chopta: {
    slug: "chopta",
    hero: clip("chopta", "hero", "Clouds pouring over Himalayan meadows, Chandrashila ridge beyond"),
    gallery: [
      clip("chopta", "trek", "Trekkers cresting a ridge in silhouette"),
      clip("chopta", "sunrise", "Sunrise hitting snow peaks, timelapse"),
      clip("chopta", "clouds", "Fast cloud movement over rhododendron slopes"),
    ],
  },
  darjeeling: {
    slug: "darjeeling",
    hero: clip("darjeeling", "hero", "Kanchenjunga emerging from cloud at sunrise, Tiger Hill"),
    gallery: [
      clip("darjeeling", "toy-train", "Toy train rounding a bend, steam and bell"),
      clip("darjeeling", "tea-gardens", "Pickers moving through clipped tea rows"),
    ],
  },
  andaman: {
    slug: "andaman",
    hero: clip("andaman", "hero", "Drone over turquoise shallows at Radhanagar, white sand curve"),
    gallery: [
      clip("andaman", "snorkelling", "Underwater over living coral, fish scattering"),
      clip("andaman", "beach", "Palm shadows on white sand, gentle surf"),
    ],
  },
};

/** Site-wide hero reel used on the homepage when supplied. */
export const homeHeroClip: CinematicClip = {
  base: "/videos/hero/reel",
  poster: "/videos/hero/reel-poster.jpg",
  gradient: g.kashmir,
  shot: "60-90s cut of the best drone moments across all destinations, no audio",
  ready: false,
};

/**
 * Package slug → destination media folder. Several packages share a
 * destination's footage (all Manali trips draw on /videos/manali).
 */
const packageToDestination: Record<string, string> = {
  "kashmir-romance": "kashmir",
  "manali-volvo": "manali",
  "manali-kasol": "manali",
  "shimla-manali": "manali",
  goa: "goa",
  jaisalmer: "jaisalmer",
  kerala: "kerala",
  andaman: "andaman",
  "leh-ladakh": "ladakh",
  "darjeeling-gangtok": "darjeeling",
  "chopta-tungnath": "chopta",
  "corbett-nainital": "corbett",
};

/** Media for a package page, falling back to a gradient-only clip if unmapped. */
export function mediaForPackage(slug: string): DestinationMedia | undefined {
  const key = packageToDestination[slug];
  return key ? destinationMedia[key] : undefined;
}

/** Build <source> entries for a clip (webm first — smaller — then mp4). */
export function clipSources(c: CinematicClip): ClipSource[] {
  if (!c.ready) return [];
  return [
    { src: `${c.base}.webm`, type: "video/webm" },
    { src: `${c.base}.mp4`, type: "video/mp4" },
  ];
}
