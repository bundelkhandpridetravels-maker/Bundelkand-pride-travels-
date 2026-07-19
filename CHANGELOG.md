# Changelog

All notable changes to this project are logged here, most recent first.

## 2026-07-18 (Module 11 — catalogue complete: all 12 packages have detail pages)

- Added full `PackageDetail` content for the last three: **Manali + Kasol**, **Shimla + Manali** (family-paced), and the **Jim Corbett + Nainital school tour** (with student-safety FAQs, GPS-tracked coach, per-student quad-sharing model).
- **Every one of the 12 packages now has a real detail page** — no card dead-ends at `/contact` anymore. All 12 prerender as static HTML (29 pages total), each with its own itinerary, hotels, transport, inclusions/exclusions, weather, FAQs, pickup/drop, structured data, canonical and booking flow.

## 2026-07-18 (Module 10 — five flagship package detail pages)

- Wrote full `PackageDetail` content for **Goa, Kerala, Andaman, Darjeeling & Gangtok, and Leh Ladakh** — real day-by-day itineraries, hotels, transport, inclusions/exclusions, best-time + weather tables, destination-specific FAQs, pickup/drop, and galleries. Goa carries the corrected **Goa / Goa** pickup-drop; Leh includes an explicit acclimatisation plan and altitude FAQs.
- The `/packages` index now links these straight to their detail pages instead of `/contact`; each gets its own TouristTrip + FAQ + Breadcrumb JSON-LD, canonical, OG and sitemap entry automatically via the shared template. Only Manali+Kasol, Shimla+Manali and the bespoke Corbett school tour still route to enquiry.
- **Verified:** build green — all **9 package pages prerender as static HTML** (26 prerendered pages total); tsc + ESLint clean; new routes return 200 with full content.

## 2026-07-18 (Module 9 — form-first booking system, pickup/drop, motion, QA)

**Booking flow (WhatsApp demoted to secondary, per instruction)**
- New **form-first booking system**. "Book now" / "Reserve your seat" open a professional modal collecting name, phone, email, city, adults, children, preferred date, package (prefilled), budget range and special requirements. WhatsApp + Call remain as secondary support actions.
- **One typed submission path** (`src/lib/enquiry.ts`, Zod-validated) → `/api/enquiries` route → `EnquiryRepository` interface (`src/lib/enquiry-repository.ts`). Default logs a structured, id-stamped, attribution-carrying record (`source`, `packageSlug`, `campaign`); swapping in Payload/Neon touches only the repository, never the UI. Verified end-to-end: valid POST → 201 + id, invalid → 422 + field errors.
- `BookingProvider` mounts one modal app-wide; `BookNowButton` + `MobileBookingBar` (sticky, thumb-reachable on mobile) trigger it. The `/contact` form now posts through the same path with an inline success state.

**Data corrections**
- Added `pickup`/`drop` to every package (cards + detail + booking). **Goa → Goa / Goa** as instructed. Kashmir kept ex-Srinagar round-trip (coherent with its fly-in itinerary) — the "Jammu package" is flagged for a decision rather than guessed (see note below).
- **Jaisalmer departures now launch 13 October, then every Friday**, generated dynamically in `src/lib/departures.ts` (renders OCT 13 → OCT 16, 23, 30, NOV 6…) and rolls to next season automatically.

**Motion (Framer Motion added)**
- Animated stat counters (`CountUp`) on hero, why-us and about; modal spring/fade; `Reveal` scroll primitive. All reduced-motion-safe; pages stay server-rendered with client leaves only.

**Quality gate**
- `next build` green — 24/25 pages prerendered static/SSG, `/api/enquiries` the one intended dynamic route.
- TypeScript clean. **ESLint clean (0 problems)** — excluded the read-only `_design-reference/**` bundle from linting (it was the source of 47 phantom errors), fixed real issues in `CountUp`, `JsonLd`, package-page entities, and justified three client-only mount effects.

## 2026-07-17 (Module 8 — FIT vs Group Departures business-model correction + catalogue expansion)

