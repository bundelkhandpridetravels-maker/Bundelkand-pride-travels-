# Bundelkhand Pride Travels — Security Architecture

## Purpose

This document is the security contract for the entire Travel Operating System, not just the Phase 1 marketing site. Every future module (CRM, Vendor Portal, Customer Dashboard, Booking Engine, AI Agents) must build on the same authentication, authorization, audit, and data-protection primitives described here — none of them require a security redesign, only extension.

Two changes this document makes to the Phase 1 build agreed earlier:
1. **RBAC is designed for all four roles (Admin, Sales, Vendor, Customer) starting now**, even though Vendor and Customer login flows don't activate until Phase 2 — the schema and access-control pattern exist from day one so enabling them later is a config change, not a rebuild.
2. **Sentry** (error monitoring/alerting) and **Cloudflare Turnstile** (bot protection) are added to the stack.

---

## 1. Threat Model — Attack Vectors & Mitigations

| Attack vector | Risk | Mitigation |
|---|---|---|
| Credential stuffing / brute force on admin login | Account takeover of CMS/admin | Payload's rate-limited login, account lockout after N failed attempts, mandatory strong passwords, MFA for Admin role (Phase 2 rollout), alerting on failed-login spikes (Sentry + PostHog) |
| Form spam / scraping bots on public inquiry form | Fake leads, resource exhaustion, email/Sheets pollution | Cloudflare Turnstile on every public form, Upstash Redis rate limiting per-IP on `/api/inquiries` and any future public POST endpoint |
| SQL injection | Data breach/corruption | Payload's Postgres adapter (Drizzle ORM) uses parameterized queries exclusively; no raw string-concatenated SQL anywhere in the codebase — enforced by code review/lint rule |
| XSS (stored/reflected) | Session hijack, admin takeover, defacement | React's default output escaping; rich text (Lexical) sanitized with `sanitize-html`-equivalent allowlist before render; strict CSP with no unsafe-inline scripts; all user-submitted fields (Reviews, Inquiries) rendered as text, never as raw HTML |
| CSRF | Unauthorized state-changing requests using an admin's session | Payload's built-in CSRF protection on admin session cookies; Next.js Server Actions' origin-check; SameSite=Lax/Strict cookies; explicit origin/referer check on all public API routes |
| Session hijacking | Impersonation of admin/vendor/customer | HttpOnly + Secure + SameSite cookies for all sessions, short-lived JWTs with refresh rotation, session invalidation on password change, IP/device anomaly logging |
| Man-in-the-middle | Data interception | TLS 1.2+ enforced everywhere (Vercel auto-HTTPS + HSTS header), no mixed content, HSTS preload once domain is stable |
| Compromised third-party API key | Lateral access to email/storage/sheets/payments | Every integration uses a scoped, least-privilege credential (see §9); keys stored only in Vercel encrypted env vars; per-service key rotation runbook |
| Vendor data cross-access | Vendor A reads/edits Vendor B's bookings | Row-level access control functions on every vendor-owned collection check `doc.vendor === session.vendorId`, enforced server-side in Payload, never trusted from the client |
| Malicious/compromised AI agent (Phase 4+) | Unauthorized refund, booking change, message sent at scale | AI Action Approval Model — no AI-initiated action with financial, contractual, or irreversible impact executes without a human approval step (see §12) |
| Prompt injection via customer messages/emails (Phase 4+) | AI agent tricked into leaking data or taking unintended action | Inbound customer/vendor content is always treated as data, never as instructions, mirroring the same instruction-source boundary this assistant itself operates under; AI agents get least-privilege tool access, scoped separately from human admin credentials |
| Dependency vulnerabilities | Known CVEs exploited | Dependabot + `npm audit`/`pnpm audit` in CI on every PR, scheduled monthly dependency review, pinned lockfile |
| Data exfiltration via backup/export | Leaked customer/payment metadata | Backups encrypted at rest, stored in a separate provider (R2) from primary DB (Neon), access restricted to a single admin-held credential, never in the git repo |

---

## 2. User Permission Model (RBAC)

Four roles across the whole system, enforced identically wherever they apply:

| Role | Scope in Phase 1 | Scope as the system grows |
|---|---|---|
| **Admin** | Full CMS access: all collections, Users, AuditLogs, SiteSettings | Full access across CRM, Vendor Portal, Booking Engine, AI approval queue |
| **Sales** | Create/edit Packages, Destinations, Blog, Reviews; read/update Inquiries; **no** access to Users, AuditLogs, SiteSettings, or destructive delete on published Packages | CRM pipeline management, booking creation, customer communication — never payment/refund authority |
| **Vendor** *(schema exists now, login inactive until Phase 2)* | None (no login surface yet) | Read/update only their own bookings, availability, and rates; zero visibility into other vendors' data or platform-wide analytics |
| **Customer** *(schema exists now, login inactive until Phase 2)* | None (no login surface yet) | Read/update only their own bookings/profile; cannot see internal fields (margins, vendor cost, internal notes) |

