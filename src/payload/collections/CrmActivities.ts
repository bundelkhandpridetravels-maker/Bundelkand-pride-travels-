import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { relation } from "@/payload/fields/common";

/** Timeline of touches against a lead/customer. AI can log + draft activities. */
const CrmActivities: CollectionConfig = {
  slug: "crm-activities",
  timestamps: true,
  labels: { singular: "CRM Activity", plural: "CRM Activities" },
  admin: {
    useAsTitle: "subject",
    group: "CRM",
    defaultColumns: ["subject", "type", "owner", "dueDate", "completed"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    relation("lead", "leads"),
    relation("customer", "customers"),
    {
      name: "type",
      type: "select",
      index: true,
      required: true,
      defaultValue: "note",
      options: [
        { label: "Call", value: "call" },
        { label: "Email", value: "email" },
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Meeting", value: "meeting" },
        { label: "Note", value: "note" },
        { label: "Task", value: "task" },
      ],
    },
    { name: "subject", type: "text", required: true },
    { name: "body", type: "textarea" },
    { name: "dueDate", type: "date" },
    { name: "completed", type: "checkbox", defaultValue: false, index: true },
    relation("owner", "users"),
    {
      name: "aiGenerated",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Logged/drafted by Hermes AI", readOnly: true },
    },
  ],
};

export default CrmActivities;