**Business model (important correction)**
- Added `tourType: "fit" | "group"` to every package. **FIT (private, customisable, flexible-date) is now the primary presentation** — Manali Volvo, Kashmir, Goa, Kerala, Andaman, Leh Ladakh, Darjeeling & Gangtok, Manali+Kasol and Shimla+Manali are all labelled "Private tour", not group departures.
- **Group departures are now only intentionally scheduled tours**: the Jaisalmer Desert Weekend (2N/3D, every Friday, season opens after 15 September) plus the two hand-scheduled Kashmir batches (Oct 13, Dec 28).
- **Jaisalmer Fridays are generated, not hand-listed** — `src/lib/departures.ts` computes upcoming Fridays after the season opens (first: SEP 18), rolls over year-to-year, and feeds both the homepage board and `/group-departures`. Adding future recurring tours = one function call, no data edits.
- Fixed a testimonial that described Manali+Kasol as a "Friday group departure".
- `/packages` now opens with a Private-tours vs Fixed-departures explainer; `/group-departures` cross-links FIT packages explicitly.

**Catalogue & pricing**
- Expanded to 12 packages: added **Goa (3N/4D ₹10,999)**, **Darjeeling & Gangtok (5N/6D ₹16,999)**, **Kerala (5N/6D ₹18,999)**, **Andaman (5N/6D ₹24,999)**, **Leh Ladakh (5N/6D ₹21,999)**, **Jaisalmer (2N/3D ₹8,999)**.
- Repriced existing packages to the supplied indicative market rates, all per-person "starting from": Manali Volvo ₹9,999 (now 5N/6D), Kashmir ₹15,999 (now 5N/6D).
- Extended itineraries to match: Kashmir gained a Sonmarg day + Pahalgam night; Manali Volvo gained Kullu/Manikaran and Naggar days (3 hotel nights + 2 Volvo nights).
- **New full detail page: `/packages/jaisalmer`** — fort, Sam dunes camel safari, desert-camp Swiss tents, folk night, season weather table, group-departure FAQs.
- Destination cards re-synced to the new pricing.

**Verified:** tsc clean; all routes 200; board shows generated Fridays (SEP 18, 25, OCT 2, 9) + fixed batches; Manali absent from the group board; new pricing renders.

## 2026-07-16 (Module 7 — accessibility & performance pass)

**Accessibility (WCAG AA)**
- Measured contrast on all 16 color pairs the design system uses. Three failed AA for the small mono labels they're applied to. Fixed at the token level:
  - `--color-muted` #8c8672 → **#716d5c** (3.28:1 → 4.68:1 on paper)
  - `--color-gold-dim` #8a6e34 → **#846a32** (4.34:1 → 4.63:1 on paper)
  - Both stay in the same warm family; every other pair already passed (most 6–17:1).
- Contact form now announces validation errors via an `aria-live="assertive"` region and moves focus to the first invalid field — previously errors were visual-only.
- Verified structurally: exactly one `<h1>` per page (all 11 routes), all landmarks present (`header`/`nav`/`main`/`footer`), `lang="en"`, every form control labelled, 44 decorative SVGs marked `aria-hidden`, icon-only nav button has `aria-label`.

**Performance**
- Switched all three fonts (Fraunces, Manrope, JetBrains Mono) to **variable-font mode** — removed the explicit weight arrays. Audit showed weights 800/900 were downloaded but used zero times. next/font now serves one variable file per style instead of a static instance per weight; preloaded Latin payload is ~143 KB across 4 files.
- Confirmed all content is prerendered **static/SSG** (23/23) — no per-request server work, the foundation for the Lighthouse 95+ target.

**Responsive**
- Audited every grid and table: all 4+ column grids are breakpoint-guarded (mobile-first `grid-cols-1/2` bases), and both wide data tables are wrapped in `overflow-x-auto`. No horizontal-overflow risks.

- **Verified:** `tsc --noEmit` clean; production build green (23/23 static); AA tokens confirmed in served CSS; aria-live confirmed in rendered form.

## 2026-07-16 (Module 6 — structured data, integration-readiness, deployment docs)

- **Structured data (JSON-LD)** across the site, validated as parsing correctly: `TravelAgency` + `WebSite` (root), `TouristTrip` + `FAQPage` (packages), `TouristDestination` (destinations), `Article` (journal), `BreadcrumbList` (all detail pages).
  - Deliberately **omitted `aggregateRating`** — the star ratings are placeholder values, and fake review schema is a direct Google penalty. Documented in `docs/BUSINESS_DATA_NEEDED.md`.
