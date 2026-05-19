import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UtmTopNav as TopNav } from "@/components/UtmTopNav";
import { NewCampaignForm } from "./NewCampaignForm";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/campaigns/new");

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">
            New campaign
          </h1>
          <p className="text-sm text-zinc-500 mb-6">
            A campaign holds your canonical <code>utm_campaign</code> slug and any defaults you
            want to reuse across links.
          </p>
          <NewCampaignForm />
        </div>
      </main>
    </>
  );
}
