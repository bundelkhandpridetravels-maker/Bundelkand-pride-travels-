import type { CollectionConfig } from "@/payload/types";
import { isStaff, vendorScoped } from "@/payload/access";
import {
  addressGroup,
  aiAssistGroup,
  contactGroup,
  relation,
} from "@/payload/fields/common";

/**
 * The trust record for every supplier — "who they are" (business, legal,
 * verification, quality score). Hotels/DMCs/TransportProviders describe "what
 * they supply" and link back here. Central to the blueprint's curated,
 * verified-vendor model + the ranking engine.
 */
const Vendors: CollectionConfig = {
  slug: "vendors",
  timestamps: true,
  labels: { singular: "Vendor", plural: "Vendors" },
  admin: {
    useAsTitle: "businessName",
    group: "Supply",
    defaultColumns: ["businessName", "type", "verificationStatus", "qualityScore"],
  },
  access: {
    // A vendor user reads only their own record; staff read all.
    read: vendorScoped("id"),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "businessName", type: "text", required: true, index: true },
    {
      name: "type",
      type: "select",
      index: true,
      options: [
        { label: "Hotel", value: "hotel" },
        { label: "DMC", value: "dmc" },
        { label: "Transport", value: "transport" },
        { label: "Guide", value: "guide" },
        { label: "Activity", value: "activity" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "ownerName", type: "text" },
    contactGroup,
    addressGroup,
    relation("destinations", "destinations", { hasMany: true }),
    { name: "gst", type: "text" },
    { name: "pan", type: "text" },
    { name: "businessAgeYears", type: "number", min: 0 },
    { name: "googleReviewsUrl", type: "text" },
    { name: "googleRating", type: "number", min: 0, max: 5 },
    { name: "avgResponseMins", type: "number", min: 0 },
    {
      name: "verificationStatus",
      type: "select",
      index: true,
      defaultValue: "unverified",
      options: [
        { label: "Unverified", value: "unverified" },
        { label: "Pending review", value: "pending" },
        { label: "Verified", value: "verified" },
        { label: "Rejected", value: "rejected" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    {
      name: "agreementStatus",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Draft", value: "draft" },
        { label: "Signed", value: "signed" },
        { label: "Expired", value: "expired" },
      ],
    },
    {
      // Output of the ranking engine — advisory, never hand-edited.
      name: "qualityScore",
      type: "number",
      min: 0,
      max: 100,
      admin: { readOnly: true, aiWritable: true, position: "sidebar" },
    },
    relation("documents", "documents", { hasMany: true }),
    { name: "photos", type: "upload", relationTo: "media", hasMany: true },
    aiAssistGroup,
    {
      name: "status",
      type: "select",
      index: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
};

export default Vendors;
