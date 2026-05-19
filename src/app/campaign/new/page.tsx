import { CampaignTopNav } from "@/components/CampaignTopNav";
import { CampaignWizard } from "./CampaignWizard";

// Open to anonymous — anyone can generate a plan. Sign-in is only required for
// saving/editing/sharing (handled inside the wizard + plan view).
export default function NewCampaignPage() {
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
