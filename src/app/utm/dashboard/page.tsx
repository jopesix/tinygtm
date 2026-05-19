import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Link2, FolderOpen, ArrowRight, Download } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { UtmTopNav as TopNav } from "@/components/UtmTopNav";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LinksTable, type LinkRow } from "@/components/LinksTable";

type LinkWithCampaign = {
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
  campaigns: { display_name: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: campaigns }, { data: linksData }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, display_name, utm_campaign, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("links")
      .select(
        "id, destination_url, generated_url, utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content, notes, created_at, campaigns(display_name)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const campaignCount = campaigns?.length ?? 0;
  const links: LinkRow[] = ((linksData ?? []) as unknown as LinkWithCampaign[]).map((l) => ({
    id: l.id,
    destination_url: l.destination_url,
    generated_url: l.generated_url,
    utm_source: l.utm_source,
    utm_medium: l.utm_medium,
    utm_campaign: l.utm_campaign,
    utm_id: l.utm_id,
    utm_term: l.utm_term,
    utm_content: l.utm_content,
    notes: l.notes,
    created_at: l.created_at,
    campaign_display_name: l.campaigns?.display_name ?? null,
  }));

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink tracking-tight">Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {campaignCount} campaign{campaignCount === 1 ? "" : "s"} · {links.length} saved
                link{links.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="flex-1 sm:flex-initial">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Link2 className="w-4 h-4" />
                  Build a link
                </Button>
              </Link>
              <Link href="/utm/campaigns/new" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  New campaign
                </Button>
              </Link>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campaigns</CardTitle>
                <FolderOpen className="w-4 h-4 text-zinc-400" />
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {campaigns && campaigns.length > 0 ? (
                <ul className="divide-y divide-zinc-100">
                  {campaigns.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/utm/campaigns/${c.id}`}
                        className="flex items-center justify-between py-3 hover:bg-zinc-50 -mx-2 px-2 rounded-md"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-900 truncate">
                            {c.display_name}
                          </div>
                          <div className="text-xs font-mono text-zinc-500 truncate">
                            {c.utm_campaign}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {c.status === "archived" && <Badge tone="neutral">archived</Badge>}
                          <ArrowRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No campaigns yet"
                  description="Campaigns group your links and keep utm_campaign consistent."
                  cta={{ label: "Create campaign", href: "/utm/campaigns/new" }}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All links ({links.length})</CardTitle>
                {links.length > 0 && (
                  <a
                    href="/api/utm/export/csv"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md px-2.5 py-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </a>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {links.length > 0 ? (
                <LinksTable links={links} showCampaignColumn />
              ) : (
                <EmptyState
                  title="No saved links yet"
                  description="Build a link on the home page and click Save."
                  cta={{ label: "Build a link", href: "/" }}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </>
  );
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-8">
      <div className="text-sm font-medium text-zinc-900">{title}</div>
      <div className="text-xs text-zinc-500 mt-1">{description}</div>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-zinc-900 hover:underline"
      >
        {cta.label}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
