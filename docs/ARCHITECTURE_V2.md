# Architecture v2 — Blueprint-Aligned System Design

> **Status: DRAFT for founder approval (2026-07-22).** Design only — no code and
> no invented business data in here. This translates
> [BUSINESS_BLUEPRINT.md](./BUSINESS_BLUEPRINT.md) into a concrete data model,
> engine designs, finance/RBAC model, and a revised build order. It **extends**
> the approved [architecture.md](./architecture.md) and
> [security-architecture.md](./security-architecture.md); it does not replace
> them. Nothing here gets built until you approve it.

## 1. Principles (inherited from the blueprint)

Curated operator, not a marketplace · verified vendors only · category-based
stay (never guarantee an exact hotel) · cash-flow first · founder retains
control · AI **drafts**, never auto-executes financial/irreversible actions
(security §12 ApprovalQueue) · build scalable architecture first · never invent
business data.

## 2. Data model (Payload collections / Neon tables)

Field lists are the **shape**, not real values. Relationships in **bold**.

### Content & catalogue
- **Destinations** *(exists as data today)* — slug, name, region, hero media, guide.
- **TourType** taxonomy — `fit | group | corporate | school | honeymoon`. Each
  package carries one; each drives its own page template + business logic.
- **Packages** — destination(**→Destinations**), tourType, duration, category,
  itinerary[], pickup, mealPlan, transport, **hotelCategory** (3★/4★/Premium),
  inclusions[], exclusions[], price, policies[], faq[], gallery[], videos[],
  **reviews(→Reviews)**, status(`active|draft|paused`).
- **Departures** (fixed group) — **→Package**, departureCity (**Delhi**),
  departureDate, returnDate, pickupPoint, reportingTime, transportType,
  **hotelCategory**, mealPlan, seatsTotal, seatsAvailable, price, inclusions[],
  exclusions[], status(`active|paused|sold_out`). *Admin-editable → this is the
  "add/edit/pause without code" requirement.*

### Vendor & hotel supply
- **Hotels** — name, **→Destination**, starCategory(3/4/premium), representative
  flag, images[], **→Vendor(owner)**, notes. *Category-based: a package books a
  category; specific hotel confirmed on availability.*
- **Vendors** — businessName, owner, gst?, pan, address, googleReviewsUrl/score,
  businessAge, photos[], vehicleDetails?, hotelCategory?, avgResponseTime,
  documents[], agreementStatus, verificationStatus, **qualityScore** (derived).
- **VendorScoreEvents** — append-only inputs to the ranking engine (review,
  complaint, response-time sample, service rating, price sample).

### Booking & finance
- **Leads** (CRM entry) — contact, source, **→Package/Destination**, stage
  (`new|contacted|quoted|won|lost`), followUps[], ownerUser.
- **Customers** — profile, **→Bookings**, documents[], consent flags.
- **Bookings** — **→Customer**, **→Package/Departure**, travellers, travelDates,
  bookingAmount, paidAmount, balance, **paymentScheduleTier**, dueDates[],
  status, **allocatedHotel(→Hotels)**, **vendorPayables[]**, margin, profit,
  refundStatus.
- **Payments** — **→Booking**, installment#, amountDue, amountPaid, dueDate,
  method, gatewayRef, status.
- **VendorPayables** — **→Booking**, **→Vendor**, amount, releaseDate (held per
  terms), status(`held|scheduled|paid`).
- **Seasons** — name(`normal|peak|super_peak`), dateRange[], rateMultiplier,
  **→Destination?**.
- **Inventory** *(Phase 2, owned rooms)* — **→Hotel**, allocatedRooms,
  bookedRooms, remainingRooms, releaseDate, peakRate, normalRate, profitPerRoom.

### Trust, ops, config
- **Reviews** — **→Booking/Package/Vendor**, rating, text, photos[], videoUrl?,
  googleReviewRequested/Completed, published.
