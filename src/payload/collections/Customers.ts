import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import {
  addressGroup,
  aiAssistGroup,
  contactGroup,
  relation,
  statusField,
  tagsField,
} from "@/payload/fields/common";

/** People who travel with BPT. Seeds the CRM; grows into loyalty later. */
const Customers: CollectionConfig = {
  slug: "customers",
  timestamps: true,
  labels: { singular: "Customer", plural: "Customers" },
  admin: {
    useAsTitle: "name",
    group: "CRM",
    defaultColumns: ["name", "phone", "city", "status"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    contactGroup,
    addressGroup,
    {
      name: "source",
      type: "select",
      index: true,
      options: [
        { label: "Website", value: "website" },
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Referral", value: "referral" },
        { label: "Instagram", value: "instagram" },
        { label: "Walk-in", value: "walk_in" },
        { label: "Repeat", value: "repeat" },
        { label: "Other", value: "other" },
      ],
    },
    tagsField,
    relation("bookings", "bookings", { hasMany: true }),
    relation("documents", "documents", { hasMany: true }),
    { name: "consentMarketing", type: "checkbox", defaultValue: false },
    { name: "notes", type: "textarea" },
    aiAssistGroup,
    statusField(
      [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Blocked", value: "blocked" },
      ],
      "active",
    ),
  ],
};

export default Customers;
