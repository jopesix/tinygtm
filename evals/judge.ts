// Optional Sonnet judge. Opt in by setting EVAL_USE_JUDGE=1 — adds ~$0.005 per
// fixture per scored run, so it's off by default. Uses Sonnet 4.6 because the
// judge needs more reasoning headroom than Haiku for quality scoring.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AiResponse } from "@/lib/schemas/generate";
import type { Fixture } from "./golden";

const JudgeSchema = z.object({
  score: z.number().min(1).max(10),
  reasoning: z.string().min(5).max(2_000),
  failures: z.array(z.string()).default([]),
});

export type JudgeResult = z.infer<typeof JudgeSchema>;

const SONNET_MODEL = "claude-sonnet-4-6";

export async function judgeFaqs(
  fixture: Fixture,
  output: AiResponse,
): Promise<JudgeResult | null> {
  if (!fixture.judge) return null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const inputSummary = `Product: ${fixture.inputs.product_description}
Reader: ${fixture.inputs.persona}
Main use case: ${fixture.inputs.key_problem}
Destination: ${fixture.inputs.faq_destination ?? "(unspecified)"}
Focus areas: ${(fixture.inputs.focus_areas ?? []).join(", ") || "(unspecified)"}`;

  const faqsForJudge = output.faqs
    .map(
      (f, i) =>
        `FAQ ${i + 1} [${f.category}]\nQ: ${f.question}\nA: ${f.answer}`,
    )
    .join("\n\n");

  const systemPrompt = `You are a critical FAQ quality reviewer. You score generated FAQs against a rubric and return a single JSON object — no prose outside the JSON.

Return:
{
  "score": <integer 1-10>,
  "reasoning": "<3-6 sentences on what you saw>",
  "failures": ["<short failure description>", ...]
}

Be harsh but fair. A 7 means "shippable, no glaring issues." A 9-10 means "I'd struggle to do better myself." Reserve 10 for genuinely outstanding work.`;

  const userPrompt = `Rubric:
${fixture.judge.rubric}

The product context the FAQs were generated from:
${inputSummary}

The generated FAQs:
${faqsForJudge}

Score these FAQs against the rubric. Output the JSON described in the system prompt.`;

  const msg = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 1_500,
    temperature: 0.2,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fenced ? fenced[1]!.trim() : text.trim();

  try {
    return JudgeSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
