"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deletePlan } from "../[id]/actions";
import { CAMPAIGN_TYPE_LABELS, BUSINESS_TYPE_LABELS } from "@/lib/schemas/campaign";

export type PlanRow = {
  id: string;
  campaign_name: string;
  campaign_type: string;
  business_type: string;
  launch_complexity: string;
  ai_cost_cents: number;
  created_at: string;
  task_count: number;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PlanList({ plans }: { plans: PlanRow[] }) {
  return (
    <div className="space-y-2">
      {plans.map((p) => (
        <PlanRowCard key={p.id} plan={p} />
      ))}
    </div>
  );
}

function PlanRowCard({ plan: p }: { plan: PlanRow }) {
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this campaign and all its tasks? This can't be undone.")) return;
    setDeleting(true);
    startTransition(async () => {
      const res = await deletePlan(p.id);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't delete.");
        setDeleting(false);
        return;
      }
      toast.success("Campaign deleted.");
    });
  }

  const typeLabel = CAMPAIGN_TYPE_LABELS[p.campaign_type] ?? p.campaign_type;
  const bizLabel = BUSINESS_TYPE_LABELS[p.business_type] ?? p.business_type;

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4 py-3">
        <Link href={`/campaign/${p.id}`} className="flex-1 min-w-0 group block">
          <h3 className="text-sm font-medium text-ink group-hover:text-brand truncate">
            {p.campaign_name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {p.task_count} task{p.task_count === 1 ? "" : "s"}
            {typeLabel ? ` · ${typeLabel}` : ""}
            {bizLabel ? ` · ${bizLabel}` : ""}
            {" · "}
            {relativeTime(p.created_at)}
          </p>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <Link href={`/campaign/${p.id}`}>
            <Button size="sm" variant="secondary">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
