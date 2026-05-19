"use client";

// Plan view client component.
// - Tasks grouped by launch_phase, then category. Checkbox toggles done/pending,
//   persists via server action (fire-and-forget).
// - Gap flags in a side panel with severity chips.
// - "Copy as Markdown" button produces a paste-ready artifact for Notion / Docs.

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Copy, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CAMPAIGN_TYPE_LABELS,
  CATEGORY_LABELS,
  CHANNEL_LABELS,
  BUSINESS_TYPE_LABELS,
  TEAM_STRUCTURE_LABELS,
  GTM_MOTION_LABELS,
} from "@/lib/schemas/campaign";
import { toggleTask, deletePlan } from "./actions";

type SeedTask = {
  id: string;
  task: string;
  category: string;
  suggested_owner: string | null;
  launch_phase: "pre_launch" | "launch_day" | "post_launch";
  priority: "must_have" | "should_have" | "optional";
  dependency: string | null;
  notes: string | null;
  status: "pending" | "done";
  sort_order: number;
};

type SeedGap = {
  id: string;
  description: string;
  area: string | null;
  severity: "low" | "medium" | "high";
};

export type PlanSeed = {
  id: string;
  classification: {
    campaign_name: string;
    campaign_type: string;
    business_type: string;
    team_structure: string;
    gtm_motion: string;
    channels: string[];
    launch_complexity: string;
  };
  tasks: SeedTask[];
  gaps: SeedGap[];
  usage: { model: string | null; cost_cents: number };
};

const PHASE_LABELS: Record<SeedTask["launch_phase"], string> = {
  pre_launch: "Pre-launch",
  launch_day: "Launch day",
  post_launch: "Post-launch",
};

const PRIORITY_LABELS: Record<SeedTask["priority"], string> = {
  must_have: "Must-have",
  should_have: "Should-have",
  optional: "Optional",
};

