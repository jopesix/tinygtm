// Campaign plan export helpers. Markdown is built inline in PlanView; this file
// covers CSV (download) and TSV (clipboard for Sheets paste).

import {
  CAMPAIGN_TYPE_LABELS,
  BUSINESS_TYPE_LABELS,
  TEAM_STRUCTURE_LABELS,
  GTM_MOTION_LABELS,
  CHANNEL_LABELS,
  CATEGORY_LABELS,
} from "@/lib/schemas/campaign";

export type ExportPlanTask = {
  task: string;
  category: string;
  suggested_owner: string | null;
  launch_phase: "pre_launch" | "launch_day" | "post_launch";
  priority: "must_have" | "should_have" | "optional";
  dependency: string | null;
  notes: string | null;
  status: "pending" | "done";
};

export type ExportPlanGap = {
  description: string;
  area: string | null;
  severity: "low" | "medium" | "high";
};

export type ExportPlan = {
  campaign_name: string;
  campaign_type: string;
  business_type: string;
  team_structure: string;
  gtm_motion: string;
  channels: string[];
  launch_complexity: string;
  tasks: ExportPlanTask[];
  gaps: ExportPlanGap[];
};

const PHASE_LABELS: Record<ExportPlanTask["launch_phase"], string> = {
  pre_launch: "Pre-launch",
  launch_day: "Launch day",
  post_launch: "Post-launch",
};

const PRIORITY_LABELS: Record<ExportPlanTask["priority"], string> = {
  must_have: "Must-have",
  should_have: "Should-have",
  optional: "Optional",
};

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

// Slug the campaign name for the filename — keep it human-readable, ASCII-safe.
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "campaign";
}

const COLUMNS = [
  "Phase",
  "Category",
  "Priority",
  "Task",
  "Suggested owner",
  "Dependency",
  "Notes",
  "Status",
] as const;

function rowsFromPlan(plan: ExportPlan): string[][] {
  return plan.tasks.map((t) => [
    PHASE_LABELS[t.launch_phase],
    CATEGORY_LABELS[t.category] ?? t.category,
    PRIORITY_LABELS[t.priority],
    t.task,
    t.suggested_owner ?? "",
    t.dependency ?? "",
    t.notes ?? "",
    t.status,
  ]);
}

function csvEscape(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCampaignCsv(plan: ExportPlan) {
  const lines: string[] = [];
  // Top-of-file metadata as comment-ish prefix rows (Sheets/Numbers ignore extra rows fine).
  lines.push(csvEscape(`Campaign: ${plan.campaign_name}`));
  lines.push(
    csvEscape(
      [
        `Type: ${CAMPAIGN_TYPE_LABELS[plan.campaign_type] ?? plan.campaign_type}`,
        `Business: ${BUSINESS_TYPE_LABELS[plan.business_type] ?? plan.business_type}`,
        `Team: ${TEAM_STRUCTURE_LABELS[plan.team_structure] ?? plan.team_structure}`,
        `GTM: ${GTM_MOTION_LABELS[plan.gtm_motion] ?? plan.gtm_motion}`,
        `Channels: ${plan.channels.map((c) => CHANNEL_LABELS[c] ?? c).join("; ")}`,
        `Complexity: ${plan.launch_complexity}`,
      ].join(" · "),
    ),
  );
  lines.push("");
  lines.push(COLUMNS.map(csvEscape).join(","));
  for (const row of rowsFromPlan(plan)) {
    lines.push(row.map(csvEscape).join(","));
  }
  if (plan.gaps.length) {
    lines.push("");
    lines.push(csvEscape("Operational gaps"));
    lines.push(["Severity", "Area", "Description"].map(csvEscape).join(","));
    for (const g of plan.gaps) {
      lines.push(
        [g.severity, g.area ?? "", g.description].map(csvEscape).join(","),
      );
    }
  }
  const text = lines.join("\r\n") + "\r\n";
  triggerDownload(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
    `${slug(plan.campaign_name)}-plan.csv`,
  );
}

export function buildCampaignTsv(plan: ExportPlan): string {
  const lines: string[] = [];
  lines.push(COLUMNS.join("\t"));
  for (const row of rowsFromPlan(plan)) {
    // TSV: replace any embedded tabs/newlines so paste-into-Sheets stays clean.
    lines.push(
      row
        .map((cell) => cell.replace(/\t/g, " ").replace(/\r?\n/g, " ↵ "))
        .join("\t"),
    );
  }
  return lines.join("\n");
}
