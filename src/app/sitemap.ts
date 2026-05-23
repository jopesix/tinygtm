// /sitemap.xml — Next.js generates this from the returned array.
// Includes: homepage, per-tool SEO landings, /about, /changelog, and one
// entry per programmatic page (UTM channels, campaign types, FAQ use cases).
// Functional tool routes (/utm, /faq/new, /campaign/new) are linked from
// landings but kept out of the sitemap so SEO landings stay the canonical
// entry points.

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { UTM_CHANNELS } from "@/lib/utm-channels";
import { CAMPAIGN_TYPES } from "@/lib/campaign-types";
import { FAQ_USE_CASES } from "@/lib/faq-use-cases";

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

  // Programmatic SEO: UTM channels.
  const channelPages: MetadataRoute.Sitemap = UTM_CHANNELS.map((c) => ({
    url: `${SITE.url}/utm-link-builder/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Programmatic SEO: campaign types.
  const campaignTypePages: MetadataRoute.Sitemap = CAMPAIGN_TYPES.map((c) => ({
    url: `${SITE.url}/campaign-planner/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Programmatic SEO: FAQ use cases.
  const faqUseCasePages: MetadataRoute.Sitemap = FAQ_USE_CASES.map((c) => ({
    url: `${SITE.url}/faq-generator/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...core, ...channelPages, ...campaignTypePages, ...faqUseCasePages];
}
