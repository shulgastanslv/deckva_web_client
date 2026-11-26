import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/og";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/admin", "/api/", "/invite/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
