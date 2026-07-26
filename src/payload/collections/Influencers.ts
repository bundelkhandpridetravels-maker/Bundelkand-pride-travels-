import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import {
  aiAssistGroup,
  contactGroup,
  relation,
  statusField,
} from "@/payload/fields/common";

/**
 * Content/marketing partners. In the vision they graduate into Trip Captains;
 * this record holds their reach, niche and agreement.
 */
const Influencers: CollectionConfig = {
  slug: "influencers",
  timestamps: true,
  labels: { singular: "Influencer", plural: "Influencers" },
  admin: {
    useAsTitle: "name",
    group: "Partners",
    defaultColumns: ["name", "niche", "status"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    {
      name: "platforms",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
            { label: "TikTok", value: "tiktok" },
            { label: "Facebook", value: "facebook" },
          ],
        },
        { name: "handle", type: "text" },
        { name: "followers", type: "number", min: 0 },
      ],
    },
    { name: "niche", type: "text" },
    relation("destinationsCovered", "destinations", { hasMany: true }),
    relation("agreement", "contracts"),
    {
      name: "payoutModel",
      type: "select",
      options: [
        { label: "Flat fee", value: "flat" },
        { label: "Commission", value: "commission" },
        { label: "Barter", value: "barter" },
        { label: "Hybrid", value: "hybrid" },
      ],
    },
    contactGroup,
    relation("content", "media", { hasMany: true }),
    aiAssistGroup,
    { name: "notes", type: "textarea" },
    statusField(
      [
        { label: "Prospect", value: "prospect" },
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Archived", value: "archived" },
      ],
      "prospect",
    ),
  ],
};

export default Influencers;
