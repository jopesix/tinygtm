// /robots.txt — Allow all crawlers on public pages. Block API routes, auth
// callbacks, dashboards, and per-user share/result pages from indexing.
// Sitemap is advertised here.

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/login",
          "/faq/dashboard",
          "/faq/generate",
          "/faq/new",
          "/faq/share/",
          "/campaign/dashboard",
          "/campaign/new",
          "/campaign/result",
          "/campaign/share/",
          "/utm/dashboard",
          "/utm/settings/",
          "/utm/campaigns/",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
