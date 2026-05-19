// POST /api/generate — three modes (Milestone 3):
//   - "initial":         first generation for a session (M2 behavior).
//   - "more":            append N new FAQs to an existing session (no duplicates).
//   - "regenerate_one":  replace a single FAQ with an improved version.
//
// Shared concerns: zod validation, rate-limit, monthly cost cap, defensive
// XML-tagged prompt, JSON + schema validation on response, optional DB
// persistence for signed-in users, cost tracking.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { getAnthropic, getModel, estimateCostCents } from "@/lib/anthropic";
import {
  AiResponseSchema,
  FaqItemSchema,
  GenerateRequestSchema,
  type AiResponse,
  type FaqItem,
  type GenerateRequest,
} from "@/lib/schemas/generate";
import {
  buildGenerateMorePrompt,
  buildRegenerateOnePrompt,
  buildSystemPrompt,
  buildUserPrompt,
  type PromptInputs,
} from "@/lib/prompts/faq";
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

function toPromptInputs(req: GenerateRequest): PromptInputs {
  return {
    product_description: req.product_description,
    product_url: req.product_url || undefined,
    target_audience: req.target_audience,
    key_problem: req.key_problem,
    persona: req.persona,
    resource_type: req.resource_type,
    resource_text: req.resource_text,
    faq_destination: req.faq_destination,
    focus_areas: req.focus_areas,
    main_value_prop: req.main_value_prop,
    likely_themes: req.likely_themes,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  let parsed: GenerateRequest;
  try {
    const body = await req.json();
    parsed = GenerateRequestSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Some fields are missing or invalid.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "bad_request", message: "Request body was not valid JSON." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subject = user ? `user:${user.id}` : `ip:${getClientIp(req)}`;
  const limit = user ? userPerDay() : anonPerDay();

  const rl = await checkAndIncrementDailyLimit(subject, limit);
  if (!rl.ok) {
    track("generate_rate_limited", {
      subject_kind: user ? "user" : "ip",
      used: rl.used,
      limit,
      mode: parsed.mode,
    });
    return NextResponse.json(
      {
        error: "rate_limited",
        message: user
          ? `You've hit today's ${limit}-generation limit. Try again tomorrow.`
          : `Anonymous users get ${limit} free generations per day. Sign in for more.`,
        used: rl.used,
        limit,
      },
      { status: 429 },
    );
  }

  const cap = await checkMonthlyCostCap();
  if (!cap.ok) {
    await refundDailyLimit(subject);
    captureError(new Error("monthly_cost_cap_hit"), {
      spent_cents: cap.spentCents,
      cap_cents: cap.capCents,
    });
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
  const systemPrompt = buildSystemPrompt();
  const promptInputs = toPromptInputs(parsed);

  let userPrompt: string;
  if (parsed.mode === "more") {
    userPrompt = buildGenerateMorePrompt(
      promptInputs,
      parsed.existing_faqs,
      parsed.additional_count,
    );
  } else if (parsed.mode === "regenerate_one") {
    userPrompt = buildRegenerateOnePrompt(promptInputs, parsed.existing_faq, parsed.steer);
  } else {
    userPrompt = buildUserPrompt(promptInputs);
  }

  let aiText = "";
  let usageInput = 0;
  let usageOutput = 0;
  try {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model,
      max_tokens: 4_000,
      temperature: 0.4,
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
    await refundDailyLimit(subject);
    captureError(err, { where: "anthropic.messages.create", model, mode: parsed.mode });
    return NextResponse.json(
      {
        error: "ai_unavailable",
        message:
          "We couldn't reach the AI right now. Try again in a few seconds — it usually works on the second try.",
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
    captureError(err, { where: "ai_json_parse", model, mode: parsed.mode, preview: aiText.slice(0, 200) });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message:
          "The AI didn't return valid JSON this time. Try again — usually works on the second try.",
      },
      { status: 502 },
    );
  }

  // --- Branch by mode for response parsing + persistence. ---

  if (parsed.mode === "regenerate_one") {
    let single: FaqItem;
    try {
      single = FaqItemSchema.parse(aiJson);
    } catch (err) {
      captureError(err, { where: "ai_schema_validation", mode: "regenerate_one", model });
      return NextResponse.json(
        {
          error: "ai_invalid_output",
          message:
            "The AI's response didn't match the expected structure. Try again — usually works on the second try.",
        },
        { status: 502 },
      );
    }

    // Persist update for signed-in users targeting an owned FAQ row.
    if (user && parsed.faq_id) {
      try {
        const { error: updateErr } = await supabase
          .from("faq_item")
          .update({
            category: single.category,
            question: single.question,
            answer: single.answer,
            confidence: single.confidence,
            source_basis: single.source_basis || null,
            assumption_flag: single.assumption_flag,
            suggested_use: single.suggested_use || null,
          })
          .eq("id", parsed.faq_id);
        if (updateErr) captureError(updateErr, { where: "supabase.faq_item.regenerate.update" });
      } catch (err) {
        captureError(err, { where: "supabase.faq_item.regenerate" });
      }
    }

    track("generate_completed", {
      mode: "regenerate_one",
      subject_kind: user ? "user" : "ip",
      model,
      cost_cents: costCents,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json({
      mode: "regenerate_one" as const,
      faq: single,
      session_id: parsed.session_id ?? null,
      faq_id: parsed.faq_id ?? null,
      usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
    });
  }

  // initial + more both return the full AiResponse shape.
  let validated: AiResponse;
  try {
    validated = AiResponseSchema.parse(aiJson);
  } catch (err) {
    captureError(err, { where: "ai_schema_validation", mode: parsed.mode, model });
    return NextResponse.json(
      {
        error: "ai_invalid_output",
        message:
          "The AI's response didn't match the expected structure. Try again — usually works on the second try.",
      },
      { status: 502 },
    );
  }

  // --- Initial: create session + persist all rows. ---
  if (parsed.mode === "initial") {
    let sessionId: string | null = null;
    if (user) {
      try {
        let profileId: string | null = parsed.product_profile_id ?? null;
        if (parsed.save_as_profile && parsed.profile_name) {
          const { data: profile, error: profileErr } = await supabase
            .from("product_profile")
            .insert({
              user_id: user.id,
              name: parsed.profile_name,
              description: parsed.product_description,
              url: parsed.product_url || null,
              target_audience: parsed.target_audience,
              key_problem: parsed.key_problem,
            })
            .select("id")
            .single();
          if (profileErr) captureError(profileErr, { where: "supabase.profile.insert" });
          else if (profile) profileId = profile.id as string;
        }

        const { data: session, error: sessionErr } = await supabase
          .from("generation_session")
          .insert({
            user_id: user.id,
            product_profile_id: profileId,
            product_description: parsed.product_description,
            product_url: parsed.product_url || null,
            target_audience: parsed.target_audience,
            key_problem: parsed.key_problem,
            persona: parsed.persona,
            status: "completed",
            ai_model: model,
            ai_input_tokens: usageInput,
            ai_output_tokens: usageOutput,
            ai_cost_cents: costCents,
          })
          .select("id")
          .single();

        if (sessionErr) {
          captureError(sessionErr, { where: "supabase.session.insert" });
        } else if (session) {
          sessionId = session.id as string;

          const faqRows = validated.faqs.map((faq, idx) => ({
            session_id: sessionId,
            category: faq.category,
            question: faq.question,
            answer: faq.answer,
            confidence: faq.confidence,
            source_basis: faq.source_basis || null,
            assumption_flag: faq.assumption_flag,
            suggested_use: faq.suggested_use || null,
            sort_order: idx,
          }));
          if (faqRows.length) {
            const { error: faqErr } = await supabase.from("faq_item").insert(faqRows);
            if (faqErr) captureError(faqErr, { where: "supabase.faq_item.insert" });
          }

          const gapRows = validated.missing_context.map((g) => ({
            session_id: sessionId,
            gap_type: g.gap_type,
            description: g.description,
            suggested_fix: g.suggested_fix || null,
            severity: g.severity,
          }));
          if (gapRows.length) {
            const { error: gapErr } = await supabase
              .from("missing_context_item")
              .insert(gapRows);
            if (gapErr) captureError(gapErr, { where: "supabase.missing_context_item.insert" });
          }
        }
      } catch (err) {
        captureError(err, { where: "persist.initial" });
      }
    }

    track("generate_completed", {
      mode: "initial",
      subject_kind: user ? "user" : "ip",
      persona: parsed.persona,
      model,
      input_tokens: usageInput,
      output_tokens: usageOutput,
      cost_cents: costCents,
      faq_count: validated.faqs.length,
      gap_count: validated.missing_context.length,
      duration_ms: Date.now() - startedAt,
      persisted: sessionId !== null,
    });

    return NextResponse.json({
      mode: "initial" as const,
      session_id: sessionId,
      is_anonymous: !user,
      faqs: validated.faqs,
      missing_context: validated.missing_context,
      source_summary: validated.source_summary,
      inputs: {
        product_description: parsed.product_description,
        product_url: parsed.product_url || null,
        target_audience: parsed.target_audience,
        key_problem: parsed.key_problem,
        persona: parsed.persona,
        resource_type: parsed.resource_type ?? null,
        resource_text: parsed.resource_text ?? null,
      },
      usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
    });
  }

  // --- More: append new rows to an existing session. ---
  // session_id is only persisted for signed-in users whose session_id is owned.
  let addedRowIds: string[] = [];
  if (user && parsed.session_id) {
    try {
      // Get max sort_order in this session, ensuring the session belongs to the user (RLS).
      const { data: maxRow, error: maxErr } = await supabase
        .from("faq_item")
        .select("sort_order")
        .eq("session_id", parsed.session_id)
        .order("sort_order", { ascending: false })
        .limit(1);
      if (maxErr) captureError(maxErr, { where: "supabase.faq_item.maxOrder" });

      const startOrder = ((maxRow?.[0]?.sort_order as number | undefined) ?? -1) + 1;
      const faqRows = validated.faqs.map((faq, idx) => ({
        session_id: parsed.session_id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        confidence: faq.confidence,
        source_basis: faq.source_basis || null,
        assumption_flag: faq.assumption_flag,
        suggested_use: faq.suggested_use || null,
        sort_order: startOrder + idx,
      }));

      if (faqRows.length) {
        const { data: inserted, error: faqErr } = await supabase
          .from("faq_item")
          .insert(faqRows)
          .select("id");
        if (faqErr) captureError(faqErr, { where: "supabase.faq_item.more.insert" });
        else if (inserted) addedRowIds = inserted.map((r) => r.id as string);
      }

      // Update session aggregate cost.
      const { error: sessionUpdErr } = await supabase
        .from("generation_session")
        .update({
          ai_input_tokens: usageInput,
          ai_output_tokens: usageOutput,
          ai_cost_cents: costCents,
        })
        .eq("id", parsed.session_id);
      if (sessionUpdErr)
        captureError(sessionUpdErr, { where: "supabase.session.more.update" });
    } catch (err) {
      captureError(err, { where: "persist.more" });
    }
  }

  track("generate_completed", {
    mode: "more",
    subject_kind: user ? "user" : "ip",
    model,
    cost_cents: costCents,
    added_count: validated.faqs.length,
    duration_ms: Date.now() - startedAt,
    persisted: addedRowIds.length > 0,
  });

  return NextResponse.json({
    mode: "more" as const,
    session_id: parsed.session_id ?? null,
    added_faqs: validated.faqs.map((faq, i) => ({
      ...faq,
      id: addedRowIds[i] ?? null,
    })),
    missing_context: validated.missing_context,
    source_summary: validated.source_summary,
    usage: { input_tokens: usageInput, output_tokens: usageOutput, cost_cents: costCents, model },
  });
}
