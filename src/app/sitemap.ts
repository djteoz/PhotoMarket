import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Транслитерация для URL городов
function transliterate(text: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    " ": "-",
    "-": "-",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech"
  ).replace(/\/$/, "");

  // Static routes
  const staticRoutes = [
    { path: "", priority: 1.0, changeFreq: "daily" as const },
    { path: "/catalog", priority: 0.9, changeFreq: "daily" as const },
    { path: "/search", priority: 0.9, changeFreq: "daily" as const },
    { path: "/community", priority: 0.8, changeFreq: "daily" as const },
    { path: "/about", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/contacts", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/pricing", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/terms", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/faq", priority: 0.7, changeFreq: "weekly" as const },
  ];

  const routes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  // Dynamic routes - Studios
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

  // Dynamic routes - Cities
  const cities = await prisma.studio.groupBy({
    by: ["city"],
    _count: { city: true },
  });

  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/city/${transliterate(city.city)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Dynamic routes - Community posts
  const posts = await prisma.forumPost.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/community/post/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...studioRoutes, ...cityRoutes, ...postRoutes];
}
