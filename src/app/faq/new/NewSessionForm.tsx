"use client";

// Four-step wizard for starting a new FAQ session.
// 1) Source — paste, fetch URL, optional description seed
// 2) Shape  — destination, reader, focus areas
// 3) Review — Claude-inferred summary the user can edit
// 4) Generating — loader → /faq/generate?session=<id> on success
//
// The wizard is one file because the steps share enough state that splitting
// adds more boilerplate than it removes. Each step's render path lives in its
// own helper for readability.

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
  Plus,
  X,
} from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FAQ_DESTINATIONS, FOCUS_AREAS, type FaqDestinationKey } from "@/lib/wizard-options";

const RESULT_STORAGE_KEY = "faq-generator:last-result";

export type ProductProfile = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  target_audience: string;
  key_problem: string;
};

const MAX_PASTE = 50_000;
const STEPS = [
  { key: "source", label: "Add context" },
  { key: "shape", label: "Shape" },
  { key: "review", label: "Review" },
  { key: "generating", label: "Generate" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

type InferredContext = {
  product_summary: string;
  target_reader: string;
  main_use_case: string;
  main_value_prop: string;
  likely_themes: string[];
};

export function NewSessionForm({
  isAuthed,
  profiles,
}: {
  isAuthed: boolean;
  profiles: ProductProfile[];
}) {
  const router = useRouter();

  // Step 1 — Source
  const [profileId, setProfileId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resourceText, setResourceText] = useState("");
  const [fetchUrl, setFetchUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Shape
  const [destination, setDestination] = useState<FaqDestinationKey>("launch_page");
  const [reader, setReader] = useState("");
  const [focusAreas, setFocusAreas] = useState<Set<string>>(new Set(["general"]));

  // Step 3 — Review (inferred + editable)
  const [inferring, setInferring] = useState(false);
  const [inferred, setInferred] = useState<InferredContext | null>(null);
  const [productSummary, setProductSummary] = useState("");
  const [reviewReader, setReviewReader] = useState("");
  const [mainUseCase, setMainUseCase] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [themes, setThemes] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<StepKey>("source");

  // ─── Profile prefill ───────────────────────────────────────────────
  function applyProfile(id: string) {
    setProfileId(id);
    if (!id) {
      setDescription("");
      setUrl("");
      setReader("");
      return;
    }
    const p = profiles.find((p) => p.id === id);
    if (p) {
      setDescription(p.description);
      setUrl(p.url ?? "");
      setReader(p.target_audience);
      // Leave resourceText alone — profile doesn't carry source material.
    }
  }

  // ─── Step 1 actions ────────────────────────────────────────────────
  async function handleFetchUrl() {
    const trimmed = fetchUrl.trim();
    if (!trimmed) return toast.error("Enter a URL first.");
    if (!/^https?:\/\//i.test(trimmed)) {
      return toast.error("URL must start with http:// or https://");
    }
    setFetching(true);
    try {
      const res = await fetch("/api/faq/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : null) ?? "Couldn't fetch that URL.";
        toast.error(message);
        return;
      }
      const payload = data as {
        markdown: string;
        char_count: number;
        truncated: boolean;
        title: string;
      };
      const next = resourceText.trim()
        ? `${resourceText}\n\n--- Fetched from ${trimmed} ---\n${payload.markdown}`
        : payload.markdown;
      setResourceText(next.slice(0, MAX_PASTE));
      if (!url.trim()) setUrl(trimmed);
      toast.success(
        payload.truncated
          ? `Fetched ${payload.char_count.toLocaleString()} chars (truncated to fit).`
          : `Fetched ${payload.char_count.toLocaleString()} chars.`,
      );
    } catch {
      toast.error("Network error fetching URL.");
    } finally {
      setFetching(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected if needed.
    e.target.value = "";

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is over 10MB. Try splitting it or pasting the relevant section.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/faq/extract-file", { method: "POST", body: form });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : null) ?? "Couldn't extract that file.";
        toast.error(message);
        return;
      }
      const payload = data as {
        markdown: string;
        char_count: number;
        truncated: boolean;
        filename: string;
        resource_type_hint?: string;
      };
      const next = resourceText.trim()
        ? `${resourceText}\n\n--- From ${payload.filename} ---\n${payload.markdown}`
        : payload.markdown;
      setResourceText(next.slice(0, MAX_PASTE));
      toast.success(
        payload.truncated
          ? `Loaded ${payload.char_count.toLocaleString()} chars from ${payload.filename} (truncated to fit).`
          : `Loaded ${payload.char_count.toLocaleString()} chars from ${payload.filename}.`,
      );
    } catch {
      toast.error("Network error uploading the file.");
    } finally {
      setUploading(false);
    }
  }

  function goToShape() {
    const hasSource = resourceText.trim().length > 0 || url.trim().length > 0;
    const hasDescription = description.trim().length >= 10;
    if (!hasSource && !hasDescription) {
      toast.error("Paste source material, fetch a URL, or write a short description first.");
      return;
    }
    if (resourceText.length > MAX_PASTE) {
      toast.error(`Source material is too long (max ${MAX_PASTE.toLocaleString()} chars).`);
      return;
    }
    setStep("shape");
  }

  function toggleFocusArea(key: string) {
    setFocusAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function goToReview() {
    setInferring(true);
    setStep("review");
    try {
      const res = await fetch("/api/faq/infer-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_text: resourceText.trim() || undefined,
          resource_type: undefined,
          product_url: url.trim() || undefined,
          product_description_seed: description.trim() || undefined,
          reader_seed: reader.trim() || undefined,
          faq_destination: destination,
          focus_areas: Array.from(focusAreas),
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : null) ?? "Couldn't read the source.";
        toast.error(message);
        // Allow the user to manually fill in the fields if inference fails.
        setInferred({
          product_summary: description,
          target_reader: reader,
          main_use_case: "",
          main_value_prop: "",
          likely_themes: [],
        });
        setProductSummary(description);
        setReviewReader(reader);
        return;
      }
      const c = data as InferredContext;
      setInferred(c);
      setProductSummary(c.product_summary);
      setReviewReader(c.target_reader);
      setMainUseCase(c.main_use_case);
      setValueProp(c.main_value_prop);
      setThemes(c.likely_themes);
    } catch {
      toast.error("Network error reading the source.");
    } finally {
      setInferring(false);
    }
  }

  async function handleGenerate() {
    if (productSummary.trim().length < 10) {
      return toast.error("Product summary is too short — give it at least a sentence.");
    }
    if (reviewReader.trim().length < 2) {
      return toast.error("Add a target reader before generating.");
    }
    if (mainUseCase.trim().length < 5) {
      return toast.error("Add the main use case before generating.");
    }

    setSubmitting(true);
    setStep("generating");
    try {
      const res = await fetch("/api/faq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "initial",
          product_description: productSummary.trim(),
          product_url: url.trim() || undefined,
          target_audience: reviewReader.trim(),
          key_problem: mainUseCase.trim(),
          persona: reviewReader.trim(),
          resource_type: undefined,
          resource_text: resourceText.trim() || undefined,
          product_profile_id: profileId || null,
          faq_destination: destination,
          focus_areas: Array.from(focusAreas),
          main_value_prop: valueProp.trim() || undefined,
          likely_themes: themes.filter((t) => t.trim().length > 0),
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : null) ?? "Something went wrong. Try again.";
        toast.error(message);
        setStep("review");
        setSubmitting(false);
        return;
      }

      try {
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
      const sessionId =
        data && typeof data === "object" && "session_id" in data
          ? (data as { session_id: string | null }).session_id
          : null;
      router.push(sessionId ? `/faq/generate?session=${sessionId}` : "/faq/generate");
    } catch {
      toast.error("Network error reaching the AI route. Try again.");
      setStep("review");
      setSubmitting(false);
    }
  }

  // ─── Step 1 render ─────────────────────────────────────────────────
  function renderSource() {
    return (
      <div className="space-y-5">
        {isAuthed && profiles.length > 0 && (
          <Card>
            <CardBody>
              <Field
                label="Use a saved product profile"
                hint="Or start fresh and paste source below."
              >
                <Select value={profileId} onChange={(e) => applyProfile(e.target.value)}>
                  <option value="">Start fresh</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-ink">Source material</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Paste anything that describes your product — a PRD, landing page copy, release
                notes, transcript, help doc. Or fetch a public URL. The more grounded the input,
                the better the FAQs.
              </p>
            </div>

            <Field
              label="Fetch from a URL"
              hint="Any web URL including public landing pages, blog posts, help docs, Google Docs. Won't work on auth-walled pages."
            >
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  placeholder="https://rivva.app or https://rivva.app/about"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!fetching) void handleFetchUrl();
                    }
                  }}
                  disabled={fetching}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleFetchUrl}
                  disabled={fetching || !fetchUrl.trim()}
                >
                  {fetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Fetching…
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" /> Fetch
                    </>
                  )}
                </Button>
              </div>
            </Field>

            <Field
              label="And/or fetch from file"
              hint="PDF, DOCX, MD, or TXT. Up to 10MB. Scanned PDFs won't work — they need OCR first."
            >
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.md,.markdown,.txt"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Reading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Choose file
                    </>
                  )}
                </Button>
                <span className="text-xs text-zinc-500">
                  We&apos;ll extract clean text and drop it into the paste box below.
                </span>
              </div>
            </Field>

            <Field
              label="Paste content"
              hint={`Up to ${MAX_PASTE.toLocaleString()} chars. ${resourceText.length.toLocaleString()} used.`}
            >
              <Textarea
                value={resourceText}
                onChange={(e) => setResourceText(e.target.value)}
                placeholder="Paste your PRD, transcript, release notes, landing page copy, or anything that describes your product…"
                rows={10}
                className="font-mono text-xs"
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-ink">
                Product description{" "}
                <span className="text-xs text-zinc-400 font-normal">(optional)</span>
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                A short head start. We&apos;ll also infer this from your source in the step above.
              </p>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rivva is a calm-first reading app for neurodivergent adults."
              rows={3}
            />
            <Field label="Product URL" hint="Optional. Helps ground the language used in answers.">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://rivva.app"
              />
            </Field>
          </CardBody>
          <CardFooter className="justify-end">
            <Button onClick={goToShape}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Step 2 render ─────────────────────────────────────────────────
  function renderShape() {
    return (
      <div className="space-y-5">
        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-ink">Shape the FAQs</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Tell us how these FAQs will be used. We only ask what materially changes the
                output.
              </p>
            </div>

            <Field label="FAQ destination" required hint="Where will these FAQs live?">
              <Select
                value={destination}
                onChange={(e) => setDestination(e.target.value as FaqDestinationKey)}
              >
                {FAQ_DESTINATIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Reader"
              hint="Who will read these FAQs? Free-form — we don't need a fixed persona."
            >
              <Input
                value={reader}
                onChange={(e) => setReader(e.target.value)}
                placeholder="e.g. startup founders, HR managers, developers, new users, enterprise buyers"
              />
            </Field>

            <Field
              label="Focus areas"
              hint="Pick anything the FAQs should lean into. Defaults to General if you skip."
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FOCUS_AREAS.map((f) => {
                  const checked = focusAreas.has(f.key);
                  return (
                    <label
                      key={f.key}
                      className={
                        "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors " +
                        (checked
                          ? "bg-brand/5 border-brand text-ink"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-700")
                      }
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-brand focus:ring-brand"
                        checked={checked}
                        onChange={() => toggleFocusArea(f.key)}
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </Field>
          </CardBody>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep("source")}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={goToReview}>
              <Wand2 className="w-4 h-4" /> Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Step 3 render ─────────────────────────────────────────────────
  function renderReview() {
    return (
      <div className="space-y-5">
        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-ink">Here&apos;s what we understood</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Edit anything that&apos;s wrong before we generate. The FAQs will be grounded in
                this summary.
              </p>
            </div>

            {inferring && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-32 bg-zinc-200 rounded animate-pulse" />
                    <div className="h-8 w-full bg-zinc-100 rounded animate-pulse" />
                  </div>
                ))}
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading your source material…
                </p>
              </div>
            )}

            {!inferring && inferred && (
              <>
                <Field label="Product summary" required>
                  <Textarea
                    value={productSummary}
                    onChange={(e) => setProductSummary(e.target.value)}
                    rows={3}
                  />
                </Field>

                <Field label="Target reader" required>
                  <Input
                    value={reviewReader}
                    onChange={(e) => setReviewReader(e.target.value)}
                  />
                </Field>

                <Field label="Main use case" required>
                  <Textarea
                    value={mainUseCase}
                    onChange={(e) => setMainUseCase(e.target.value)}
                    rows={2}
                  />
                </Field>

                <Field label="Main value proposition">
                  <Textarea
                    value={valueProp}
                    onChange={(e) => setValueProp(e.target.value)}
                    rows={2}
                  />
                </Field>

                <ThemesEditor themes={themes} onChange={setThemes} />
              </>
            )}
          </CardBody>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep("shape")} disabled={inferring}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={inferring || submitting || !inferred}>
              <Sparkles className="w-4 h-4" /> Generate FAQs
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Step 4 render ─────────────────────────────────────────────────
  function renderGenerating() {
    return (
      <Card>
        <CardBody className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <h2 className="text-base font-medium text-ink">Generating your FAQs…</h2>
          <p className="text-sm text-zinc-500 max-w-md">
            Usually takes 5–15 seconds. We&apos;ll redirect you to the result as soon as it&apos;s
            ready.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StepProgress current={step} />
      {step === "source" && renderSource()}
      {step === "shape" && renderShape()}
      {step === "review" && renderReview()}
      {step === "generating" && renderGenerating()}
    </div>
  );
}

function StepProgress({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className={
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium " +
                (active
                  ? "bg-brand text-white"
                  : done
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-500")
              }
            >
              {i + 1}
            </span>
            <span
              className={
                "truncate " + (active ? "text-ink font-medium" : "text-zinc-500")
              }
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={
                  "flex-1 h-px " + (i < currentIdx ? "bg-emerald-300" : "bg-zinc-200")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ThemesEditor({
  themes,
  onChange,
}: {
  themes: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addDraft() {
    const t = draft.trim();
    if (!t) return;
    if (themes.includes(t)) return setDraft("");
    onChange([...themes, t].slice(0, 12));
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <Field
      label="Likely FAQ themes"
      hint="Topic areas customers will ask about. Edit, remove, or add to taste."
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {themes.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs text-zinc-700"
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(themes.filter((_, idx) => idx !== i))}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label={`Remove ${t}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {themes.length === 0 && (
            <span className="text-xs text-zinc-400">No themes yet — add one below.</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
            }}
            placeholder="e.g. Pricing, Setup time, Security"
          />
          <Button type="button" variant="secondary" onClick={addDraft} disabled={!draft.trim()}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>
    </Field>
  );
}
