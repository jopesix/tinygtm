// /dashboard — list of the signed-in user's past FAQ sessions.
// Server-rendered. RLS handles ownership.

import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SessionList, type SessionRow } from "./SessionList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/faq/dashboard")}`);
  }

  // Pull sessions with FAQ counts in one round-trip via the nested-count relation.
  const { data, error } = await supabase
    .from("generation_session")
    .select(
      "id, product_description, target_audience, persona, ai_model, ai_cost_cents, created_at, faq_item(count)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const sessions: SessionRow[] = (data ?? []).map((row) => {
    const counts = (row.faq_item as unknown as { count: number }[] | null) ?? [];
    return {
      id: row.id as string,
      product_description: (row.product_description as string) ?? "",
      target_audience: (row.target_audience as string) ?? "",
      persona: (row.persona as string) ?? "",
      ai_model: (row.ai_model as string | null) ?? "",
      ai_cost_cents: (row.ai_cost_cents as number | null) ?? 0,
      created_at: row.created_at as string,
      faq_count: counts[0]?.count ?? 0,
    };
  });

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-ink tracking-tight">Your sessions</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Every FAQ session you&apos;ve generated. Most recent first.
              </p>
            </div>
            <Link href="/faq/new">
              <Button>New session</Button>
            </Link>
          </header>

          {error && (
            <Card>
              <CardBody>
                <p className="text-sm text-red-600">
                  Couldn&apos;t load your sessions. Try refreshing.
                </p>
              </CardBody>
            </Card>
          )}

          {!error && sessions.length === 0 && (
            <Card>
              <CardBody className="py-12 text-center space-y-3">
                <p className="text-sm text-zinc-700">
                  No sessions yet. Start your first one to populate this list.
                </p>
                <Link href="/faq/new" className="inline-block">
                  <Button>Start a new session</Button>
                </Link>
              </CardBody>
            </Card>
          )}

          {sessions.length > 0 && <SessionList sessions={sessions} />}
        </div>
      </main>
    </>
  );
}
