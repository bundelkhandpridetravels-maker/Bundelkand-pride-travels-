# Deployment & operations guide

Everything you need to get this site from your laptop to
**https://www.bundelkhandpridetravels.com** and run it day to day.

**Pipeline:** Claude Code → GitHub → Vercel → GoDaddy DNS
GoDaddy is **only the registrar**. The app is hosted on Vercel.

---

## 1. Local development

Node.js v24 is installed at `C:\Program Files\nodejs` but is **not on the default PATH**.

```bash
# Git Bash
export PATH="/c/Program Files/nodejs:$PATH"
npm install       # first time only
npm run dev       # → http://localhost:3000
```

The first compile takes ~60s (fonts are fetched and cached); after that it's a few seconds.

```bash
npm run build     # production build — takes ~2 min
npx tsc --noEmit  # typecheck
```

---

## 2. GitHub workflow

The repo has no remote yet. To create one:

```bash
git init                     # if not already a repo
git add .
git commit -m "Initial commit: Bundelkhand Pride Travels site"
gh repo create bundelkhand-pride-travels --private --source=. --push
```

**Branching:**

- `main` = production. Every push deploys live.
- Feature work goes on a branch → open a PR → Vercel builds a **preview URL** for that PR → merge when it looks right.

Never commit `.env*` files. `.gitignore` already covers them.

---

## 3. Deploying to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → import the `bundelkhand-pride-travels` repo.
3. Vercel auto-detects Next.js. Defaults are correct — don't override the build command or output directory.
4. Click **Deploy**. You'll get a `*.vercel.app` URL in ~2 minutes.

Every push to `main` redeploys automatically. Every PR gets its own preview URL.

---

## 4. Connecting the GoDaddy domain

In **Vercel → Project → Settings → Domains**, add:

- `www.bundelkhandpridetravels.com` (primary)
- `bundelkhandpridetravels.com` (Vercel will redirect it to `www`)

Vercel shows the exact records to create. Then in **GoDaddy → My Products → DNS → Manage DNS**:

| Type | Name | Value | TTL |
|---|---|---|---|
| `CNAME` | `www` | `cname.vercel-dns.com` | 1 hour |
| `A` | `@` | `76.76.21.21` | 1 hour |

> Use whatever values **Vercel shows you** — they occasionally change. The table above is the current standard.

Notes:

- Delete GoDaddy's default parking/forwarding records for `@` and `www`, or they'll conflict.
- DNS propagation takes minutes to a few hours.
- SSL is issued automatically by Vercel once DNS resolves. Don't buy an SSL certificate from GoDaddy.
- **Do not** use GoDaddy's "Website Builder" or hosting — the domain only needs to point at Vercel.

---

## 5. Environment variables

The site currently needs **zero** environment variables — it's fully static. This is deliberate and is why deployment is trivial today.

When Phase 1B (backend) lands, add these in **Vercel → Settings → Environment Variables** (and mirror them in a local `.env.local`, which is git-ignored):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `PAYLOAD_SECRET` | Payload CMS session secret |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Cloudflare R2 media storage |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Bot protection on forms |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |
| `SENTRY_DSN` | Error monitoring |
| `GOOGLE_SHEETS_SERVICE_ACCOUNT` | Lead sync to Sheets |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments (Phase 2) |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Cloud API (Phase 2) |
| `INSTAGRAM_ACCESS_TOKEN` | Live Instagram gallery (see §9) |

Rule: anything prefixed `NEXT_PUBLIC_` is **visible in the browser**. Never prefix a secret.

---

## 6. Analytics

**Vercel Analytics** (Core Web Vitals) — enable in the Vercel dashboard, then:

```bash
npm i @vercel/analytics
```

Add `<Analytics />` to `src/app/layout.tsx`.

**PostHog** (funnels, events, session replay) — create a project, set `NEXT_PUBLIC_POSTHOG_KEY`, and initialise it in a client component mounted from the layout.

Neither is installed yet — they're deliberately deferred so the site ships with zero third-party JS until you want it.

---

## 7. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add property → **Domain** → `bundelkhandpridetravels.com`.
3. Verify via DNS TXT record (add it in GoDaddy DNS).
4. Submit the sitemap: `https://www.bundelkhandpridetravels.com/sitemap.xml`.

The sitemap is generated automatically from the data files — you never edit it by hand.

Also worth doing: [Bing Webmaster Tools](https://www.bing.com/webmasters) (import directly from Search Console).

---

## 8. Updating content (no backend needed yet)

All content lives in `src/data/`. Edit, commit, push — Vercel redeploys and the sitemap updates itself.

| To change… | Edit |
|---|---|
| Company info, stats, mission, tagline | `src/data/company.ts` |
| Homepage packages, categories, departures, testimonials, FAQs | `src/data/home.ts` |
| Package detail pages (itinerary, hotels, weather, FAQs) | `src/data/packages.ts` |
| Destination cards (price, rating, duration) | `src/data/destinations.ts` |
| Destination guides (attractions, tips, weather) | `src/data/destination-details.ts` |
| Journal article bodies | `src/data/journal-posts.ts` |
| Production URL / social profiles | `src/lib/site.ts` |

### Adding a new package

1. Add a card entry to `featuredPackages` in `src/data/home.ts`.
2. Add a matching entry (same `slug`) to `packageDetails` in `src/data/packages.ts`.

That's it — the detail page, the catalogue entry, the sitemap URL and the JSON-LD are all generated. A package with a card but no detail entry safely routes to `/contact` instead of 404ing.

### Adding a journal article

1. Add metadata to `journal` in `src/data/home.ts`.
2. Add the body to `journalPosts` in `src/data/journal-posts.ts` using the `Block` format (`p`, `h2`, `ul`).

---

## 9. Future integrations

**Instagram gallery** — the UI already consumes `getSocialPosts()` in `src/lib/social.ts`, which currently returns placeholders. To go live: get an Instagram Graph API token, fetch inside `getSocialPosts()`, map the response to `SocialPost[]`. No component changes needed.

**Hero video** — drop `hero.webm` / `hero.mp4` / `hero-poster.jpg` into `public/hero/` and list them in `heroVideoSources` in `src/data/destinations.ts`. See `public/hero/README.md`.

**Backend (Phase 1B)** — Payload CMS mounts inside this same app at `/admin`, backed by Neon Postgres. The `src/data/*.ts` shapes were designed to mirror the planned Payload collections, so the swap is `import { getPackages } from "@/lib/cms"` instead of a static import — the components don't change. See `docs/architecture.md`.

---

## 10. Outstanding items before launch

- [ ] **Legal review** of `/privacy-policy` and `/terms-conditions` — drafted from assumptions, not verified against your actual terms
- [ ] **Verify public stats** (9,000+ travellers, 1,000+ tours, 3+ years) — these render as factual claims
- [ ] **Business details for structured data** — see `docs/BUSINESS_DATA_NEEDED.md`
- [ ] Real photography to replace gradient placeholders
- [ ] Decide: Google Reviews live API vs. curated testimonials
