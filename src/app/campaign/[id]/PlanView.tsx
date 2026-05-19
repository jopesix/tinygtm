"use client";

// Plan view client component.
// - Tasks grouped by launch_phase, then category. Checkbox toggles done/pending,
//   persists via server action (fire-and-forget).
// - Gap flags in a side panel with severity chips.
// - "Copy as Markdown" button produces a paste-ready artifact for Notion / Docs.

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronDown, Copy, Download, LayoutGrid, List, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShareButton } from "@/components/ShareButton";
import {
  CAMPAIGN_TYPE_LABELS,
  CATEGORY_LABELS,
  CHANNEL_LABELS,
  BUSINESS_TYPE_LABELS,
  TEAM_STRUCTURE_LABELS,
  GTM_MOTION_LABELS,
} from "@/lib/schemas/campaign";
import {
  buildCampaignTsv,
  downloadCampaignCsv,
  type ExportPlan,
} from "@/lib/export-campaign";
import { toggleTask, deletePlan } from "./actions";

type SeedTask = {
  id: string | null; // null for anonymous (no DB row)
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
  id: string | null;
  description: string;
  area: string | null;
  severity: "low" | "medium" | "high";
};

export type PlanSeed = {
  id: string | null; // null for anonymous flow (no persisted plan)
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

type ViewMode = "list" | "table";

export function PlanView({ seed }: { seed: PlanSeed }) {
  const [tasks, setTasks] = useState<SeedTask[]>(seed.tasks);
  const [, startTransition] = useTransition();
  const isPersisted = Boolean(seed.id);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  function buildExportPlan(): ExportPlan {
    return {
      campaign_name: seed.classification.campaign_name,
      campaign_type: seed.classification.campaign_type,
      business_type: seed.classification.business_type,
      team_structure: seed.classification.team_structure,
      gtm_motion: seed.classification.gtm_motion,
      channels: seed.classification.channels,
      launch_complexity: seed.classification.launch_complexity,
      tasks: tasks.map((t) => ({
        task: t.task,
        category: t.category,
        suggested_owner: t.suggested_owner,
        launch_phase: t.launch_phase,
        priority: t.priority,
        dependency: t.dependency,
        notes: t.notes,
        status: t.status,
      })),
      gaps: seed.gaps.map((g) => ({
        description: g.description,
        area: g.area,
        severity: g.severity,
      })),
    };
  }

  async function copyTsv() {
    try {
      await navigator.clipboard.writeText(buildCampaignTsv(buildExportPlan()));
      toast.success("TSV copied — paste straight into Sheets.");
    } catch {
      toast.error("Couldn't reach the clipboard.");
    }
  }

  function flipTask(rowKey: string) {
    const target = tasks.find((t) => (t.id ?? `idx-${tasks.indexOf(t)}`) === rowKey);
    if (!target) return;
    const nextStatus = target.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) =>
        (t.id ?? `idx-${prev.indexOf(t)}`) === rowKey ? { ...t, status: nextStatus } : t,
      ),
    );
    // Only persist if the row has a real DB id (signed-in flow).
    if (!target.id) return;
    const dbId = target.id;
    startTransition(async () => {
      const res = await toggleTask(dbId, nextStatus);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't save.");
        setTasks((prev) =>
          prev.map((t) => (t.id === dbId ? { ...t, status: target.status } : t)),
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
    if (!seed.id) return;
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
              {tasks.length} tasks · {doneCount} done
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="secondary" onClick={copyAllMarkdown}>
              <Copy className="w-4 h-4" /> Copy
            </Button>
            <ExportMenu
              onCsv={() => downloadCampaignCsv(buildExportPlan())}
              onTsv={copyTsv}
            />
            {isPersisted && seed.id && <ShareButton href={`/campaign/share/${seed.id}`} />}
            {isPersisted && (
              <Button variant="ghost" onClick={handleDelete} title="Delete this plan">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        <ViewModeToggle current={viewMode} onChange={setViewMode} />

        {!isPersisted && (
          <Card>
            <CardBody className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-700">
                You&apos;re viewing this as a guest. Sign in to save this plan, check tasks off,
                or share a view-only link.
              </p>
              <a
                href={`/login?next=${encodeURIComponent("/campaign/new")}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover px-3 py-1.5 rounded-md whitespace-nowrap"
              >
                Sign in
              </a>
            </CardBody>
          </Card>
        )}

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

        {viewMode === "list" &&
          groupedTasks.map((g) => (
            <section key={g.phase} className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {PHASE_LABELS[g.phase]}
              </h2>
              <div className="space-y-2">
                {g.rows.map((t, idx) => {
                  const rowKey = t.id ?? `idx-${tasks.indexOf(t)}-${g.phase}-${idx}`;
                  return (
                    <Card key={rowKey}>
                      <CardBody className="py-3 flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => flipTask(rowKey)}
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
                            {t.dependency && (
                              <span
                                className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200"
                                title={`Depends on: ${t.dependency}`}
                              >
                                ↳ depends on
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
                            <p className="text-xs text-violet-700 mt-0.5">
                              ↳ Depends on: {t.dependency}
                            </p>
                          )}
                          {t.notes && (
                            <p className="text-xs text-zinc-500 mt-0.5 italic">{t.notes}</p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}

        {viewMode === "table" && (
          <TableView tasks={tasks} onToggle={flipTask} />
        )}

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
        {seed.gaps.map((g, idx) => (
          <Card key={g.id ?? `gap-${idx}`}>
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

// --- View-mode toggle (List | Table) ---

function ViewModeToggle({
  current,
  onChange,
}: {
  current: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex rounded-md border border-zinc-200 bg-white text-xs"
    >
      <ToggleBtn active={current === "list"} onClick={() => onChange("list")}>
        <List className="w-3.5 h-3.5" /> List
      </ToggleBtn>
      <ToggleBtn active={current === "table"} onClick={() => onChange("table")}>
        <LayoutGrid className="w-3.5 h-3.5" /> Table
      </ToggleBtn>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 px-3 h-8 first:rounded-l-md last:rounded-r-md transition-colors " +
        (active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-50")
      }
    >
      {children}
    </button>
  );
}

// --- Table view ---
//
// One row per task, columns for Phase / Category / Priority / Task / Owner /
// Dependency / Notes / Done. Easier than the list when you want a fast scan
// of who-owns-what and what depends on what.

function TableView({
  tasks,
  onToggle,
}: {
  tasks: SeedTask[];
  onToggle: (rowKey: string) => void;
}) {
  const sorted = [...tasks].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-xs">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium w-8"></th>
            <th className="px-3 py-2 font-medium">Phase</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Priority</th>
            <th className="px-3 py-2 font-medium">Task</th>
            <th className="px-3 py-2 font-medium">Owner</th>
            <th className="px-3 py-2 font-medium">Depends on</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, idx) => {
            const rowKey = t.id ?? `idx-${idx}`;
            return (
              <tr key={rowKey} className="border-t border-zinc-100">
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => onToggle(rowKey)}
                    aria-label={t.status === "done" ? "Mark pending" : "Mark done"}
                    className={
                      "inline-flex h-4 w-4 items-center justify-center rounded border " +
                      (t.status === "done"
                        ? "bg-brand border-brand text-white"
                        : "bg-white border-zinc-300 text-transparent hover:border-zinc-400")
                    }
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                </td>
                <td className="px-3 py-2 align-top whitespace-nowrap text-zinc-500">
                  {PHASE_LABELS[t.launch_phase]}
                </td>
                <td className="px-3 py-2 align-top whitespace-nowrap text-zinc-500">
                  {CATEGORY_LABELS[t.category] ?? t.category}
                </td>
                <td className="px-3 py-2 align-top whitespace-nowrap">
                  <span
                    className={
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border " +
                      PRIORITY_STYLES[t.priority]
                    }
                  >
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </td>
                <td
                  className={
                    "px-3 py-2 align-top text-sm " +
                    (t.status === "done"
                      ? "text-zinc-400 line-through"
                      : "text-ink")
                  }
                >
                  {t.task}
                </td>
                <td className="px-3 py-2 align-top whitespace-nowrap text-zinc-500">
                  {t.suggested_owner || "—"}
                </td>
                <td className="px-3 py-2 align-top text-zinc-700">
                  {t.dependency || <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-3 py-2 align-top text-zinc-500">
                  {t.notes || <span className="text-zinc-300">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Export menu (CSV download + TSV copy) ---
//
// Markdown copy is the primary action handled outside this menu (the "Copy" button).
// This dropdown is the secondary path for spreadsheet/Notion workflows.

function ExportMenu({
  onCsv,
  onTsv,
}: {
  onCsv: () => void;
  onTsv: () => Promise<void> | void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }
  return (
    <details ref={detailsRef} className="relative">
      <summary className="list-none inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg border border-zinc-300 bg-white text-ink hover:bg-zinc-50 cursor-pointer select-none">
        <Download className="w-4 h-4" /> Export <ChevronDown className="w-3.5 h-3.5" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
        <button
          type="button"
          onClick={() => {
            onCsv();
            close();
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Download CSV
          <div className="text-xs text-zinc-400">Spreadsheet-ready file</div>
        </button>
        <button
          type="button"
          onClick={async () => {
            await onTsv();
            close();
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Copy as TSV
          <div className="text-xs text-zinc-400">Paste straight into Google Sheets</div>
        </button>
      </div>
    </details>
  );
}
