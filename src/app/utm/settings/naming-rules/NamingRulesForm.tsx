"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { normalizeToken, type NamingRules } from "@/lib/utm/normalize";

export function NamingRulesForm({ initialRules }: { initialRules: NamingRules }) {
  const [pending, startTransition] = useTransition();
  const [rules, setRules] = useState<NamingRules>(initialRules);
  const [newSource, setNewSource] = useState("");
  const [newMedium, setNewMedium] = useState("");

  function addSource() {
    const v = normalizeToken(newSource, rules);
    if (!v) return;
    if (rules.allowed_sources.includes(v)) {
      toast.error(`"${v}" is already in the list.`);
      return;
    }
    setRules((r) => ({ ...r, allowed_sources: [...r.allowed_sources, v] }));
    setNewSource("");
  }

  function addMedium() {
    const v = normalizeToken(newMedium, rules);
    if (!v) return;
    if (rules.allowed_mediums.includes(v)) {
      toast.error(`"${v}" is already in the list.`);
      return;
    }
    setRules((r) => ({ ...r, allowed_mediums: [...r.allowed_mediums, v] }));
    setNewMedium("");
  }

  function removeSource(v: string) {
    setRules((r) => ({ ...r, allowed_sources: r.allowed_sources.filter((s) => s !== v) }));
  }

  function removeMedium(v: string) {
    setRules((r) => ({ ...r, allowed_mediums: r.allowed_mediums.filter((m) => m !== v) }));
  }

  function save() {
    startTransition(async () => {
      const res = await fetch("/api/utm/naming-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Couldn't save rules.");
        return;
      }
      toast.success("Naming rules saved.");
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <Section title="Format">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={rules.force_lowercase}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, force_lowercase: e.target.checked }))
                  }
                  className="rounded border-zinc-300"
                />
                Force lowercase
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <span>Separator</span>
                <select
                  value={rules.separator}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, separator: e.target.value as "_" | "-" }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="_">Underscore (_)</option>
                  <option value="-">Hyphen (-)</option>
                </select>
              </label>
            </div>
          </Section>

          <Section
            title="Approved sources"
            description='Values like "linkedin", "google", "newsletter". The builder will warn if a source is off this list.'
          >
            <div className="flex flex-wrap gap-1.5 mb-3">
              {rules.allowed_sources.map((s) => (
                <button
                  key={s}
                  onClick={() => removeSource(s)}
                  className="group inline-flex"
                  title="Remove"
                >
                  <Badge tone="neutral" className="group-hover:bg-red-50 group-hover:text-red-700 group-hover:border-red-200">
                    {s}
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSource();
                  }
                }}
                placeholder="add a source (e.g. youtube)"
              />
              <Button variant="secondary" onClick={addSource} disabled={!newSource}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </Section>

          <Section
            title="Approved mediums"
            description='Values like "cpc", "paid_social", "email". Same warning behavior as sources.'
          >
            <div className="flex flex-wrap gap-1.5 mb-3">
              {rules.allowed_mediums.map((m) => (
                <button
                  key={m}
                  onClick={() => removeMedium(m)}
                  className="group inline-flex"
                  title="Remove"
                >
                  <Badge tone="neutral" className="group-hover:bg-red-50 group-hover:text-red-700 group-hover:border-red-200">
                    {m}
                    <X className="w-3 h-3" />
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMedium}
                onChange={(e) => setNewMedium(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMedium();
                  }
                }}
                placeholder="add a medium (e.g. webinar)"
              />
              <Button variant="secondary" onClick={addMedium} disabled={!newMedium}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </Section>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save rules
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-zinc-900">{title}</div>
      {description && <div className="text-xs text-zinc-500 mt-0.5 mb-3">{description}</div>}
      {!description && <div className="mt-2" />}
      {children}
    </div>
  );
}