- **VendorTasks** — **→Vendor/Booking**, type(availability/confirm/invoice),
  status. (Feeds vendor dashboard + AI automation drafts.)
- **AuditLogs** *(active today)* — append-only, extends to every collection above.
- **B2BPartners** *(future)* — agency, verificationStatus, pricingTier, wallet,
  commissionRate, **→Bookings**.
- **Globals** — SiteSettings (incl. **PaymentPolicy** = the 40/40/20 tiers,
  configurable), Navigation, Footer.

## 3. Engines (AI-assisted, human-gated)

### Vendor Ranking Engine
`qualityScore = weighted(customerReviews, complaintRate, responseTime,
serviceQuality, pricing, professionalism)`. Recomputed on new VendorScoreEvents.
Output orders vendors in allocation + admin. Weights live in SiteSettings
(configurable). **AI recommends; a human confirms allocation.**

### Hotel Allocation Engine
Input: booked category + travelDates + destination. Filters Hotels by category +
availability, ranks by vendor qualityScore × season rate × vendor priority,
proposes best hotel. **Proposal only** → routed through the ApprovalQueue for a
human to confirm before the customer is told a specific hotel (blueprint:
category-based, no exact guarantee).

## 4. Finance & cash-flow model

- **Payment tiers** (blueprint defaults, admin-configurable): >20 days →
  40/40/20; 7–20 days → higher advance; <7 days → 100% before confirmation.
- **Vendor payout hold:** customer money is NOT immediately released; VendorPayables
  carry a `releaseDate` per agreed terms → working-capital retained.
- **Per-booking P&L:** bookingAmount − vendorPayables = margin; tracked live for
  the founder dashboard.
- All money movement (refunds, payouts) is an ApprovalQueue action — never
  auto-executed by AI (security §12).

## 5. RBAC extension (extends security §2)

Roles: `admin` · `sales` · `ops` (new) · `vendor` · `customer` · `b2b_partner`
(future). Same `(user.role, user.id, doc) → boolean` access-function pattern
already used — extended, not redesigned. Row-level scoping: vendors see only
their VendorTasks/Payables/Reviews; b2b partners see only their Bookings/wallet.

## 6. Revised build order (supersedes ROADMAP phase labels)

1. **Backend foundation** (needs your `DATABASE_URL`): Payload + Neon + core
   collections (Packages, Departures, Hotels, Vendors, Bookings, Reviews,
   AuditLogs) + admin. Makes departures/hotels/packages editable without code.
2. **Enquiry → CRM**: swap `EnquiryRepository` to Payload; Leads pipeline.
3. **Payments & finance**: Razorpay + payment tiers + payables hold + P&L.
4. **Vendor system**: verification store, VendorTasks, vendor dashboard, ranking
   engine (score only; allocation stays human-confirmed).
5. **Hotel allocation** + season/inventory (Phase 2 owned rooms).
6. **AI automation** (reminders, doc collection, review requests, vendor
   suggestions) — all ApprovalQueue-gated.
7. **B2B portal** (verified agents).

Frontend (Track A UI + tour-type scaffolds) proceeds in parallel and is
backend-agnostic (data files today → CMS later, same shapes).

## 7. Founder data still required (blueprint: never invent)

- Representative **partner hotel names** per destination × star category.
- Per-**departure** operational details (date/return/reporting/transport/hotel/
  meal/seats/price/inclusions/exclusions) for all 7, incl. the 4 new ones.
- Whether **Corporate/Honeymoon** have real packages (currently: scaffold-only).
- Real **vendors** to seed, or design-only until onboarding.
- Confirmation of the **PaymentPolicy** defaults (40/40/20 etc.).

## 8. Open questions

- School & College already has the Corbett tour — treat School as an active tour
  type now, Corporate/Honeymoon as scaffolds?
- Do you want `ops` as a distinct role from `sales`, or keep two roles for now?
- B2B pricing model (flat commission vs tiers) — defer until portal phase?
