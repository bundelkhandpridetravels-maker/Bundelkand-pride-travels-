# Project Status

**Last updated:** 2026-07-16
**Current stage:** Phase 1 — Frontend Development
**Current module:** Module 9 complete — form-first booking system (backend-ready), pickup/drop, Jaisalmer departures from 13 Oct, Framer Motion. Build green (static/SSG), **tsc + ESLint both clean**.

## Open decision — the "Jammu package"

You asked for a Jammu package (pickup/drop Jammu). The current Kashmir package is a coherent Srinagar fly-in tour (flights + airport transfers, 5N/6D). Making it ex-Jammu adds two ~8-hour highway days, changing its duration and price — I won't guess those for a real trip. **Options:** (a) add a separate ex-Jammu Kashmir package (I'd suggest 6N/7D) with its own price, or (b) convert the existing one — tell me the nights/price. Goa (Goa/Goa) is already applied.

## Booking backend swap (when ready)

Enquiries flow through `src/lib/enquiry.ts` -> `/api/enquiries` -> `EnquiryRepository`. To go live: implement `PayloadEnquiryRepository` or `NeonEnquiryRepository` and swap it in `getEnquiryRepository()`. Email/WhatsApp/CRM side-effects hook into the route. No UI changes.

## What's built and working

| Route | Status |
|---|---|
| `/` | ✅ Full homepage — 12 sections |
| `/about` | ✅ Mission, vision, promise, stats, positioning |
| `/packages` | ✅ Package catalogue |
| `/packages/[slug]` | ✅ Full template — 3 of 6 packages written |
| `/destinations` | ✅ Destination index |
| `/destinations/[slug]` | ✅ Full guides — 3 of 6 destinations written |
| `/group-departures` | ✅ Real departures board + explainer |
| `/journal` | ✅ Index |
| `/journal/[slug]` | ✅ 3 complete articles |
| `/contact` | ✅ Inquiry form (WhatsApp hand-off) |
| `/privacy-policy` · `/terms-conditions` | ✅ Drafted — **need legal review** |
| `/sitemap.xml` · `/robots.txt` | ✅ Auto-generated from data files |

- **Stack:** Next.js 16.2.10 (App Router, Turbopack) + React 19 + TS + Tailwind v4
- **Build:** ✅ green — **23/23 pages prerendered static/SSG**
- **Types:** ✅ `tsc --noEmit` clean
- **Content:** all copy lives in `src/data/{company,home,packages,destinations,destination-details,journal-posts}.ts`, shaped to match the future Payload CMS collections so the backend swap is a drop-in. The sitemap auto-includes anything added there.

## Environment / gotchas

- Node at `C:\Program Files\nodejs` — **not on the default PATH**. Prepend `export PATH="/c/Program Files/nodejs:$PATH"` before npm/node.
- `npm run dev` → http://localhost:3000. First cold compile ~60s (font fetch); afterwards ~1–10s.
- `next build` takes ~2 min — run it in the background (`.logs/build.log`); it can exceed a 5-minute tool timeout.
- The in-app browser **screenshot tool times out** on pages with the hero's infinite CSS animations. Verify with `curl` + `grep`, `get_page_text`, or `javascript_tool` instead.

## Next up

1. **Deploy to Vercel + connect the domain** — the site is launch-ready; follow `docs/DEPLOYMENT.md`
2. Remaining content: 3 packages (manali-kasol, shimla-manali, corbett-nainital), 3 destinations (goa, rajasthan, andaman)
3. Extract shared UI primitives — card/button/pill markup is repeated across ~8 files (tech-debt cleanup, not blocking)
4. Real Lighthouse run in Chrome once deployed (structural/measured audit is done; an in-browser Lighthouse score needs a real Chrome, which this environment can't drive — the hero's infinite animation also times out the screenshot tool)
5. **Then** Phase 1B backend: Payload CMS, collections, inquiry pipeline

## Done in the a11y/perf pass (Module 7)

- WCAG AA contrast: fixed 3 failing token pairs (`muted`, `gold-dim`); all pairs now ≥4.5:1 for the text sizes they're used at
- Contact form: `aria-live` error announcements + focus-to-first-invalid
- Structure verified: 1 `<h1>`/page, all landmarks, labelled controls, `aria-hidden` on decorative SVGs
- Fonts: switched to variable-font mode (dropped unused weights 800/900)
- Responsive: all grids breakpoint-guarded, wide tables wrapped — no horizontal overflow
- Everything prerenders static (23/23)

## Needs you (I can't do these)

- ⚠️ **Confirm the real domain.** `sitemap.ts`, `robots.ts` and `layout.tsx` currently assume `https://www.bundelkhandpridetravels.com`. If your GoDaddy domain differs, this must change before launch — it affects SEO and OG tags.
- ⚠️ **Legal review of `/privacy-policy` and `/terms-conditions`.** I drafted them from how the business appears to operate; a human who knows your actual cancellation terms must check them.
- ⚠️ **Verify the public stats** (9,000+ travellers, 1,000+ tours, 3+ years) — live factual claims now, not placeholders.
- **Hero footage** — drop licensed MP4/WebM into `/public/hero` (see its README); gradient fallback works until then.
- **Decisions:** Google Reviews live API vs. curated testimonials · map link (current, light) vs. interactive embed.
- **Accounts** for Phase 1B (Vercel, Neon, R2, Resend, Upstash, Sentry) — I can't create accounts or handle live credentials.
