// SEO landing page for the GTM/Campaign Planner tool.
// tinygtm.io/campaign-planner → CTA → tinygtm.io/campaign/new

import type { Metadata } from "next";
import Link from "next/link";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";

const PATH = "/campaign-planner";
const TITLE = "GTM/Campaign Planner — Turn Messy Notes into a Launch Plan";
const DESCRIPTION =
  "Paste your kickoff notes, transcript, or Slack thread. TinyGTM classifies the campaign, builds a tailored launch plan with operational tasks across pre-launch, launch day, and post-launch, and flags gaps you might have forgotten.";

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
    q: "What does the Campaign Planner actually produce?",
    a: "A structured launch plan: a classification of the campaign type (product launch, webinar, lifecycle, etc.), business and motion context, and a list of operational tasks grouped into pre-launch, launch day, and post-launch — each tagged with category, priority, suggested owner, and dependencies. It also flags operational gaps the input didn't cover.",
  },
  {
    q: "Is the Campaign Planner free?",
    a: "Yes. Anyone can paste a campaign and generate a plan without signing up. Sign in if you want to save, edit, reorder, or share the plan as a view-only link.",
  },
  {
    q: "What kind of input does it take?",
    a: "Kickoff notes, meeting transcripts, Slack threads, briefs, even a paragraph in your own words. The more context you paste, the more tailored the plan. There's a 50,000-character ceiling so it handles even fat transcripts.",
  },
  {
    q: "Is this a project management tool?",
    a: "No. TinyGTM doesn't try to replace Asana, Linear, ClickUp, or Notion. It produces the plan; you live in whichever PM tool your team already uses. The plan exports cleanly to CSV/TSV so you can paste it into a tracker.",
  },
  {
    q: "Can I export the plan to a spreadsheet?",
    a: "Yes. Every plan has one-click CSV export (download) and TSV copy (paste straight into Google Sheets). The Markdown export is good for pasting into Slack, Notion, or a brief.",
  },
  {
    q: "Can I share a plan with my team?",
    a: "Signed-in users get a shareable view-only link for each saved plan — anyone with the link can read it, no account required, but only you can edit.",
  },
  {
    q: "What's the difference between a brief and a plan?",
    a: "A brief explains what the campaign is and why. A plan is the operational checklist of what needs to happen for it to ship. TinyGTM's planner takes the brief-style context you paste and emits the plan you'd otherwise spend an hour assembling by hand.",
  },
];

export default function CampaignPlannerLanding() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TinyGTM GTM/Campaign Planner",
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
      { "@type": "ListItem", position: 2, name: "Campaign Planner", item: absoluteUrl(PATH) },
    ],
  };

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">GTM/Campaign Planner</div>
            <h1>
              Turn messy campaign notes into{" "}
              <span className="accent">an executable launch plan.</span>
            </h1>
            <p className="lede">
              Paste your kickoff notes, transcript, or Slack thread. TinyGTM classifies the
              campaign, generates a tailored launch plan with operational tasks per phase, and
              flags gaps you might have forgotten — in about 30 seconds.
            </p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/campaign/new">
                Plan a campaign
              </Link>
            </div>
            <div className="lp-hero-meta">
              <span>Free to try</span>
              <span className="dot" />
              <span>No sign-up needed</span>
              <span className="dot" />
              <span>~30 seconds per plan</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">What it does</div>
            <h2>From context blob to operational plan.</h2>
          </div>
          <div className="lp-features">
            <div className="lp-feature">
              <span className="lp-feature-icon">01</span>
              <h3>Classifies the campaign</h3>
              <p>
                Product launch? Webinar? Lifecycle? Outbound? TinyGTM picks the campaign type,
                business model, GTM motion, and channels from your context — and lets you correct
                it before generating the plan.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">02</span>
              <h3>Builds a phased plan</h3>
              <p>
                Tasks split into pre-launch, launch day, and post-launch. Each task has a
                category, priority, suggested owner, and the dependency it&apos;s blocked on.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">03</span>
              <h3>Flags operational gaps</h3>
              <p>
                The plan ends with a list of things you didn&apos;t mention but probably need to
                think about — analytics tracking, support enablement, internal comms.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">04</span>
              <h3>Editable + reorderable</h3>
              <p>
                Tick tasks done, drag to reorder within a phase, edit copy, or delete what
                doesn&apos;t apply. The plan is yours; we just bootstrap it.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">05</span>
              <h3>Export to anywhere</h3>
              <p>
                CSV download for ops. TSV copy that pastes cleanly into Google Sheets. Markdown
                copy for Slack or Notion. Or a shareable view-only link for the rest of the team.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">06</span>
              <h3>Anonymous-friendly</h3>
              <p>
                Generate a plan without signing up. Sign in only when you want to save it to a
                dashboard, edit it later, or share it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">How it works</div>
            <h2>Two AI calls. One executable plan.</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">STEP 01</div>
              <h3>Paste your context</h3>
              <p>
                Kickoff notes. Meeting transcript. Slack thread. PRD. A paragraph in your own
                words. The richer the input, the more tailored the plan.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 02</div>
              <h3>Confirm the classification</h3>
              <p>
                TinyGTM picks the campaign type and motion from your context. You confirm or
                correct it in one click before generating the plan.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 03</div>
              <h3>Edit, export, share</h3>
              <p>
                Toggle tasks done, reorder phases, or export to CSV/Markdown. Sign in to keep the
                plan around and share a view-only link.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">Built for</div>
            <h2>Solo founders and small GTM teams.</h2>
            <p>
              Founders running their own launches. PMMs without a launch coordinator. Demand-gen
              leads juggling four campaigns at once. Anyone who&apos;s ever stared at a kickoff
              transcript wondering where to start.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>About the Campaign Planner</h2>
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
            <div className="eyebrow">Pair it with</div>
            <h2>Other tiny tools that play well with this one.</h2>
          </div>
          <div className="lp-pair">
            <Link href="/utm-link-builder" className="lp-pair-card">
              <span className="lp-pair-num">01</span>
              <span className="lp-pair-text">
                <span className="lp-pair-name">UTM Link Builder &amp; Tracker</span>
                <span className="lp-pair-tag">Clean tracking links for the campaign</span>
              </span>
            </Link>
            <Link href="/faq-generator" className="lp-pair-card">
              <span className="lp-pair-num">03</span>
              <span className="lp-pair-text">
                <span className="lp-pair-name">FAQ Generator</span>
                <span className="lp-pair-tag">Customer FAQs for the launch page</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Plan your next campaign in 30 seconds.</h2>
            <p>Paste any context. Get a phased plan. Edit, export, ship.</p>
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
