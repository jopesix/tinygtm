// FAQ intent categories — from PRD §11.
// The AI groups generated questions by these categories.
// Stored as enum-ish strings; UI renders them as section headers.

export type FaqCategory =
  | "product_understanding"
  | "onboarding_and_setup"
  | "workflow_and_integration"
  | "objections_and_concerns"
  | "feature_clarification"
  | "pricing_and_access"
  | "edge_cases"
  | "technical_clarification"
  | "stakeholder_concerns";

export const FAQ_CATEGORIES: readonly { key: FaqCategory; label: string; purpose: string }[] = [
  {
    key: "product_understanding",
    label: "Product understanding",
    purpose: "Clarifies what the product is and who it is for.",
  },
  {
    key: "onboarding_and_setup",
    label: "Onboarding & setup",
    purpose: "Explains what's needed to begin.",
  },
  {
    key: "workflow_and_integration",
    label: "Workflow & integration",
    purpose: "Explains how the product fits existing systems.",
  },
  {
    key: "objections_and_concerns",
    label: "Objections & concerns",
    purpose: "Handles hesitation, trust, risk, and adoption concerns.",
  },
  {
    key: "feature_clarification",
    label: "Feature clarification",
    purpose: "Explains specific capabilities and limitations.",
  },
  {
    key: "pricing_and_access",
    label: "Pricing & access",
    purpose: "Addresses packaging, limits, plans, and access.",
  },
  {
    key: "edge_cases",
    label: "Edge cases",
    purpose: "Addresses unusual or complex scenarios.",
  },
  {
    key: "technical_clarification",
    label: "Technical clarification",
    purpose: "Explains security, data, compatibility, and implementation details.",
  },
  {
    key: "stakeholder_concerns",
    label: "Stakeholder concerns",
    purpose: "Addresses concerns from buyers, admins, legal, IT, or leadership.",
  },
] as const;

export function getCategoryLabel(key: string): string {
  return FAQ_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
