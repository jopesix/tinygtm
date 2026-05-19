"use client";

// Milestone 3 results UI.
// Anonymous: read-only — render + copy, with a sign-in CTA. Iteration features are gated.
// Signed-in: full editing — edit/delete/reorder/regenerate-one + generate-more.
//
// State lives in this component. Edits hit PATCH /api/faq/:id, deletes hit DELETE,
// reorder hits POST /api/faq/reorder, regenerate-one + generate-more hit /api/generate.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  downloadCsv,
  downloadDocx,
  downloadMarkdown,
  downloadPdf,
  type ExportFaq,
} from "@/lib/export-faqs";
import { ShareButton } from "@/components/ShareButton";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { FAQ_CATEGORIES, getCategoryLabel } from "@/lib/faq-categories";
import { getGapTypeLabel } from "@/lib/missing-context-types";

const RESULT_STORAGE_KEY = "faq-generator:last-result";

type Inputs = {
  product_description: string;
  product_url: string | null;
  target_audience: string;
  key_problem: string;
  persona: string;
  resource_type: string | null;
  resource_text: string | null;
};

type FaqRow = {
  id: string | null; // null for anonymous (no DB row)
  category: string;
  question: string;
  answer: string;
  confidence: "low" | "medium" | "high";
  source_basis: string;
  assumption_flag: boolean;
  suggested_use: string;
};

type GapRow = {
  id: string | null;
  gap_type: string;
  description: string;
  suggested_fix: string;
  severity: "low" | "medium" | "high";
};

type UsageInfo = {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
};

export type InitialSessionData = {
  source: "server" | "sessionStorage";
  session_id: string | null;
  inputs: Inputs;
  faqs: FaqRow[];
  missing_context: GapRow[];
  usage: UsageInfo;
  source_summary?: string;
};

// --- sessionStorage subscription (anonymous + signed-in fresh-generation path) ---

