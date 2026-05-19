import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RULES, type NamingRules } from "@/lib/utm/normalize";
import { buildLinkPayload } from "@/lib/utm";

const Body = z.object({
  campaign_id: z.string().uuid().nullable().optional(),
  destination_url: z.string().min(1),
  utm_source: z.string().min(1),
  utm_medium: z.string().min(1),
  utm_campaign: z.string().min(1),
  utm_id: z.string().optional().nullable(),
  utm_term: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  allow_duplicate: z.boolean().optional(),
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: rulesRow } = await supabase
    .from("naming_rules")
    .select("force_lowercase, separator, allowed_sources, allowed_mediums")
    .eq("user_id", user.id)
    .maybeSingle();

  const rules: NamingRules = (rulesRow as NamingRules | null) ?? DEFAULT_RULES;

  const payload = buildLinkPayload(
    {
      destination_url: parsed.data.destination_url,
      utm_source: parsed.data.utm_source,
      utm_medium: parsed.data.utm_medium,
      utm_campaign: parsed.data.utm_campaign,
      utm_id: parsed.data.utm_id ?? undefined,
      utm_term: parsed.data.utm_term ?? undefined,
      utm_content: parsed.data.utm_content ?? undefined,
    },
    rules,
  );

  if (payload.hasErrors) {
    return NextResponse.json(
      { error: "Validation failed", issues: payload.issues },
      { status: 400 },
    );
  }

  // Exact-duplicate check via normalized dedupe_key.
  const { data: existing } = await supabase
    .from("links")
    .select("id, generated_url, dedupe_key, created_at")
    .eq("user_id", user.id)
    .eq("dedupe_key", payload.dedupe_key)
    .maybeSingle();

  if (existing && !parsed.data.allow_duplicate) {
    return NextResponse.json(
      {
        error: "Exact duplicate exists",
        duplicate: existing,
      },
      { status: 409 },
    );
  }

  const { data: inserted, error } = await supabase
    .from("links")
    .insert({
      user_id: user.id,
      campaign_id: parsed.data.campaign_id ?? null,
      destination_url: payload.fields.destination_url,
      generated_url: payload.generated_url,
      utm_source: payload.fields.utm_source,
      utm_medium: payload.fields.utm_medium,
      utm_campaign: payload.fields.utm_campaign,
      utm_id: payload.fields.utm_id ?? null,
      utm_term: payload.fields.utm_term ?? null,
      utm_content: payload.fields.utm_content ?? null,
      notes: parsed.data.notes ?? null,
      dedupe_key: payload.dedupe_key,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: inserted });
}
