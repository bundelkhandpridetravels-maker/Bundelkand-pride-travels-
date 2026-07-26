# `src/payload/` — build-isolated backend schema

Production-grade **Payload CMS collection designs** for the BPT Travel OS.
Designed now, wired later. **Nothing here connects to a database or requires
`DATABASE_URL`, and nothing is imported by any page/route** — so it is fully
build-safe and never enters the production bundle.

## Why the types are local (not `payload`)

This repo runs **Next 16**; Payload 3 targets Next 15, and `main` auto-deploys.
Installing Payload + its adapters now risks breaking the live build. So
[`types.ts`](./types.ts) mirrors Payload's `CollectionConfig` API closely enough
that migration is a mechanical import swap — no redesign.

## Layout

```
src/payload/
├── types.ts              # local mirror of Payload's collection-config API
├── access.ts             # reusable RBAC access functions (roles, row-level scoping)
├── fields/common.ts      # reusable field models (money, contact, address, seo, status, ai…)
├── collections/*.ts      # 19 collections (one file each) + index.ts (ordered array)
├── schema.ts             # the object a future payload.config.ts consumes + validateSchema()
└── README.md
```

## Collections (19)

Access: **Users** · CRM: **Leads, CrmActivities, Customers** · Catalogue:
**Destinations, Packages, Itineraries** · Supply: **Vendors, Hotels, Dmcs,
TransportProviders** · Operations: **Bookings** · Finance: **Payments** ·
Partners: **Influencers, TripCaptains** · Content: **Reviews, Media** · Legal:
**Documents, Contracts**.

Design principles baked in: destination-scoping for multi-country rollout;
category-based hotels (never an exact-hotel guarantee); vendor trust/score
separated from what vendors supply; cash-flow fields + vendor-payout holds;
polymorphic Documents/Contracts; AI-assist blocks (`ai.*`, advisory only) so
Hermes AI can enrich records without schema changes; financial mutations gated
behind `requiresHumanApproval` (ApprovalQueue, security §12).

## Going live (when `DATABASE_URL` is available)

1. `npm i payload @payloadcms/db-postgres @payloadcms/next @payloadcms/richtext-lexical`
   (verify Next 16 compatibility first).
2. Add `payload.config.ts`:
   ```ts
   import { buildConfig } from "payload";
   import { postgresAdapter } from "@payloadcms/db-postgres";
   import { collections } from "@/payload/schema";
   export default buildConfig({
     db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
     collections, // swap the local CollectionConfig import in each file for `payload`'s
     // ...admin, auth, upload (R2), email (Resend)
   });
   ```
3. Mount `/admin` via `@payloadcms/next`; wrap `next.config.ts` with `withPayload`.
4. Point the existing `EnquiryRepository` seam at a `PayloadEnquiryRepository`.
5. Set `DATABASE_URL` (+ R2/Resend keys) in Vercel. Add AuditLogs + Globals
   (SiteSettings incl. PaymentPolicy) at this step.

Until then: `validateSchema()` in `schema.ts` returns `[]` when the design is
internally consistent (no duplicate slugs, all `relationTo` targets exist).
