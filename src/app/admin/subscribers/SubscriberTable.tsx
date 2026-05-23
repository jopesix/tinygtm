"use client";

import { useMemo, useState } from "react";

export type SubscriberRow = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toCsv(rows: SubscriberRow[]): string {
  const header = ["email", "source", "created_at"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.email, r.source, r.created_at]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  return lines.join("\r\n") + "\r\n";
}

export function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) => r.email.toLowerCase().includes(q) || r.source.toLowerCase().includes(q),
    );
  }, [rows, query]);

  function downloadCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tinygtm-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function copyEmails() {
    const text = filtered.map((r) => r.email).join("\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Filter by email or source"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 max-w-sm h-9 px-3 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <div className="text-xs text-zinc-500">
          {filtered.length} of {rows.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyEmails}
            className="h-9 px-3 text-xs text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50"
          >
            Copy emails
          </button>
          <button
            onClick={downloadCsv}
            className="h-9 px-3 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-hover"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left text-xs uppercase tracking-wide text-zinc-500 font-semibold px-4 py-2">
                Email
              </th>
              <th className="text-left text-xs uppercase tracking-wide text-zinc-500 font-semibold px-4 py-2">
                Source
              </th>
              <th className="text-left text-xs uppercase tracking-wide text-zinc-500 font-semibold px-4 py-2">
                Subscribed
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-2.5 text-ink">{r.email}</td>
                <td className="px-4 py-2.5 text-xs text-zinc-500 font-mono">{r.source}</td>
                <td className="px-4 py-2.5 text-xs text-zinc-500">{formatDate(r.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-sm">
                  No matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
