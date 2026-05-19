import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  force_lowercase: z.boolean(),
  separator: z.enum(["_", "-"]),
  allowed_sources: z.array(z.string().min(1)).min(1).max(100),
  allowed_mediums: z.array(z.string().min(1)).min(1).max(100),
});

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { error } = await supabase
    .from("naming_rules")
    .upsert(
      {
        user_id: user.id,
        ...parsed.data,
      },
      { onConflict: "user_id" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
