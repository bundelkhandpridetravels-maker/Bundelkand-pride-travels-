import type { CollectionConfig } from "@/payload/types";
import { isStaff, readPublishedOrStaff } from "@/payload/access";
import {
  moneyGroup,
  relation,
  seoGroup,
  slugField,
  statusField,
} from "@/payload/fields/common";

/** Sellable products. `tourType` drives the per-type business logic + template. */
const Packages: CollectionConfig = {
  slug: "packages",
  timestamps: true,
  versions: { drafts: true },
  labels: { singular: "Package", plural: "Packages" },
  admin: {
    useAsTitle: "title",
    group: "Catalogue",
    defaultColumns: ["title", "destination", "tourType", "status"],
  },
  access: {
    read: readPublishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    slugField("title"),
    relation("destination", "destinations", { required: true }),
    {
      name: "tourType",
      type: "select",
      index: true,
      required: true,
      defaultValue: "fit",
      options: [
        { label: "FIT (customised)", value: "fit" },
        { label: "Fixed group departure", value: "group" },
        { label: "Corporate", value: "corporate" },
        { label: "School & College", value: "school" },
        { label: "Honeymoon", value: "honeymoon" },
      ],
    },
    { name: "nights", type: "number", min: 0 },
    { name: "days", type: "number", min: 0 },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Budget", value: "budget" },
        { label: "Standard", value: "standard" },
        { label: "Premium", value: "premium" },
        { label: "Luxury", value: "luxury" },
      ],
    },
    {
      name: "pickup",
      type: "group",
      fields: [
        { name: "location", type: "text" },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Airport", value: "airport" },
            { label: "Railway station", value: "railway" },
            { label: "Bus stand", value: "bus" },
            { label: "Hotel", value: "hotel" },
          ],
        },
      ],
    },
    { name: "dropLocation", type: "text" },
    {
      name: "mealPlan",
      type: "select",
      options: [
        { label: "Room only", value: "ep" },
        { label: "Breakfast", value: "cp" },
        { label: "Breakfast + Dinner", value: "map" },
        { label: "All meals", value: "ap" },
      ],
    },
    {
      name: "hotelCategory",
      type: "select",
      options: [
        { label: "3 Star", value: "3" },
        { label: "4 Star", value: "4" },
        { label: "5 Star", value: "5" },
        { label: "Premium", value: "premium" },
      ],
    },
    relation("itinerary", "itineraries"),
    { name: "inclusions", type: "array", fields: [{ name: "item", type: "text" }] },
    { name: "exclusions", type: "array", fields: [{ name: "item", type: "text" }] },
    moneyGroup("priceFrom", "Starting price / person"),
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "videos",
      type: "array",
      fields: [
        { name: "url", type: "text" },
        { name: "caption", type: "text" },
      ],
    },
    {
      name: "faq",
      type: "array",
      fields: [
        { name: "question", type: "text" },
        { name: "answer", type: "textarea" },
      ],
    },
    {
      name: "policies",
      type: "array",
      fields: [
        { name: "title", type: "text" },
        { name: "body", type: "textarea" },
      ],
    },
    relation("reviews", "reviews", { hasMany: true }),
    seoGroup,
    statusField(),
  ],
};

export default Packages;
