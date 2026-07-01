import { MetadataRoute } from "next";
import { api } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4200";

  let postsSlugs: string[] = [];
  try {
    const res = await api.getPostSlugs();
    if (Array.isArray(res)) {
      postsSlugs = res;
    }
  } catch (error) {
    console.error("Failed to fetch post slugs for sitemap:", error);
  }

  const postsSitemap = postsSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routes = ["", "/blog", "/shop", "/about"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  return [...routes, ...postsSitemap];
}
