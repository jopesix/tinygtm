import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RULES, type NamingRules, normalizeToken } from "@/lib/utm/normalize";

const Body = z.object({
  display_name: z.string().min(1).max(120),
  utm_campaign: z.string().min(1).max(120),
  utm_id: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const { data: rulesRow } = await supabase
    .from("naming_rules")
    .select("force_lowercase, separator, allowed_sources, allowed_mediums")
    .eq("user_id", user.id)
    .maybeSingle();
  const rules: NamingRules = (rulesRow as NamingRules | null) ?? DEFAULT_RULES;

  const slug = normalizeToken(parsed.data.utm_campaign, rules);
  if (!slug) {
    return NextResponse.json(
      { error: "Campaign slug normalized to empty. Try different characters." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      display_name: parsed.data.display_name.trim(),
      utm_campaign: slug,
      utm_id: parsed.data.utm_id?.trim() || null,
      description: parsed.data.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    // Unique violation on (user_id, utm_campaign)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A campaign with the slug "${slug}" already exists.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}
