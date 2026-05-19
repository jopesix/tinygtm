// /campaign/dashboard — list of the signed-in user's saved campaign plans.
// Server-rendered. RLS gates ownership.

import Link from "next/link";
import { redirect } from "next/navigation";
import { CampaignTopNav } from "@/components/CampaignTopNav";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlanList, type PlanRow } from "./PlanList";

export const dynamic = "force-dynamic";

export default async function CampaignDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/campaign/dashboard")}`);
  }

  const { data, error } = await supabase
    .from("campaign_plan")
    .select(
      "id, campaign_name, campaign_type, business_type, launch_complexity, ai_cost_cents, created_at, plan_task(count)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const plans: PlanRow[] = (data ?? []).map((row) => {
    const counts = (row.plan_task as unknown as { count: number }[] | null) ?? [];
    return {
      id: row.id as string,
      campaign_name: (row.campaign_name as string) ?? "Untitled campaign",
      campaign_type: (row.campaign_type as string) ?? "",
      business_type: (row.business_type as string) ?? "",
      launch_complexity: (row.launch_complexity as string) ?? "",
      ai_cost_cents: (row.ai_cost_cents as number | null) ?? 0,
      created_at: row.created_at as string,
      task_count: counts[0]?.count ?? 0,
    };
  });

  return (
    <>
      <CampaignTopNav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-ink tracking-tight">Your campaigns</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Every campaign plan you&apos;ve saved. Most recent first.
              </p>
            </div>
            <Link href="/campaign/new">
              <Button>New campaign</Button>
            </Link>
          </header>

          {error && (
            <Card>
              <CardBody>
                <p className="text-sm text-red-600">
                  Couldn&apos;t load your campaigns. Try refreshing.
                </p>
              </CardBody>
            </Card>
          )}

          {!error && plans.length === 0 && (
            <Card>
              <CardBody className="py-12 text-center space-y-3">
                <p className="text-sm text-zinc-700">
                  No campaigns yet. Plan your first one to populate this list.
                </p>
                <Link href="/campaign/new" className="inline-block">
                  <Button>Plan a campaign</Button>
                </Link>
              </CardBody>
            </Card>
          )}

          {plans.length > 0 && <PlanList plans={plans} />}
        </div>
      </main>
    </>
  );
}
