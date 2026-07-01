import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4200";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/", // Block admin pages from crawlers
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
