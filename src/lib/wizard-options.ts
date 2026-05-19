// Options for the 4-step "new FAQ session" wizard.
// FAQ destination shapes tone + length. Focus areas bias which categories
// Claude leans into.

export type FaqDestinationKey =
  | "launch_page"
  | "help_centre"
  | "sales_page"
  | "product_update"
  | "internal_enablement"
  | "demo_page"
  | "other";

export const FAQ_DESTINATIONS: readonly { key: FaqDestinationKey; label: string; promptHint: string }[] = [
  {
    key: "launch_page",
    label: "Launch page",
    promptHint:
      "Punchy, conversion-oriented FAQs for a launch page. Short answers, lead with benefits, anticipate the most common visitor questions.",
  },
  {
    key: "help_centre",
    label: "Help centre",
    promptHint:
      "Thorough help-centre FAQs. Longer, more procedural answers. Cover edge cases. Customers landing here are looking for specific resolution.",
  },
  {
    key: "sales_page",
    label: "Sales page",
    promptHint:
      "Objection-handling sales FAQs. Address buyer concerns, comparisons, ROI, implementation, security. Tone is confident and proof-driven.",
  },
  {
    key: "product_update",
    label: "Product update",
    promptHint:
      "Release-note FAQs explaining a new feature or change. Cover what changed, what's affected, what users need to do, and rollback / migration concerns.",
  },
  {
    key: "internal_enablement",
    label: "Internal enablement material",
    promptHint:
      "FAQs for an internal sales / CS / support team. Tone is practical, includes positioning notes, common customer pushback, and how to handle it.",
  },
  {
    key: "demo_page",
    label: "Demo page",
    promptHint:
      "Pre-demo FAQs that set expectations before a sales call. Cover what to bring, how long, what's covered, and post-demo next steps.",
  },
  {
    key: "other",
    label: "Other",
    promptHint:
      "General-purpose FAQs adaptable to multiple surfaces. Plain language, balanced coverage.",
  },
] as const;

export function getFaqDestination(key: string) {
  return FAQ_DESTINATIONS.find((d) => d.key === key) ?? FAQ_DESTINATIONS[FAQ_DESTINATIONS.length - 1];
}

export type FocusAreaKey =
  | "pricing"
  | "features"
  | "setup"
  | "security"
  | "integrations"
  | "data_and_privacy"
  | "use_cases"
  | "comparisons"
  | "limitations"
  | "support"
  | "how_to"
  | "general";

export const FOCUS_AREAS: readonly { key: FocusAreaKey; label: string }[] = [
  { key: "pricing", label: "Pricing" },
  { key: "features", label: "Features" },
  { key: "setup", label: "Setup" },
  { key: "security", label: "Security" },
  { key: "integrations", label: "Integrations" },
  { key: "data_and_privacy", label: "Data and privacy" },
  { key: "use_cases", label: "Use cases" },
  { key: "comparisons", label: "Comparisons" },
  { key: "limitations", label: "Limitations" },
  { key: "support", label: "Support" },
  { key: "how_to", label: "How to" },
  { key: "general", label: "General" },
] as const;

export function getFocusAreaLabel(key: string): string {
  return FOCUS_AREAS.find((f) => f.key === key)?.label ?? key;
}
