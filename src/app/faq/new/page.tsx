// /new — the intake form. Milestone 1 UI shell.
// Signed-in users see the profile picker + "save as profile" checkbox.
// Anonymous users see the same form without those affordances.

import { TopNav } from "@/components/TopNav";
import { NewSessionForm, type ProductProfile } from "./NewSessionForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profiles: ProductProfile[] = [];
  if (user) {
    const { data } = await supabase
      .from("product_profile")
      .select("id, name, description, url, target_audience, key_problem")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) profiles = data as ProductProfile[];
  }

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">
              New FAQ session
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Tell us about your product. The more context you provide, the more
              grounded the FAQs will be.
            </p>
          </div>

          <NewSessionForm isAuthed={!!user} profiles={profiles} />
        </div>
      </main>
    </>
  );
}
