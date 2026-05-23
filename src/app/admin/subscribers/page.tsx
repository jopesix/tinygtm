// /admin/subscribers — list of email subscribers captured by the landing
// email form. Admin-only, gated by ADMIN_EMAILS env var.
//
// Uses the service-role client to bypass RLS on public.subscribers because
// the table has no SELECT policy for any client role.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { SubscriberTable, type SubscriberRow } from "./SubscriberTable";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/admin/subscribers")}`);
  }
  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscribers")
    .select("id, email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows: SubscriberRow[] = (data ?? []).map((r) => ({
    id: r.id as string,
    email: r.email as string,
    source: (r.source as string | null) ?? "landing",
    created_at: r.created_at as string,
  }));

  return (
    <>
      <LandingTopNav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header>
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Admin
            </div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight mt-1">
              Subscribers
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Email subscribers captured by the landing form. Most recent first. Up to 500 shown.
            </p>
          </header>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
              Couldn&apos;t load subscribers: {error.message}
            </div>
          )}

          {!error && rows.length === 0 && (
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-sm rounded-md p-6 text-center">
              No subscribers yet. The first person who submits the landing form will show up here.
            </div>
          )}

          {rows.length > 0 && <SubscriberTable rows={rows} />}
        </div>
      </main>
    </>
  );
}
