// POST /api/subscribe { email, source? }
// Inserts into public.subscribers via the service-role key (bypassing RLS).
// The anon key can't write to this table — that's intentional.

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { createClient } from "@supabase/supabase-js";

const SubscribeRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z.string().trim().max(40).optional().default("landing"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service-role credentials");
  // The service role key bypasses RLS — never expose it to the client.
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let parsed;
  try {
    parsed = SubscribeRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "That doesn't look like a valid email." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const supabase = getServiceRoleClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: parsed.email, source: parsed.source });

    if (error) {
      // 23505 is Postgres unique-constraint violation — they're already subscribed.
      // Return success either way so the UI just shows "Thanks ✓".
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, already_subscribed: true });
      }
      console.error("[subscribe] insert failed", error);
      return NextResponse.json(
        { error: "save_failed", message: "Couldn't save right now — try again later." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[subscribe] unexpected", err);
    return NextResponse.json(
      { error: "service_unavailable", message: "Subscribe service unavailable." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
