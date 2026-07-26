import type { CollectionConfig } from "@/payload/types";
import { anyone, isStaff } from "@/payload/access";
import { relation, tagsField } from "@/payload/fields/common";

/**
 * Upload collection — all images/video/posters. Files live in Cloudflare R2 when
 * wired (architecture.md). Public read so media can render on the site.
 */
const Media: CollectionConfig = {
  slug: "media",
  timestamps: true,
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
      { name: "hero", width: 1920 },
    ],
  },
  labels: { singular: "Media", plural: "Media" },
  admin: { group: "Content", defaultColumns: ["alt", "type", "destination"] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
    { name: "credit", type: "text" },
    {
      name: "type",
      type: "select",
      options: [
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
        { label: "Poster", value: "poster" },
        { label: "Document", value: "document" },
      ],
    },
    relation("destination", "destinations"),
    tagsField,
  ],
};

export default Media;
