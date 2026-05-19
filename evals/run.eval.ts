// Eval runner. Run with: npm run eval
//
// Each fixture hits the real Anthropic API once with the default Haiku model
// (or whatever ANTHROPIC_MODEL is set to), then runs golden checks against the
// returned JSON. Optional Sonnet judge runs when EVAL_USE_JUDGE=1.
//
// Cost: ~$0.01 per fixture run on Haiku, ~$0.06 with the judge on Sonnet.

import { describe, it, expect } from "vitest";
import "dotenv/config";
import { getAnthropic, getModel } from "@/lib/anthropic";
import { AiResponseSchema, type AiResponse } from "@/lib/schemas/generate";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts/faq";
import { FIXTURES } from "./fixtures";
import { judgeFaqs } from "./judge";

const USE_JUDGE = process.env.EVAL_USE_JUDGE === "1";

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1]!.trim();
  return text.trim();
}

async function generate(prompt: ReturnType<typeof buildUserPrompt>): Promise<AiResponse> {
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: getModel(),
    max_tokens: 4_000,
    temperature: 0.4,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  return AiResponseSchema.parse(JSON.parse(extractJson(text)));
}

describe("FAQ generator evals", () => {
  for (const fixture of FIXTURES) {
    describe(fixture.name, () => {
      let output: AiResponse;

      it(`generates valid JSON (${fixture.id})`, async () => {
        const prompt = buildUserPrompt(fixture.inputs);
        output = await generate(prompt);
        expect(output).toBeDefined();
        expect(output.faqs.length).toBeGreaterThanOrEqual(fixture.expect.minFaqs);
        expect(output.faqs.length).toBeLessThanOrEqual(fixture.expect.maxFaqs);
      }, 60_000);

      it("covers required categories", () => {
        const cats = new Set(output.faqs.map((f) => f.category));
        for (const required of fixture.expect.mustHaveCategories) {
          expect(cats, `Expected category "${required}" in output`).toContain(required);
        }
      });

      it("flags required gap types", () => {
        const gapTypes = new Set(output.missing_context.map((g) => g.gap_type));
        for (const required of fixture.expect.mustHaveGapTypes) {
          expect(gapTypes, `Expected gap "${required}" in missing_context`).toContain(required);
        }
      });

      it("mentions at least one required substring", () => {
        if (!fixture.expect.mustMentionAny?.length) return;
        const allText = output.faqs
          .map((f) => `${f.question}\n${f.answer}`)
          .join("\n")
          .toLowerCase();
        const found = fixture.expect.mustMentionAny.some((s) =>
          allText.includes(s.toLowerCase()),
        );
        expect(found, `Expected at least one of ${fixture.expect.mustMentionAny.join(" / ")}`).toBe(
          true,
        );
      });

      it("never produces forbidden phrasings", () => {
        if (!fixture.expect.mustNotMention?.length) return;
        const allText = output.faqs
          .map((f) => `${f.question}\n${f.answer}`)
          .join("\n")
          .toLowerCase();
        for (const forbidden of fixture.expect.mustNotMention) {
          expect(allText, `Output contained forbidden phrase "${forbidden}"`).not.toContain(
            forbidden.toLowerCase(),
          );
        }
      });

      it.runIf(USE_JUDGE && Boolean(fixture.judge))("passes the Sonnet judge", async () => {
        const judged = await judgeFaqs(fixture, output);
        expect(judged, "judge returned null").toBeTruthy();
        const min = fixture.judge!.minScore;
        if (judged) {
          console.log(`  judge: ${judged.score}/10 — ${judged.reasoning}`);
          if (judged.failures.length) {
            console.log(`  failures: ${judged.failures.join("; ")}`);
          }
          expect(judged.score).toBeGreaterThanOrEqual(min);
        }
      }, 60_000);
    });
  }
});
