// Eval fixture shape. Each fixture defines inputs to /api/generate and a set
// of "golden" assertions about the output that should hold across reasonable
// prompt + model variations.

import type { PromptInputs } from "@/lib/prompts/faq";

export type Fixture = {
  id: string;
  name: string;
  inputs: PromptInputs;
  expect: {
    minFaqs: number;
    maxFaqs: number;
    /** Categories that MUST appear at least once in the generated faqs[]. */
    mustHaveCategories: string[];
    /** Categories that should NOT dominate (cap as a fraction of total). */
    shouldNotExceed?: { category: string; maxFraction: number }[];
    /** Gap types that MUST appear in missing_context[]. */
    mustHaveGapTypes: string[];
    /** Substring that MUST appear in at least one answer (case-insensitive). */
    mustMentionAny?: string[];
    /** Phrasing the model should NEVER produce in answers. */
    mustNotMention?: string[];
  };
  /** Optional rubric for the Sonnet judge. */
  judge?: {
    rubric: string;
    minScore: number; // 1-10
  };
};
