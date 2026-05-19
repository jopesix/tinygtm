// POST /api/campaign/classify
// Reads campaign context → AI classifies (one call) → returns classification.
// Sign-in required. Does NOT persist — persistence happens after the user
// confirms classification and triggers /api/campaign/plan.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { getAnthropic, getModel, estimateCostCents } from "@/lib/anthropic";
import {
  ClassifyRequestSchema,
  ClassificationSchema,
  type Classification,
} from "@/lib/schemas/campaign";
import {
  buildClassifySystemPrompt,
  buildClassifyUserPrompt,
} from "@/lib/prompts/campaign";
import {
  addMonthlyCostCents,
  anonPerDay,
  checkAndIncrementDailyLimit,
  checkMonthlyCostCap,
  refundDailyLimit,
  userPerDay,
} from "@/lib/kv";
import { captureError, track } from "@/lib/observability";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1]!.trim();
  return text.trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  let parsed;
  try {
    parsed = ClassifyRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Paste at least a paragraph.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subject = user ? `user:${user.id}` : `ip:${getClientIp(req)}`;
  const limit = user ? userPerDay() : anonPerDay();
  const rl = await checkAndIncrementDailyLimit(subject, limit);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `You've hit today's ${limit}-generation limit. Try again tomorrow.`,
      },
      { status: 429 },
    );
  }

  const cap = await checkMonthlyCostCap();
  if (!cap.ok) {
    await refundDailyLimit(subject);
    return NextResponse.json(
      {
        error: "service_paused",
        message: "TinyGTM AI is paused for the rest of the month. Try again on the 1st.",
      },
      { status: 503 },
    );
  }

  const model = getModel();
  let aiText = "";
  let usageInput = 0;
  let usageOutput = 0;
  try {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model,
      max_tokens: 800,
      temperature: 0.2,
      system: buildClassifySystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildClassifyUserPrompt({
            source_text: parsed.source_text,
            source_url: parsed.source_url ?? undefined,
          }),
        },
      ],
    });
    usageInput = msg.usage?.input_tokens ?? 0;
    usageOutput = msg.usage?.output_tokens ?? 0;
    aiText = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
  } catch (err) {
    await refundDailyLimit(subject);
    captureError(err, { where: "campaign.classify.anthropic", model });
    return NextResponse.json(
      {
        error: "ai_unavailable",
        message: "Couldn't reach the AI. Try again — usually works on the second try.",
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
    captureError(err, { where: "campaign.classify.json_parse", preview: aiText.slice(0, 200) });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "The AI didn't return valid JSON. Try again.",
      },
      { status: 502 },
    );
  }

  let classification: Classification;
  try {
    classification = ClassificationSchema.parse(aiJson);
  } catch (err) {
    captureError(err, { where: "campaign.classify.schema", model });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "Classification didn't match the expected structure. Try again.",
      },
      { status: 502 },
    );
  }

  track("campaign_classified", {
    model,
    cost_cents: costCents,
    duration_ms: Date.now() - startedAt,
    campaign_type: classification.campaign_type,
  });

  return NextResponse.json({
    classification,
    usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
  });
}
