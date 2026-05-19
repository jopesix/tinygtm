// POST /api/extract-url { url }
// Fetches a public URL via Jina Reader and returns clean Markdown for use as
// supporting context. Jina handles JS rendering + content extraction; we cap
// the result at MAX_PASTE so the textarea isn't drowned.
//
// JINA_API_KEY is optional. Without it: ~20 RPM shared free tier. With it:
// significantly higher RPS and longer pages.

import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { MAX_PASTE } from "@/lib/schemas/generate";
import { captureError, track } from "@/lib/observability";

const ExtractRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(8)
    .max(2_000)
    .refine((v) => /^https?:\/\//i.test(v), "Must start with http(s)://"),
});

type JinaResponse = {
  code?: number;
  status?: number;
  data?: {
    title?: string;
    description?: string;
    url?: string;
    content?: string;
    usage?: { tokens?: number };
  };
  message?: string;
};

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let parsed: z.infer<typeof ExtractRequestSchema>;
  try {
    parsed = ExtractRequestSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_input", message: "Enter a valid http(s) URL.", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Block private / loopback hosts at the boundary — Jina would also refuse,
  // but better to reject locally so we don't leak our server's IP-routability.
  try {
    const u = new URL(parsed.url);
    const host = u.hostname;
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return NextResponse.json(
        { error: "invalid_url", message: "Private / loopback hosts aren't allowed." },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "invalid_url", message: "Couldn't parse the URL." }, { status: 400 });
  }

  const startedAt = Date.now();
  const jinaUrl = `https://r.jina.ai/${parsed.url}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Return-Format": "markdown",
  };
  if (process.env.JINA_API_KEY) headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;

  let jina: JinaResponse | null = null;
  try {
    const upstream = await fetch(jinaUrl, {
      method: "GET",
      headers,
      // 25s soft timeout — Vercel's hard cap is 30s on this route.
      signal: AbortSignal.timeout(25_000),
    });
    if (!upstream.ok) {
      captureError(new Error(`jina http ${upstream.status}`), {
        where: "jina.fetch",
        status: upstream.status,
        url: parsed.url,
      });
      return NextResponse.json(
        {
          error: "fetch_failed",
          message:
            upstream.status === 429
              ? "URL fetcher is rate-limited right now. Try again in a few seconds."
              : `Couldn't fetch that URL (HTTP ${upstream.status}). It may be behind auth or bot protection.`,
        },
        { status: 502 },
      );
    }
    jina = (await upstream.json()) as JinaResponse;
  } catch (err) {
    captureError(err, { where: "jina.fetch", url: parsed.url });
    return NextResponse.json(
      {
        error: "fetch_failed",
        message: "URL fetcher timed out or errored. Paste the content manually instead.",
      },
      { status: 502 },
    );
  }

  const content = jina?.data?.content?.trim() ?? "";
  if (!content) {
    return NextResponse.json(
      {
        error: "no_content",
        message:
          "Jina returned an empty page. The URL may be behind auth, JavaScript-only, or blocking bot fetches.",
      },
      { status: 502 },
    );
  }

  const truncated = content.length > MAX_PASTE ? content.slice(0, MAX_PASTE) : content;
  const wasTruncated = content.length > MAX_PASTE;

  track("extract_url_completed", {
    url: parsed.url,
    char_count: truncated.length,
    truncated: wasTruncated,
    duration_ms: Date.now() - startedAt,
  });

  return NextResponse.json({
    title: jina?.data?.title ?? "",
    url: jina?.data?.url ?? parsed.url,
    markdown: truncated,
    char_count: truncated.length,
    truncated: wasTruncated,
  });
}
