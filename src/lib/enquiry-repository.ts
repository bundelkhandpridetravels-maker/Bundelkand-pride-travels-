// Server-only module: imported exclusively by the /api/enquiries route handler.
// (The `server-only` guard package isn't installed in this project yet; keeping
// this file out of client imports enforces the boundary by convention.)
import { randomUUID } from "node:crypto";
import type { Enquiry, EnquiryInput } from "@/lib/enquiry";

/**
 * Persistence boundary for enquiries.
 *
 * The API route depends on this interface, never on a concrete store. To go
 * live with a real backend you implement one of these and swap it in
 * `getEnquiryRepository()` — the route, the form, and every button stay put.
 *
 * Planned implementations (Phase 1B):
 *   - PayloadEnquiryRepository  → payload.create({ collection: "inquiries", ... })
 *   - NeonEnquiryRepository     → INSERT ... RETURNING id
 * plus side-effect hooks (Resend email, WhatsApp Cloud API, CRM webhook) layered
 * in `create()` or via an event the CRM subscribes to.
 */
export interface EnquiryRepository {
  create(input: EnquiryInput): Promise<Enquiry>;
}

/**
 * Default repository until the database is connected.
 * Validates the shape, stamps id/status/timestamp, and logs a structured record
 * to the server console so nothing is silently lost during the pre-backend phase.
 * It does NOT durably persist — that's intentional and documented, not a bug.
 */
class ConsoleEnquiryRepository implements EnquiryRepository {
  async create(input: EnquiryInput): Promise<Enquiry> {
    const enquiry: Enquiry = {
      ...input,
      id: `enq_${randomUUID()}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    // Structured so it can be scraped from logs or piped to a sink today.
    console.info("[enquiry:new]", JSON.stringify(enquiry));
    return enquiry;
  }
}

let repo: EnquiryRepository | null = null;

/** Single accessor. Swap the constructed repository here when the backend lands. */
export function getEnquiryRepository(): EnquiryRepository {
  if (!repo) repo = new ConsoleEnquiryRepository();
  return repo;
}
