# Bundelkhand Pride Travels — Sitemap (Phase 1)

## Primary navigation

- `/` — Homepage
- `/packages` — All packages (filterable: Kashmir, Manali, Himachal, Treks, School Tours)
- `/packages/[slug]` — Package detail page
- `/destinations` — All destinations
- `/destinations/[slug]` — Destination landing page
- `/treks` — Trek-specific listing (Chopta, Churdhar, Yulla Kanda) — a filtered view of packages, not a separate content type
- `/group-departures` — Fixed-date departures board (Friday Manali/Kashmir batches, seasonal group trips)
- `/school-tours` — School & college tour packages, coordinator-focused copy
- `/journal` — Travel Inspiration (blog) index
- `/journal/[slug]` — Blog post
- `/about` — About us
- `/contact` — Contact page

## Campaign / secondary

- `/landing/[slug]` — Ad-campaign landing pages (no nav link, traffic-only)
- `/reviews` — Optional dedicated reviews page (Phase 1 stretch — homepage carousel covers this initially)

## Utility / legal

- `/privacy-policy`
- `/terms-conditions`
- `/404`

## Explicitly out of scope for Phase 1

No `/login`, `/account`, `/vendor`, `/admin` customer-or-vendor-facing routes yet — those activate in Phase 2+ per the approved architecture. `/admin` (Payload CMS) is a Phase 1B backend concern, not part of this frontend-only build.
