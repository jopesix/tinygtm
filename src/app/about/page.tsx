// /about — founder story + product philosophy. Establishes E-E-A-T for search
// engines and gives humans a reason to trust the toolkit.

import type { Metadata } from "next";
import Link from "next/link";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";

const PATH = "/about";
const TITLE = "About TinyGTM — Tiny tools for solo founders and small GTM teams";
const DESCRIPTION =
  "TinyGTM is a small suite of focused, single-purpose marketing utilities built by Peace Itimi. Free, anonymous-friendly, and designed around the work marketers actually repeat every week.";

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

export default function AboutPage() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    url: SITE.authorUrl,
    sameAs: [SITE.authorUrl, `https://twitter.com/${SITE.twitter.replace("@", "")}`],
    worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: absoluteUrl(PATH),
    name: TITLE,
    description: DESCRIPTION,
    mainEntity: personLd,
  };

  return (
    <>
      <JsonLd data={[aboutLd, personLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">About</div>
            <h1>
              Tiny tools for the marketing work{" "}
              <span className="accent">you actually repeat.</span>
            </h1>
            <p className="lede">
              TinyGTM is a small suite of focused, single-purpose marketing utilities. Free,
              anonymous-friendly, and built around the work marketers do every week, not the work
              that fits a SaaS sales deck.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: 28, marginTop: 0 }}>
            Why TinyGTM exists
          </h2>
          <p>
            Most marketing software is the wrong size for the problem. You don&apos;t need a
            platform to build a UTM link. You don&apos;t need a $99/month subscription to draft
            customer FAQs. You don&apos;t need a launch coordinator to plan a webinar.
          </p>
          <p>
            What you need is the artifact: the link, the plan, the FAQs. Paste-ready, exportable,
            and ideally produced in under a minute. That&apos;s what TinyGTM does. Each tool
            covers exactly one repetitive marketing task and gets out of your way.
          </p>

          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: 28, marginTop: 56 }}>
            How it works
          </h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
            <li>
              <strong>Free to use.</strong> Every tool runs without an account. Sign in only when
              you want to save, edit, reorder, or share.
            </li>
            <li>
              <strong>The output is the artifact.</strong> Copy-ready and export-ready, with no
              watermarks or upsells inside it.
            </li>
            <li>
              <strong>Single-purpose.</strong> Each tool does one thing. We&apos;re not trying to
              replace Notion, Asana, Linear, or your analytics platform.
            </li>
            <li>
              <strong>Built for taste, not scale.</strong> Tools ship when they&apos;re good, not
              when there&apos;s a press cycle.
            </li>
          </ul>

          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: 28, marginTop: 56 }}>
            The current toolkit
          </h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
            <li>
              <Link href="/utm-link-builder" style={{ color: "var(--coral)", textDecoration: "underline" }}>
                UTM Link Builder &amp; Tracker
              </Link>
              : clean campaign URLs without breaking your naming conventions.
            </li>
            <li>
              <Link href="/campaign-planner" style={{ color: "var(--coral)", textDecoration: "underline" }}>
                GTM/Campaign Planner
              </Link>
              : paste any campaign context and get a tailored launch plan.
            </li>
            <li>
              <Link href="/faq-generator" style={{ color: "var(--coral)", textDecoration: "underline" }}>
                FAQ Generator
              </Link>
              : realistic customer FAQs from product docs, URLs, and call notes.
            </li>
            <li>
              Marketing Experiment Generator: structured growth experiments. Coming soon.
            </li>
          </ul>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Browse the toolkit.</h2>
            <p>Three free tools live today. A fourth on the way.</p>
          </div>
          <Link className="btn btn-primary" href="/#tools">
            See all tools
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
