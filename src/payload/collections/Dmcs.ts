import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { contactGroup, relation, statusField } from "@/payload/fields/common";

/** Destination Management Companies — on-ground partners per destination. */
const Dmcs: CollectionConfig = {
  slug: "dmcs",
  timestamps: true,
  labels: { singular: "DMC", plural: "DMCs" },
  admin: {
    useAsTitle: "name",
    group: "Supply",
    defaultColumns: ["name", "vendor", "status"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    relation("vendor", "vendors"),
    relation("destinationsServed", "destinations", { hasMany: true }),
    {
      name: "services",
      type: "select",
      hasMany: true,
      options: [
        { label: "Hotels", value: "hotels" },
        { label: "Transport", value: "transport" },
        { label: "Guides", value: "guides" },
        { label: "Activities", value: "activities" },
        { label: "Permits", value: "permits" },
        { label: "Full package", value: "full" },
      ],
    },
    contactGroup,
    {
      name: "contractStatus",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Draft", value: "draft" },
        { label: "Signed", value: "signed" },
        { label: "Expired", value: "expired" },
      ],
    },
    { name: "rating", type: "number", min: 0, max: 5, admin: { readOnly: true, aiWritable: true } },
    statusField(),
  ],
};

export default Dmcs;
