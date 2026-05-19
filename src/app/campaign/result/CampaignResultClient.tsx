"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { PlanView, type PlanSeed } from "../[id]/PlanView";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  Classification,
  Task as AiTask,
  Gap as AiGap,
} from "@/lib/schemas/campaign";

const RESULT_STORAGE_KEY = "tinygtm-campaign:last-result";

type StoredResult = {
  plan_id: string | null;
  classification: Classification;
  tasks: AiTask[];
  gaps: AiGap[];
  usage?: { model?: string | null; cost_cents?: number };
};

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function read(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(RESULT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readServer(): null {
  return null;
}

function toSeed(stored: StoredResult): PlanSeed {
  const phaseOrder = ["pre_launch", "launch_day", "post_launch"] as const;
  return {
    id: null,
    classification: stored.classification,
    tasks: stored.tasks.map((t, idx) => ({
      id: null,
      task: t.task,
      category: t.category,
      suggested_owner: t.suggested_owner || null,
      launch_phase: t.launch_phase,
      priority: t.priority,
      dependency: t.dependency || null,
      notes: t.notes || null,
      status: "pending" as const,
      sort_order: phaseOrder.indexOf(t.launch_phase) * 1000 + idx,
    })),
    gaps: stored.gaps.map((g) => ({
      id: null,
      description: g.description,
      area: g.area || null,
      severity: g.severity,
    })),
    usage: {
      model: stored.usage?.model ?? null,
      cost_cents: stored.usage?.cost_cents ?? 0,
    },
  };
}

export function CampaignResultClient() {
  const raw = useSyncExternalStore(subscribe, read, readServer);

  let seed: PlanSeed | null = null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredResult;
      seed = toSeed(parsed);
    } catch {
      seed = null;
    }
  }

  if (!seed) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm text-zinc-700">
            No recent plan in this tab. Start a new one to generate.
          </p>
          <Link href="/campaign/new">
            <Button>Start a new plan</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return <PlanView seed={seed} />;
}
