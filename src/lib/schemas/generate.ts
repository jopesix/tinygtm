import { z } from "zod";
import { FAQ_CATEGORIES } from "@/lib/faq-categories";
import { GAP_TYPES } from "@/lib/missing-context-types";

const categoryKeys = FAQ_CATEGORIES.map((c) => c.key) as [string, ...string[]];
const gapKeys = GAP_TYPES.map((g) => g.key) as [string, ...string[]];

export const MAX_PASTE = 50_000;

const baseInputs = {
  product_description: z.string().trim().min(10).max(4_000),
  product_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be http(s) URL")
    .optional()
    .or(z.literal("").optional()),
  target_audience: z.string().trim().min(3).max(500),
  key_problem: z.string().trim().min(5).max(1_000),
  // "persona" is now free-text from the wizard's Reader field (was an enum of 5 fixed personas
  // before 2026-05-18). Keep the field name so the DB column and downstream prompt keep working.
  persona: z.string().trim().min(2).max(500),
  resource_type: z
    .enum(["prd", "transcript", "release_notes", "support_ticket", "help_doc", "customer_interview", "other"])
    .optional(),
  resource_text: z.string().max(MAX_PASTE).optional(),
  // New wizard fields — passed to the prompt but not currently persisted in DB.
  faq_destination: z.string().max(40).optional(),
  focus_areas: z.array(z.string().max(60)).max(20).optional(),
  main_value_prop: z.string().max(800).optional(),
  likely_themes: z.array(z.string().max(200)).max(12).optional(),
};

export const GenerateRequestSchema = z.discriminatedUnion("mode", [
  // Initial generation — first run for a session.
  z.object({
    mode: z.literal("initial").default("initial"),
    ...baseInputs,
    product_profile_id: z.string().uuid().nullable().optional(),
    save_as_profile: z.boolean().optional(),
    profile_name: z.string().trim().max(80).optional(),
  }),
  // Generate more — append N new FAQs to an existing session.
  // session_id required only for signed-in persistence; anonymous can iterate purely in-memory.
  z.object({
    mode: z.literal("more"),
    ...baseInputs,
    session_id: z.string().uuid().nullable().optional(),
    existing_faqs: z
      .array(z.object({ question: z.string().min(1).max(500), category: z.string().max(80) }))
      .max(40),
    additional_count: z.number().int().min(1).max(10).default(6),
  }),
  // Regenerate a single FAQ — replace one row with an improved version.
  z.object({
    mode: z.literal("regenerate_one"),
    ...baseInputs,
    session_id: z.string().uuid().nullable().optional(),
    faq_id: z.string().uuid().nullable().optional(),
    existing_faq: z.object({
      question: z.string().min(1).max(500),
      answer: z.string().min(1).max(2_500),
      category: z.string().max(80),
    }),
    steer: z.string().max(500).optional(),
  }),
]);

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// AI response — the shape Claude is asked to return.
// IMPORTANT: trust signals (confidence, source_basis, assumption_flag) belong in
// the side panel, not inline with the artifact. They are present here so the AI
// can produce them, but the render path must keep them out of the copied output.
export const FaqItemSchema = z.object({
  category: z.enum(categoryKeys),
  question: z.string().min(5).max(500),
  answer: z.string().min(5).max(2_500),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  source_basis: z.string().max(300).optional().default(""),
  assumption_flag: z.boolean().default(false),
  suggested_use: z.string().max(80).optional().default(""),
});

export const MissingContextSchema = z.object({
  gap_type: z.enum(gapKeys),
  description: z.string().min(5).max(500),
  suggested_fix: z.string().max(500).optional().default(""),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
});

export const AiResponseSchema = z.object({
  faqs: z.array(FaqItemSchema).min(4).max(20),
  missing_context: z.array(MissingContextSchema).max(15).default([]),
  source_summary: z.string().max(800).optional().default(""),
});

export type AiResponse = z.infer<typeof AiResponseSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type MissingContextItem = z.infer<typeof MissingContextSchema>;
