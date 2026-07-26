import type { CollectionConfig } from "@/payload/types";
import { isStaff, readPublishedOrStaff } from "@/payload/access";
import { relation, statusField } from "@/payload/fields/common";

/**
 * Day-wise plans, kept separate from Packages so an itinerary can be templated
 * and reused across products/departures and versioned independently.
 */
const Itineraries: CollectionConfig = {
  slug: "itineraries",
  timestamps: true,
  versions: { drafts: true },
  labels: { singular: "Itinerary", plural: "Itineraries" },
  admin: {
    useAsTitle: "title",
    group: "Catalogue",
    defaultColumns: ["title", "destination", "version", "status"],
  },
  access: {
    read: readPublishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    relation("package", "packages"),
    relation("destination", "destinations"),
    {
      name: "days",
      type: "array",
      fields: [
        { name: "dayNumber", type: "number", min: 1 },
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "meals", type: "text" },
        { name: "stayCategory", type: "text" },
        {
          name: "activities",
          type: "array",
          fields: [{ name: "activity", type: "text" }],
        },
      ],
    },
    { name: "version", type: "number", defaultValue: 1, admin: { position: "sidebar" } },
    {
      name: "reusableTemplate",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Can be cloned onto other packages" },
    },
    statusField(),
  ],
};

export default Itineraries;
