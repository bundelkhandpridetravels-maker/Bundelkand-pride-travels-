# Roadmap

## Phase 1 — Product Design + Frontend Development (current)

- [x] Module 0 — Architecture, security architecture, tech stack (approved)
- [ ] Module 1 — Visual identity, design system, homepage wireframe, sitemap (awaiting approval)
- [ ] Module 2 — Next.js scaffold + design system implemented as real components/tokens
- [ ] Module 3 — Homepage built with realistic dummy data
- [ ] Module 4 — Package detail page template
- [ ] Module 5 — Destination detail page template
- [ ] Module 6 — Remaining pages: about, contact, journal (blog), group departures, school tours, legal
- [ ] Module 7 — Mobile-first responsive + accessibility + performance pass (Lighthouse 95+ target)

## Phase 1B — Backend & CMS

- Payload CMS 3 embedded, Neon Postgres, Cloudflare R2 storage
- Collections: Packages, Destinations, LandingPages, BlogPosts, Reviews, Inquiries, Media, Users, Vendors (schema-only), Customers (schema-only), AuditLogs
- Inquiry pipeline: form → Payload + Resend email + Google Sheets row
- Rate limiting (Upstash) + bot protection (Cloudflare Turnstile) on public forms
- SEO (metadata, sitemap.xml, JSON-LD, OG images) + analytics (Vercel Analytics, PostHog) + monitoring (Sentry)

## Phase 2

- Activate Vendor/Customer auth on the existing schema
- Live Razorpay checkout, live WhatsApp Cloud API integration
- n8n automations
- MFA for Admin role

## Phase 3

- Convert to Turborepo monorepo
- Vendor Portal + Customer Dashboard as new apps sharing `packages/ui`, `packages/db`, and existing access-control functions

## Phase 4

- AI layer: chatbot, AI Sales Assistant, AI Ops, AI Marketing — all gated by the human-in-the-loop `ApprovalQueue` model
- Richer analytics

## Phase 5

- Booking engine
- Mobile app (Expo)
- Partner API
