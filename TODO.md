# TODO

## Done

- [x] Scaffold Next.js + TypeScript + Tailwind
- [x] Design system tokens (Tailwind v4 `@theme`) + `next/font` typography
- [x] Cinematic hero (intro animation, video-ready background, smart search, featured cards)
- [x] Full homepage — 12 sections
- [x] Official company profile wired in as single source of truth
- [x] Package catalogue + package detail template (3 packages fully written)
- [x] Destination index + destination guide template (3 guides fully written)
- [x] Contact page + inquiry form (WhatsApp hand-off)
- [x] Privacy policy + terms & conditions
- [x] Link integrity pass (no dead nav/footer links)
- [x] Production build green — 15/15 static pages

## Frontend remaining

- [x] Real `/group-departures` board page
- [x] `/about` page
- [x] `/journal` index + `/journal/[slug]` post template (3 articles written)
- [x] `sitemap.ts` + `robots.ts`
- [ ] Detail content for remaining packages: manali-kasol, shimla-manali, corbett-nainital
- [ ] Detail content for remaining destinations: goa, rajasthan, andaman
- [ ] Extract shared UI primitives (button, card, pill) — markup now repeated across ~8 files
- [ ] Responsive pass on real devices (layouts are mobile-first but untested on hardware)
- [ ] Accessibility audit (keyboard nav, focus order, contrast, alt text)
- [ ] Performance pass — Lighthouse 95+ target; audit font weights (Fraunces ships 5 weights × 2 styles — likely trimmable)
- [ ] JSON-LD structured data (TouristTrip / Article schema)

## Needs you

- [ ] **Confirm the real domain** — code assumes `www.bundelkhandpridetravels.com` in `sitemap.ts`, `robots.ts`, `layout.tsx`
- [ ] Verify public stats are accurate (9,000+ travellers, 1,000+ tours, 3+ years) — now live claims
- [ ] **Legal review of `/privacy-policy` and `/terms-conditions`** before launch
- [ ] Licensed hero footage → `/public/hero` (optional; fallback works)
- [ ] Decision: Google Reviews live API vs. curated testimonials
- [ ] Decision: map link (current, light) vs. interactive embed (heavier)

## Phase 1B (backend) — not started, needs your accounts

- [ ] Payload CMS install/config + collections/globals
- [ ] Inquiry pipeline (POST → Payload + Resend email + Google Sheets)
- [ ] Rate limiting (Upstash) + bot protection (Turnstile)
- [ ] Analytics (PostHog, Vercel) + monitoring (Sentry)

## Later phases — do not start early

- [ ] Auth, Vendor/Customer login activation
- [ ] Live Razorpay checkout · Live WhatsApp Cloud API · n8n automations
- [ ] Turborepo conversion
- [ ] AI agents / ApprovalQueue
