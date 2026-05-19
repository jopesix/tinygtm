// /campaign/share/[id] — public view-only render of a saved campaign plan.
// Anyone with the URL can view. Service-role bypasses RLS on read.
// No edit / toggle / delete affordances.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import {
  CAMPAIGN_TYPE_LABELS,
  BUSINESS_TYPE_LABELS,
  GTM_MOTION_LABELS,
  TEAM_STRUCTURE_LABELS,
  CHANNEL_LABELS,
  CATEGORY_LABELS,
} from "@/lib/schemas/campaign";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Promise<{ id: string }>;

const PHASE_LABELS = {
  pre_launch: "Pre-launch",
  launch_day: "Launch day",
  post_launch: "Post-launch",
} as const;
const PHASE_ORDER: (keyof typeof PHASE_LABELS)[] = ["pre_launch", "launch_day", "post_launch"];

const PRIORITY_STYLES: Record<string, string> = {
  must_have: "bg-red-50 text-red-700 border-red-200",
  should_have: "bg-amber-50 text-amber-700 border-amber-200",
  optional: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

export default async function CampaignSharePage({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = createAdminClient();

  const [{ data: plan }, { data: tasks }, { data: gaps }] = await Promise.all([
    supabase
      .from("campaign_plan")
      .select(
        "id, campaign_name, campaign_type, business_type, team_structure, gtm_motion, channels, launch_complexity",
      )
      .eq("id", id)
      .single(),
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

  if (!plan) notFound();

  const groupedTasks = PHASE_ORDER.map((phase) => ({
    phase,
    rows: (tasks ?? []).filter((t) => (t.launch_phase as string) === phase),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="TinyGTM home">
            <div className="h-7 w-7 bg-brand rounded-md" />
            <span className="font-semibold text-ink">
              Tiny<span className="text-zinc-400 font-normal">GTM</span>
              <span className="text-zinc-400 font-normal"> · Shared plan</span>
            </span>
          </Link>
          <Link
            href="/campaign/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover px-3 py-1.5 rounded-md"
          >
            Make your own
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <section className="space-y-5 min-w-0">
              <div>
                <h1 className="text-2xl font-semibold text-ink tracking-tight">
                  {plan.campaign_name as string}
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  {CAMPAIGN_TYPE_LABELS[plan.campaign_type as string] ?? plan.campaign_type} ·{" "}
                  {BUSINESS_TYPE_LABELS[plan.business_type as string] ?? plan.business_type} ·{" "}
                  {GTM_MOTION_LABELS[plan.gtm_motion as string] ?? plan.gtm_motion} ·{" "}
                  {TEAM_STRUCTURE_LABELS[plan.team_structure as string] ?? plan.team_structure}
                </p>
              </div>

              <Card>
                <CardBody className="flex flex-wrap gap-1.5">
                  {((plan.channels as string[]) ?? []).map((ch) => (
                    <span
                      key={ch}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand-soft text-ink border border-brand/20"
                    >
                      {CHANNEL_LABELS[ch] ?? ch}
                    </span>
                  ))}
                </CardBody>
              </Card>

              {groupedTasks.map((group) => (
                <section key={group.phase} className="space-y-2">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {PHASE_LABELS[group.phase]}
                  </h2>
                  <div className="space-y-2">
                    {group.rows.map((t) => (
                      <Card key={t.id as string}>
                        <CardBody className="py-3 flex items-start gap-3">
                          <span
                            className={
                              "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] " +
                              ((t.status as string) === "done"
                                ? "bg-brand border-brand text-white"
                                : "bg-white border-zinc-300")
                            }
                          >
                            {(t.status as string) === "done" ? "✓" : ""}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                                {CATEGORY_LABELS[t.category as string] ?? t.category}
                              </span>
                              <span
                                className={
                                  "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border " +
                                  (PRIORITY_STYLES[t.priority as string] ?? "")
                                }
                              >
                                {(t.priority as string).replace("_", "-")}
                              </span>
                              {t.suggested_owner && (
                                <span className="text-[10px] text-zinc-500">
                                  owner: {t.suggested_owner as string}
                                </span>
                              )}
                            </div>
                            <p
                              className={
                                "text-sm mt-1 " +
                                ((t.status as string) === "done"
                                  ? "text-zinc-400 line-through"
                                  : "text-ink")
                              }
                            >
                              {t.task as string}
                            </p>
                            {t.dependency && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Depends on: {t.dependency as string}
                              </p>
                            )}
                            {t.notes && (
                              <p className="text-xs text-zinc-500 mt-0.5 italic">
                                {t.notes as string}
                              </p>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}

              <footer className="pt-6 border-t border-zinc-200 text-xs text-zinc-500">
                Generated with{" "}
                <Link href="/campaign/new" className="underline hover:text-zinc-700">
                  TinyGTM Campaign Planner
                </Link>
              </footer>
            </section>

            <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              <div>
                <h2 className="text-sm font-medium text-ink">
                  Operational gaps ({(gaps ?? []).length})
                </h2>
              </div>
              {(gaps ?? []).map((g) => (
                <Card key={g.id as string}>
                  <CardBody className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      {g.area && (
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          {g.area as string}
                        </div>
                      )}
                      <span
                        className={
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border " +
                          (SEVERITY_STYLES[g.severity as string] ?? "")
                        }
                      >
                        {g.severity as string}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700">{g.description as string}</p>
                  </CardBody>
                </Card>
              ))}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