- **Canonical URLs** on all 12 routes, plus `robots` directives and `en_IN` locale on OG tags.
- **Domain de-duplicated** into `src/lib/site.ts` — the production URL was hardcoded in three files (`layout.tsx`, `sitemap.ts`, `robots.ts`), which is how domains drift. Now one constant, imported everywhere. Confirmed as `https://www.bundelkhandpridetravels.com`.
- **Instagram-ready gallery**: added `src/lib/social.ts` adapter (`getSocialPosts()` → `SocialPost[]`). The Gallery component now consumes the adapter instead of hard-coded tiles — connecting the Graph API later touches one file, no component changes.
- **Documentation**: `docs/DEPLOYMENT.md` (local dev, GitHub workflow, Vercel deploy, GoDaddy DNS records, env vars, analytics, Search Console, how to add packages/articles, future backend) and `docs/BUSINESS_DATA_NEEDED.md`.
- **Google Business Profile: not accessible.** No GBP connector exists in the registry and none is connected. Per instruction, no business data was invented — gaps are catalogued instead.
- **Verified:** build green (23/23 static), `tsc --noEmit` clean, all JSON-LD parses, canonicals resolve to the production domain.

## 2026-07-16 (Module 5 — group departures, journal, about, SEO plumbing)

- **`/group-departures`** built for real (replacing the placeholder): full departures board with status pills, "how group trips work" explainer, and a private-group CTA.
- **Journal** is now a real blog: `/journal` index plus `/journal/[slug]` article template with three complete, genuinely useful articles written in the brand voice — *Best time to visit Kashmir, month by month*, *What to actually pack for a Himalayan trek*, and *Planning a school tour: a coordinator's checklist*.
- **`/about`** page: brand promise, real stats, mission/vision/promise, what-we-do pillars, and pan-India positioning ("our name is local, our map isn't").
- **SEO plumbing**: `sitemap.ts` (auto-generates all 18 URLs from the data files — new packages/destinations/posts appear automatically) and `robots.ts`.
- Final `/#about` anchors in nav and footer repointed to the real `/about` page — no dead links remain anywhere in the site.
- **Verified:** `tsc --noEmit` clean; all 16 routes + `/sitemap.xml` + `/robots.txt` return HTTP 200.

## 2026-07-16 (Module 4 — destination pages + legal)

- **Destination landing pages** (`/destinations` + `/destinations/[slug]`) with every requested element: overview, best time to visit, attractions grid, activities, hotels, weather table, team travel tips, gallery, and related packages. Full guides written for **Kashmir, Manali and Kerala**; the index lists all six and routes the rest to enquiry.
- **Destinations index** (`/destinations`) — editorial cards with rating, duration and starting price.
- **Legal pages**: `/privacy-policy` and `/terms-conditions`, written to reflect how the business actually operates (supplier-dependent cancellation terms, PCI-safe payment handling, DPDPA-aligned data practices). Both were previously dead footer links.
- **Link integrity pass**: hero destination cards, navbar and footer now point at real routes instead of `/packages` catch-alls and dead `#` anchors.
- **Verified:** production build green — 15/15 pages prerendered static/SSG; `tsc --noEmit` clean; all 12 routes return HTTP 200.

## 2026-07-16 (Module 3 — full homepage + package pages + contact)

- **Homepage complete.** All twelve sections live and verified: hero, why-us (with real company stats, mission & vision), travel categories, featured packages, departures board, testimonials, AI-planning teaser, travel gallery, journal, FAQ, newsletter, footer.
- **Wired the official company profile** into `src/data/company.ts` as a single source of truth — real metrics (9,000+ travellers, 1,000+ tours, 20+ destinations, 24×7 support), tagline, mission, vision, promise, six "why choose us" pillars, contact details. Replaced the placeholder "500+ travellers" stat.
- Adopted **"Open the World Close to You"** as the customer-facing brand promise (footer/contact), with "plans like an engineer, cares like family" as the supporting descriptor.
- **Package detail template** (`/packages/[slug]`) with every requested element: cinematic hero, asymmetric destination gallery, highlights, day-by-day itinerary timeline, hotel cards, transport, inclusions/exclusions, map link, best-time + weather table, reviews, trip FAQs, **sticky booking panel** (CSS-only), and related packages. Full detail content for Kashmir Romance, Manali Volvo and Chopta Tungnath.
- **Packages index** (`/packages`) replaced the placeholder with a real filterable-ready catalogue.
- **Contact page** (`/contact`) with an accessible inquiry form (client-side validation, WhatsApp hand-off). Backend POST → CRM/email/Sheets remains Phase 1B.
- Fixes: corrected the Instagram handle to the real `@bundelkhand_pridetravels` (and linked it); removed misleading 01–06 numbering from the non-sequential "why us" pillars.
- **Verified:** `tsc --noEmit` clean; `/`, `/packages`, all three package detail routes, `/contact`, `/group-departures` all return HTTP 200 with no console or render errors.

