"use server";

// Server actions for /dashboard. Auth + RLS enforced by Supabase.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability";

export async function deleteSession(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid session id" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("generation_session").delete().eq("id", id);
  if (error) {
    captureError(error, { where: "dashboard.deleteSession", id });
    return { ok: false, error: "Couldn't delete the session." };
  }
  revalidatePath("/faq/dashboard");
  return { ok: true };
}
