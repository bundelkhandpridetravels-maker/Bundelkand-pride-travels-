# Business data needed

**Status: Google Business Profile is NOT accessible from this environment.**

I checked the connector registry — there is no Google Business Profile / Google My
Business connector available, and none is connected to this session. Connected
integrations are Gmail, Calendar and media tools only.

So the items below are **not invented and not guessed**. They're either omitted
from the code or marked with a `TODO`. Fill them in here (or paste them in chat)
and I'll wire them through in one pass.

---

## 1. Blocking — needed for local SEO & structured data

These feed `organizationJsonLd()` in `src/lib/seo.ts`. Google penalises structured
data that doesn't match reality, so I've deliberately left them out rather than approximate.

| Field | Currently | Needed |
|---|---|---|
| **Street address** | Only "Jhansi, Uttar Pradesh" | Full street address + postal code |
| **Opening hours** | "9 AM – 10 PM daily" (from the old site — **unverified**) | Confirmed hours per day |
| **Email** | `bundelkhandpridetravels@gmail.com` (from the old site — **unverified**) | Confirmed public email |
| **Google Maps link** | Not present | Your GBP "share" link or Place ID |
| **Geo coordinates** | Not present | Latitude/longitude of the office |
| **Legal entity name** | Not present | Registered business name, if different from the trading name |
| **GSTIN** | Not present | Needed on invoices/terms if you display it |

## 2. Verify before launch — these are live claims on the site

Currently rendered as fact on the homepage, `/about` and `/contact`:

- **9,000+** happy travellers
- **1,000+** tours planned
- **20+** destinations
- **3+** years of experience
- **24×7** support during active trips

If any are aspirational rather than actual, tell me and I'll soften or remove them.
Publishing unverifiable metrics is both a trust risk and, for some claims, a
consumer-protection one.

## 3. Ratings — deliberately omitted from structured data

The star ratings on package/destination cards (4.7–4.9) are **placeholder values**
in `src/data/home.ts` and `src/data/destinations.ts`.

I have **not** put `aggregateRating` in the JSON-LD, because fake review schema is
a direct Google penalty and a policy violation. To show ratings legitimately, pick one:

- **Google Reviews via Places API** — real, licensed, costs money and needs a Google Cloud account
- **Curated testimonials** — what we have now; keep the star ratings visual-only, no schema
- **Remove the numeric ratings** until real review data exists (my recommendation if the numbers aren't real)

## 4. Phone number — confirm

`+91 92351 21325` is used across the site and in `tel:`/WhatsApp links, taken from
your existing website. Please confirm it's current and is the number you want
customers calling.

## 5. Nice to have

- Team photos / founder bio for `/about`
- Real photography for hero, packages, destinations (see `public/hero/README.md`)
- Registered office vs. operational address, if they differ
- Any industry registrations (IATA, travel-agent licence, tourism board) — these are strong trust signals worth surfacing
