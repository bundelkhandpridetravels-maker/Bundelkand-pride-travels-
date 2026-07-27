# Go-Live Readiness Report

> Generated snapshot of platform readiness (2026-07). The live version renders at
> **`/dashboard/validation`** and **`/dashboard/operations`** (founder-gated),
> computed from real introspection (`src/lib/platform`) — repository `live` flags,
> provider names and env-var presence. This doc is the human-readable companion.

Every category below is distinct: **Architecture Complete** (built, verified),
**Provider Pending** (needs a real provider implementation), **Credential
Pending** (needs an env var / account), **Business Pending** (needs founder data).

## ✅ Architecture Complete (built, deployed, verified)

| Layer | Modules |
|---|---|
| Customer | Booking journey · Payment-pending state · Booking tracking · Quote generation · Review collection |
| Business | CRM brain · Vendor management · Vendor import · Marketing & partnerships |
| Platform | Hermes AI contract · Document management · Email workflows · Payload-style schema · Repository + Provider patterns |

All operate in **stub mode** by design and are wired through typed repositories/
providers. The public site, booking/quote/tracking/review flows and the console
(Founder/Operations/Validation/Vendor/CRM/Marketing/Admin/Vendor-Import) are live.

## 🔌 Provider Pending (implement the real provider — no code redesign)

| Module | Swap |
|---|---|
| Documents | `ConsoleUploadProvider` → R2/S3/GCS/Azure in `documents/provider.ts` |
| Email | `ConsoleEmailProvider` → Resend in `email/email-provider.ts` |
| Vendor import | Manual → Gmail/OCR/PDF `ImportSourceProvider`s |

## 🔑 Credential Pending (set env / connect account)

| Need | Unblocks |
|---|---|
| `FOUNDER_DASHBOARD_PASSWORD` (Vercel) | Console access (currently 503) |
| `DATABASE_URL` (Neon) + Payload wiring | Every `*Repository` stub → live at once (CRM/Vendor/Marketing/Reviews/Bookings/Import) |
| `RESEND_API_KEY` | Transactional email delivery |
| `R2_*` | Document storage |
| `RAZORPAY_KEY_ID/SECRET` | Payments (post-GST) |
| `GOOGLE_CLIENT_ID` | Gmail vendor import |

## 🧾 Business Pending (founder-supplied data — not code)

- Google Place ID → review handoff
- Real verified vendor data (hotels/DMCs/transport)
- Partner hotel names per destination × category
- Per-departure operational details (dates/reporting/transport/hotel/seats/price/inclusions)
- GST rate (once registration completes)
- Licensed hero media (photos/video)

## Production checklist (go-live order)

1. Set `FOUNDER_DASHBOARD_PASSWORD` → console reachable.
2. Provision Neon, set `DATABASE_URL`, wire Payload (`src/payload/schema.ts`), point each `*Repository` at the DB.
3. Implement providers as accounts arrive: Resend → R2 → Gmail/OCR → Razorpay (post-GST).
4. Load business data (vendors, departures, hotels, Google Place ID, GST, media).
5. Enable Hermes (`HERMES_ENABLED`) once a model is connected.

Deployment blockers: **none for the current stub platform** (build green, deployed).
Real operation is gated only by the credential/business items above.
