// GET /api/indexnow
// Pings the IndexNow protocol with every URL in our sitemap so Bing, Yandex,
// Naver, Seznam, and other IndexNow-supporting search engines learn about
// content changes within seconds instead of the next crawl cycle.
//
// Called by a Vercel cron daily (configured in vercel.json) and can also be
// called manually after any deploy or significant content change.
//
// Security: when CRON_SECRET is set, requires Authorization: Bearer <secret>.
// Vercel Cron sets this header automatically. Manual calls need to include it.

import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/lib/site";
import { UTM_CHANNELS } from "@/lib/utm-channels";
import { CAMPAIGN_TYPES } from "@/lib/campaign-types";
import { FAQ_USE_CASES } from "@/lib/faq-use-cases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The IndexNow key. Must match the filename of the key file under public/.
const INDEXNOW_KEY = "9b4c2e5d8a1f3g6h7i0j4k7l1m4n8o2p";
const INDEXNOW_KEY_LOCATION = `${SITE.url}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

function buildUrlList(): string[] {
  const core = [
    "/",
    "/utm-link-builder",
    "/campaign-planner",
    "/faq-generator",
    "/about",
    "/changelog",
  ];
  const channels = UTM_CHANNELS.map((c) => `/utm-link-builder/${c.slug}`);
  const campaigns = CAMPAIGN_TYPES.map((c) => `/campaign-planner/${c.slug}`);
  const useCases = FAQ_USE_CASES.map((c) => `/faq-generator/${c.slug}`);
  return [...core, ...channels, ...campaigns, ...useCases].map((p) => `${SITE.url}${p}`);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth: Vercel Cron sends Authorization: Bearer ${CRON_SECRET}.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const urlList = buildUrlList();

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE.url).host,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList,
      }),
    });

    // IndexNow returns 200 (success) or 202 (accepted but key still validating).
    // 422 means duplicate request within rate limit.
    return NextResponse.json({
      ok: res.ok || res.status === 202,
      indexnow_status: res.status,
      urls_pinged: urlList.length,
      key_location: INDEXNOW_KEY_LOCATION,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "indexnow_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
