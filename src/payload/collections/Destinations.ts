import type { CollectionConfig } from "@/payload/types";
import { isStaff, readPublishedOrStaff } from "@/payload/access";
import {
  relation,
  seoGroup,
  slugField,
  statusField,
  tagsField,
} from "@/payload/fields/common";

/**
 * Places BPT sells. `country` + `phase` + `verificationStatus` support the
 * destination-by-destination scaling strategy (Manali→…→International) and the
 * founder's "verify every destination" model.
 */
const Destinations: CollectionConfig = {
  slug: "destinations",
  timestamps: true,
  versions: { drafts: true },
  labels: { singular: "Destination", plural: "Destinations" },
  admin: {
    useAsTitle: "name",
    group: "Catalogue",
    defaultColumns: ["name", "country", "phase", "verificationStatus", "status"],
  },
  access: {
    read: readPublishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    slugField("name"),
    { name: "country", type: "text", index: true, defaultValue: "India" },
    { name: "region", type: "text" },
    { name: "coordinates", type: "point" },
    {
      // Ties to the phased rollout: 1=Manali, 2=Kashmir, 3=Ladakh, 4=Jaisalmer…
      name: "phase",
      type: "number",
      min: 1,
      admin: { description: "Rollout phase", position: "sidebar" },
    },
    {
      name: "verificationStatus",
      type: "select",
      index: true,
      defaultValue: "planned",
      options: [
        { label: "Planned", value: "planned" },
        { label: "Scouting", value: "scouting" },
        { label: "Verifying", value: "verifying" },
        { label: "Verified", value: "verified" },
      ],
    },
    { name: "heroMedia", type: "upload", relationTo: "media" },
    { name: "overview", type: "richText" },
    {
      name: "bestSeasons",
      type: "array",
      fields: [{ name: "season", type: "text" }],
    },
    {
      name: "highlights",
      type: "array",
      fields: [{ name: "highlight", type: "text" }],
    },
    relation("verifiedVendors", "vendors", { hasMany: true }),
    tagsField,
    seoGroup,
    statusField(),
  ],
};

export default Destinations;
