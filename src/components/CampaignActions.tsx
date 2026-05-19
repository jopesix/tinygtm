"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

export function CampaignActions({
  campaignId,
  isArchived,
}: {
  campaignId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleArchive() {
    startTransition(async () => {
      const res = await fetch(`/api/utm/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isArchived ? "active" : "archived" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Couldn't update campaign.");
        return;
      }
      toast.success(isArchived ? "Campaign restored." : "Campaign archived.");
      router.refresh();
    });
  }

  function deleteCampaign() {
    if (
      !confirm(
        "Delete this campaign? Saved links will be kept but unlinked. This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      const res = await fetch(`/api/utm/campaigns/${campaignId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Couldn't delete campaign.");
        return;
      }
      toast.success("Campaign deleted.");
      router.push("/utm/dashboard");
    });
  }

  return (
    <>
      <Button variant="secondary" onClick={toggleArchive} disabled={pending}>
        {isArchived ? (
          <>
            <ArchiveRestore className="w-4 h-4" />
            Restore
          </>
        ) : (
          <>
            <Archive className="w-4 h-4" />
            Archive
          </>
        )}
      </Button>
      <Button variant="ghost" onClick={deleteCampaign} disabled={pending}>
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </>
  );
}
