# Project Status

**Last updated:** 2026-07-22
**Current stage:** Phase 2 — premium UI/experience pass (Track A) + backend brought forward (pending credentials)
**Current module:** Phase 2 · Internal console dashboard shells — **complete** (build green, tsc + ESLint clean). Shared `DashboardShell` (sidebar/topbar) via `dashboard/(console)/` route group; new surfaces `/dashboard` (hub), `/dashboard/vendor`, `/dashboard/crm`, `/dashboard/admin` (scaffold, empty/pending states only); reusable `src/components/dashboard/*` (+ barrel re-exporting founder primitives); nav-as-data in `src/lib/dashboard/nav.ts`; loading.tsx skeletons; proxy matcher extended to also gate exact `/dashboard`. Founder dashboard left untouched. Prior: A2 primitives + 5 section scaffolds; A1 motion foundation (`6e55d9c` deployed).

**Founder vision captured:** `docs/VISION.md` — BPT as a multi-unit AI-powered Travel OS; destination-by-destination scaling (Manali→Kashmir→Ladakh→Jaisalmer→India→Intl); Hermes AI + Trip-Captain units reserved as `planned`. Architecture must stay modular/shareable across future units; keep booking/CRM/vendor logic behind clean seams for AI later; route irreversible actions through ApprovalQueue.

**Scaffold-only mode (2026-07-22):** Founder directive — build the complete UI/routes/DB-schema/CMS-collections/dashboards/booking-flow/components with clearly-marked placeholders; invent NOTHING (destinations/hotels/itineraries/prices/rules); real data supplied later. Sequencing rule to protect the LIVE site: frontend scaffolds deploy now; **Payload/DB backend stays build-isolated until `DATABASE_URL` is provided** (a half-wired backend would break `next build` and take production down). Canonical docs: `docs/BUSINESS_BLUEPRINT.md`, `docs/ARCHITECTURE_V2.md`.

**Scaffold build queue:** [done] UI primitives · [done] tour-type/section routes · [done] dashboard shells · [done] DB schema + CMS collections (build-isolated) · [done] booking-flow UI + payment-pending state (`/book`, `/api/bookings`) · [done] customer journey — booking tracking (`/track`, `/api/bookings/lookup`, `BookingStatusTimeline`) · [done] quote generation system (`/quote`, `src/lib/quote/*`, `QuoteDocumentView`) · [done] CRM & business-ops layer (`src/lib/crm/*`: unified model/lifecycle, adapters folding enquiry+booking+quote, `CrmRepository` seam, Hermes contract; `/dashboard/crm` wired to seam + reusable `PipelineBoard`) · [done] vendor management (`src/lib/vendor/*`) · [done] Hermes AI integration layer (`src/lib/hermes/*`) · [done] marketing & partnership dashboard (`src/lib/marketing/*`) · [done] email workflow architecture (`src/lib/email/*`) · [done] document management & upload architecture (`src/lib/documents/*`) · [done] Platform Validation Sprint — vendor import & validation (`src/lib/vendor-import/*`: model/source-provider/mapping/validation/duplicate/readiness/pipeline/import-repository/hermes; founder `/dashboard/vendor-import`) · [next] review collection flow · [ ] apply primitives across existing pages (A5) · [ ] A3 hero + A4 mobile polish.

**Vendor import layer (`src/lib/vendor-import`):** provider-based ingestion pipeline (fetch→map→validate→dedupe→score). NO Gmail/OCR/PDF/Payload/Neon/R2 connected — `ImportSourceProvider` manual stub only; Gmail/business-card/rate-sheet/brochure/contract/email-sync are drop-in providers. Candidates wrap `Partial<VendorRecord>` (reuse, no duplicate). Dedupe runs against the existing `VendorRepository`. `/dashboard/vendor-import` (founder, Basic-Auth-gated) shows status/duplicates/missing-fields/validation/readiness.

