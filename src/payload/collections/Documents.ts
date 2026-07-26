import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { relation, statusField } from "@/payload/fields/common";

/**
 * Secure document store (IDs, vouchers, invoices, signed agreements). Uploads
 * held privately; `relatedTo` is polymorphic so any entity can own documents.
 * Confidential by default — supports the legal/compliance foundation.
 */
const Documents: CollectionConfig = {
  slug: "documents",
  timestamps: true,
  upload: {
    staticDir: "documents",
    mimeTypes: ["application/pdf", "image/*"],
  },
  labels: { singular: "Document", plural: "Documents" },
  admin: {
    useAsTitle: "title",
    group: "Legal",
    defaultColumns: ["title", "docType", "confidential", "expiresAt"],
  },
  // Documents can be sensitive; staff-only by default. Row-level scoping
  // (e.g. a vendor seeing only their own) layers on when portals go live.
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    {
      name: "docType",
      type: "select",
      index: true,
      options: [
        { label: "ID proof", value: "id_proof" },
        { label: "Passport", value: "passport" },
        { label: "Agreement", value: "agreement" },
        { label: "Invoice", value: "invoice" },
        { label: "Voucher", value: "voucher" },
        { label: "Other", value: "other" },
      ],
    },
    // Polymorphic owner — any of these entities can hold documents.
    relation("relatedTo", [
      "customers",
      "vendors",
      "bookings",
      "influencers",
      "trip-captains",
      "contracts",
    ]),
    { name: "confidential", type: "checkbox", defaultValue: true },
    { name: "expiresAt", type: "date" },
    { name: "notes", type: "textarea" },
    statusField(
      [
        { label: "Active", value: "active" },
        { label: "Expired", value: "expired" },
        { label: "Archived", value: "archived" },
      ],
      "active",
    ),
  ],
};

export default Documents;
