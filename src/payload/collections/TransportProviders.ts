import type { CollectionConfig } from "@/payload/types";
import { isStaff } from "@/payload/access";
import { relation, statusField } from "@/payload/fields/common";

/** Fleet partners — vehicles per destination, safety flags for school tours. */
const TransportProviders: CollectionConfig = {
  slug: "transport-providers",
  timestamps: true,
  labels: { singular: "Transport Provider", plural: "Transport Providers" },
  admin: {
    useAsTitle: "name",
    group: "Supply",
    defaultColumns: ["name", "vendor", "status"],
  },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    relation("vendor", "vendors"),
    relation("destinations", "destinations", { hasMany: true }),
    {
      name: "vehicles",
      type: "array",
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Sedan", value: "sedan" },
            { label: "SUV", value: "suv" },
            { label: "Tempo Traveller", value: "tempo" },
            { label: "Mini Bus", value: "mini_bus" },
            { label: "Volvo / Coach", value: "coach" },
          ],
        },
        { name: "model", type: "text" },
        { name: "capacity", type: "number", min: 1 },
        { name: "count", type: "number", min: 0 },
        { name: "ac", type: "checkbox", defaultValue: true },
      ],
    },
    { name: "gpsEnabled", type: "checkbox", defaultValue: false },
    { name: "driversVerified", type: "checkbox", defaultValue: false },
    statusField(),
  ],
};

export default TransportProviders;
