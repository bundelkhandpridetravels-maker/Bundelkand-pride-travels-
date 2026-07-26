import type { CollectionConfig } from "@/payload/types";
import { ROLES, isAdmin, isStaff, isAdminOrSelf } from "@/payload/access";
import { relation } from "@/payload/fields/common";

/** Staff + role-bearing accounts. The only auth-enabled collection at first. */
const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  timestamps: true,
  labels: { singular: "User", plural: "Users" },
  admin: {
    useAsTitle: "email",
    group: "Access",
    defaultColumns: ["name", "email", "role", "active"],
  },
  access: {
    read: isStaff,
    create: isAdmin,
    update: isAdminOrSelf(),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      index: true,
      defaultValue: "sales",
      options: ROLES.map((r) => ({ label: r, value: r })),
    },
    { name: "phone", type: "text" },
    { name: "active", type: "checkbox", defaultValue: true, index: true },
    // Set for vendor-scoped accounts; drives vendorScoped() row-level access.
    relation("vendor", "vendors"),
    { name: "avatar", type: "upload", relationTo: "media" },
    { name: "lastLoginAt", type: "date", admin: { readOnly: true } },
  ],
};

export default Users;
