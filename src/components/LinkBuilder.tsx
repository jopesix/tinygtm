"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Copy,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { type NamingRules, normalizeToken } from "@/lib/utm/normalize";
import { buildLinkPayload, type ValidationIssue } from "@/lib/utm";

export type Campaign = {
  id: string;
  display_name: string;
  utm_campaign: string;
  utm_id: string | null;
};

type Props = {
  isAuthed: boolean;
  rules: NamingRules;
  campaigns: Campaign[];
  initialCampaignId?: string | null;
};

type AddKind = "source" | "medium";

type Fields = {
  destination_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_id: string;
  utm_term: string;
  utm_content: string;
};

const EMPTY: Fields = {
  destination_url: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_id: "",
  utm_term: "",
  utm_content: "",
};

export function LinkBuilder({ isAuthed, rules: initialRules, campaigns, initialCampaignId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Keep rules in local state so off-list additions take effect immediately.
  // When the user is signed in, we also persist to /api/naming-rules.
  const [rules, setRules] = useState<NamingRules>(initialRules);

  // Seed initial fields with the prefilled campaign (if any) so we never need
  // a setState-in-effect.
  const initialCampaign = useMemo(
    () => (initialCampaignId ? campaigns.find((c) => c.id === initialCampaignId) ?? null : null),
    [initialCampaignId, campaigns],
  );

  const [campaignId, setCampaignId] = useState<string | null>(initialCampaignId ?? null);
  const [fields, setFields] = useState<Fields>(() => ({
    ...EMPTY,
    utm_campaign: initialCampaign?.utm_campaign ?? "",
    utm_id: initialCampaign?.utm_id ?? "",
  }));

  function pickCampaign(nextId: string | null) {
    setCampaignId(nextId);
    if (!nextId) return;
    const c = campaigns.find((x) => x.id === nextId);
    if (!c) return;
    setFields((f) => ({
      ...f,
      utm_campaign: c.utm_campaign,
      utm_id: c.utm_id ?? f.utm_id,
    }));
  }

  // Live preview: normalize + validate + build URL on every keystroke.
  const preview = useMemo(
    () =>
      buildLinkPayload(
        {
          destination_url: fields.destination_url,
          utm_source: fields.utm_source,
          utm_medium: fields.utm_medium,
          utm_campaign: fields.utm_campaign,
          utm_id: fields.utm_id || undefined,
          utm_term: fields.utm_term || undefined,
          utm_content: fields.utm_content || undefined,
        },
        rules,
      ),
    [fields, rules],
  );

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function copyToClipboard() {
    if (preview.hasErrors) {
      toast.error("Fix the errors before copying.");
      return;
    }
    await navigator.clipboard.writeText(preview.generated_url);
    toast.success("Link copied.");
  }

  async function handleSave() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    if (preview.hasErrors) {
      toast.error("Fix the errors before saving.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/utm/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId, ...preview.fields }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data?.duplicate) {
        toast.error("This exact link already exists.", {
          description: "We won't save a duplicate. You can copy the existing one.",
          action: {
            label: "Copy existing",
            onClick: async () => {
              await navigator.clipboard.writeText(data.duplicate.generated_url);
              toast.success("Existing link copied.");
            },
          },
        });
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || "Couldn't save link.");
        return;
      }

      toast.success("Link saved.");
      router.refresh();
    });
  }

  async function addToApproved(kind: AddKind, rawValue: string) {
    const value = normalizeToken(rawValue, rules);
    if (!value) return;
    const next: NamingRules =
      kind === "source"
        ? rules.allowed_sources.includes(value)
          ? rules
          : { ...rules, allowed_sources: [...rules.allowed_sources, value] }
        : rules.allowed_mediums.includes(value)
          ? rules
          : { ...rules, allowed_mediums: [...rules.allowed_mediums, value] };

    setRules(next);

    if (isAuthed) {
      const res = await fetch("/api/utm/naming-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        toast.error("Couldn't save the new value to your rules.");
        return;
      }
      toast.success(`Added "${value}" to your approved ${kind}s.`);
    } else {
      toast.success(`Using "${value}". Sign in to save this to your approved ${kind}s.`);
    }
  }

  const issuesByField = useMemo(() => {
    const m: Record<string, ValidationIssue[]> = {};
    for (const i of preview.issues) {
      const key = i.field as string;
      m[key] = m[key] || [];
      m[key].push(i);
    }
    return m;
  }, [preview.issues]);

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <div className="md:col-span-3 space-y-4">
        {/* Main form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link builder</CardTitle>
            <CardDescription>
              Required fields are marked. Values are normalized to lowercase snake_case on save.
            </CardDescription>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            {/* Campaign selector */}
            {isAuthed && (
              <Field
                label="Campaign"
                hint={
                  campaigns.length === 0 ? (
                    <>
                      <Link href="/utm/campaigns/new" className="underline">
                        Create your first campaign
                      </Link>{" "}
                      to reuse a canonical utm_campaign across links.
                    </>
                  ) : (
                    <>
                      Pick an existing campaign to inherit its canonical utm_campaign, or{" "}
                      <Link href="/utm/campaigns/new" className="underline">
                        create a new one
                      </Link>
                      .
                    </>
                  )
                }
              >
                <select
                  value={campaignId ?? ""}
                  onChange={(e) => pickCampaign(e.target.value || null)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
                >
                  <option value="">— one-off link (no campaign) —</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} ({c.utm_campaign})
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Destination URL" required>
              <Input
                type="url"
                placeholder="https://your-site.com/page"
                value={fields.destination_url}
                onChange={(e) => update("destination_url", e.target.value)}
              />
              <FieldIssues issues={issuesByField["destination_url"]} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Campaign source (utm_source)"
                required
                hint="Type any value — or pick a suggestion below."
              >
                <Input
                  placeholder="linkedin"
                  value={fields.utm_source}
                  onChange={(e) => update("utm_source", e.target.value)}
                />
                <SuggestionChips
                  values={rules.allowed_sources}
                  current={fields.utm_source}
                  onPick={(v) => update("utm_source", v)}
                />
                <FieldIssues
                  issues={issuesByField["utm_source"]}
                  rawValue={fields.utm_source}
                  onAddApproved={() => addToApproved("source", fields.utm_source)}
                />
              </Field>

              <Field
                label="Campaign medium (utm_medium)"
                required
                hint="Type any value — or pick a suggestion below."
              >
                <Input
                  placeholder="paid_social"
                  value={fields.utm_medium}
                  onChange={(e) => update("utm_medium", e.target.value)}
                />
                <SuggestionChips
                  values={rules.allowed_mediums}
                  current={fields.utm_medium}
                  onPick={(v) => update("utm_medium", v)}
                />
                <FieldIssues
                  issues={issuesByField["utm_medium"]}
                  rawValue={fields.utm_medium}
                  onAddApproved={() => addToApproved("medium", fields.utm_medium)}
                />
              </Field>
            </div>

            <Field
              label="Campaign name (utm_campaign)"
              required
              hint={
                campaignId
                  ? "Locked to the selected campaign's canonical slug."
                  : "Use the same slug across every link in this campaign."
              }
            >
              <Input
                placeholder="uk_fintech_founders_retargeting"
                value={fields.utm_campaign}
                onChange={(e) => update("utm_campaign", e.target.value)}
                disabled={!!campaignId}
              />
              <FieldIssues issues={issuesByField["utm_campaign"]} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Campaign ID (utm_id)">
                <Input
                  placeholder="optional"
                  value={fields.utm_id}
                  onChange={(e) => update("utm_id", e.target.value)}
                />
              </Field>
              <Field label="Term (utm_term)">
                <Input
                  placeholder="optional"
                  value={fields.utm_term}
                  onChange={(e) => update("utm_term", e.target.value)}
                />
              </Field>
              <Field label="Content (utm_content)">
                <Input
                  placeholder="optional"
                  value={fields.utm_content}
                  onChange={(e) => update("utm_content", e.target.value)}
                />
              </Field>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Preview panel */}
      <div className="md:col-span-2 space-y-4">
        <Card className="md:sticky md:top-20">
          <CardHeader>
            <CardTitle className="text-base">Generated URL</CardTitle>
            <CardDescription>
              {preview.hasErrors
                ? "Fill in required fields to generate."
                : "Preview updates as you type."}
            </CardDescription>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="font-mono text-xs bg-zinc-900 text-zinc-100 rounded-lg p-3 break-all min-h-[80px] whitespace-pre-wrap">
              {preview.generated_url || (
                <span className="text-zinc-500 italic">
                  https://your-site.com/page?utm_source=...&utm_medium=...&utm_campaign=...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Button onClick={copyToClipboard} disabled={preview.hasErrors} size="sm">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                disabled={preview.hasErrors || pending}
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isAuthed ? "Save link" : "Sign in to save"}
              </Button>
              {preview.generated_url && !preview.hasErrors && (
                <a
                  href={preview.generated_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 px-2 py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
              )}
            </div>

            {!isAuthed && (
              <p className="mt-3 text-xs text-zinc-500">
                You can generate and copy links without signing in. Sign in to save to your
                campaign history and export.
              </p>
            )}

            {/* Issues summary */}
            {preview.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {preview.issues.map((i, idx) => (
                  <IssueRow key={idx} issue={i} />
                ))}
              </div>
            )}
            {preview.issues.length === 0 && preview.generated_url && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Looks good. Naming rules satisfied.
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function FieldIssues({
  issues,
  rawValue,
  onAddApproved,
}: {
  issues?: ValidationIssue[];
  rawValue?: string;
  onAddApproved?: () => void;
}) {
  if (!issues || issues.length === 0) return null;
  return (
    <div className="mt-1 space-y-1">
      {issues.map((i, idx) => (
        <IssueRow
          key={idx}
          issue={i}
          compact
          // "Add to approved list" only makes sense for non-empty off-list warnings.
          onAddApproved={
            i.level === "warning" && rawValue && onAddApproved ? onAddApproved : undefined
          }
        />
      ))}
    </div>
  );
}

function IssueRow({
  issue,
  compact,
  onAddApproved,
}: {
  issue: ValidationIssue;
  compact?: boolean;
  onAddApproved?: () => void;
}) {
  const isError = issue.level === "error";
  return (
    <div
      className={`flex items-start gap-1.5 text-xs ${
        isError ? "text-red-700" : "text-amber-800"
      } ${compact ? "" : "p-2 rounded-md " + (isError ? "bg-red-50" : "bg-amber-50")}`}
    >
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {issue.message}
        {issue.suggestion && (
          <>
            {" "}
            Did you mean <strong>{issue.suggestion}</strong>?
          </>
        )}
        {onAddApproved && (
          <button
            type="button"
            onClick={onAddApproved}
            className="ml-2 inline-flex items-center gap-0.5 text-amber-900 underline underline-offset-2 hover:text-amber-950"
          >
            <Plus className="w-3 h-3" />
            Add to approved list
          </button>
        )}
      </div>
    </div>
  );
}

function SuggestionChips({
  values,
  current,
  onPick,
}: {
  values: string[];
  current: string;
  onPick: (v: string) => void;
}) {
  if (values.length === 0) return null;
  // Show the entire approved list so the user can always see what's allowed.
  // Sort by relevance to the current input so close matches surface first.
  const needle = current.toLowerCase();
  const ranked = needle
    ? [...values].sort((a, b) => {
        const ai = a.toLowerCase().indexOf(needle);
        const bi = b.toLowerCase().indexOf(needle);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
    : values;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {ranked.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
            v === current
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
