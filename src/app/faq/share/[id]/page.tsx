// /faq/share/[id] — public view-only render of a saved FAQ session.
// Anyone with the URL can view. Service-role bypasses RLS.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { FAQ_CATEGORIES, getCategoryLabel } from "@/lib/faq-categories";
import { getGapTypeLabel } from "@/lib/missing-context-types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Promise<{ id: string }>;

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

export default async function FaqSharePage({ params }: { params: Params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = createAdminClient();

  const [{ data: session }, { data: faqs }, { data: gaps }] = await Promise.all([
    supabase
      .from("generation_session")
      .select("id, product_description, target_audience, persona")
      .eq("id", id)
      .single(),
    supabase
      .from("faq_item")
      .select("id, category, question, answer, sort_order")
      .eq("session_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("missing_context_item")
      .select("id, gap_type, description, suggested_fix, severity")
      .eq("session_id", id)
      .order("severity", { ascending: false }),
  ]);

  if (!session) notFound();

  // Group FAQs by category in canonical order.
  type Row = {
    id: string;
    category: string;
    question: string;
    answer: string;
    sort_order: number;
  };
  const rows = (faqs ?? []) as unknown as Row[];
  const byCategory = new Map<string, Row[]>();
  for (const faq of rows) {
    const arr = byCategory.get(faq.category) ?? [];
    arr.push(faq);
    byCategory.set(faq.category, arr);
  }
  const grouped: { category: string; rows: Row[] }[] = [];
  for (const c of FAQ_CATEGORIES) {
    const r = byCategory.get(c.key);
    if (r) grouped.push({ category: c.key, rows: r });
  }
  for (const [key, r] of byCategory.entries()) {
    if (!FAQ_CATEGORIES.find((c) => c.key === key)) grouped.push({ category: key, rows: r });
  }

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="TinyGTM home">
            <div className="h-7 w-7 bg-brand rounded-md" />
            <span className="font-semibold text-ink">
              Tiny<span className="text-zinc-400 font-normal">GTM</span>
              <span className="text-zinc-400 font-normal"> · Shared FAQ</span>
            </span>
          </Link>
          <Link
            href="/faq/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover px-3 py-1.5 rounded-md"
          >
            Make your own
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <section className="space-y-6 min-w-0">
              <header>
                <h1 className="text-2xl font-semibold text-ink tracking-tight">FAQ</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  {rows.length} FAQ{rows.length === 1 ? "" : "s"} · for{" "}
                  {(session.target_audience as string) || (session.persona as string)}
                </p>
              </header>

              {grouped.map((group) => (
                <section key={group.category} className="space-y-3">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {getCategoryLabel(group.category)}
                  </h2>
                  <div className="space-y-3">
                    {group.rows.map((faq) => (
                      <Card key={faq.id}>
                        <CardBody className="space-y-2">
                          <h3 className="text-base font-medium text-ink">{faq.question}</h3>
                          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{faq.answer}</p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}

              <footer className="pt-6 border-t border-zinc-200 text-xs text-zinc-500">
                Generated with{" "}
                <Link href="/faq/new" className="underline hover:text-zinc-700">
                  TinyGTM FAQ Generator
                </Link>
              </footer>
            </section>

            <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              {(gaps ?? []).length > 0 && (
                <>
                  <div>
                    <h2 className="text-sm font-medium text-ink">
                      Missing context ({(gaps ?? []).length})
                    </h2>
                  </div>
                  {((gaps ?? []) as unknown as { id: string; gap_type: string; description: string; suggested_fix: string | null; severity: string }[]).map((g) => (
                    <Card key={g.id}>
                      <CardBody className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">
                            {getGapTypeLabel(g.gap_type)}
                          </div>
                          <span
                            className={
                              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border " +
                              (SEVERITY_STYLES[g.severity] ?? "")
                            }
                          >
                            {g.severity}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-700">{g.description}</p>
                        {g.suggested_fix && (
                          <p className="text-xs text-zinc-500 italic">Hint: {g.suggested_fix}</p>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
