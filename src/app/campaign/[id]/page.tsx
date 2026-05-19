// /campaign/[id] — server component loads the plan + tasks + gaps from DB,
// hands them to the PlanView client component.

import { redirect, notFound } from "next/navigation";
import { CampaignTopNav } from "@/components/CampaignTopNav";
import { createClient } from "@/lib/supabase/server";
import { PlanView, type PlanSeed } from "./PlanView";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Promise<{ id: string }>;

export default async function CampaignPlanPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/campaign/${id}`)}`);
  }

  const { data: plan } = await supabase
    .from("campaign_plan")
    .select(
      "id, campaign_name, campaign_type, business_type, team_structure, gtm_motion, channels, launch_complexity, ai_model, ai_cost_cents",
    )
    .eq("id", id)
    .single();

  if (!plan) notFound();

  const [{ data: tasks }, { data: gaps }] = await Promise.all([
    supabase
      .from("plan_task")
      .select(
        "id, task, category, suggested_owner, launch_phase, priority, dependency, notes, status, sort_order",
      )
      .eq("plan_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("plan_gap")
      .select("id, description, area, severity")
      .eq("plan_id", id)
      .order("severity", { ascending: false }),
  ]);

  const seed: PlanSeed = {
    id: plan.id as string,
    classification: {
      campaign_name: plan.campaign_name as string,
      campaign_type: plan.campaign_type as string,
      business_type: plan.business_type as string,
      team_structure: plan.team_structure as string,
      gtm_motion: plan.gtm_motion as string,
      channels: (plan.channels as string[]) ?? [],
      launch_complexity: plan.launch_complexity as string,
    },
    tasks: ((tasks ?? []) as unknown as PlanSeed["tasks"]).map((t) => ({
      ...t,
      suggested_owner: t.suggested_owner ?? null,
      dependency: t.dependency ?? null,
      notes: t.notes ?? null,
    })),
    gaps: ((gaps ?? []) as unknown as PlanSeed["gaps"]).map((g) => ({
      ...g,
      area: g.area ?? null,
    })),
    usage: {
      model: (plan.ai_model as string | null) ?? null,
      cost_cents: (plan.ai_cost_cents as number | null) ?? 0,
    },
  };

  return (
    <>
      <CampaignTopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <PlanView seed={seed} />
        </div>
      </main>
    </>
  );
}
