import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { aiAssistGroup, moneyGroup, relation } from "@/payload/fields/common";

/**
 * The operational heart: a confirmed trip. Carries pricing/P&L and vendor
 * assignment. Money movement (payments, payouts, refunds) lives in Payments and
 * is ApprovalQueue-gated — AI may prepare, never auto-execute (security §12).
 */
const Bookings: CollectionConfig = {
  slug: "bookings",
  timestamps: true,
  labels: { singular: "Booking", plural: "Bookings" },
  admin: {
    useAsTitle: "bookingRef",
    group: "Operations",
    defaultColumns: ["bookingRef", "customer", "status", "travelStartDate"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "bookingRef", type: "text", unique: true, index: true },
    relation("customer", "customers", { required: true }),
    relation("package", "packages"),
    relation("tripCaptain", "trip-captains"),
    { name: "travelStartDate", type: "date", index: true },
    { name: "travelEndDate", type: "date" },
    {
      name: "travellers",
      type: "group",
      fields: [
        { name: "adults", type: "number", min: 0, defaultValue: 1 },
        { name: "children", type: "number", min: 0, defaultValue: 0 },
        { name: "infants", type: "number", min: 0, defaultValue: 0 },
      ],
    },
    {
      name: "status",
      type: "select",
      index: true,
      defaultValue: "enquiry",
      options: [
        { label: "Enquiry", value: "enquiry" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Partially paid", value: "partially_paid" },
        { label: "Paid", value: "paid" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    { name: "pickupPoint", type: "text" },
    { name: "dropPoint", type: "text" },
    relation("allocatedHotel", "hotels"),
    relation("assignedVendors", "vendors", { hasMany: true }),
    {
      name: "pricing",
      type: "group",
      fields: [
        moneyGroup("total", "Booking amount"),
        moneyGroup("paid", "Paid so far"),
        moneyGroup("balance", "Balance due"),
        moneyGroup("vendorCost", "Vendor cost"),
        moneyGroup("margin", "Margin"),
        {
          name: "paymentTier",
          type: "select",
          admin: { description: "Advance schedule (configurable in settings)" },
          options: [
            { label: ">20 days (40/40/20)", value: "standard" },
            { label: "7–20 days (higher advance)", value: "near" },
            { label: "<7 days (full advance)", value: "last_minute" },
          ],
        },
      ],
    },
    { name: "source", type: "text" },
    { name: "notes", type: "textarea" },
    aiAssistGroup,
  ],
};

export default Bookings;
