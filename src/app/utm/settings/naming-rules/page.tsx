import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UtmTopNav as TopNav } from "@/components/UtmTopNav";
import { NamingRulesForm } from "./NamingRulesForm";
import { DEFAULT_RULES, type NamingRules } from "@/lib/utm/normalize";

export default async function NamingRulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/naming-rules");

  const { data } = await supabase
    .from("naming_rules")
    .select("force_lowercase, separator, allowed_sources, allowed_mediums")
    .eq("user_id", user.id)
    .maybeSingle();

  const rules: NamingRules = (data as NamingRules | null) ?? DEFAULT_RULES;

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">
            Naming rules
          </h1>
          <p className="text-sm text-zinc-500 mb-6">
            These rules apply to every link you build. Sources and mediums outside the approved
            list trigger a warning — they don&apos;t block saving.
          </p>
          <NamingRulesForm initialRules={rules} />
        </div>
      </main>
    </>
  );
}
