import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { moneyGroup, relation } from "@/payload/fields/common";

/**
 * Agreements of every kind (vendor/hotel/DMC/influencer/employment/NDA/…). The
 * legal backbone from the compliance foundation — designed for now, populated
 * later. `party` is polymorphic across the entities BPT contracts with.
 */
const Contracts: CollectionConfig = {
  slug: "contracts",
  timestamps: true,
  labels: { singular: "Contract", plural: "Contracts" },
  admin: {
    useAsTitle: "title",
    group: "Legal",
    defaultColumns: ["title", "contractType", "status", "expiryDate"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    {
      name: "contractType",
      type: "select",
      index: true,
      options: [
        { label: "Vendor", value: "vendor" },
        { label: "Hotel", value: "hotel" },
        { label: "DMC", value: "dmc" },
        { label: "Influencer", value: "influencer" },
        { label: "Employment", value: "employment" },
        { label: "Freelancer", value: "freelancer" },
        { label: "Developer", value: "developer" },
        { label: "NDA", value: "nda" },
        { label: "Other", value: "other" },
      ],
    },
    // Polymorphic counterparty.
    relation("party", ["vendors", "influencers", "users", "dmcs", "transport-providers"]),
    {
      name: "status",
      type: "select",
      index: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Signed", value: "signed" },
        { label: "Expired", value: "expired" },
        { label: "Terminated", value: "terminated" },
      ],
    },
    { name: "effectiveDate", type: "date" },
    { name: "expiryDate", type: "date", index: true },
    relation("documents", "documents", { hasMany: true }),
    { name: "signedBy", type: "text" },
    moneyGroup("value", "Contract value"),
    { name: "notes", type: "textarea" },
  ],
};

export default Contracts;
