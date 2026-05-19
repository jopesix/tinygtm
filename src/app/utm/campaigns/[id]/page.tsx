import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus, Link2, Download, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { UtmTopNav as TopNav } from "@/components/UtmTopNav";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinksTable, type LinkRow } from "@/components/LinksTable";
import { CampaignActions } from "@/components/CampaignActions";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!campaign) notFound();

  const { data: links } = await supabase
    .from("links")
    .select(
      "id, destination_url, generated_url, utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content, notes, created_at",
    )
    .eq("user_id", user.id)
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/utm/dashboard"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-ink tracking-tight">
                  {campaign.display_name}
                </h1>
                {campaign.status === "archived" && <Badge tone="neutral">archived</Badge>}
              </div>
              <div className="text-sm font-mono text-zinc-500 mt-1 break-all">
                {campaign.utm_campaign}
              </div>
              {campaign.description && (
                <p className="text-sm text-zinc-600 mt-2 max-w-2xl">{campaign.description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/?campaign=${campaign.id}`}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand text-white text-sm font-medium px-4 h-9 hover:bg-brand-hover flex-1 sm:flex-initial"
              >
                <Plus className="w-4 h-4" />
                New link
              </Link>
              <CampaignActions
                campaignId={campaign.id}
                isArchived={campaign.status === "archived"}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Links ({links?.length ?? 0})
                </CardTitle>
                {links && links.length > 0 && (
                  <a
                    href={`/api/utm/export/csv?campaign_id=${campaign.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md px-2.5 py-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </a>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {links && links.length > 0 ? (
                <LinksTable links={links as LinkRow[]} />
              ) : (
                <div className="text-center py-10">
                  <Link2 className="w-8 h-8 text-zinc-300 mx-auto" />
                  <div className="text-sm font-medium text-zinc-900 mt-3">
                    No links in this campaign yet
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Use the link builder to create the first one.
                  </div>
                  <Link
                    href={`/?campaign=${campaign.id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-zinc-900 hover:underline"
                  >
                    Build a link →
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </>
  );
}
