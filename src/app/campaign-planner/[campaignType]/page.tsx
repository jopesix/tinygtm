// Programmatic SEO: per-campaign-type landing pages.
// One indexable page per entry in src/lib/campaign-types.ts. Each page targets
// search intent like "product launch plan template" or "webinar launch plan"
// and links into the actual /campaign/new wizard.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { CAMPAIGN_TYPES, findCampaignType } from "@/lib/campaign-types";

type RouteParams = { campaignType: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return CAMPAIGN_TYPES.map((c) => ({ campaignType: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { campaignType: slug } = await params;
  const entry = findCampaignType(slug);
  if (!entry) return {};

  const path = `/campaign-planner/${entry.slug}`;
  const title = `${entry.name} (Free)`;
  return {
    title,
    description: entry.metaDescription,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      siteName: SITE.name,
      title,
      description: entry.metaDescription,
      images: [{ url: absoluteUrl(SITE.ogImage), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: entry.metaDescription,
      images: [absoluteUrl(SITE.ogImage)],
    },
  };
}

export default async function CampaignTypePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { campaignType: slug } = await params;
  const entry = findCampaignType(slug);
  if (!entry) notFound();

  const path = `/campaign-planner/${entry.slug}`;

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `TinyGTM ${entry.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: entry.metaDescription,
    url: absoluteUrl(path),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: SITE.author, url: SITE.authorUrl },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map(({ q, a }) => ({
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
        name: "Campaign Planner",
        item: absoluteUrl("/campaign-planner"),
      },
      { "@type": "ListItem", position: 3, name: entry.shortName, item: absoluteUrl(path) },
    ],
  };

  const otherTypes = CAMPAIGN_TYPES.filter((c) => c.slug !== entry.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">Campaign Planner · {entry.shortName}</div>
            <h1>
              {entry.name}{" "}
              <span className="accent">in 30 seconds.</span>
            </h1>
            <p className="lede">{entry.whyItMatters}</p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/campaign/new">
                Generate a {entry.shortName} plan
              </Link>
            </div>
            <div className="lp-hero-meta">
              <span>Free to try</span>
              <span className="dot" />
              <span>No sign-up needed</span>
              <span className="dot" />
              <span>Editable, exportable, shareable</span>
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
            What a {entry.shortName.toLowerCase()} plan looks like
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{entry.whatThePlanLooksLike}</p>
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
            Phase by phase
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
            {(
              [
                { label: "Pre-launch", body: entry.phases.preLaunch },
                { label: "Launch day", body: entry.phases.launchDay },
                { label: "Post-launch", body: entry.phases.postLaunch },
              ] as const
            ).map((phase) => (
              <div
                key={phase.label}
                style={{
                  padding: "20px 22px",
                  border: "1px solid var(--border-default)",
                  borderRadius: 12,
                  background: "var(--bg-canvas)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--coral)",
                    marginBottom: 8,
                  }}
                >
                  {phase.label}
                </div>
                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {phase.body}
                </p>
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
            Common operational gaps
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Things teams routinely miss when they plan a {entry.shortName.toLowerCase()} without a
            structured checklist. The TinyGTM plan flags these as gaps.
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {entry.commonGaps.map((g, i) => (
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
            <h2>About {entry.shortName.toLowerCase()} plans</h2>
          </div>
          <div className="lp-faq">
            {entry.faqs.map(({ q, a }) => (
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
            <div className="eyebrow">Other campaign types</div>
            <h2>Plan generators for other campaign types</h2>
          </div>
          <div className="lp-pair">
            {otherTypes.map((c) => (
              <Link key={c.slug} href={`/campaign-planner/${c.slug}`} className="lp-pair-card">
                <span className="lp-pair-num">→</span>
                <span className="lp-pair-text">
                  <span className="lp-pair-name">{c.name}</span>
                  <span className="lp-pair-tag">{c.searchPhrase}</span>
                </span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/campaign-planner"
              style={{
                color: "var(--coral)",
                textDecoration: "underline",
                fontSize: 14,
              }}
            >
              ← Back to all Campaign Planner features
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Generate your {entry.shortName.toLowerCase()} plan in 30 seconds.</h2>
            <p>Free to try. No sign-up. Save and edit when you&apos;re ready.</p>
          </div>
          <Link className="btn btn-primary" href="/campaign/new">
            Open the Campaign Planner
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
