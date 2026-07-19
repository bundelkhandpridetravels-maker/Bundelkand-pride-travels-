# Bundelkhand Pride Travels — Design System

## Sources
No codebase, Figma file, slide deck, or brand asset (logo, photography, existing style
guide) was attached to this project. Everything below is originated from a single text
brief describing the brand and product vision (Bundelkhand Pride Travels — a premium,
AI-ready Indian travel marketplace covering holiday packages, hotels, flights, buses,
cabs, and a CRM/agent back office). There is no pre-existing visual identity to recreate
from, so this system is a from-scratch, ground-up design language built to the brief's
direction (bright/welcoming, not dark-luxury) rather than a recreation of any real
product. If a codebase, Figma link, brand guide, logo, or photography exists, attach it
and this system should be reconciled against it.

## Brand
- **Name:** Bundelkhand Pride Travels
- **Tagline:** Discover More. Travel Better.
- **Industry:** Premium travel & tourism marketplace (India-focused: Himachal, Kashmir,
  Uttarakhand, Rajasthan, Goa, North East, Madhya Pradesh heritage circuits, treks,
  spiritual tours, and international/corporate/group travel)
- **Personality:** Premium, safe, trustworthy, friendly, modern, tech-driven, reliable,
  adventure-focused — bright and welcoming rather than dark/moody luxury.
- **Benchmarks (quality bar, never to be visually copied):** Airbnb, Booking.com,
  MakeMyTrip, Agoda, Klook, RedBus, Trip.com, Apple.
- **Logo:** none supplied. Do not invent one — wherever a mark would go, the wordmark
  "Bundelkhand Pride Travels" renders in `--font-display` (see `assets/wordmark.svg`).
  If a real logo exists, drop it into `assets/` and swap the reference in
  `components/navigation/Navbar.jsx`.

## Product surfaces covered in this pass
Given the brief's enormous scope (dozens of modules: package marketplace, hotel/flight/
bus/cab booking, visa, insurance, B2B agent portal, full CRM, five dashboards…), this
first pass prioritizes the highest-value, most conversion-critical surface end to end:

1. **Foundations** — full color/type/spacing/radius/shadow/motion token system, iconography.
2. **Core component library** — the primitives every surface above will reuse.
3. **Marketing marketplace UI kit** — homepage, package listing (search/filter/browse),
   package detail (booking-ready), and the enquiry/booking modal — the customer-facing
   funnel described in "Booking Experience" and "Upcoming Departures."

**Not yet built** (flagged, not forgotten): Hotel/Flight/Bus/Cab dedicated booking flows,
Visa/Insurance pages, B2B agent portal, and the five internal dashboards (Customer,
Agent, Admin, Sales, Operations, Finance) with their CRM/lead/quotation/invoice tooling.
The component library and tokens are built generically enough to extend into all of
these — see "Intentional additions" below for what would need to be added first
(data-table, chart primitives, timeline).

## Intentional additions
No source defined a component inventory, so per the from-scratch path this system
authors a standard travel-marketplace primitive set: Button, IconButton, Badge, Tag,
Input, Select, Textarea, Checkbox, Radio, Switch, Card, Tabs, Accordion, Modal, Toast,
Tooltip, Rating, Avatar, PriceBlock, SeatsLeftMeter, CountdownTimer, PackageCard,
DepartureCard, Navbar, Footer, SearchBar/BookingWidget — sized to what the marketing
funnel and future booking/CRM surfaces will need.

## Index
- `styles.css` — root stylesheet, imports everything under `tokens/`.
- `tokens/` — colors, typography, spacing, radius, shadows, motion.
- `guidelines/` — foundation specimen cards (Design System tab "Foundations"/"Type"/
  "Colors"/"Spacing"/"Brand"/"Icons" groups).
