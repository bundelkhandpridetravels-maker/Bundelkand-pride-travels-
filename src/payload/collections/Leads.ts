import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import {
  aiAssistGroup,
  contactGroup,
  moneyGroup,
  relation,
} from "@/payload/fields/common";

/**
 * Sales pipeline entries. Enquiries flow in via the existing typed
 * EnquiryRepository seam; AI (Hermes) enriches score/summary/next-action.
 */
const Leads: CollectionConfig = {
  slug: "leads",
  timestamps: true,
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    useAsTitle: "name",
    group: "CRM",
    defaultColumns: ["name", "stage", "source", "owner", "value"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    contactGroup,
    {
      name: "source",
      type: "select",
      index: true,
      options: [
        { label: "Website form", value: "website" },
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Instagram", value: "instagram" },
        { label: "Referral", value: "referral" },
        { label: "Phone", value: "phone" },
        { label: "Other", value: "other" },
      ],
    },
    relation("destination", "destinations"),
    relation("package", "packages"),
    {
      name: "stage",
      type: "select",
      index: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Quoted", value: "quoted" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
    relation("owner", "users"),
    moneyGroup("value", "Estimated value"),
    {
      name: "followUps",
      type: "array",
      fields: [
        { name: "date", type: "date" },
        { name: "note", type: "text" },
        { name: "done", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "lostReason", type: "text" },
    { name: "createdVia", type: "text", admin: { description: "Attribution/campaign" } },
    aiAssistGroup,
  ],
};

export default Leads;
