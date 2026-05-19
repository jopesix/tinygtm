// POST /api/campaign/plan
// Takes the user-confirmed classification + source → AI generates the plan + gaps
// → persists campaign_plan + plan_task + plan_gap rows → returns plan_id.
//
// Phase 2 will replace the AI plan call with a rules engine selecting from
// per-campaign-type templates. The persistence + response shape stay the same.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { getAnthropic, getModel, estimateCostCents } from "@/lib/anthropic";
import {
  PlanGenerateRequestSchema,
  PlanAiSchema,
  type PlanAi,
} from "@/lib/schemas/campaign";
import {
  buildPlanSystemPrompt,
  buildPlanUserPrompt,
} from "@/lib/prompts/campaign";
import {
  addMonthlyCostCents,
  checkAndIncrementDailyLimit,
  checkMonthlyCostCap,
  refundDailyLimit,
  userPerDay,
} from "@/lib/kv";
import { captureError, track } from "@/lib/observability";
import { createClient } from "@/lib/supabase/server";

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
    parsed = PlanGenerateRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Invalid request.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sign in to use the Campaign Planner." },
      { status: 401 },
    );
  }

  const subject = `user:${user.id}`;
  const limit = userPerDay();
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
        message: "TinyGTM AI is paused for the rest of the month.",
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
      max_tokens: 4_000,
      temperature: 0.4,
      system: buildPlanSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildPlanUserPrompt({
            source_text: parsed.source_text,
            source_url: parsed.source_url || undefined,
            classification: parsed.classification as unknown as Record<string, unknown>,
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
    captureError(err, { where: "campaign.plan.anthropic", model });
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
    captureError(err, { where: "campaign.plan.json_parse", preview: aiText.slice(0, 200) });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "The AI didn't return valid JSON. Try again.",
      },
      { status: 502 },
    );
  }

  let planAi: PlanAi;
  try {
    planAi = PlanAiSchema.parse(aiJson);
  } catch (err) {
    captureError(err, { where: "campaign.plan.schema", model });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message: "The AI's plan didn't match the expected structure. Try again.",
      },
      { status: 502 },
    );
  }

  // Persist
  let planId: string | null = null;
  try {
    const { data: plan, error: planErr } = await supabase
      .from("campaign_plan")
      .insert({
        user_id: user.id,
        source_text: parsed.source_text,
        source_url: parsed.source_url || null,
        campaign_name: parsed.classification.campaign_name,
        campaign_type: parsed.classification.campaign_type,
        business_type: parsed.classification.business_type,
        team_structure: parsed.classification.team_structure,
        gtm_motion: parsed.classification.gtm_motion,
        channels: parsed.classification.channels,
        launch_complexity: parsed.classification.launch_complexity,
        ai_model: model,
        ai_input_tokens: usageInput,
        ai_output_tokens: usageOutput,
        ai_cost_cents: costCents,
      })
      .select("id")
      .single();

    if (planErr) {
      captureError(planErr, { where: "supabase.campaign_plan.insert" });
      return NextResponse.json(
        {
          error: "save_failed",
          message:
            "Generated the plan but couldn't save it. Make sure campaign.sql has been applied.",
        },
        { status: 500 },
      );
    }
    planId = plan.id as string;

    const phaseOrder = ["pre_launch", "launch_day", "post_launch"] as const;
    const taskRows = planAi.tasks.map((t, idx) => ({
      plan_id: planId,
      task: t.task,
      category: t.category,
      suggested_owner: t.suggested_owner || null,
      launch_phase: t.launch_phase,
      priority: t.priority,
      dependency: t.dependency || null,
      notes: t.notes || null,
      sort_order: phaseOrder.indexOf(t.launch_phase) * 1000 + idx,
    }));
    if (taskRows.length) {
      const { error: tErr } = await supabase.from("plan_task").insert(taskRows);
      if (tErr) captureError(tErr, { where: "supabase.plan_task.insert" });
    }

    const gapRows = planAi.gaps.map((g) => ({
      plan_id: planId,
      description: g.description,
      area: g.area || null,
      severity: g.severity,
    }));
    if (gapRows.length) {
      const { error: gErr } = await supabase.from("plan_gap").insert(gapRows);
      if (gErr) captureError(gErr, { where: "supabase.plan_gap.insert" });
    }
  } catch (err) {
    captureError(err, { where: "campaign.persist" });
  }

  track("campaign_plan_generated", {
    model,
    cost_cents: costCents,
    duration_ms: Date.now() - startedAt,
    task_count: planAi.tasks.length,
    gap_count: planAi.gaps.length,
    campaign_type: parsed.classification.campaign_type,
  });

  return NextResponse.json({
    plan_id: planId,
    tasks: planAi.tasks,
    gaps: planAi.gaps,
    usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
  });
}
