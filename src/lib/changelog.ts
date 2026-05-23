// Source of truth for the public changelog at /changelog.
// Most-recent entry first. Adding an entry takes one PR — keeps freshness
// signals strong for SEO and gives subscribers something concrete to point at.

export type ChangelogEntry = {
  date: string; // ISO date (YYYY-MM-DD)
  title: string;
  tag: "Tool" | "Feature" | "Infrastructure" | "Polish";
  bullets: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-23",
    title: "tinygtm.tools is live + full SEO sweep",
    tag: "Infrastructure",
    bullets: [
      "Switched the canonical domain to tinygtm.tools",
      "Per-tool SEO landings: /utm-link-builder, /campaign-planner, /faq-generator",
      "Sitemap, robots.txt, llms.txt for AEO/LLM crawlers",
      "Structured data (SoftwareApplication, FAQPage, BreadcrumbList) on every landing",
      "Dynamic Open Graph image rendered via next/og",
      "Vercel Web Analytics + Speed Insights enabled",
    ],
  },
  {
    date: "2026-05-19",
    title: "GTM/Campaign Planner — Phase 1",
    tag: "Tool",
    bullets: [
      "Paste any campaign context, get a classified launch plan with operational tasks per phase",
      "Editable, exportable to CSV/TSV/Markdown, shareable as a view-only link",
      "Anonymous-friendly: try without an account, sign in to save",
    ],
  },
  {
    date: "2026-05-19",
    title: "Tools switcher in every tool's top nav",
    tag: "Polish",
    bullets: [
      "Hop between live tools without bouncing back to the landing",
      "Highlights the current tool, hides soon-tools, links 'Back to TinyGTM'",
    ],
  },
  {
    date: "2026-05-17",
    title: "FAQ Generator — Milestone 2",
    tag: "Feature",
    bullets: [
      "Multi-source input: product description, target audience, URL, PDF/DOCX/MD/TXT uploads",
      "FAQs grouped by persona, grounded in source material",
      "Edit inline, regenerate single FAQ, generate more, answer-gaps modal",
      "Exports: Markdown, JSON, DOCX, PDF",
    ],
  },
  {
    date: "2026-05-17",
    title: "UTM Link Builder & Tracker shipped",
    tag: "Tool",
    bullets: [
      "Build, validate, save, and reuse campaign tracking links",
      "Templates and per-parameter naming rules",
      "Duplicate detection across saved links",
      "CSV export for the whole campaign",
    ],
  },
];
