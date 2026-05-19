// TinyGTM landing — minimal text-only design (handoff 2026-05-19).
// Top bar (brand + Tools dropdown + live pill) → centered hero → tools list →
// footer with email capture + Peace Itimi credit. No SVG art.
//
// Tool tiles + dropdown link to /<tool>-landing pages for SEO funnel; in-app
// nav links elsewhere go direct to the builder.

import Link from "next/link";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { TOOLS } from "@/lib/tools";
import { SITE, absoluteUrl } from "@/lib/site";

export default function HomePage() {
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: {
      "@type": "Person",
      name: SITE.author,
      url: SITE.authorUrl,
    },
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/opengraph-image"),
    founder: { "@type": "Person", name: SITE.author, url: SITE.authorUrl },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TinyGTM tools",
    itemListElement: TOOLS.filter((t) => t.status === "live" && t.landingHref).map(
      (t, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: absoluteUrl(t.landingHref!),
        name: t.name,
      }),
    ),
  };

  return (
    <>
      <JsonLd data={[websiteLd, orgLd, itemListLd]} />
      <LandingTopNav />

      <section className="hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">Free toolkit for repetitive GTM work</div>
            <h1>
              Tiny tools for the marketing work{" "}
              <span className="accent">you repeat weekly.</span>
            </h1>
            <p className="lede">
              TinyGTM turns product context, campaign notes, customer insights, and growth goals
              into structured marketing assets your team can copy, edit, export, and reuse — from
              tracking links and campaign plans to FAQs and growth experiments.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#tools">
                Browse the tools
              </a>
            </div>
            <div className="hero-meta">
              <span>Free</span>
              <span className="dot" />
              <span>No sign-up</span>
              <span className="dot" />
              <span>Built for solo founders &amp; small GTM teams</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tools" id="tools">
        <div className="wrap">
          <div className="tools-head">
            <div className="eyebrow">The tools</div>
            <h2>Pick the one that solves today&apos;s annoying task.</h2>
          </div>

          <div className="tool-list">
            {TOOLS.map((t) => {
              const isLive = t.status === "live" && Boolean(t.landingHref);

              const inner = (
                <>
                  <span className="tool-num">{t.number}</span>
                  <div className="tool-content">
                    <h3 className="tool-name">{t.name}</h3>
                    <p className="tool-desc">{t.longDesc}</p>
                  </div>
                  <div className="tool-right">
                    {isLive ? (
                      <>
                        <span className="tool-tag">{t.tag}</span>
                        <span className="tool-arrow" aria-hidden="true">→</span>
                      </>
                    ) : (
                      <>
                        <span className="tool-tag">{t.tag}</span>
                        <span className="tool-soon">Soon</span>
                      </>
                    )}
                  </div>
                </>
              );

              return isLive && t.landingHref ? (
                <Link
                  key={t.slug}
                  className="tool"
                  href={t.landingHref}
                  aria-label={`Learn more about TinyGTM ${t.shortName}`}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={t.slug}
                  className="tool is-soon"
                  aria-label={`${t.shortName} — coming soon`}
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
