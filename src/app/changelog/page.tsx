// /changelog — what shipped, when. Public freshness signal for SEO and a
// place to point subscribers at when they ask "what's new?".

import type { Metadata } from "next";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { CHANGELOG } from "@/lib/changelog";

const PATH = "/changelog";
const TITLE = "TinyGTM Changelog — What's new across the toolkit";
const DESCRIPTION =
  "Every shipped tool, feature, and improvement to the TinyGTM marketing toolkit. Most recent first.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: absoluteUrl(SITE.ogImage), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [absoluteUrl(SITE.ogImage)],
  },
};

const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  Tool: { bg: "#fde6dc", fg: "#9c3d12" },
  Feature: { bg: "#dbeafe", fg: "#1e40af" },
  Infrastructure: { bg: "#e0f2fe", fg: "#075985" },
  Polish: { bg: "#dcfce7", fg: "#166534" },
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "TinyGTM Changelog",
    url: absoluteUrl(PATH),
    description: DESCRIPTION,
    blogPost: CHANGELOG.map((entry) => ({
      "@type": "BlogPosting",
      datePublished: entry.date,
      headline: entry.title,
      url: absoluteUrl(PATH) + `#${entry.date}-${entry.title.toLowerCase().replace(/\s+/g, "-")}`,
    })),
  };

  return (
    <>
      <JsonLd data={blogLd} />
      <LandingTopNav />

      <section className="lp-hero" style={{ padding: "72px 0 48px" }}>
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">Changelog</div>
            <h1 style={{ fontSize: 44 }}>What&apos;s new.</h1>
            <p className="lede">
              Every shipped tool, feature, and improvement. Most recent first. New here?{" "}
              <a
                href="#subscribe"
                style={{ color: "var(--coral)", textDecoration: "underline" }}
              >
                Subscribe
              </a>{" "}
              to get an email when something ships.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ paddingTop: 16 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {CHANGELOG.map((entry) => {
              const slug = `${entry.date}-${entry.title.toLowerCase().replace(/\s+/g, "-")}`;
              const tag = TAG_COLORS[entry.tag] ?? TAG_COLORS.Polish;
              return (
                <li
                  key={slug}
                  id={slug}
                  style={{
                    borderTop: "1px solid var(--border-default)",
                    padding: "32px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <time
                      dateTime={entry.date}
                      style={{
                        fontFamily: "var(--ff-mono)",
                        fontSize: 12.5,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {formatDate(entry.date)}
                    </time>
                    <span
                      style={{
                        fontFamily: "var(--ff-mono)",
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: tag.bg,
                        color: tag.fg,
                      }}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--ff-display)",
                      fontSize: 24,
                      fontWeight: 600,
                      letterSpacing: "-0.018em",
                      margin: "0 0 12px",
                    }}
                  >
                    {entry.title}
                  </h2>
                  <ul style={{ paddingLeft: 20, lineHeight: 1.65, color: "var(--text-secondary)" }}>
                    {entry.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div id="subscribe" />
      <LandingFooter />
    </>
  );
}