**Enforcement pattern (applies to every collection, every phase):** access control is a server-side function evaluated per request against `(user.role, user.id, document)` — never inferred from the client, never based on hiding a UI button. The exact same function shape is reused when Vendor/Customer collections go live and when CRM/Booking Engine collections are added, so the authorization model never needs to be redesigned — only new resource checks are added to it.

`AuditLogs` records every Admin/Sales create/update/delete/login/permission-change from day one (see §6), so the audit trail already covers the roles that are active, and Vendor/Customer actions are captured by the same mechanism the moment those roles go live.

---

## 3. API Security Model

- All public-facing routes (`/api/inquiries`, future public endpoints) validate input server-side with Zod regardless of client-side validation
- All routes that mutate data require an authenticated session; Payload's REST/GraphQL/Local API all pass through the same access-control functions as the admin UI — there is no separate, weaker "API path"
- Future Vendor/Customer/partner API access uses scoped API tokens (not shared admin credentials), each tied to a role and, for vendors, to a specific `vendorId`
- Inbound webhooks (payment confirmations, WhatsApp, future vendor PMS integrations) verify HMAC signatures from the provider before processing — an unsigned or invalid-signature payload is rejected and logged, never acted on
- Rate limiting (Upstash Redis, sliding window) on every public POST endpoint; stricter limits on anything unauthenticated
- CORS locked to the site's own origin(s); no wildcard `*` on any route that isn't intentionally public

---

## 4. Session Management

- Payload admin sessions: HttpOnly, Secure, SameSite cookies carrying short-lived JWTs, configurable expiry, refresh-token rotation
- Same pattern will back Vendor/Customer auth in Phase 2 (via Payload auth-enabled collections or Auth.js, whichever is chosen at that time) — no divergent session mechanism per role
- Session invalidation on: password change, role change, explicit logout, and (Phase 2+) suspicious device/IP change
- No sensitive data (roles, tokens, PII) stored in localStorage/sessionStorage — cookies only

---

## 5. Data Protection

**In transit:** TLS 1.2+ enforced end-to-end via Vercel's automatic HTTPS; HSTS header; no plaintext fallback.

**At rest:**
- Neon Postgres encrypts data at rest by default
- Sensitive fields (none in Phase 1 beyond contact PII; future payment references, vendor bank details) are never stored in plaintext where the provider doesn't already guarantee encryption — e.g., any future stored payment reference is a tokenized reference from Razorpay, never raw card data (see §10)
- R2-stored media (hotel photos/videos) — access via signed URLs where content shouldn't be fully public
- Backups encrypted at rest by the storing provider (Neon PITR, R2 with SSE)

---

## 6. Audit Logging

An `AuditLogs` collection is built in Phase 1, not deferred:
- Records: actor (user id + role), action (create/update/delete/login/permission-change), collection + document id, timestamp, IP/user-agent
- Written via Payload hooks (`afterChange`, `afterDelete`, `afterLogin`) on every collection — a hook pattern that automatically extends to new collections added in later phases with zero extra design work
- Read access restricted to Admin role only; audit logs themselves are append-only (no update/delete access for any role, including Admin, through the normal API)

---

## 7. Monitoring & Alerting

- **Sentry** for application error tracking and alerting (added to the stack specifically for this requirement) — alerts on error-rate spikes, unhandled exceptions in API routes
- **PostHog** for anomalous traffic/usage pattern detection (e.g., sudden spike in form submissions from one IP/region)
- Vercel + Neon platform-level logs/metrics for infra-level anomalies
- Alert thresholds configured for: repeated failed logins, rate-limit trigger spikes, webhook signature-verification failures, unexpected 5xx spikes

---

## 8. Backup & Disaster Recovery

**Backup strategy:**
- Neon: continuous point-in-time recovery (provider-managed)
- Weekly `pg_dump` export to a dedicated Cloudflare R2 bucket (separate from media storage), encrypted, retained on a rolling window — an independent, cross-provider copy so a single vendor incident can't take out both primary and backup
- R2 media: versioning enabled, lifecycle rules to manage storage cost as volume grows
- Secrets: a single encrypted offline copy (e.g., in a password manager vault held by the business owner), never in git, never in plaintext chat/email

**Recovery strategy:**
- Target RPO: near-zero for the database (Neon PITR) and ≤24h worst case if falling back to the weekly export
- Target RTO: a few hours — restoring a Neon branch to a point in time, repointing `DATABASE_URL`, and redeploying the (already-built) Vercel app is fast since application code isn't the bottleneck
- Documented runbook (in `docs/`) for: DB restore, secret rotation after a suspected compromise, and full redeploy from git if Vercel itself has an incident

