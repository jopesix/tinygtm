// Missing context gap types — from PRD §13.
// The AI populates these in the missing_context[] array of its structured output.
// The UI renders these in the side panel (NOT inline with FAQs — output principle).

export type GapType =
  | "unclear_positioning"
  | "missing_implementation_details"
  | "ambiguous_claims"
  | "missing_pricing_context"
  | "missing_security_context"
  | "missing_edge_case_handling"
  | "missing_audience_specificity";

export type Severity = "low" | "medium" | "high";

export const GAP_TYPES: readonly { key: GapType; label: string; description: string }[] = [
  {
    key: "unclear_positioning",
    label: "Unclear positioning",
    description: "Product claims are broad or undefined.",
  },
  {
    key: "missing_implementation_details",
    label: "Missing implementation details",
    description: "Setup, integrations, or workflow fit are not explained.",
  },
  {
    key: "ambiguous_claims",
    label: "Ambiguous claims",
    description: "Copy makes claims without proof or scope.",
  },
  {
    key: "missing_pricing_context",
    label: "Missing pricing context",
    description: "Pricing or access is absent.",
  },
  {
    key: "missing_security_context",
    label: "Missing security context",
    description: "Security, data, or privacy concerns are not addressed.",
  },
  {
    key: "missing_edge_case_handling",
    label: "Missing edge-case handling",
    description: "Unusual workflows or failure cases are not covered.",
  },
  {
    key: "missing_audience_specificity",
    label: "Missing audience specificity",
    description: "Target audience is too broad.",
  },
] as const;

export function getGapTypeLabel(key: string): string {
  return GAP_TYPES.find((g) => g.key === key)?.label ?? key;
}