function subscribeStorage(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(RESULT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStorageServer(): null {
  return null;
}

// --- main component ---

export function GenerateResult({ initial }: { initial: InitialSessionData | null }) {
  const storageRaw = useSyncExternalStore(subscribeStorage, readStorage, readStorageServer);
  const fromStorage = useMemo<InitialSessionData | null>(() => {
    if (initial) return null; // server data wins
    if (!storageRaw) return null;
    try {
      const parsed = JSON.parse(storageRaw);
      // Shape from the "initial" mode response.
      return {
        source: "sessionStorage" as const,
        session_id: parsed.session_id ?? null,
        inputs: parsed.inputs,
        faqs: (parsed.faqs ?? []).map((f: FaqRow) => ({ ...f, id: f.id ?? null })),
        missing_context: (parsed.missing_context ?? []).map((g: GapRow) => ({
          ...g,
          id: g.id ?? null,
        })),
        usage: parsed.usage,
        source_summary: parsed.source_summary,
      } satisfies InitialSessionData;
    } catch {
      return null;
    }
  }, [storageRaw, initial]);

  const seed = initial ?? fromStorage;

  if (!seed) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm text-zinc-700">
            No FAQ session loaded. Generate a new one to get started.
          </p>
          <Link href="/faq/new">
            <Button>Start a new session</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return <Loaded seed={seed} />;
}

function gapKey(gap: GapRow, idx: number): string {
  return gap.id ?? `gap-${idx}-${gap.gap_type}`;
}

function Loaded({ seed }: { seed: InitialSessionData }) {
  const [faqs, setFaqs] = useState<FaqRow[]>(seed.faqs);
  const [gaps, setGaps] = useState<GapRow[]>(seed.missing_context);
  const [selectedGapKeys, setSelectedGapKeys] = useState<Set<string>>(new Set());
  const [extraContext, setExtraContext] = useState<string>("");
  const [generatingMore, setGeneratingMore] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedCount = selectedGapKeys.size;

  // Reorder/edit/delete are only available when there's a backing session_id (signed in).
  const isPersisted = Boolean(seed.session_id);

  const ordered = useMemo(() => faqs, [faqs]);

  // Group FAQs by category for render.
  const grouped = useMemo(() => {
    const map = new Map<string, FaqRow[]>();
    for (const faq of ordered) {
      const arr = map.get(faq.category) ?? [];
      arr.push(faq);
      map.set(faq.category, arr);
    }
    // Preserve the canonical category order from FAQ_CATEGORIES, then any unknown last.
    const result: { category: string; rows: FaqRow[] }[] = [];
    for (const c of FAQ_CATEGORIES) {
      const rows = map.get(c.key);
      if (rows) result.push({ category: c.key, rows });
    }
    for (const [key, rows] of map.entries()) {
      if (!FAQ_CATEGORIES.find((c) => c.key === key)) result.push({ category: key, rows });
    }
    return result;
  }, [ordered]);

  // --- Copy actions ---
  const copyAllMarkdown = useCallback(async () => {
    const lines: string[] = [];
    lines.push(`# FAQ\n`);
    for (const group of grouped) {
      lines.push(`## ${getCategoryLabel(group.category)}\n`);
      for (const faq of group.rows) {
        lines.push(`**${faq.question}**\n`);
        lines.push(`${faq.answer}\n`);
      }
    }
    const text = lines.join("\n").trim() + "\n";
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${faqs.length} FAQs to clipboard.`);
    } catch {
      toast.error("Couldn't reach the clipboard. Select and copy manually.");
    }
  }, [grouped, faqs.length]);

  const copyOne = useCallback(async (faq: FaqRow) => {
    const text = `**${faq.question}**\n\n${faq.answer}\n`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("FAQ copied.");
    } catch {
      toast.error("Couldn't reach the clipboard.");
    }
  }, []);

  // --- Mutations: edit / delete / reorder ---
  const persistEdit = useCallback(
    async (id: string, patch: Partial<Pick<FaqRow, "question" | "answer" | "category">>) => {
      if (!isPersisted || !id) return; // anonymous: state-only
      try {
        const res = await fetch(`/api/faq/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.message ?? "Couldn't save the edit.");
        }
      } catch {
        toast.error("Network error saving edit.");
      }
    },
    [isPersisted],
  );

  const handleEdit = useCallback(
    (idx: number, patch: Partial<Pick<FaqRow, "question" | "answer" | "category">>) => {
      setFaqs((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx]!, ...patch };
        return next;
      });
      const target = faqs[idx];
      if (target?.id) void persistEdit(target.id, patch);
    },
    [faqs, persistEdit],
  );

  const handleDelete = useCallback(
    async (idx: number) => {
      const target = faqs[idx];
      if (!target) return;
      if (!confirm("Delete this FAQ?")) return;
      setFaqs((prev) => prev.filter((_, i) => i !== idx));
      if (isPersisted && target.id) {
        try {
          const res = await fetch(`/api/faq/${target.id}`, { method: "DELETE" });
          if (!res.ok) toast.error("Couldn't delete on the server.");
        } catch {
          toast.error("Network error deleting.");
        }
      }
    },
    [faqs, isPersisted],
  );

  // Persist the current flat faqs order to /api/faq/reorder. Debounced so a
  // quick drag-drop-drag flurry coalesces into one save.
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistReorder = useCallback(
    (latest: FaqRow[]) => {
      if (!isPersisted || !seed.session_id) return;
      const ordered_ids = latest.map((f) => f.id).filter((x): x is string => !!x);
      if (!ordered_ids.length) return;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/faq/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: seed.session_id, ordered_ids }),
          });
          if (!res.ok) toast.error("Couldn't save the new order.");
        } catch {
          toast.error("Network error saving order.");
        }
      }, 600);
    },
    [isPersisted, seed.session_id],
  );

  // dnd-kit drag end. Each category section has its own SortableContext, so
  // active.id and over.id are guaranteed to be in the same section. We reorder
  // within the section, then splice that section's new order back into the flat
  // faqs array (preserving the relative position of rows in OTHER categories).
  const handleDragEnd = useCallback(
    (category: string, e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;

      setFaqs((prev) => {
        const sectionRows = prev.filter((f) => f.category === category);
        const oldIdx = sectionRows.findIndex(
          (f) => (f.id ?? `idx-${prev.indexOf(f)}`) === active.id,
        );
        const newIdx = sectionRows.findIndex(
          (f) => (f.id ?? `idx-${prev.indexOf(f)}`) === over.id,
        );
        if (oldIdx === -1 || newIdx === -1) return prev;
        const reordered = arrayMove(sectionRows, oldIdx, newIdx);
        // Walk the original flat array; when we hit a row in this category,
        // replace it with the next item from the reordered section list.
        let cursor = 0;
        const next = prev.map((f) =>
          f.category === category ? reordered[cursor++]! : f,
        );
        persistReorder(next);
        return next;
      });
    },
    [persistReorder],
  );

  // --- Regenerate one ---
  const handleRegenerateOne = useCallback(
    async (idx: number) => {
      const target = faqs[idx];
      if (!target) return;
      setRegeneratingId(target.id ?? `idx-${idx}`);
      try {
        const res = await fetch("/api/faq/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "regenerate_one",
            ...seed.inputs,
            product_url: seed.inputs.product_url ?? undefined,
            resource_text: seed.inputs.resource_text ?? undefined,
            resource_type: seed.inputs.resource_type ?? undefined,
            session_id: seed.session_id,
            faq_id: target.id,
            existing_faq: {
              question: target.question,
              answer: target.answer,
              category: target.category,
            },
          }),
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            (data && typeof data === "object" && "message" in data && typeof data.message === "string"
              ? data.message
              : null) ?? "Regenerate failed.";
          toast.error(msg);
          return;
        }
        const replaced = (data as { faq: Omit<FaqRow, "id"> }).faq;
        setFaqs((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx]!, ...replaced };
          return next;
        });
        toast.success("FAQ regenerated.");
      } catch {
        toast.error("Network error regenerating.");
      } finally {
        setRegeneratingId(null);
      }
    },
    [faqs, seed.inputs, seed.session_id],
  );

  // --- Generate more ---
  // gapAnswers param: keyed by gapKey; only non-empty values are stitched in.
  const handleGenerateMore = useCallback(
    async (opts?: {
      count?: number;
      extra?: string;
      gapAnswers?: Record<string, string>;
    }) => {
      setGeneratingMore(true);
      try {
        // Build resource_text by stacking: existing context + structured gap answers + free-form extra.
        const baseResource = seed.inputs.resource_text ?? "";

        const gapAnswerBlock = opts?.gapAnswers
          ? gaps
              .map((gap, idx) => {
                const answer = opts.gapAnswers?.[gapKey(gap, idx)]?.trim();
                if (!answer) return null;
                return `Q (${getGapTypeLabel(gap.gap_type)} — ${gap.description})\nA: ${answer}`;
              })
              .filter((line): line is string => Boolean(line))
          : [];

        const stitched = [
          baseResource.trim(),
          gapAnswerBlock.length
            ? `Additional details (answers to previously missing context):\n${gapAnswerBlock.join("\n\n")}`
            : "",
          opts?.extra ?? "",
        ]
          .filter((s) => s && s.length > 0)
          .join("\n\n");

        const augmentedResource = stitched.length ? stitched : undefined;

        const res = await fetch("/api/faq/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "more",
            ...seed.inputs,
            product_url: seed.inputs.product_url ?? undefined,
            resource_type: seed.inputs.resource_type ?? "other",
            resource_text: augmentedResource || undefined,
            session_id: seed.session_id,
            existing_faqs: faqs.map((f) => ({ question: f.question, category: f.category })),
            additional_count: opts?.count ?? 6,
          }),
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            (data && typeof data === "object" && "message" in data && typeof data.message === "string"
              ? data.message
              : null) ?? "Generate more failed.";
          toast.error(msg);
          return;
        }
        const payload = data as {
          added_faqs: (Omit<FaqRow, "id"> & { id: string | null })[];
          missing_context: GapRow[];
        };
        setFaqs((prev) => [...prev, ...payload.added_faqs.map((f) => ({ ...f, id: f.id ?? null }))]);
        // Refresh the missing-context panel with the latest pass — gaps may have changed.
        if (Array.isArray(payload.missing_context)) {
          setGaps(payload.missing_context.map((g) => ({ ...g, id: null })));
        }
        toast.success(`Added ${payload.added_faqs.length} more FAQs.`);
        setExtraContext("");
        setSelectedGapKeys(new Set());
        setModalOpen(false);
      } catch {
        toast.error("Network error generating more.");
      } finally {
        setGeneratingMore(false);
      }
    },
    [seed.inputs, seed.session_id, faqs, gaps],
  );

  // Sync sessionStorage so refresh-without-session-id keeps showing the right data.
  useEffect(() => {
    if (seed.source !== "sessionStorage") return;
    try {
      sessionStorage.setItem(
        RESULT_STORAGE_KEY,
        JSON.stringify({
          session_id: seed.session_id,
          inputs: seed.inputs,
          faqs,
          missing_context: gaps,
          usage: seed.usage,
          source_summary: seed.source_summary,
        }),
      );
    } catch {
      // ignore quota / private-mode failures
    }
  }, [seed, faqs, gaps]);

  const totalCount = faqs.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main column — FAQ artifact */}
      <section className="space-y-6 min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight">FAQ result</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {totalCount} FAQ{totalCount === 1 ? "" : "s"} ·{" "}
              {seed.usage.model || "Claude"} · {(seed.usage.cost_cents / 100).toFixed(3)}¢
              {seed.session_id ? (
                <> · saved ({seed.session_id.slice(0, 8)}…)</>
              ) : (
                <> · anonymous</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={copyAllMarkdown}>
              <Copy className="w-4 h-4" /> Copy all
            </Button>
            {seed.session_id && <ShareButton href={`/faq/share/${seed.session_id}`} />}
            <DownloadMenu faqs={faqs} />
          </div>
        </header>

        {!isPersisted && (
          <Card>
            <CardBody className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-700">
                You&apos;re viewing this as a guest. Sign in to save, edit, or reorder.
              </p>
              <Link href={`/login?next=${encodeURIComponent("/faq/new")}`}>
                <Button size="sm">Sign in</Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {grouped.map((group) => (
          <CategorySection
            key={group.category}
            category={group.category}
            rows={group.rows}
            faqs={faqs}
            canEdit={isPersisted}
            regeneratingId={regeneratingId}
            onCopy={copyOne}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRegenerate={handleRegenerateOne}
            onDragEnd={handleDragEnd}
          />
        ))}

        <Card>
          <CardBody className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-ink">Generate more FAQs</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Adds new FAQs without replacing the ones above. Use the Missing Context panel on
                the right to give Claude answers it needs.
              </p>
            </div>
            <Textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Optional: free-form context (e.g. 'also add an FAQ about refunds')."
              rows={3}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleGenerateMore({ extra: extraContext.trim() || undefined })}
                disabled={generatingMore}
              >
                {generatingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Generate 6 more
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Side panel — Missing Context */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <div>
          <h2 className="text-sm font-medium text-ink">Missing context ({gaps.length})</h2>
          {gaps.length > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              These are questions Claude needs answered to write better FAQs. Pick the ones you can
              answer.
            </p>
          )}
        </div>
        {gaps.length === 0 && (
          <Card>
            <CardBody>
              <p className="text-xs text-zinc-500">
                No gaps detected. Your product context covered all the angles Claude tried.
              </p>
            </CardBody>
          </Card>
        )}
        {gaps.map((gap, gIdx) => {
          const key = gapKey(gap, gIdx);
          const selected = selectedGapKeys.has(key);
          const toggle = () => {
            setSelectedGapKeys((prev) => {
              const next = new Set(prev);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            });
          };
          return (
            <button
              key={key}
              type="button"
              onClick={toggle}
              className={
                "block w-full text-left rounded-2xl bg-white border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors px-4 py-3 cursor-pointer " +
                (selected
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-zinc-200 hover:border-zinc-300")
              }
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border " +
                    (selected
                      ? "bg-brand border-brand text-white"
                      : "bg-white border-zinc-300 text-transparent")
                  }
                >
                  <Check className="w-3 h-3" />
                </span>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {getGapTypeLabel(gap.gap_type)}
                    </div>
                    <SeverityChip severity={gap.severity} />
                  </div>
                  <p className="text-sm text-zinc-700">{gap.description}</p>
                  {gap.suggested_fix && (
                    <p className="text-xs text-zinc-500 italic">Hint: {gap.suggested_fix}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {gaps.length > 0 && (
          <div className="pt-1">
            <Button
              onClick={() => setModalOpen(true)}
              disabled={selectedCount === 0 || generatingMore}
              className="w-full"
            >
              <Sparkles className="w-4 h-4" />
              {selectedCount === 0
                ? "Select questions to answer"
                : `Answer ${selectedCount} & generate FAQs`}
            </Button>
          </div>
        )}
      </aside>

      {modalOpen && (
        <AnswerGapsModal
          gaps={gaps.filter((g, idx) => selectedGapKeys.has(gapKey(g, idx)))}
          submitting={generatingMore}
          onCancel={() => setModalOpen(false)}
          onSubmit={(answers, extra) =>
            void handleGenerateMore({
              gapAnswers: Object.fromEntries(
                gaps
                  .map((g, idx) => [gapKey(g, idx), answers[gapKey(g, idx)] ?? ""] as const)
                  .filter(([, v]) => v.trim().length > 0),
              ),
              extra: extra.trim() || undefined,
            })
          }
        />
      )}
    </div>
  );
}

function SeverityChip({ severity }: { severity: "low" | "medium" | "high" }) {
  const map: Record<typeof severity, string> = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${map[severity]}`}
    >
      {severity}
    </span>
  );
}

// --- Modal: answer selected gaps before generating ---

function AnswerGapsModal({
  gaps,
  submitting,
  onCancel,
  onSubmit,
}: {
  gaps: GapRow[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (answers: Record<string, string>, extra: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState<string>("");
  const firstFieldRef = useRef<HTMLTextAreaElement | null>(null);

  // ESC to dismiss + lock body scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel, submitting]);

  const filledCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Answer missing context"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Answer to generate better FAQs</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Fill in what you can. Skip what you don&apos;t know yet — Claude only uses the ones
              you answer.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-5 flex-1">
          {gaps.map((gap, idx) => {
            const key = gap.id ?? `modal-gap-${idx}-${gap.gap_type}`;
            const value = answers[key] ?? "";
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    {getGapTypeLabel(gap.gap_type)}
                  </div>
                  <SeverityChip severity={gap.severity} />
                </div>
                <p className="text-sm font-medium text-ink">{gap.description}</p>
                {gap.suggested_fix && (
                  <p className="text-xs text-zinc-500 italic">Hint: {gap.suggested_fix}</p>
                )}
                <Textarea
                  ref={idx === 0 ? firstFieldRef : null}
                  value={value}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder="Your answer…"
                  rows={3}
                  className="text-sm"
                />
              </div>
            );
          })}

          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Anything else? (optional)
            </div>
            <Textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Free-form context for the next pass (e.g. 'also add an FAQ about refunds')."
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-500">
            {filledCount === 0 && extra.trim().length === 0
              ? "Type at least one answer or some extra context to continue."
              : `${filledCount} answer${filledCount === 1 ? "" : "s"}${
                  extra.trim().length > 0 ? " + extra context" : ""
                } ready.`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(answers, extra)}
              disabled={submitting || (filledCount === 0 && extra.trim().length === 0)}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate FAQs
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- One category section: header + DndContext + SortableContext over its rows ---

function CategorySection({
  category,
  rows,
  faqs,
  canEdit,
  regeneratingId,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
  onDragEnd,
}: {
  category: string;
  rows: FaqRow[];
  faqs: FaqRow[];
  canEdit: boolean;
  regeneratingId: string | null;
  onCopy: (faq: FaqRow) => void;
  onEdit: (
    idx: number,
    patch: Partial<Pick<FaqRow, "question" | "answer" | "category">>,
  ) => void;
  onDelete: (idx: number) => void;
  onRegenerate: (idx: number) => void;
  onDragEnd: (category: string, e: DragEndEvent) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemIds = rows.map((faq) => faq.id ?? `idx-${faqs.indexOf(faq)}`);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {getCategoryLabel(category)}
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onDragEnd(category, e)}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {rows.map((faq) => {
              const idx = faqs.indexOf(faq);
              const sortableId = faq.id ?? `idx-${idx}`;
              return (
                <SortableFaqCard
                  key={sortableId}
                  sortableId={sortableId}
                  faq={faq}
                  canEdit={canEdit}
                  canDrag={canEdit && rows.length > 1}
                  isRegenerating={regeneratingId === sortableId}
                  onCopy={() => onCopy(faq)}
                  onEdit={(patch) => onEdit(idx, patch)}
                  onDelete={() => onDelete(idx)}
                  onRegenerate={() => onRegenerate(idx)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

// --- Sortable FAQ card ---

function SortableFaqCard({
  sortableId,
  faq,
  canEdit,
  canDrag,
  isRegenerating,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
}: {
  sortableId: string;
  faq: FaqRow;
  canEdit: boolean;
  canDrag: boolean;
  isRegenerating: boolean;
  onCopy: () => void;
  onEdit: (patch: Partial<Pick<FaqRow, "question" | "answer" | "category">>) => void;
  onDelete: () => void;
  onRegenerate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    disabled: !canDrag,
  });

  const [editing, setEditing] = useState(false);
  const [draftQ, setDraftQ] = useState(faq.question);
  const [draftA, setDraftA] = useState(faq.answer);

  const startEdit = () => {
    setDraftQ(faq.question);
    setDraftA(faq.answer);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    const patch: Partial<Pick<FaqRow, "question" | "answer">> = {};
    if (draftQ.trim() && draftQ.trim() !== faq.question) patch.question = draftQ.trim();
    if (draftA.trim() && draftA.trim() !== faq.answer) patch.answer = draftA.trim();
    if (Object.keys(patch).length) onEdit(patch);
    setEditing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className={isDragging ? "shadow-lg ring-1 ring-brand/30" : undefined}>
        <CardBody className="space-y-3">
          <div className="flex items-start gap-2">
            {canDrag && !editing && (
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="mt-0.5 -ml-1 inline-flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-grab active:cursor-grabbing touch-none"
                aria-label="Drag to reorder"
                title="Drag to reorder (or use space + arrow keys)"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              {!editing ? (
                <>
                  <h3 className="text-base font-medium text-ink">{faq.question}</h3>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{faq.answer}</p>
                </>
              ) : (
                <>
                  <Input
                    value={draftQ}
                    onChange={(e) => setDraftQ(e.target.value)}
                    className="text-base font-medium"
                  />
                  <Textarea value={draftA} onChange={(e) => setDraftA(e.target.value)} rows={5} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            {!editing && (
              <>
                <Button size="sm" variant="ghost" onClick={onCopy} title="Copy this FAQ">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  title="Regenerate this FAQ"
                >
                  {isRegenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </Button>
                {canEdit && (
                  <Button size="sm" variant="ghost" onClick={startEdit} title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onDelete} title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            {editing && (
              <>
                <Button size="sm" onClick={saveEdit}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// --- Download menu: Markdown / CSV / DOCX / PDF ---
//
// Uses a native <details> for accessibility + zero deps. The DOCX/PDF exporters
// are lazy-imported inside src/lib/export-faqs.ts so users who never click
// download don't pay the bundle cost.

function DownloadMenu({ faqs }: { faqs: ExportFaq[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [busyFormat, setBusyFormat] = useState<string | null>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  async function run(format: string, fn: () => void | Promise<void>) {
    setBusyFormat(format);
    try {
      await fn();
      closeMenu();
    } catch {
      toast.error(`Couldn't generate ${format.toUpperCase()} — try again.`);
    } finally {
      setBusyFormat(null);
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className="list-none inline-flex items-center gap-2 h-9 px-4 text-sm rounded-lg border border-zinc-300 bg-white text-ink hover:bg-zinc-50 cursor-pointer select-none"
        aria-label="Download menu"
      >
        <Download className="w-4 h-4" /> Download <ChevronDown className="w-3.5 h-3.5" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
        <DownloadItem
          label="Markdown (.md)"
          busy={busyFormat === "md"}
          onClick={() => run("md", () => downloadMarkdown(faqs))}
        />
        <DownloadItem
          label="CSV (.csv)"
          busy={busyFormat === "csv"}
          onClick={() => run("csv", () => downloadCsv(faqs))}
        />
        <DownloadItem
          label="Word (.docx)"
          busy={busyFormat === "docx"}
          onClick={() => run("docx", () => downloadDocx(faqs))}
        />
        <DownloadItem
          label="PDF (.pdf)"
          busy={busyFormat === "pdf"}
          onClick={() => run("pdf", () => downloadPdf(faqs))}
        />
      </div>
    </details>
  );
}

function DownloadItem({
  label,
  busy,
  onClick,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 flex items-center justify-between gap-2"
    >
      {label}
      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
    </button>
  );
}
