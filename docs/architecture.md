# Bundelkhand Pride Travels — Phase 1 Architecture (AI-Powered Travel Operating System)

## Context

This is the public-facing Phase 1 of what will grow into a full Travel Operating System — CRM, vendor/customer dashboards, AI agents, booking engine — for Bundelkhand Pride Travels' domain, registered on GoDaddy. The existing Bundelkhand Pride Travels site (`_design-reference/`, read-only) is the company's real prior homepage — hand-built HTML with no backend, no CMS, and no data model. Its layout/UX patterns and brand name carry forward; the implementation itself does not — none of it is reused as-is. Everything below is designed so Phase 1 (marketing site + CMS + lead pipeline) never has to be rebuilt when CRM, vendor portals, and AI agents are added later — only extended. Security is a first-class part of that: see [security-architecture.md](./security-architecture.md) for the full threat model, RBAC design, and AI safety model this architecture is built on.

## Tech Stack (final)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript, RSC) | Best-in-class SEO/perf, pairs natively with Vercel, huge ecosystem, future Vercel AI SDK support |
| CMS / Backend | **Payload CMS 3** (embedded *inside* the Next.js app) | TS-native, mounts directly at `/admin`, auto-generates a non-dev admin UI from collection configs, stores content in the *same* Postgres DB as everything else — so future CRM/Bookings can join against Packages/Customers without syncing two systems |
| Database | **Neon Postgres** (serverless) | Scales to zero, branches per Vercel Preview deployment, encrypted at rest, point-in-time recovery |
| File storage | **Cloudflare R2** | S3-compatible, zero egress fees, wired via Payload's S3 storage plugin |
| Email | **Resend** + React Email | Modern DX, great deliverability, templates as React components |
| Auth / RBAC | **Payload auth**, roles `admin` / `sales` active now; `vendor` / `customer` schema present, login inactive until Phase 2 | See security-architecture.md §2 — same access-control pattern reused, not redesigned, when Vendor/Customer login activates |
| Bot protection | **Cloudflare Turnstile** on all public forms | Free, privacy-respecting, pairs naturally with existing Cloudflare (R2) usage |
| Rate limiting | **Upstash Redis** (sliding window) on public POST routes | Stops form abuse/spam without adding infra to manage |
| Error monitoring | **Sentry** | Alerting on error spikes, failed-login spikes, unhandled exceptions — added specifically for the security/monitoring requirement |
| Payments | **Razorpay** — prep only in Phase 1 | PCI-DSS Level 1 hosted checkout; we never touch raw card data (SAQ A scope) |
| WhatsApp | **Meta WhatsApp Business Cloud API** — prep only | Stub client + signature-verified webhook route scaffolded |
| Automation | **Direct API route now → n8n in Phase 2** | Inquiry → email + Sheet row today; webhook-ready for n8n later without redesign |
| Analytics | **Vercel Analytics** + **PostHog** | PostHog doubles as anomalous-traffic detection and grows into AI Analytics/Marketing |
| Hosting | **Vercel** | See comparison in the approved plan — Node runtime support for Payload admin, native Next.js integration |
| Domain | Stays registered at **GoDaddy**; DNS points to Vercel | No reason to move registrars |

## Content & Data Model (Payload collections, Neon Postgres)

- **Packages, Destinations, LandingPages, BlogPosts, Reviews** — public content, fully editable by non-developers via `/admin`
- **Inquiries** — lead capture; source/status fields double as seed data for the future CRM
- **Media** — Payload upload collection, files in R2
- **Users** — Admin/Sales accounts (role field), the only active login surface in Phase 1
- **Vendors** *(schema only in Phase 1)* — vendor profile fields exist now; row-level `vendorId` access control is written now even though no vendor logs in until Phase 2
- **Customers** *(schema only in Phase 1)* — same principle as Vendors
- **AuditLogs** *(active from day 1)* — append-only record of every Admin/Sales create/update/delete/login, via Payload hooks that automatically extend to future collections
- **Globals**: SiteSettings, Navigation, Footer

Every access-control function (who can read/write which document) is written as `(user.role, user.id, document) → boolean`, evaluated server-side on every API path — the exact pattern that CRM, Booking Engine, and the AI approval queue reuse later without modification.

