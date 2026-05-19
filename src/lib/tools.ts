// Tool index for the landing. When UTM Builder + Campaign Briefs +
// Experiments come online, flip `status` to "live" and fill `href`.
//
// `href` is null for "soon" — the tool card renders as a non-link <div>.

export type ToolStatus = "live" | "soon";

export type Tool = {
  number: string;
  slug: string; // used in the dropdown panel + aria labels
  name: string;
  shortName: string; // for the dropdown panel
  shortDesc: string; // for the dropdown panel
  longDesc: string; // for the card body
  ctaLabel: string;
  tag: string;
  status: ToolStatus;
  href: string | null;
};

export const TOOLS: readonly Tool[] = [
  {
    number: "01",
    slug: "utm",
    name: "UTM Link Builder & Tracker",
    shortName: "UTM Links",
    shortDesc: "Builder & tracker for clean campaign URLs",
    longDesc:
      "Build, store, and reuse campaign tracking links without breaking your naming conventions. Templates, duplicate detection, CSV export.",
    ctaLabel: "Open UTM Links",
    tag: "Growth · Demand gen",
    status: "live",
    // Internal /utm path → 307 redirect to the external UTM Builder app.
    // When tools consolidate into this monorepo, /utm becomes a real route
    // group and the link doesn't need to change.
    href: "/utm",
  },
  {
    number: "02",
    slug: "campaign",
    name: "Campaign Operations Planner",
    shortName: "Campaign Planner",
    shortDesc: "Turn messy campaign context into an executable launch plan",
    longDesc:
      "Paste your kickoff notes, transcript, or Slack thread. We classify the campaign, build a tailored launch plan with operational tasks per phase, and flag gaps you might have forgotten.",
    ctaLabel: "Open Campaign Planner",
    tag: "PMM · Founders · Demand gen",
    status: "live",
    href: "/campaign/new",
  },
  {
    number: "03",
    slug: "faq",
    name: "FAQ Generator",
    shortName: "Product FAQs",
    shortDesc: "Realistic customer FAQs from product docs",
    longDesc:
      "Generate realistic customer FAQs from product docs, URLs, PRDs, and call notes; grouped by persona, grounded in your source material.",
    ctaLabel: "Open Product FAQs",
    tag: "PMM · Sales enablement",
    status: "live",
    // Internal /faq path → 307 redirect to the external FAQ Generator app.
    href: "/faq",
  },
  {
    number: "04",
    slug: "experiments",
    name: "Marketing Experiment Generator",
    shortName: "Experiments",
    shortDesc: "Structured growth experiments & learnings",
    longDesc:
      "Generate structured growth experiments your team can actually run — across paid, lifecycle, content, onboarding. Keep a log of what you learned.",
    ctaLabel: "Open Experiments",
    tag: "Growth · PLG · Lifecycle",
    status: "soon",
    href: null,
  },
] as const;

export function liveCount(): number {
  return TOOLS.filter((t) => t.status === "live").length;
}
