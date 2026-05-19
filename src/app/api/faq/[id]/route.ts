// PATCH /api/faq/:id  → update question / answer / category for one FAQ row.
// DELETE /api/faq/:id → remove one FAQ row.
// RLS handles ownership: the policy on faq_item joins to generation_session.user_id.

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { FAQ_CATEGORIES } from "@/lib/faq-categories";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability";

const categoryKeys = FAQ_CATEGORIES.map((c) => c.key) as [string, ...string[]];

const PatchSchema = z
  .object({
    question: z.string().trim().min(3).max(500).optional(),
    answer: z.string().trim().min(3).max(2_500).optional(),
    category: z.enum(categoryKeys).optional(),
    confidence: z.enum(["low", "medium", "high"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field must be provided");

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "bad_id", message: "Invalid FAQ id." }, { status: 400 });
  }

  let patch: z.infer<typeof PatchSchema>;
  try {
    patch = PatchSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Invalid fields.", issues: err.issues },
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
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("faq_item")
    .update(patch)
    .eq("id", id)
    .select("id, category, question, answer, confidence, source_basis, assumption_flag, suggested_use, sort_order")
    .single();

  if (error) {
    captureError(error, { where: "supabase.faq_item.patch", id });
    // RLS denial surfaces as no row found.
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ faq: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "bad_id", message: "Invalid FAQ id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("faq_item").delete().eq("id", id);
  if (error) {
    captureError(error, { where: "supabase.faq_item.delete", id });
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