const PRIORITY_STYLES: Record<SeedTask["priority"], string> = {
  must_have: "bg-red-50 text-red-700 border-red-200",
  should_have: "bg-amber-50 text-amber-700 border-amber-200",
  optional: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const SEVERITY_STYLES: Record<SeedGap["severity"], string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const PHASE_ORDER: SeedTask["launch_phase"][] = ["pre_launch", "launch_day", "post_launch"];

export function PlanView({ seed }: { seed: PlanSeed }) {
  const [tasks, setTasks] = useState<SeedTask[]>(seed.tasks);
  const [, startTransition] = useTransition();

  function flipTask(taskId: string) {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextStatus = target.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)),
    );
    startTransition(async () => {
      const res = await toggleTask(taskId, nextStatus);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't save.");
        // Revert
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: target.status } : t)),
        );
      }
    });
  }

  async function copyAllMarkdown() {
    const c = seed.classification;
    const lines: string[] = [];
    lines.push(`# ${c.campaign_name}`, "");
    lines.push(`**Type:** ${CAMPAIGN_TYPE_LABELS[c.campaign_type] ?? c.campaign_type}`);
    lines.push(`**Business:** ${BUSINESS_TYPE_LABELS[c.business_type] ?? c.business_type}`);
    lines.push(`**Team:** ${TEAM_STRUCTURE_LABELS[c.team_structure] ?? c.team_structure}`);
    lines.push(`**GTM motion:** ${GTM_MOTION_LABELS[c.gtm_motion] ?? c.gtm_motion}`);
    lines.push(`**Channels:** ${c.channels.map((ch) => CHANNEL_LABELS[ch] ?? ch).join(", ")}`);
    lines.push(`**Complexity:** ${c.launch_complexity}`);
    lines.push("");

    for (const phase of PHASE_ORDER) {
      const phaseTasks = tasks.filter((t) => t.launch_phase === phase);
      if (!phaseTasks.length) continue;
      lines.push(`## ${PHASE_LABELS[phase]}`, "");
      for (const t of phaseTasks) {
        const check = t.status === "done" ? "x" : " ";
        const owner = t.suggested_owner ? ` *(${t.suggested_owner})*` : "";
        const prio =
          t.priority === "must_have"
            ? " — **must-have**"
            : t.priority === "optional"
              ? " — optional"
              : "";
        const cat = CATEGORY_LABELS[t.category] ?? t.category;
        lines.push(`- [${check}] **${cat}** — ${t.task}${owner}${prio}`);
        if (t.dependency) lines.push(`  - Depends on: ${t.dependency}`);
        if (t.notes) lines.push(`  - Note: ${t.notes}`);
      }
      lines.push("");
    }

    if (seed.gaps.length) {
      lines.push("## Operational gaps to address", "");
      for (const g of seed.gaps) {
        const area = g.area ? ` _(${g.area})_` : "";
        lines.push(`- **${g.severity.toUpperCase()}**${area} — ${g.description}`);
      }
      lines.push("");
    }

    const text = lines.join("\n").trim() + "\n";
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Plan copied as Markdown.");
    } catch {
      toast.error("Couldn't reach the clipboard.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this plan? Tasks and gaps go with it.")) return;
    const res = await deletePlan(seed.id);
    if (!res.ok) {
      toast.error(res.error ?? "Couldn't delete.");
      return;
    }
    toast.success("Plan deleted.");
    window.location.href = "/campaign/new";
  }

  const c = seed.classification;
  const groupedTasks = PHASE_ORDER.map((phase) => ({
    phase,
    rows: tasks.filter((t) => t.launch_phase === phase),
  })).filter((g) => g.rows.length > 0);

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <section className="space-y-5 min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight">
              {c.campaign_name}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {CAMPAIGN_TYPE_LABELS[c.campaign_type] ?? c.campaign_type} ·{" "}
              {BUSINESS_TYPE_LABELS[c.business_type] ?? c.business_type} ·{" "}
              {GTM_MOTION_LABELS[c.gtm_motion] ?? c.gtm_motion} ·{" "}
              complexity {c.launch_complexity}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {tasks.length} tasks · {doneCount} done ·{" "}
              {seed.usage.model ?? "Claude"} ·{" "}
              {(seed.usage.cost_cents / 100).toFixed(3)}¢
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={copyAllMarkdown}>
              <Copy className="w-4 h-4" /> Copy as Markdown
            </Button>
            <Button variant="ghost" onClick={handleDelete} title="Delete this plan">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <Card>
          <CardBody className="flex flex-wrap gap-1.5">
            {c.channels.map((ch) => (
              <span
                key={ch}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand-soft text-ink border border-brand/20"
              >
                {CHANNEL_LABELS[ch] ?? ch}
              </span>
            ))}
          </CardBody>
        </Card>

        {groupedTasks.map((g) => (
          <section key={g.phase} className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {PHASE_LABELS[g.phase]}
            </h2>
            <div className="space-y-2">
              {g.rows.map((t) => (
                <Card key={t.id}>
                  <CardBody className="py-3 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => flipTask(t.id)}
                      className={
                        "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors " +
                        (t.status === "done"
                          ? "bg-brand border-brand text-white"
                          : "bg-white border-zinc-300 text-transparent hover:border-zinc-400")
                      }
                      aria-label={t.status === "done" ? "Mark as pending" : "Mark as done"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          {CATEGORY_LABELS[t.category] ?? t.category}
                        </span>
                        <span
                          className={
                            "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border " +
                            PRIORITY_STYLES[t.priority]
                          }
                        >
                          {PRIORITY_LABELS[t.priority]}
                        </span>
                        {t.suggested_owner && (
                          <span className="text-[10px] text-zinc-500">
                            owner: {t.suggested_owner}
                          </span>
                        )}
                      </div>
                      <p
                        className={
                          "text-sm mt-1 " +
                          (t.status === "done"
                            ? "text-zinc-400 line-through"
                            : "text-ink")
                        }
                      >
                        {t.task}
                      </p>
                      {t.dependency && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Depends on: {t.dependency}
                        </p>
                      )}
                      {t.notes && (
                        <p className="text-xs text-zinc-500 mt-0.5 italic">{t.notes}</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <div>
          <Link href="/campaign/new">
            <Button variant="ghost">+ New plan</Button>
          </Link>
        </div>
      </section>

      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div>
          <h2 className="text-sm font-medium text-ink">
            Operational gaps ({seed.gaps.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Things we think you might be forgetting. Not blockers — judgment calls.
          </p>
        </div>
        {seed.gaps.length === 0 && (
          <Card>
            <CardBody>
              <p className="text-xs text-zinc-500">
                No gaps detected. Your context covered the major operational areas.
              </p>
            </CardBody>
          </Card>
        )}
        {seed.gaps.map((g) => (
          <Card key={g.id}>
            <CardBody className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                {g.area && (
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    {g.area}
                  </div>
                )}
                <span
                  className={
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border " +
                    SEVERITY_STYLES[g.severity]
                  }
                >
                  {g.severity}
                </span>
              </div>
              <p className="text-sm text-zinc-700">{g.description}</p>
            </CardBody>
          </Card>
        ))}
      </aside>
    </div>
  );
}
