import type { CollectionConfig } from "@/payload/types";
import { isStaff, readPublishedOrStaff } from "@/payload/access";
import { addressGroup, relation, statusField } from "@/payload/fields/common";

/**
 * Property records. Category-based (blueprint: never guarantee an exact hotel).
 * `representative` marks the sample partner hotels shown for a star category.
 */
const Hotels: CollectionConfig = {
  slug: "hotels",
  timestamps: true,
  labels: { singular: "Hotel", plural: "Hotels" },
  admin: {
    useAsTitle: "name",
    group: "Supply",
    defaultColumns: ["name", "destination", "starCategory", "status"],
  },
  access: {
    read: readPublishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    relation("destination", "destinations", { required: true }),
    relation("vendor", "vendors"),
    {
      name: "starCategory",
      type: "select",
      index: true,
      options: [
        { label: "3 Star", value: "3" },
        { label: "4 Star", value: "4" },
        { label: "5 Star", value: "5" },
        { label: "Premium", value: "premium" },
        { label: "Boutique / Homestay", value: "boutique" },
      ],
    },
    {
      name: "representative",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Show as a sample partner hotel for its category" },
    },
    addressGroup,
    {
      name: "amenities",
      type: "select",
      hasMany: true,
      options: [
        { label: "Wi-Fi", value: "wifi" },
        { label: "Restaurant", value: "restaurant" },
        { label: "Parking", value: "parking" },
        { label: "Pool", value: "pool" },
        { label: "Spa", value: "spa" },
        { label: "Heating", value: "heating" },
        { label: "Power backup", value: "power_backup" },
      ],
    },
    {
      name: "roomTypes",
      type: "array",
      fields: [
        { name: "name", type: "text" },
        { name: "occupancy", type: "number", min: 1 },
        { name: "count", type: "number", min: 0 },
        { name: "mealPlan", type: "text" },
      ],
    },
    { name: "images", type: "upload", relationTo: "media", hasMany: true },
    { name: "mapLink", type: "text" },
    { name: "description", type: "textarea" },
    statusField(),
  ],
};

export default Hotels;