- `assets/` — wordmark, placeholder photography treatment, icon reference.
- `components/` — reusable primitives, grouped by concern:
  - `components/core/` (`Button.jsx`, `Badge.jsx`, `RatingAvatar.jsx`) — Button,
    IconButton, Badge, Tag, RatingStars, Avatar
  - `components/forms/` (`TextFields.jsx`, `Toggles.jsx`) — FieldLabel, Input, Textarea,
    Select, Checkbox, Radio, Switch
  - `components/feedback/` (`Overlays.jsx`) — Modal, Toast, Tooltip
  - `components/layout/` (`CardTabsAccordion.jsx`) — Card, Tabs, Accordion
  - `components/navigation/` (`NavFooter.jsx`) — Navbar, Footer
  - `components/travel/` (`TravelCards.jsx`, `PriceMeterCountdown.jsx`,
    `BookingWidget.jsx`) — PackageCard, DepartureCard, PriceBlock, SeatsLeftMeter,
    CountdownTimer, BookingWidget
- `ui_kits/marketing/` — Homepage, Package Listing, Package Detail, Enquiry Modal
  (`index.html` is the click-through demo).
- `SKILL.md` — portable skill wrapper for use in Claude Code.

## Content fundamentals
No copy samples were supplied, so this is the intentional voice for the system,
derived from the brand personality brief (premium, safe, trustworthy, friendly,
tech-driven, adventure-focused) and the conversion goals of the funnel.

- **Address the traveler as "you."** Never third person ("guests," "users"). Instructions
  are direct and warm: "Save this trip," "Reserve your seat," "Tell us your dates."
- **Confident, short sentences over long persuasive copy.** Headlines state the trip,
  not a sales pitch: "Manali, sorted." "Kashmir in winter, the easy way." Subheads carry
  one supporting fact, not three.
- **Lead with the concrete, not the abstract.** "5N/6D · Delhi to Delhi · Private cab"
  beats "An unforgettable journey awaits." Price, duration, and route always outrank
  mood copy in hierarchy.
- **Urgency is factual, never manipulative.** "6 seats left for the Friday departure" is
  fine; invented scarcity ("Only 1 left!!" on every card) is not. One honest urgency
  signal per card, not stacked.
  Example: `Book with ₹3,000 advance · 6 seats left · Departs Fri, 18 Jul`
- **Sentence case for headings and buttons**, not Title Case: "Explore Kashmir packages,"
  button label "Reserve seat" not "Reserve Seat." Product/place names keep their own
  capitalization (Manali, Spiti, Golden Triangle).
- **Numerals are always digits, never spelled out**, and prices always carry the ₹ symbol
  and thousands separators: ₹13,000, not "Rs 13000" or "thirteen thousand."
- **No emoji in UI chrome** (buttons, nav, form labels). Emoji are acceptable only inside
  informal, human-authored contexts — e.g. a WhatsApp confirmation message string — never
  in the product's own type.
- **Reassurance language is specific, not generic.** Prefer "Pay ₹3,000 now, rest before
  departure" over "100% safe & secure." Trust is built with clear terms, not badges of
  adjectives.
- **Errors and empty states are helpful, not apologetic.** "No packages match these
  filters yet — try widening your dates" rather than "Oops! Something went wrong."

## Visual foundations
- **Color:** Bright and welcoming, not dark-luxury. Sky/Ocean Blue (`--color-primary`) is
  the brand anchor — used for links, primary navigation, and trust elements (verified
  badges, secure-payment notes). Navy (`--color-secondary`) is reserved for footer, dark
  section bands, and high-contrast text — it is depth, not gloom. Sun Yellow
  (`--color-energy`) marks energy/urgency (seats-left chips, "New" tags) but never carries
  body text (fails contrast on white). Orange is the single conversion color — every
  primary "Book Now" / "Reserve Seat" CTA is orange, so it never competes with itself.
  Coral is reserved for the wishlist heart only. Gold appears exclusively on
  premium/luxury package labels — treat it as a rare accent, not a palette regular.