## Folder Structure

```
bundelkhand-pride-travels/
├── _design-reference/         # already extracted — read-only, never imported by the app
├── docs/
│   ├── architecture.md         # this document
│   └── security-architecture.md
├── src/
│   ├── app/
│   │   ├── (site)/             # public marketing site
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── destinations/[slug]/page.tsx
│   │   │   ├── packages/[slug]/page.tsx
│   │   │   ├── landing/[slug]/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── sitemap.ts
│   │   │   └── robots.ts
│   │   ├── (payload)/admin/[[...segments]]/page.tsx
│   │   └── api/
│   │       ├── inquiries/route.ts           # Turnstile + rate limit + Zod → Payload + email + sheet
│   │       ├── webhooks/payload/route.ts     # ready for n8n subscription later
│   │       └── og/route.tsx
│   ├── collections/            # Packages.ts, Destinations.ts, Vendors.ts, Customers.ts, AuditLogs.ts, ...
│   ├── access/                 # shared role-based access-control functions, reused across collections
│   ├── globals/
│   ├── components/{ui,sections,forms}/
│   ├── lib/
│   │   ├── payload.ts
│   │   ├── email/
│   │   ├── sheets/
│   │   ├── whatsapp/            # stub, HMAC signature verification scaffolded
│   │   ├── payments/            # Razorpay stub
│   │   ├── rate-limit.ts        # Upstash wrapper
│   │   └── seo.ts
│   ├── payload.config.ts
│   └── styles/
├── public/
├── .env.example
├── next.config.ts               # security headers: CSP, HSTS, X-Frame-Options
├── package.json
└── tsconfig.json
```

**Monorepo timing:** unchanged from the approved plan — single Next.js app now, mechanical conversion to Turborepo `apps/*` + `packages/*` when the Vendor Portal (Phase 3) is built, because the module boundaries above are already clean.

## Deployment Strategy

1. GitHub repo, `main` = production
2. Vercel project linked to the repo — every PR gets a Preview deployment **and** an isolated Neon DB branch
3. Merge to `main` → automatic production deploy, SSL auto-issued, HSTS enforced
4. GoDaddy DNS points at Vercel; domain stays registered at GoDaddy
5. CI: typecheck + lint (oxlint) + `npm audit`/Dependabot + build on every PR

## What needs to come from you

Account creation and live credentials aren't something I can do on your behalf. Once Node.js is installed, I'll scaffold the full codebase — you'll separately need to create accounts for Vercel, Neon, Cloudflare (R2 + Turnstile), Resend, Upstash, Sentry, Google Cloud (Sheets service account), and later Razorpay/Meta WhatsApp, then hand me the resulting keys via `.env.local`/Vercel's dashboard.

## Development Roadmap

- **Phase 1 (this build):** Marketing site, Payload CMS, RBAC scaffolding (Admin/Sales active, Vendor/Customer schema-ready), audit logging, inquiry pipeline (email + Sheets) with rate limiting + bot protection, blog, reviews, SEO, analytics, monitoring, payment/WhatsApp prep stubs
- **Phase 2:** Activate Vendor/Customer auth on the existing schema, live Razorpay checkout, live WhatsApp integration, n8n automations, MFA for Admin
- **Phase 3:** Convert to Turborepo monorepo; Vendor Portal + Customer Dashboard as new apps sharing `packages/ui`, `packages/db`, and the same access-control functions
- **Phase 4:** AI layer — chatbot, AI Sales Assistant, AI Ops, AI Marketing — all gated by the `ApprovalQueue` human-in-the-loop model in security-architecture.md §12
- **Phase 5:** Booking engine, mobile app (Expo), partner API

## Verification

- `npm run dev` boots with no console errors
- `/admin` login works, RBAC roles restrict access as designed, creating/editing a Package works end-to-end with photos
- Submitting the inquiry form is blocked by Turnstile when automated, rate-limited on repeat submissions, and on success creates an Inquiry, sends an email, appends a Sheets row, and writes an AuditLogs entry
- `npm run build` completes cleanly; security headers present in response (CSP/HSTS/X-Frame-Options)
