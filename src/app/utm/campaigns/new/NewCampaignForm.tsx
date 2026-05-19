"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeToken, DEFAULT_RULES } from "@/lib/utm/normalize";

export function NewCampaignForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  // `manualSlug === null` means "auto-derive from displayName".
  const [manualSlug, setManualSlug] = useState<string | null>(null);
  const [utmId, setUtmId] = useState("");
  const [description, setDescription] = useState("");

  const slug = manualSlug ?? normalizeToken(displayName, DEFAULT_RULES);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !slug.trim()) {
      toast.error("Display name and slug are required.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/utm/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          utm_campaign: slug,
          utm_id: utmId || null,
          description: description || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Couldn't create campaign.");
        return;
      }
      toast.success("Campaign created.");
      router.push(`/utm/campaigns/${data.campaign.id}`);
    });
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Display name" required>
            <Input
              placeholder="UK Fintech Founders Retargeting"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>

          <Field
            label="Canonical utm_campaign slug"
            required
            hint="This exact value will be reused on every link in this campaign."
          >
            <Input
              placeholder="uk_fintech_founders_retargeting"
              value={slug}
              onChange={(e) => setManualSlug(e.target.value)}
            />
          </Field>

          <Field label="Campaign ID (utm_id)" hint="Optional. Often used to match ad-platform IDs.">
            <Input value={utmId} onChange={(e) => setUtmId(e.target.value)} />
          </Field>

          <Field label="Description" hint="Optional. Visible only to you.">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create campaign
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
