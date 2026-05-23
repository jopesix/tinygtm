// SEO landing page for the UTM Link Builder & Tracker tool.
// tinygtm.tools/utm-link-builder → CTA → tinygtm.tools/utm
//
// This is a marketing/SEO page. The actual builder UI lives at /utm.

import type { Metadata } from "next";
import Link from "next/link";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { UTM_CHANNELS } from "@/lib/utm-channels";

const PATH = "/utm-link-builder";
const TITLE = "Free UTM Link Builder & Tracker for Marketers";
const DESCRIPTION =
  "Build, store, and reuse campaign tracking links without breaking your naming conventions. Templates, duplicate detection, and CSV export. Free for solo founders and small GTM teams.";

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

const faqs: Array<{ q: string; a: string }> = [
  {
    q: "What is a UTM link, and why do I need a builder?",
    a: "UTM links are URLs with extra parameters (utm_source, utm_medium, utm_campaign, utm_content, utm_term) that tell your analytics tool where a click came from. A builder enforces consistency — every link follows the same naming convention so your campaign reports stay clean instead of fragmenting across typos like \"Facebook\" vs \"facebook\" vs \"FB\".",
  },
  {
    q: "Is the TinyGTM UTM Builder free?",
    a: "Yes. The builder is free to use without an account. You can build, encode, and copy links anonymously. Sign in if you want to save links to a dashboard and reuse them later.",
  },
  {
    q: "Can I enforce a UTM naming convention?",
    a: "Yes. The builder supports naming rules per parameter (e.g. utm_source must be lowercase, utm_campaign must follow a pattern like Q1-launch-blog). Once your rules are set, the builder validates every link before you copy it.",
  },
  {
    q: "Does it catch duplicate UTM links?",
    a: "Yes. Saved links are deduplicated by the full URL — if you generate the same combination twice, the dashboard surfaces the existing one so you don't end up with three near-identical campaigns in your reports.",
  },
  {
    q: "Can I export my UTM links to a spreadsheet?",
    a: "Yes. Signed-in users can export their entire campaign of saved links to CSV in one click — works straight into Google Sheets, Excel, or any campaign-tracking template.",
  },
  {
    q: "Does TinyGTM track who clicks my links?",
    a: "No. TinyGTM builds the link; the click tracking happens in your own analytics platform (GA4, Mixpanel, PostHog, Amplitude, etc.). We don't proxy or shorten your URLs, so we never see the clicks.",
  },
];

export default function UtmLinkBuilderLanding() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TinyGTM UTM Link Builder & Tracker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: SITE.author, url: SITE.authorUrl },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
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
      { "@type": "ListItem", position: 2, name: "UTM Link Builder", item: absoluteUrl(PATH) },
    ],
  };

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">UTM Link Builder &amp; Tracker</div>
            <h1>
              Build clean campaign links — <span className="accent">without breaking your naming conventions.</span>
            </h1>
            <p className="lede">
              TinyGTM&apos;s UTM Builder validates every link against your naming rules, catches
              duplicates before they fragment your reports, and exports the whole list to CSV when
              your marketing ops asks. Free, no sign-up to try.
            </p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/utm">
                Build a UTM link
              </Link>
            </div>
            <div className="lp-hero-meta">
              <span>Free forever</span>
              <span className="dot" />
              <span>No sign-up to build</span>
              <span className="dot" />
              <span>Sign in to save &amp; export</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">What it does</div>
            <h2>Every campaign URL stays consistent — even the messy ones.</h2>
          </div>
          <div className="lp-features">
            <div className="lp-feature">
              <span className="lp-feature-icon">01</span>
              <h3>Templates &amp; naming rules</h3>
              <p>
                Set per-parameter rules (case, pattern, allowed values). Every link you build is
                validated against them before it&apos;s copied — so &quot;FaceBook&quot; can&apos;t
                sneak in next to &quot;facebook&quot;.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">02</span>
              <h3>Duplicate detection</h3>
              <p>
                Saved links are deduplicated by the full URL. If you&apos;ve already built this
                exact combination, the dashboard surfaces it instead of letting you create a
                phantom twin.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">03</span>
              <h3>CSV export</h3>
              <p>
                Export every saved link to CSV in one click. Drops into Google Sheets, Excel, or
                whatever campaign tracker your team already uses.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">04</span>
              <h3>Reusable campaigns</h3>
              <p>
                Group links by campaign and reuse the structure. Onboarding a new launch is
                copying last quarter&apos;s campaign and editing the destinations.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">05</span>
              <h3>Stays in your stack</h3>
              <p>
                We build the link — your analytics platform (GA4, Mixpanel, PostHog, Amplitude)
                tracks the click. No proxy, no shortening, no third party between you and the
                data.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">06</span>
              <h3>Anonymous-friendly</h3>
              <p>
                Build and copy without signing up. Sign in only when you want the dashboard,
                history, and exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">How it works</div>
            <h2>Three steps from messy to consistent.</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">STEP 01</div>
              <h3>Set your naming rules (once)</h3>
              <p>
                Define how utm_source, utm_medium, utm_campaign, and the others should look. The
                builder will enforce them from then on.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 02</div>
              <h3>Build links</h3>
              <p>
                Paste a destination URL, fill the parameters, hit copy. The builder validates
                everything as you type and refuses to copy a link that breaks your rules.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 03</div>
              <h3>Save, share, export</h3>
              <p>
                Save links to a campaign for reuse, copy them straight into Slack or a brief, or
                export the whole campaign to CSV when ops asks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">Built for</div>
            <h2>Marketing teams that hate broken campaign reports.</h2>
            <p>
              If you&apos;ve ever spent an afternoon reconciling &quot;newsletter / email&quot; vs
              &quot;Email / newsletter&quot; in your funnel report, this is for you. Demand gen,
              lifecycle, growth, content — anywhere a UTM gets typed by a human.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>About the UTM Builder</h2>
          </div>
          <div className="lp-faq">
            {faqs.map(({ q, a }) => (
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
            <div className="eyebrow">By channel</div>
            <h2>Channel-specific UTM Builder guides</h2>
            <p>
              Channel-specific naming conventions, examples, and gotchas for the platforms
              you&apos;re actually running campaigns on.
            </p>
          </div>
          <div className="lp-pair">
            {UTM_CHANNELS.slice(0, 6).map((c) => (
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
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">Pair it with</div>
            <h2>Other tiny tools that play well with this one.</h2>
          </div>
          <div className="lp-pair">
            <Link href="/campaign-planner" className="lp-pair-card">
              <span className="lp-pair-num">02</span>
              <span className="lp-pair-text">
                <span className="lp-pair-name">GTM/Campaign Planner</span>
                <span className="lp-pair-tag">Plan the launch the links belong to</span>
              </span>
            </Link>
            <Link href="/faq-generator" className="lp-pair-card">
              <span className="lp-pair-num">03</span>
              <span className="lp-pair-text">
                <span className="lp-pair-name">FAQ Generator</span>
                <span className="lp-pair-tag">Turn product docs into customer FAQs</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Build your first UTM link in 60 seconds.</h2>
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