---

## 9. Secrets Management

- All credentials live only in Vercel's encrypted environment variables (or `.env.local`, git-ignored, for local dev)
- `.env.example` documents every required key name with no real values
- Every third-party credential is scoped to the minimum permission it needs (see §11) so a single leaked key has bounded blast radius
- Rotation is a documented, low-friction process (swap the env var in Vercel, redeploy) precisely because no secret is hardcoded anywhere in the codebase

---

## 10. Payment Security

- Razorpay (PCI-DSS Level 1 certified) hosts all card/payment-method entry via its Checkout — Bundelkhand Pride Travels' servers never receive or store raw card data, keeping PCI scope minimal (SAQ A-eligible)
- Only transaction IDs, status, and amounts are stored in our database — never card numbers, CVV, or full payment instrument details
- Payment webhooks verified via HMAC signature before any booking/payment status is updated
- Refunds and payment releases are never triggered automatically by an AI agent (see §12) — they require a defined business rule plus human approval, regardless of how the request originated

---

## 11. Vendor Access Security

- Vendors never share the Admin/Sales login surface; when Vendor login activates (Phase 2), it's a separate auth-enabled collection/scope
- Every vendor-owned record carries a `vendorId`; access-control functions enforce `doc.vendor === session.vendorId` server-side on every read/write — a vendor's API token or session can never be used to query another vendor's data, regardless of what the client sends
- Vendor-facing API tokens (for future PMS/availability integrations) are scoped per-vendor and revocable independently
- Inbound vendor confirmations (booking confirmed/rejected) are only trusted when they arrive through a signed webhook or an authenticated vendor session — never from an unauthenticated free-text channel

---

## 12. AI Safety — Human-in-the-Loop Approval Model (Phase 4+)

This is a first-class architectural principle, not an afterthought bolted onto the AI modules later:

- **AI can prepare, draft, and recommend. AI cannot finalize anything irreversible or financially significant.** Concretely: AI can draft a vendor booking request, but the booking is only confirmed after a valid vendor confirmation (webhook or authenticated vendor action) or explicit human sign-off. AI can draft customer/vendor emails and WhatsApp messages, but sending anything tied to refunds, payment releases, or booking changes requires a defined business rule plus human approval.
- **Mechanism:** an `ApprovalQueue` collection (introduced when the first AI agent is built, not before) holds any AI-proposed action with financial/contractual/irreversible impact — status `pending / approved / rejected`, approver identity, timestamp. Only Admin/Sales roles (per the same RBAC model from §2) can approve. Every approval/rejection is written to the same `AuditLogs` collection from §6 — no separate logging system for AI actions.
- **Least privilege for AI agents:** each AI agent gets its own scoped service credential, distinct from human admin credentials, so a misbehaving or manipulated agent's blast radius is bounded and independently revocable without locking out human staff.
- **Untrusted content stays data, never instructions:** any text an AI agent processes that originated from a customer, vendor, or public form is treated strictly as data to reason about — never as a command the agent executes — closing off prompt-injection as an escalation path.
- **Rate/quota limits on AI-triggered external actions** (messages sent, requests drafted) cap the damage if an agent misbehaves, mirroring the rate limiting already in place for public forms.

---

## 13. Compliance & Privacy-by-Design

- Primary applicable regulation: India's **Digital Personal Data Protection Act (DPDPA) 2023**, given the business and its customer base are India-based
- Data minimization: the inquiry form and future customer records collect only what's operationally needed (name, phone, email, travel details) — no unnecessary PII
- Consent: a clear privacy notice at the point of data collection (inquiry form, future account creation)
- Right to access/erasure: supported from Phase 1 via an admin-performed deletion of a person's Inquiry/PII on request; a formal self-service flow is a Phase 2+ addition
- Retention: stale, unconverted Inquiries are archived/anonymized on a defined schedule rather than retained indefinitely
- If/when EU customers are served, these same practices already align closely with GDPR's core principles, minimizing future compliance work

---

## 14. How Future Modules Inherit This Without a Redesign

| Future module | What it reuses unchanged |
|---|---|
| CRM | Same RBAC roles, same `AuditLogs`, same access-control function pattern applied to new CRM-specific collections |
| Vendor Portal | Activates the already-scaffolded Vendor role/collection and row-level `vendorId` access checks — no new authorization model |
| Customer Dashboard | Activates the already-scaffolded Customer role/collection with the same session/cookie pattern used by Admin/Sales today |
| Booking Engine | Payment security model (§10) and webhook signature verification (§3) apply unchanged; new collections plug into the same access-control + audit pattern |
| AI Agents | §12's approval-queue model and least-privilege agent credentials are the only new primitive needed — everything else (RBAC, audit logging, rate limiting) already exists |
