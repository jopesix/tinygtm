// /sitemap.xml — Next.js generates this from the returned array. Includes only
// public, indexable URLs (landings + homepage). Functional tool routes (/utm,
// /faq/new, /campaign/new) are linked from the landings but kept out of the
// sitemap so the SEO landings stay the canonical entry points.

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/utm-link-builder`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/campaign-planner`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/faq-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
