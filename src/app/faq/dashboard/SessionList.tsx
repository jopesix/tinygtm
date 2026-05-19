"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deleteSession } from "./actions";

export type SessionRow = {
  id: string;
  product_description: string;
  target_audience: string;
  persona: string;
  ai_model: string;
  ai_cost_cents: number;
  created_at: string;
  faq_count: number;
};

function titleFor(s: SessionRow): string {
  const desc = s.product_description.trim();
  if (!desc) return "Untitled session";
  return desc.length > 80 ? desc.slice(0, 80).trimEnd() + "…" : desc;
}

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
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <SessionRowCard key={s.id} session={s} />
      ))}
    </div>
  );
}

function SessionRowCard({ session: s }: { session: SessionRow }) {
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this session and all its FAQs? This can't be undone.")) return;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteSession(s.id);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't delete.");
        setDeleting(false);
        return;
      }
      toast.success("Session deleted.");
      // revalidatePath in the server action will refresh the list.
    });
  }

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4 py-3">
        <Link
          href={`/faq/generate?session=${s.id}`}
          className="flex-1 min-w-0 group block"
        >
          <h3 className="text-sm font-medium text-ink group-hover:text-brand truncate">
            {titleFor(s)}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {s.faq_count} FAQ{s.faq_count === 1 ? "" : "s"}
            {s.target_audience ? ` · ${s.target_audience}` : ""}
            {" · "}
            {relativeTime(s.created_at)}
            {s.ai_cost_cents > 0 ? ` · ${(s.ai_cost_cents / 100).toFixed(3)}¢` : ""}
          </p>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <Link href={`/faq/generate?session=${s.id}`}>
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
