import { redirect } from "next/navigation";
import { CampaignTopNav } from "@/components/CampaignTopNav";
import { CampaignWizard } from "./CampaignWizard";
import { createClient } from "@/lib/supabase/server";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/campaign/new");
  }

  return (
    <>
      <CampaignTopNav />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">
              New campaign plan
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Paste your campaign context. We&apos;ll classify it, then turn it into an
              executable launch plan with operational gap flags.
            </p>
          </div>
          <CampaignWizard />
        </div>
      </main>
    </>
  );
}