**Documents layer (`src/lib/documents`):** provider-driven, storage-agnostic. NO storage/DB/upload dependency. `ConsoleUploadProvider` (`stored:false`) → swap for R2/S3/GCS/Azure via `getDocumentProvider()`, no caller change. Workflows call only the `DocumentProvider` interface. Reusable by Customer/Booking/Vendor/CRM/Finance/Operations/Employee modules; Hermes seams (summary/review/extraction/reminder) ready.

**Email layer (`src/lib/email`):** console stub only — NO Resend/email dep added. Orchestrators (`workflow.ts`) are the seam routes/CRM call when email goes live; NOT wired into the stable enquiry/booking routes. Swap `getEmailProvider()` to Resend later, no caller change.

**Hermes = one shared intelligence layer** (`src/lib/hermes`): single `HermesContextProvider` contract; each module exposes context by reusing its existing repository (no per-module AI). `getHermesInsights(module?)` returns `{enabled:false}` until a model is wired (`HERMES_ENABLED=false`). Future modules (marketing/finance/operations/…) plug in by adding one provider. Reusable `HermesPanel` renders on any dashboard; critical actions gated by human approval.

**CRM = operational brain:** `src/lib/crm/model.ts` is the single vocabulary (mirrors `src/payload` schema — no duplicate models). `adapters.ts` is the integration spine (enquiry/booking/quote → one pipeline; DB ingestion reuses these). `crm-repository.ts` seam returns `live:false` until DB. `hermes.ts` is the AI contract (`HERMES_ENABLED=false`) so every module is Hermes-consumable later. CRM dashboard renders from the seam.

**Payments postponed (founder, 2026-07):** GST registration + merchant verification in progress (~1 week). Do NOT integrate Razorpay/any provider yet. All booking flows carry a **`payment_pending`** state (`src/lib/booking/status.ts`, `PAYMENTS_ENABLED=false`) so payment connects later with no journey redesign. Priorities while waiting: booking UI [done] → customer journey → quote gen → CRM workflow → vendor mgmt → Hermes AI integration points → marketing/partnership dashboard → email workflow arch → document upload flow → review collection flow. Booking journey is isolated from the untouched quick-enquiry path.

**Backend schema (build-isolated, `src/payload/`):** 19 Payload-shaped collections + RBAC access + reusable field models + `schema.ts` (consumed by a future `payload.config.ts`) + README with go-live steps. NOT installed as a dep, NOT imported by any route → zero build/prod risk. Go live when `DATABASE_URL` arrives: `npm i payload @payloadcms/db-postgres @payloadcms/next`, add payload.config.ts + `/admin`, swap each collection's `import from "@/payload/types"` → `"payload"`, point EnquiryRepository at PayloadEnquiryRepository, add AuditLogs + Globals(SiteSettings/PaymentPolicy).

## ⚠️ Production action needed by you
- **`/dashboard/founder` returns 503 in production** — the Basic Auth proxy is live but `FOUNDER_DASHBOARD_PASSWORD` is **not set** in Vercel. Add it in Vercel → Settings → Environment Variables (optionally `FOUNDER_DASHBOARD_USER`), then redeploy. Verified 2026-07-22 against https://www.bundelkhandpridetravels.com.

## Phase 2 decisions locked (2026-07-22)
- Fixed group departures leave from **Delhi** (existing Jhansi/Jammu data to be migrated). Keep the two Kashmir batches.
- Backend (Payload CMS + DB) **brought forward** for a real admin dashboard — blocked on your accounts/credentials (`DATABASE_URL` etc.).
- UI imagery: **gradient art-direction for now**; swap real licensed photos/video later (only 3 real images exist; `public/videos/*` empty).
- Track A order: A1 motion → A2 primitives → A3 hero (needs media) → A4 mobile → A5 section polish.
- Still needed from you (business data, do not invent): per-departure Date/Return/Reporting time/Transport/Hotel/Meal plan/Seats/Price/Inclusions/Exclusions; whether Corporate & Honeymoon tour types have real packages; new departures not yet in code (Manali Fri, Chopta Tungnath Deoria Tal, Madhyamaheshwar Trek, Khatu Shyam–Salasar–Jaipur).

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
