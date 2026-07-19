import type { MetadataRoute } from "next";
import { packageDetails } from "@/data/packages";
import { destinationDetails } from "@/data/destination-details";
import { journalPosts } from "@/data/journal-posts";
import { siteUrl as baseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/packages", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/destinations", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/group-departures", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/journal", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms-conditions", priority: 0.2, changeFrequency: "yearly" as const },
  ];

  const dynamicRoutes = [
    ...Object.keys(packageDetails).map((slug) => ({ path: `/packages/${slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
    ...Object.keys(destinationDetails).map((slug) => ({ path: `/destinations/${slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
    ...Object.keys(journalPosts).map((slug) => ({ path: `/journal/${slug}`, priority: 0.6, changeFrequency: "monthly" as const })),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
