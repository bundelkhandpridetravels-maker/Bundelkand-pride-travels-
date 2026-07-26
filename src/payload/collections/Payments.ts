import type { CollectionConfig } from "@/payload/types";
import { isStaff, requiresHumanApproval } from "@/payload/access";
import { currencyField, relation } from "@/payload/fields/common";

/**
 * Installments against a booking. Supports the cash-flow model: customer pays
 * before travel; vendor payouts are held to a release schedule. Refunds/payouts
 * are financial mutations → gated (requiresHumanApproval); AI never executes.
 */
const Payments: CollectionConfig = {
  slug: "payments",
  timestamps: true,
  labels: { singular: "Payment", plural: "Payments" },
  admin: {
    useAsTitle: "gatewayRef",
    group: "Finance",
    defaultColumns: ["booking", "type", "amount", "status", "dueDate"],
  },
  access: {
    read: isStaff,
    create: requiresHumanApproval,
    update: requiresHumanApproval,
    delete: requiresHumanApproval,
  },
  fields: [
    relation("booking", "bookings", { required: true }),
    { name: "installmentNumber", type: "number", min: 1 },
    {
      name: "type",
      type: "select",
      index: true,
      options: [
        { label: "Advance", value: "advance" },
        { label: "Balance", value: "balance" },
        { label: "Final", value: "final" },
        { label: "Refund", value: "refund" },
        { label: "Vendor payout", value: "vendor_payout" },
      ],
    },
    { name: "amount", type: "number", min: 0, required: true },
    currencyField(),
    { name: "dueDate", type: "date", index: true },
    { name: "paidAt", type: "date" },
    {
      // For vendor payouts: hold until this date per agreed terms.
      name: "releaseDate",
      type: "date",
      admin: { description: "Vendor payout hold date (cash-flow)" },
    },
    {
      name: "method",
      type: "select",
      options: [
        { label: "Razorpay", value: "razorpay" },
        { label: "UPI", value: "upi" },
        { label: "Bank transfer", value: "bank" },
        { label: "Card", value: "card" },
        { label: "Cash", value: "cash" },
      ],
    },
    { name: "gatewayRef", type: "text", index: true },
    {
      name: "status",
      type: "select",
      index: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
        { label: "Held", value: "held" },
      ],
    },
    { name: "notes", type: "textarea" },
  ],
};

export default Payments;
