import { z } from "zod";
import { MAX_PASTE } from "./generate";

export const InferContextRequestSchema = z.object({
  // At least one of resource_text or product_url should produce useful output.
  resource_text: z.string().max(MAX_PASTE).optional(),
  resource_type: z.string().max(40).optional(),
  product_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (v) => v === undefined || v === "" || /^https?:\/\//i.test(v),
      "Must be http(s) URL if provided",
    ),
  product_description_seed: z.string().max(4_000).optional(),
  reader_seed: z.string().max(500).optional(),
  faq_destination: z.string().max(40).optional(),
  focus_areas: z.array(z.string().max(60)).max(20).optional(),
});

export type InferContextRequest = z.infer<typeof InferContextRequestSchema>;

export const InferContextResponseSchema = z.object({
  product_summary: z.string().min(5).max(1_200),
  target_reader: z.string().min(2).max(500),
  main_use_case: z.string().min(5).max(800),
  main_value_prop: z.string().min(5).max(800),
  likely_themes: z.array(z.string().min(2).max(200)).min(2).max(12),
});

export type InferContextResponse = z.infer<typeof InferContextResponseSchema>;
