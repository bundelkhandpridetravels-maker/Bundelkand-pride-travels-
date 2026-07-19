/**
 * Roadmap and sprint definitions for the Founder Dashboard.
 *
 * Progress values are DECLARED here rather than guessed by the scanner, because
 * "how done is the CRM" isn't something a filesystem can answer. They are kept
 * honest by hand and dated — the scanner supplies the hard numbers alongside.
 *
 * Rule: never mark something complete that isn't visible on localhost:3000.
 */

export type SprintStatus = "done" | "active" | "blocked" | "next" | "planned";

export type Sprint = {
  id: string;
  name: string;
  progress: number; // 0-100
  status: SprintStatus;
  started?: string;
  target?: string;
  priority: "P0" | "P1" | "P2" | "P3";
  dependsOn?: string[];
  note: string;
};

export const sprints: Sprint[] = [
  { id: "design-system", name: "Design system", progress: 100, status: "done", started: "2026-07-15", priority: "P0", note: "Tokens, typography, colour, motion primitives — in use across every page" },
  { id: "frontend", name: "Marketing frontend", progress: 95, status: "active", started: "2026-07-15", priority: "P0", note: "12 packages, 3 destination guides, journal, legal, about — all static-rendered" },
  { id: "booking", name: "Booking enquiry system", progress: 85, status: "active", started: "2026-07-18", priority: "P0", dependsOn: ["frontend"], note: "Form + Zod + API live and tested; persistence pending a database" },
  { id: "media", name: "Media & cinematic layer", progress: 40, status: "blocked", started: "2026-07-18", priority: "P0", dependsOn: ["design-system"], note: "Architecture complete (11 folders, 138 placeholders). Blocked on real footage" },
  { id: "seo", name: "SEO & structured data", progress: 90, status: "active", started: "2026-07-17", priority: "P1", note: "JSON-LD, canonicals, sitemap, robots all live and validated" },
  { id: "animations", name: "Motion & interaction", progress: 70, status: "active", started: "2026-07-18", priority: "P1", note: "Lenis, GSAP parallax, atmosphere canvas, interactive itinerary, lightbox" },
  { id: "cms", name: "CMS (Payload)", progress: 0, status: "next", priority: "P0", dependsOn: ["booking"], note: "Needs Neon database + account credentials" },
  { id: "database", name: "Database (Neon)", progress: 0, status: "blocked", priority: "P0", note: "Blocked: needs your Neon account" },
  { id: "auth", name: "Authentication & RBAC", progress: 0, status: "planned", priority: "P1", dependsOn: ["cms"], note: "Schema designed in security architecture; not implemented" },
  { id: "payments", name: "Payments (Razorpay)", progress: 0, status: "planned", priority: "P1", dependsOn: ["database"], note: "Needs merchant account" },
  { id: "crm", name: "CRM & lead management", progress: 5, status: "planned", priority: "P1", dependsOn: ["database"], note: "Enquiry model already captures attribution for this" },
  { id: "admin", name: "Admin panel", progress: 0, status: "planned", priority: "P2", dependsOn: ["cms"], note: "Payload provides this once CMS lands" },
  { id: "chatbot", name: "AI chatbot", progress: 0, status: "planned", priority: "P2", dependsOn: ["cms"], note: "Waitlist section live on homepage" },
  { id: "voice", name: "Voice AI", progress: 0, status: "planned", priority: "P3", dependsOn: ["chatbot"], note: "Phase 7" },
  { id: "vendor", name: "Vendor portal", progress: 0, status: "planned", priority: "P3", dependsOn: ["auth"], note: "Row-level access model already designed" },
  { id: "b2b", name: "B2B platform", progress: 0, status: "planned", priority: "P3", dependsOn: ["vendor"], note: "Phase 10" },
  { id: "analytics", name: "Analytics", progress: 0, status: "planned", priority: "P2", note: "PostHog + Vercel Analytics not yet installed" },
  { id: "marketing", name: "Marketing automation", progress: 0, status: "planned", priority: "P3", dependsOn: ["crm"], note: "Phase 6" },
];

export type Phase = {
  n: number;
  name: string;
  status: SprintStatus;
  checklist: { label: string; done: boolean }[];
};

export const phases: Phase[] = [
  {
    n: 1, name: "Premium website", status: "active",
    checklist: [
      { label: "Design system & tokens", done: true },
      { label: "Homepage (12 sections)", done: true },
      { label: "12 package detail pages", done: true },
      { label: "Destination guides", done: true },
      { label: "Journal + legal pages", done: true },
      { label: "Booking enquiry flow", done: true },
      { label: "SEO + structured data", done: true },
      { label: "Motion & cinematic layer", done: false },
      { label: "Real photography & video", done: false },
      { label: "Deploy to Vercel", done: false },
    ],
  },
  {
    n: 2, name: "CMS", status: "next",
    checklist: [
      { label: "Neon database provisioned", done: false },
      { label: "Payload installed & mounted", done: false },
      { label: "Collections defined", done: false },
      { label: "Migrate data files to CMS", done: false },
    ],
  },
  { n: 3, name: "Booking engine", status: "planned", checklist: [
    { label: "Enquiry model & API", done: true },
    { label: "Persistent storage", done: false },
    { label: "Availability & seat holds", done: false },
  ]},
  { n: 4, name: "Payments", status: "planned", checklist: [
    { label: "Razorpay merchant account", done: false },
    { label: "Checkout + webhook verification", done: false },
  ]},
  { n: 5, name: "CRM", status: "planned", checklist: [
    { label: "Lead attribution captured", done: true },
    { label: "Pipeline & statuses", done: false },
    { label: "Sales dashboard", done: false },
  ]},
  { n: 6, name: "Automation", status: "planned", checklist: [
    { label: "Email (Resend)", done: false },
    { label: "WhatsApp Cloud API", done: false },
    { label: "n8n workflows", done: false },
  ]},
  { n: 7, name: "Voice AI", status: "planned", checklist: [{ label: "Scoping", done: false }] },
  { n: 8, name: "Analytics", status: "planned", checklist: [
    { label: "PostHog + Vercel Analytics", done: false },
    { label: "Conversion funnels", done: false },
  ]},
  { n: 9, name: "Vendor portal", status: "planned", checklist: [
    { label: "Vendor auth & row-level access", done: false },
  ]},
  { n: 10, name: "B2B platform", status: "planned", checklist: [{ label: "Scoping", done: false }] },
];

/** Things only the founder can unblock — surfaced prominently. */
export const founderBlockers = [
  { label: "Real destination footage", why: "Cinematic layer is architected but empty", action: "Top up Higgsfield credits, license stock, or shoot on your next trip" },
  { label: "Neon + Vercel accounts", why: "Blocks CMS, database, deployment and everything after", action: "Create accounts, then paste keys into .env.local" },
  { label: "Verify public stats", why: "9,000+ travellers / 1,000+ tours render as factual claims", action: "Confirm the numbers are accurate" },
  { label: "Legal review", why: "Privacy policy & terms were drafted from assumptions", action: "Have someone who knows your cancellation terms check them" },
  { label: "Jammu package decision", why: "Pickup/drop correction still ambiguous", action: "Separate ex-Jammu tour, or convert the Srinagar one? Need nights + price" },
];
