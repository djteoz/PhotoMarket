import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  // Static routes
  const routes = ["", "/studios", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  // Dynamic routes (Studios)
  const studios = await prisma.studio.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const studioRoutes = studios.map((studio) => ({
    url: `${baseUrl}/studios/${studio.id}`,
    lastModified: studio.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...studioRoutes];
}
