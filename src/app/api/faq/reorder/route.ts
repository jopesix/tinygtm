// POST /api/faq/reorder { session_id, ordered_ids: string[] }
// Bulk update sort_order for every FAQ in a session. RLS-enforced.

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability";

const ReorderSchema = z.object({
  session_id: z.string().uuid(),
  ordered_ids: z.array(z.string().uuid()).min(1).max(40),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof ReorderSchema>;
  try {
    body = ReorderSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Invalid reorder payload.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Update each row's sort_order. Supabase doesn't have a true bulk-update with
  // different values per row, so we issue parallel updates. RLS scopes them to
  // the user's own session.
  const updates = await Promise.all(
    body.ordered_ids.map((id, idx) =>
      supabase.from("faq_item").update({ sort_order: idx }).eq("id", id).eq("session_id", body.session_id),
    ),
  );

  const failed = updates.filter((r) => r.error);
  if (failed.length) {
    failed.forEach((r) => captureError(r.error, { where: "supabase.faq_item.reorder" }));
    return NextResponse.json({ error: "reorder_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
