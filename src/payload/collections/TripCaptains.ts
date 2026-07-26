import type { CollectionConfig } from "@/payload/types";
import { isStaff, vendorScoped } from "@/payload/access";
import { relation, statusField } from "@/payload/fields/common";

/**
 * Trip Captains — influencers/partners who lead trips (vision). Tracks trips,
 * commission, performance and referral attribution. A captain user sees only
 * their own record (reuses the same row-level scoping pattern as vendors).
 */
const TripCaptains: CollectionConfig = {
  slug: "trip-captains",
  timestamps: true,
  labels: { singular: "Trip Captain", plural: "Trip Captains" },
  admin: {
    useAsTitle: "displayName",
    group: "Partners",
    defaultColumns: ["displayName", "commissionRate", "performanceScore", "status"],
  },
  access: {
    read: vendorScoped("user"),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: "displayName", type: "text", required: true, index: true },
    relation("user", "users"),
    relation("influencer", "influencers"),
    relation("destinations", "destinations", { hasMany: true }),
    relation("trips", "bookings", { hasMany: true }),
    { name: "commissionRate", type: "number", min: 0, max: 100 },
    {
      name: "performanceScore",
      type: "number",
      min: 0,
      max: 100,
      admin: { readOnly: true, aiWritable: true },
    },
    { name: "referralCode", type: "text", unique: true, index: true },
    statusField(
      [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Inactive", value: "inactive" },
      ],
      "active",
    ),
  ],
};

export default TripCaptains;
