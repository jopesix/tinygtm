// /sitemap.xml — Next.js generates this from the returned array.
// Includes: homepage, per-tool SEO landings, /about, /changelog, and one
// entry per programmatic channel page. Functional tool routes (/utm,
// /faq/new, /campaign/new) are linked from landings but kept out of the
// sitemap so SEO landings stay the canonical entry points.

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { UTM_CHANNELS } from "@/lib/utm-channels";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
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
    {
      url: `${SITE.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Programmatic SEO: one entry per channel under /utm-link-builder/*.
  const channelPages: MetadataRoute.Sitemap = UTM_CHANNELS.map((c) => ({
    url: `${SITE.url}/utm-link-builder/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...core, ...channelPages];
}
