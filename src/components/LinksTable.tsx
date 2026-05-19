"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, ExternalLink, Search, Clipboard } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

// Locale-independent date format so SSR and client agree. Uses UTC so it
// doesn't drift by the user's timezone either.
function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type LinkRow = {
  id: string;
  destination_url: string;
  generated_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_id: string | null;
  utm_term: string | null;
  utm_content: string | null;
  notes: string | null;
  created_at: string;
  campaign_display_name?: string | null;
};

export function LinksTable({
  links,
  showCampaignColumn = false,
}: {
  links: LinkRow[];
  showCampaignColumn?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return links;
    return links.filter((l) =>
      [
        l.destination_url,
        l.generated_url,
        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        l.utm_id,
        l.utm_term,
        l.utm_content,
        l.notes,
        l.campaign_display_name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle)),
    );
  }, [links, q]);

  async function copyOne(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied.");
  }

  async function copyAllAsTsv() {
    const headers = [
      "created_at",
      "destination_url",
      "generated_url",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_id",
      "utm_term",
      "utm_content",
      "notes",
    ];
    const rows = filtered.map((l) =>
      [
        l.created_at,
        l.destination_url,
        l.generated_url,
        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        l.utm_id ?? "",
        l.utm_term ?? "",
        l.utm_content ?? "",
        l.notes ?? "",
      ].join("\t"),
    );
    const tsv = [headers.join("\t"), ...rows].join("\n");
    await navigator.clipboard.writeText(tsv);
    toast.success(`Copied ${filtered.length} row${filtered.length === 1 ? "" : "s"} as TSV.`, {
      description: "Paste into Google Sheets or Excel.",
    });
  }

  async function deleteOne(id: string) {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    const res = await fetch(`/api/utm/links/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Couldn't delete link.");
      return;
    }
    toast.success("Link deleted.");
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by URL, source, medium, content…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <button
          onClick={copyAllAsTsv}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md px-2.5 py-1.5"
        >
          <Clipboard className="w-3.5 h-3.5" />
          Copy all as TSV
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-200">
              <th className="py-2 pr-3 font-medium">Generated URL</th>
              {showCampaignColumn && <th className="py-2 pr-3 font-medium">Campaign</th>}
              <th className="py-2 pr-3 font-medium">Source</th>
              <th className="py-2 pr-3 font-medium">Medium</th>
              <th className="py-2 pr-3 font-medium">Content</th>
              <th className="py-2 pr-3 font-medium">Created</th>
              <th className="py-2 pr-0 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-zinc-100 hover:bg-zinc-50 align-top">
                <td className="py-2.5 pr-3 max-w-[420px]">
                  <div className="font-mono text-xs text-zinc-900 truncate" title={l.generated_url}>
                    {l.generated_url}
                  </div>
                  <div className="text-xs text-zinc-500 truncate mt-0.5">{l.destination_url}</div>
                </td>
                {showCampaignColumn && (
                  <td className="py-2.5 pr-3 text-xs text-zinc-600 max-w-[140px] truncate">
                    {l.campaign_display_name ? (
                      l.campaign_display_name
                    ) : (
                      <span className="text-zinc-400 italic">one-off</span>
                    )}
                  </td>
                )}
                <td className="py-2.5 pr-3">
                  <Badge tone="neutral">{l.utm_source}</Badge>
                </td>
                <td className="py-2.5 pr-3">
                  <Badge tone="neutral">{l.utm_medium}</Badge>
                </td>
                <td className="py-2.5 pr-3 text-xs text-zinc-600 max-w-[180px] truncate">
                  {l.utm_content || <span className="text-zinc-400">—</span>}
                </td>
                <td className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap">
                  {formatDate(l.created_at)}
                </td>
                <td className="py-2.5 pr-0">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => copyOne(l.generated_url)}
                      title="Copy link"
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={l.generated_url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open"
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteOne(l.id)}
                      title="Delete"
                      className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={showCampaignColumn ? 7 : 6} className="py-8 text-center text-sm text-zinc-500">
                  No links match &quot;{q}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
