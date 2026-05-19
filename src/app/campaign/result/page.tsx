// /campaign/result — anonymous flow view. Reads the last plan from
// sessionStorage and renders it via the same PlanView the signed-in
// /campaign/[id] page uses. PlanSeed.id is null so PlanView skips persistence.

import { CampaignTopNav } from "@/components/CampaignTopNav";
import { CampaignResultClient } from "./CampaignResultClient";

export default function CampaignResultPage() {
  return (
    <>
      <CampaignTopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <CampaignResultClient />
        </div>
      </main>
    </>
  );
}