- **Backgrounds:** Warm white (`--surface-page`, #FFFCF6) everywhere by default — never
  stark #FFFFFF as a page canvas (that reads clinical/cold). Cards sit on raised pure
  white to separate from the warm page. Dark navy bands are used sparingly for footer and
  1 hero treatment max per page — never stacked dark sections back to back.
  Photography is full-bleed in hero and card-cover contexts, always with a soft navy
  gradient scrim at the bottom third when text overlays it (never a flat dark overlay
  across the whole image — keep the photo bright and legible).
  No repeating textures/patterns; no hand-drawn illustration style — this brand is
  photography-led (per brief: "large photography").
- **Imagery mood:** Warm, saturated, daylight-lit travel photography — golden-hour
  mountains, bright bazaars, clear lakes. Never black & white, never desaturated/moody
  grain. Because no photography was supplied, placeholders use warm gradient blocks
  (sky→gold or navy→sky) with a destination label, sized to real photo aspect ratios
  (4:3 cards, 21:9 hero) — swap in real photography before shipping.
  Placeholder gradient: `linear-gradient(135deg, var(--sky-400), var(--yellow-300))`.
- **Typography:** Sora for display/headings (geometric warmth, confident at large sizes),
  Work Sans for body/UI (humanist, legible small). Headings are set tight
  (`--tracking-tight`, `--leading-tight`); body is generous (`--leading-relaxed`) for
  itinerary and policy copy that runs long. Overline/eyebrow labels (category tags above
  headings) use `--tracking-wider` + uppercase + `--text-xs`.
- **Spacing & layout:** Generous whitespace throughout — section padding starts at
  `--space-16`/`--space-24`, never below `--space-8` at the page-section level. 12-column
  grid, `--container-max` 1280px for content, `--container-wide` 1440px for
  browse/listing grids. Mobile-first: single column below 768px, cards become
  horizontal-scroll rails on mobile rather than cramming a grid.
- **Radius:** Soft throughout — 12–16px on cards, full pill (999px) on tags, chips, and
  every button. No sharp corners anywhere; this is a friendly-premium brand, not an
  austere one.
- **Shadows:** Soft, warm-tinted (navy at low opacity, never pure black) — cards use
  `--shadow-sm`/`--shadow-md` at rest. Hover raises to `--shadow-lg` with a `translateY(-2px)`
  lift. Primary CTAs get a colored glow shadow on hover (`--shadow-glow-cta`,
  orange-tinted) rather than a darker fill alone — reinforces the single conversion color.
- **Borders:** 1px `--border` on inputs and outline-variant components; cards on the
  warm page background lean on shadow alone (no border) to avoid a "boxed-in" feel;
  cards inside a white panel add a subtle `--border-subtle` since shadow contrast drops.
- **Motion:** Quick and friendly, never sluggish (`--duration-base` 200ms standard ease).
  A small spring/bounce (`--ease-bounce`) is reserved for delight moments only: the
  wishlist heart popping, a seat-reserved confirmation check. Everything else (hover,
  modal open, tab switch) uses standard ease — bounce everywhere would feel toy-like for
  a "premium" brand.
- **Hover states:** Buttons darken one step (`--color-cta-hover`) and lift with a glow
  shadow; cards lift + shadow deepens; links underline on hover (never underlined at
  rest, matching Content Fundamentals' clean-headline approach).
- **Press/active states:** Scale to 0.98 + darken to the `-active` color step — a tactile
  "pressed" feel appropriate for a booking flow where every tap matters.
- **Transparency & blur:** Used only for the sticky booking bar on package-detail pages
  (frosted `backdrop-filter: blur(12px)` over photography) and for modal scrims
  (`rgba(navy, 0.5)`). Not used decoratively elsewhere.
- **Focus states:** Visible 3px sky-blue ring (`--focus-ring`) on every interactive
  element, offset from the border — WCAG AA, never suppressed.

## Iconography
No icon assets, icon font, or SVG sprite were supplied. This system uses **Phosphor
Icons** (regular weight, 1.5px-equivalent stroke) via CDN as a documented substitution —
its geometric-friendly line style matches the Sora/Work Sans pairing better than a
sharper set like Feather. Load via
`<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>` and use
`<i class="ph ph-airplane-tilt"></i>`-style classes (see `assets/icon-reference.html`
for the exact glyph set this system relies on — planes, buses, mountains, calendar,
seats, WhatsApp, phone, heart, star, map-pin). Weight is fixed at **regular** everywhere
except active/selected nav states, which use **fill**, to signal state without adding
color. Icons are always paired with a text label in navigation and buttons — never
icon-only except inside a fixed-size 40px tap target (share, wishlist, close). No emoji
are used as icon replacements anywhere in the product chrome.
