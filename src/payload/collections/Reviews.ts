import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { relation } from "@/payload/fields/common";

/**
 * Verified traveller feedback — the trust engine. Triggered after a trip
 * completes; feeds vendor scores and the Google-review strategy. `sentiment` is
 * AI-derived (advisory).
 */
const Reviews: CollectionConfig = {
  slug: "reviews",
  timestamps: true,
  labels: { singular: "Review", plural: "Reviews" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "rating", "source", "published"],
  },
  access: {
    // Public reads see only published reviews; staff see all.
    read: (args) => (isStaff(args) ? true : { published: { equals: true } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    relation("customer", "customers"),
    relation("booking", "bookings"),
    relation("package", "packages"),
    relation("destination", "destinations"),
    relation("vendor", "vendors"),
    { name: "rating", type: "number", min: 1, max: 5, required: true, index: true },
    { name: "title", type: "text" },
    { name: "body", type: "textarea" },
    { name: "photos", type: "upload", relationTo: "media", hasMany: true },
    { name: "videoUrl", type: "text" },
    {
      name: "source",
      type: "select",
      options: [
        { label: "On-site", value: "onsite" },
        { label: "Google", value: "google" },
        { label: "Instagram", value: "instagram" },
      ],
    },
    {
      name: "sentiment",
      type: "select",
      admin: { readOnly: true, aiWritable: true },
      options: [
        { label: "Positive", value: "positive" },
        { label: "Neutral", value: "neutral" },
        { label: "Negative", value: "negative" },
      ],
    },
    { name: "googleReviewRequested", type: "checkbox", defaultValue: false },
    { name: "googleReviewCompleted", type: "checkbox", defaultValue: false },
    { name: "published", type: "checkbox", defaultValue: false, index: true },
  ],
};

export default Reviews;
