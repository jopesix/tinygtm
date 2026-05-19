// Home = the link builder itself, per the PRD: "users do not need to sign up
// to generate. They only need to sign up or sign in to save and sync."

import { UtmTopNav as TopNav } from "@/components/UtmTopNav";
import { LinkBuilder, type Campaign } from "@/components/LinkBuilder";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RULES, type NamingRules } from "@/lib/utm/normalize";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign: campaignParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rules: NamingRules = DEFAULT_RULES;
  let campaigns: Campaign[] = [];

  if (user) {
    const [{ data: rulesRow }, { data: campaignRows }] = await Promise.all([
      supabase
        .from("naming_rules")
        .select("force_lowercase, separator, allowed_sources, allowed_mediums")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("campaigns")
        .select("id, display_name, utm_campaign, utm_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    if (rulesRow) rules = rulesRow as NamingRules;
    if (campaignRows) campaigns = campaignRows as Campaign[];
  }

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">
              Build a tracking link
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Campaign-first UTM builder. Generate, standardize, and store every link in one
              place — no more spreadsheet drift.
            </p>
          </div>

          <LinkBuilder
            isAuthed={!!user}
            rules={rules}
            campaigns={campaigns}
            initialCampaignId={campaignParam ?? null}
          />
        </div>
      </main>
    </>
  );
}
