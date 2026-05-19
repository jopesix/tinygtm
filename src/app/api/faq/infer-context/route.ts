// POST /api/infer-context
// Reads source material + wizard inputs, returns structured context for the
// Review step. Adds one Haiku 4.5 call between source paste and FAQ generation.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { getAnthropic, getModel, estimateCostCents } from "@/lib/anthropic";
import {
  InferContextRequestSchema,
  InferContextResponseSchema,
  type InferContextResponse,
} from "@/lib/schemas/infer-context";
import {
  buildInferContextSystemPrompt,
  buildInferContextUserPrompt,
} from "@/lib/prompts/infer-context";
import { addMonthlyCostCents, checkMonthlyCostCap } from "@/lib/kv";
import { captureError, track } from "@/lib/observability";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1]!.trim();
  return text.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  let parsed;
  try {
    parsed = InferContextRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Invalid fields.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Require at least SOME source material, otherwise the inference is just hallucination.
  const hasSomething =
    Boolean(parsed.resource_text && parsed.resource_text.trim()) ||
    Boolean(parsed.product_url && parsed.product_url.trim()) ||
    Boolean(parsed.product_description_seed && parsed.product_description_seed.trim());
  if (!hasSomething) {
    return NextResponse.json(
      {
        error: "no_source",
        message: "Paste some source material or fetch a URL first.",
      },
      { status: 400 },
    );
  }

  // Cap shared with /api/generate so a runaway month pauses both.
  const cap = await checkMonthlyCostCap();
  if (!cap.ok) {
    return NextResponse.json(
      {
        error: "service_paused",
        message:
          "FAQ Generator is paused for the rest of this month while we review usage. Try again on the 1st.",
      },
      { status: 503 },
    );
  }

  const model = getModel();
  const systemPrompt = buildInferContextSystemPrompt();
  const userPrompt = buildInferContextUserPrompt({
    resource_text: parsed.resource_text,
    resource_type: parsed.resource_type,
    product_url: parsed.product_url,
    product_description_seed: parsed.product_description_seed,
    reader_seed: parsed.reader_seed,
    faq_destination: parsed.faq_destination,
    focus_areas: parsed.focus_areas,
  });

  let aiText = "";
  let usageInput = 0;
  let usageOutput = 0;
  try {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model,
      max_tokens: 1_500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    usageInput = msg.usage?.input_tokens ?? 0;
    usageOutput = msg.usage?.output_tokens ?? 0;
    aiText = msg.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
  } catch (err) {
    captureError(err, { where: "infer.messages.create", model });
    return NextResponse.json(
      {
        error: "ai_unavailable",
        message:
          "Couldn't read the source right now. Try again in a few seconds, or skip and fill the fields manually.",
      },
      { status: 502 },
    );
  }

  const costCents = estimateCostCents(model, usageInput, usageOutput);
  void addMonthlyCostCents(costCents);

  let aiJson: unknown;
  try {
    aiJson = JSON.parse(extractJson(aiText));
  } catch (err) {
    captureError(err, {
      where: "infer.json_parse",
      model,
      preview: aiText.slice(0, 200),
    });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "Couldn't parse the inference output. Try again, or fill the fields manually.",
      },
      { status: 502 },
    );
  }

  let validated: InferContextResponse;
  try {
    validated = InferContextResponseSchema.parse(aiJson);
  } catch (err) {
    captureError(err, { where: "infer.schema_validation", model });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "Inference output didn't match the expected structure. Try again.",
      },
      { status: 502 },
    );
  }

  track("infer_context_completed", {
    model,
    input_tokens: usageInput,
    output_tokens: usageOutput,
    cost_cents: costCents,
    duration_ms: Date.now() - startedAt,
  });

  return NextResponse.json({
    ...validated,
    usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
  });
}
