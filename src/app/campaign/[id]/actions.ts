"use server";

// Server actions for the plan view: toggle a task's status, delete a plan.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function toggleTask(
  taskId: string,
  nextStatus: "pending" | "done",
): Promise<{ ok: boolean; error?: string }> {
  if (!UUID_RE.test(taskId)) return { ok: false, error: "Invalid task id" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("plan_task")
    .update({ status: nextStatus })
    .eq("id", taskId);

  if (error) {
    captureError(error, { where: "campaign.toggleTask", taskId });
    return { ok: false, error: "Couldn't save." };
  }
  return { ok: true };
}

export async function deletePlan(planId: string): Promise<{ ok: boolean; error?: string }> {
  if (!UUID_RE.test(planId)) return { ok: false, error: "Invalid plan id" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("campaign_plan").delete().eq("id", planId);
  if (error) {
    captureError(error, { where: "campaign.deletePlan", planId });
    return { ok: false, error: "Couldn't delete." };
  }
  revalidatePath("/campaign/dashboard");
  return { ok: true };
}
