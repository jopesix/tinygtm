"use client";

// Three-step wizard for Campaign Operations Planner.
// 1) Input source — paste messy notes
// 2) Confirm classification — edit AI's guess for type/business/team/motion/channels
// 3) Generating — loader, redirect to /campaign/[id] on success

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Textarea, Input, Field } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  BUSINESS_TYPE_LABELS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
  GTM_MOTION_LABELS,
  TEAM_STRUCTURE_LABELS,
  type Classification,
} from "@/lib/schemas/campaign";

const MAX_SOURCE = 50_000;

const STEPS = [
  { key: "input", label: "Add context" },
  { key: "classify", label: "Confirm" },
  { key: "plan", label: "Generate" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

const COMPLEXITY_OPTIONS = [
  { value: "low", label: "Low — solo, one channel" },
  { value: "medium", label: "Medium — multi-channel, manageable" },
  { value: "high", label: "High — many teams, multi-week" },
] as const;

export function CampaignWizard() {
  const router = useRouter();

  // Step 1: Input
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Async
  const [classifying, setClassifying] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Step 2: Classification (editable)
  const [classification, setClassification] = useState<Classification | null>(null);

  const [step, setStep] = useState<StepKey>("input");

  async function goClassify() {
    if (sourceText.trim().length < 50) {
      toast.error("Paste at least a paragraph of context.");
      return;
    }
    if (sourceText.length > MAX_SOURCE) {
      toast.error(`Trim to under ${MAX_SOURCE.toLocaleString()} characters.`);
      return;
    }
    setClassifying(true);
    setStep("classify");
    try {
      const res = await fetch("/api/campaign/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_text: sourceText,
          source_url: sourceUrl.trim() || undefined,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : "Couldn't classify the campaign.";
        toast.error(message);
        setStep("input");
        return;
      }
      const c = (data as { classification: Classification }).classification;
      setClassification(c);
    } catch {
      toast.error("Network error classifying. Try again.");
      setStep("input");
    } finally {
      setClassifying(false);
    }
  }

  async function goGenerate() {
    if (!classification) return;
    setGenerating(true);
    setStep("plan");
    try {
      const res = await fetch("/api/campaign/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_text: sourceText,
          source_url: sourceUrl.trim() || undefined,
          classification,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : "Couldn't generate the plan.";
        toast.error(message);
        setStep("classify");
        setGenerating(false);
        return;
      }
      const planId = (data as { plan_id: string | null }).plan_id;
      if (planId) {
        router.push(`/campaign/${planId}`);
      } else {
        toast.error("Plan generated but couldn't be saved. Make sure campaign.sql is applied.");
        setStep("classify");
        setGenerating(false);
      }
    } catch {
      toast.error("Network error generating plan. Try again.");
      setStep("classify");
      setGenerating(false);
    }
  }

  function updateClassification<K extends keyof Classification>(
    key: K,
    value: Classification[K],
  ) {
    setClassification((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleChannel(channel: string) {
    if (!classification) return;
    const has = classification.channels.includes(channel as Classification["channels"][number]);
    const next = has
      ? classification.channels.filter((c) => c !== channel)
      : [...classification.channels, channel as Classification["channels"][number]];
    if (next.length === 0) return; // require at least one
    updateClassification("channels", next as Classification["channels"]);
  }

  return (
    <div className="space-y-6">
      <StepProgress current={step} />

      {step === "input" && (
        <Card>
          <CardBody className="space-y-5">
            <Field
              label="Paste your campaign context"
              required
              hint={`Kickoff notes, transcript, Slack thread, anything. ${sourceText.length.toLocaleString()} / ${MAX_SOURCE.toLocaleString()} chars`}
            >
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="e.g. We're launching a webinar for CFOs about AI reporting workflows using LinkedIn ads, lifecycle email, and SDR outreach. Goal is 200 registrations, 60 attendees, 12 SQOs. Tagline TBD."
                rows={12}
                className="font-mono text-xs"
              />
            </Field>

            <Field label="Campaign URL" hint="Optional. Landing page, brief doc, anything we can use.">
              <Input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://your-site.com/launch"
              />
            </Field>
          </CardBody>
          <CardFooter className="justify-end">
            <Button onClick={goClassify} disabled={classifying || sourceText.trim().length < 50}>
              <Wand2 className="w-4 h-4" /> Classify
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === "classify" && (
        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-ink">Confirm what we&apos;re looking at</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                We&apos;ve read your context. Edit anything that&apos;s wrong before we build the
                plan.
              </p>
            </div>

            {classifying || !classification ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-32 bg-zinc-200 rounded animate-pulse" />
                    <div className="h-9 w-full bg-zinc-100 rounded animate-pulse" />
                  </div>
                ))}
                <p className="text-xs text-zinc-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading your campaign…
                </p>
              </div>
            ) : (
              <>
                <Field label="Campaign name" required>
                  <Input
                    value={classification.campaign_name}
                    onChange={(e) => updateClassification("campaign_name", e.target.value)}
                  />
                </Field>

                <Field label="Campaign type" required>
                  <Select
                    value={classification.campaign_type}
                    onChange={(e) =>
                      updateClassification(
                        "campaign_type",
                        e.target.value as Classification["campaign_type"],
                      )
                    }
                  >
                    {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Business type" required>
                    <Select
                      value={classification.business_type}
                      onChange={(e) =>
                        updateClassification(
                          "business_type",
                          e.target.value as Classification["business_type"],
                        )
                      }
                    >
                      {Object.entries(BUSINESS_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Team structure" required>
                    <Select
                      value={classification.team_structure}
                      onChange={(e) =>
                        updateClassification(
                          "team_structure",
                          e.target.value as Classification["team_structure"],
                        )
                      }
                    >
                      {Object.entries(TEAM_STRUCTURE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="GTM motion" required>
                    <Select
                      value={classification.gtm_motion}
                      onChange={(e) =>
                        updateClassification(
                          "gtm_motion",
                          e.target.value as Classification["gtm_motion"],
                        )
                      }
                    >
                      {Object.entries(GTM_MOTION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Launch complexity" required>
                    <Select
                      value={classification.launch_complexity}
                      onChange={(e) =>
                        updateClassification(
                          "launch_complexity",
                          e.target.value as Classification["launch_complexity"],
                        )
                      }
                    >
                      {COMPLEXITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Channels involved" required hint="Pick at least one.">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(CHANNEL_LABELS).map(([k, v]) => {
                      const checked = classification.channels.includes(
                        k as Classification["channels"][number],
                      );
                      return (
                        <label
                          key={k}
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
                            onChange={() => toggleChannel(k)}
                          />
                          {v}
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}
          </CardBody>
          <CardFooter className="justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep("input")}
              disabled={classifying || generating}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              onClick={goGenerate}
              disabled={classifying || generating || !classification}
            >
              <Sparkles className="w-4 h-4" /> Generate plan
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === "plan" && (
        <Card>
          <CardBody className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <h2 className="text-base font-medium text-ink">Building your operations plan…</h2>
            <p className="text-sm text-zinc-500 max-w-md">
              Tailoring tasks to your campaign type, channels, and team. About 5–15 seconds.
            </p>
          </CardBody>
        </Card>
      )}
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
