// Programmatic SEO: per-channel UTM Builder landing pages.
// One indexable page per channel in src/lib/utm-channels.ts. Adding a new
// channel automatically generates a new static page + sitemap entry + cross-
// link on the main /utm-link-builder landing.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { UTM_CHANNELS, findChannel } from "@/lib/utm-channels";

type RouteParams = { channel: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return UTM_CHANNELS.map((c) => ({ channel: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { channel: slug } = await params;
  const channel = findChannel(slug);
  if (!channel) return {};

  const path = `/utm-link-builder/${channel.slug}`;
  const title = `${channel.name} UTM Builder — Free Link Builder for ${channel.shortName}`;
  return {
    title,
    description: channel.metaDescription,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      siteName: SITE.name,
      title,
      description: channel.metaDescription,
      images: [{ url: absoluteUrl(SITE.ogImage), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: channel.metaDescription,
      images: [absoluteUrl(SITE.ogImage)],
    },
  };
}

export default async function ChannelUtmPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { channel: slug } = await params;
  const channel = findChannel(slug);
  if (!channel) notFound();

  const path = `/utm-link-builder/${channel.slug}`;

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `TinyGTM UTM Builder for ${channel.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: channel.metaDescription,
    url: absoluteUrl(path),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: SITE.author, url: SITE.authorUrl },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: channel.faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TinyGTM", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "UTM Link Builder",
        item: absoluteUrl("/utm-link-builder"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${channel.name} UTM Builder`,
        item: absoluteUrl(path),
      },
    ],
  };

  // Other channels for cross-linking — show 4 different ones.
  const otherChannels = UTM_CHANNELS.filter((c) => c.slug !== channel.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">UTM Builder · for {channel.shortName}</div>
            <h1>
              {channel.name} UTM Builder —{" "}
              <span className="accent">clean tracking for every {channel.shortName} link.</span>
            </h1>
            <p className="lede">{channel.whyItMatters}</p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/utm">
                Build a {channel.shortName} UTM
              </Link>
            </div>
            <div className="lp-hero-meta">
              <span>Free forever</span>
              <span className="dot" />
              <span>No sign-up to build</span>
              <span className="dot" />
              <span>Naming rules + duplicate detection</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              marginTop: 0,
            }}
          >
            Recommended UTM convention for {channel.name}
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Pick these defaults and lock them in — every {channel.name} link your team builds will
            stay consistent and roll up cleanly in reports.
          </p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--ff-mono)",
              fontSize: 13.5,
              marginTop: 16,
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <td style={{ padding: "12px 16px", background: "var(--bg-surface)", width: 200 }}>
                  utm_source
                </td>
                <td style={{ padding: "12px 16px", color: "var(--coral)" }}>
                  {channel.recommendedSource}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <td style={{ padding: "12px 16px", background: "var(--bg-surface)" }}>
                  utm_medium
                </td>
                <td style={{ padding: "12px 16px", color: "var(--coral)" }}>
                  {channel.recommendedMedium}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px 16px", background: "var(--bg-surface)" }}>
                  utm_campaign pattern
                </td>
                <td style={{ padding: "12px 16px", color: "var(--coral)" }}>
                  {channel.campaignPattern}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              marginTop: 0,
            }}
          >
            {channel.name} UTM examples
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {channel.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  border: "1px solid var(--border-default)",
                  borderRadius: 10,
                  background: "var(--bg-canvas)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {ex.context}
                </div>
                <code
                  style={{
                    display: "block",
                    fontFamily: "var(--ff-mono)",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                  }}
                >
                  {ex.url}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              marginTop: 0,
            }}
          >
            Common {channel.name} UTM mistakes
          </h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {channel.gotchas.map((g, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>{channel.name} UTM tracking questions</h2>
          </div>
          <div className="lp-faq">
            {channel.faqs.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p className="answer">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">More channels</div>
            <h2>UTM builders for other channels</h2>
          </div>
          <div className="lp-pair">
            {otherChannels.map((c) => (
              <Link
                key={c.slug}
                href={`/utm-link-builder/${c.slug}`}
                className="lp-pair-card"
              >
                <span className="lp-pair-num">→</span>
                <span className="lp-pair-text">
                  <span className="lp-pair-name">{c.name} UTM Builder</span>
                  <span className="lp-pair-tag">{c.searchPhrase}</span>
                </span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/utm-link-builder"
              style={{
                color: "var(--coral)",
                textDecoration: "underline",
                fontSize: 14,
              }}
            >
              ← Back to all UTM Builder features
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Build your first {channel.name} UTM link in 60 seconds.</h2>
            <p>Free to try. No sign-up. Save to a dashboard when you&apos;re ready.</p>
          </div>
          <Link className="btn btn-primary" href="/utm">
            Open the UTM Builder
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