## 2026-07-15 (Module 2 — frontend build begins: scaffold + cinematic hero)

- Scaffolded the production app: **Next.js 16.2.10 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4**. Implemented the approved "departures board" design system as real Tailwind v4 `@theme` tokens (ink/gold/pine palette) and wired premium typography via `next/font` — **Fraunces** (display serif italic), **Manrope** (sans), **JetBrains Mono** (ticket-style data).
- Built the **cinematic hero module** as reusable components:
  - `IntroAnimation` — aircraft-flythrough opening (~2.8s), skippable (button/click/key), plays once per browser via `localStorage`, auto-skipped for `prefers-reduced-motion`.
  - `HeroBackground` — **video-ready** looping background with a graceful crossfading Ken Burns gradient fallback; respects reduced-motion, Save-Data, and slow connections. Real footage drops into `/public/hero` with zero code changes (see `public/hero/README.md`).
  - `SmartSearch` — glassmorphism floating panel (destination / month / budget / travellers).
  - `FeaturedDestinations` — six premium destination cards (price, duration, rating) with hover motion.
  - `Hero` — composes the above with headline "Explore India with confidence.", subheadline, dual CTAs, and trust stats.
- Added `Navbar` (transparent-over-hero → solid on scroll, mobile menu), `Footer`, and on-brand `/packages` + `/group-departures` placeholder pages so no CTA 404s.
- SEO metadata + `viewport` (theme-color, OpenGraph/Twitter) set in the root layout with pan-India positioning.
- Added `.claude/launch.json` (dev server config), renamed package to `bundelkhand-pride-travels`.
- **Verified locally:** dev server boots, `/` returns HTTP 200, zero console errors, correct fonts/tokens/DOM (6 hero scenes, 6 featured cards, 4 search fields), intro dismisses cleanly with no scroll-lock leak.

## 2026-07-15 (Module 1 refinement — final UI/UX review)

- Refined homepage wireframe per product-vision feedback: cinematic full-bleed hero media treatment (poster-first, desktop-only ambient video), pan-India brand positioning ("Premium travel experiences across India"), new **AI trip planning "Coming Soon" section with waitlist capture**, Google Reviews rating badge on the reviews section.
- Published new **package detail page wireframe**: cinematic hero with in-hero Google rating, Airbnb-pattern asymmetric gallery, highlights grid, day-wise itinerary timeline, inspected-hotel cards, transport card, map + season/weather strip, trip-specific reviews, FAQ, sticky booking panel (bottom bar on mobile), related packages.
- Recorded PM recommendations and trade-offs (video hero performance, Google Reviews API licensing, map embed weight) for decision before Module 2.

## 2026-07-15

- Corrected project branding throughout: the company is **Bundelkhand Pride Travels**, not "Empire Travels" (an earlier naming error). Renamed project folder, both architecture docs, and the published design-system artifact.
- Finalized brand tagline: **"Plans like an engineer. Cares like family."**
- Published homepage wireframe artifact, annotated with the psychological rationale for every section (hero, search, popular destinations, featured packages, why choose us, travel categories, upcoming group departures, customer reviews, Instagram/social proof, travel inspiration, FAQ, newsletter, footer).
- Published design system artifact: ink-navy/gold/pine "departures board" visual identity — color palette, typography, buttons, forms, cards, tags, elevation/radius scale, grid system, motion principles.
- Wrote `docs/SITEMAP.md`.
- Set up `PROJECT_STATUS.md`, `ROADMAP.md`, `TODO.md`, `CHANGELOG.md` for ongoing project tracking.
- Confirmed Node.js v24.18.0 / npm 11.16.0 are installed (not yet on shell PATH by default).
- Reordered Phase 1: frontend/design work now precedes backend/CMS work per updated direction — no backend, CRM, payment, or API logic until the frontend is built and approved against realistic dummy data.

## 2026-07-15 (earlier)

- Extracted the company's existing homepage bundle (`_design-reference/`) as a read-only reference — layout/content patterns only, not reused as code or visual identity.
- Approved full Phase 1 architecture: Next.js 15 + Payload CMS 3 (embedded) + Neon Postgres + Cloudflare R2 + Resend + Vercel, via formal plan-mode review (`docs/architecture.md`).
- Approved Security Architecture: RBAC (Admin/Sales active, Vendor/Customer schema-ready), audit logging, rate limiting (Upstash) + bot protection (Turnstile), payment security (Razorpay hosted checkout), AI human-in-the-loop `ApprovalQueue` model (`docs/security-architecture.md`).
