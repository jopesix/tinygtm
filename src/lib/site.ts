// Site-wide config. Single source of truth for hostname, OG image, and brand
// strings used in metadata, sitemap, robots, llms.txt, JSON-LD, etc.

export const SITE = {
  name: "TinyGTM",
  url: "https://tinygtm.tools",
  title: "TinyGTM — Tiny marketing utilities",
  tagline: "Tiny tools for the marketing work you repeat weekly.",
  description:
    "Free marketing utilities for solo founders and small GTM teams. Build UTM tracking links, generate FAQs from your product, and plan launch campaigns — no sign-up required.",
  author: "Peace Itimi",
  authorUrl: "https://peaceitimi.com",
  twitter: "@peaceitimi",
  ogImage: "/og.png",
  locale: "en_US",
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE.url}${path}`;
}
