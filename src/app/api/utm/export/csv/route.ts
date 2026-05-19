// CSV export of the user's saved links. Optionally filtered by ?campaign_id=.

import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaign_id");

  let query = supabase
    .from("links")
    .select(
      "created_at, destination_url, generated_url, utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content, notes, campaigns(display_name)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const headers = [
    "created_at",
    "campaign",
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
  const rows = (data ?? []).map((r) => {
    const campaignName = (r as unknown as { campaigns: { display_name: string } | null }).campaigns
      ?.display_name;
    return [
      r.created_at,
      campaignName ?? "",
      r.destination_url,
      r.generated_url,
      r.utm_source,
      r.utm_medium,
      r.utm_campaign,
      r.utm_id ?? "",
      r.utm_term ?? "",
      r.utm_content ?? "",
      r.notes ?? "",
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const filename = campaignId ? `utm-links-${campaignId}.csv` : "utm-links.csv";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
