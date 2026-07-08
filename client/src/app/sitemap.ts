import { MetadataRoute } from "next";
import { api, SITE_URL } from "@/lib/api";
import { Category, Post, PaginatedResponse } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  let posts: Post[] = [];
  try {
    const res = await api.getPosts({ limit: "100" });
    if (res && Array.isArray((res as any).data)) {
      posts = (res as PaginatedResponse<Post>).data;
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap:", error);
  }

  let categories: Category[] = [];
  try {
    const res = await api.getCategories();
    if (Array.isArray(res)) {
      categories = res as Category[];
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }

  const postsSitemap = posts.map((post) => {
    const isLookbook = post.category?.slug === "outfits";
    return {
      url: `${baseUrl}${isLookbook ? "/lookbook" : "/blog"}/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  const categoriesSitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const routes = ["", "/blog", "/shop", "/about", "/lookbook"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  return [...routes, ...postsSitemap, ...categoriesSitemap];
}
