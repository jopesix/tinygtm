// /generate — Milestone 3 results page.
// Two entry paths:
//   - /faq/generate?session=<uuid>  → signed-in. Server-fetches the session + faqs +
//     missing_context from Supabase (RLS-scoped), passes them as initial props.
//   - /generate                  → anonymous. Renders the result client-side from
//     sessionStorage stashed by /new.

import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/server";
import { GenerateResult, type InitialSessionData } from "./GenerateResult";

type SearchParams = Promise<{ session?: string }>;

export default async function GenerateResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session: sessionId } = await searchParams;

  let initial: InitialSessionData | null = null;

  if (sessionId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Signed-in URL but no session — bounce to login, preserving the target.
      redirect(`/login?next=${encodeURIComponent(`/faq/generate?session=${sessionId}`)}`);
    }

    const { data: session } = await supabase
      .from("generation_session")
      .select(
        "id, product_description, product_url, target_audience, key_problem, persona, ai_model, ai_input_tokens, ai_output_tokens, ai_cost_cents",
      )
      .eq("id", sessionId)
      .single();

    if (session) {
      const [{ data: faqs }, { data: gaps }] = await Promise.all([
        supabase
          .from("faq_item")
          .select(
            "id, category, question, answer, confidence, source_basis, assumption_flag, suggested_use, sort_order",
          )
          .eq("session_id", sessionId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("missing_context_item")
          .select("id, gap_type, description, suggested_fix, severity")
          .eq("session_id", sessionId)
          .order("severity", { ascending: false }),
      ]);

      initial = {
        source: "server",
        session_id: session.id as string,
        inputs: {
          product_description: session.product_description as string,
          product_url: (session.product_url as string | null) ?? null,
          target_audience: session.target_audience as string,
          key_problem: session.key_problem as string,
          persona: session.persona as string,
          resource_type: null,
          resource_text: null,
        },
        faqs: (faqs ?? []).map((row) => ({
          id: row.id as string,
          category: row.category as string,
          question: row.question as string,
          answer: row.answer as string,
          confidence: (row.confidence as "low" | "medium" | "high") ?? "medium",
          source_basis: (row.source_basis as string | null) ?? "",
          assumption_flag: Boolean(row.assumption_flag),
          suggested_use: (row.suggested_use as string | null) ?? "",
        })),
        missing_context: (gaps ?? []).map((row) => ({
          id: row.id as string,
          gap_type: row.gap_type as string,
          description: row.description as string,
          suggested_fix: (row.suggested_fix as string | null) ?? "",
          severity: (row.severity as "low" | "medium" | "high") ?? "medium",
        })),
        usage: {
          model: (session.ai_model as string | null) ?? "",
          input_tokens: (session.ai_input_tokens as number | null) ?? 0,
          output_tokens: (session.ai_output_tokens as number | null) ?? 0,
          cost_cents: (session.ai_cost_cents as number | null) ?? 0,
        },
      };
    }
  }

  return (
    <>
      <TopNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <GenerateResult initial={initial} />
        </div>
      </main>
    </>
  );
}
