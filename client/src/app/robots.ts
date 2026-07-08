import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/api";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/", // Block admin pages from crawlers
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
