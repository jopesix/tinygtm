// SEO landing page for the FAQ Generator tool.
// tinygtm.tools/faq-generator → CTA → tinygtm.tools/faq/new

import type { Metadata } from "next";
import Link from "next/link";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";

const PATH = "/faq-generator";
const TITLE = "AI FAQ Generator — Realistic Customer FAQs from Your Product";
const DESCRIPTION =
  "Generate realistic customer FAQs from product docs, URLs, PRDs, and call notes. Grouped by persona, grounded in your source material, and editable. Free, no sign-up required.";

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
    q: "What does the FAQ Generator do?",
    a: "It takes product context — a product description, target audience, optional URL, uploaded PDF/DOCX/MD/TXT, or pasted source material — and generates a set of realistic FAQs grouped by persona. The output is grounded in what you provided, not generic boilerplate.",
  },
  {
    q: "Is it free?",
    a: "Yes. The FAQ Generator is free without an account. Anonymous users can generate, regenerate, and export FAQs. Sign in if you want to save sessions, edit FAQs, reorder them, or create a view-only share link.",
  },
  {
    q: "What sources can I use as input?",
    a: "A product description (always), an optional target audience and source URL (we fetch the page content), and any combination of file uploads (PDF, DOCX, Markdown, plain text). Paste sales call transcripts, customer interview notes, PRDs, help-center docs — whatever describes the product or the customer's words.",
  },
  {
    q: "How does it pick the personas?",
    a: "From your input. If you mention solo founders and marketing managers, expect FAQs grouped by those two personas. You can also specify the persona explicitly during the wizard.",
  },
  {
    q: "Can I edit the generated FAQs?",
    a: "Yes. Signed-in users can edit any question or answer inline, reorder FAQs within a persona, regenerate a single FAQ that didn't land, or generate more FAQs in the same session.",
  },
  {
    q: "Can I export the FAQs?",
    a: "Yes. Markdown for Notion or Slack, structured JSON for engineers, and a clean DOCX/PDF for stakeholders. Plus a copy-each-FAQ button for quick paste-into-a-help-center.",
  },
  {
    q: "Will the FAQs work on my marketing site?",
    a: "Yes — and they're structured to support FAQPage schema markup if you want Google to surface them as rich results. The Markdown export already produces schema-friendly Q&A blocks.",
  },
  {
    q: "Does it work if my product is technical or niche?",
    a: "Yes. The more specific your source material, the more useful the output. Paste your PRD, docs, or a transcript with actual customer language and you'll get persona-specific FAQs that read like real questions, not generic SaaS filler.",
  },
];

export default function FaqGeneratorLanding() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TinyGTM FAQ Generator",
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
      { "@type": "ListItem", position: 2, name: "FAQ Generator", item: absoluteUrl(PATH) },
    ],
  };

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">AI FAQ Generator</div>
            <h1>
              Realistic customer FAQs — <span className="accent">grounded in your product, not in boilerplate.</span>
            </h1>
            <p className="lede">
              Paste your product description, drop a PDF or URL, and TinyGTM writes the FAQs your
              customers would actually ask — grouped by persona, edited from real source material,
              ready to drop on your marketing site or help center.
            </p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/faq/new">
                Generate FAQs
              </Link>
            </div>
            <div className="lp-hero-meta">
              <span>Free to use</span>
              <span className="dot" />
              <span>No sign-up to try</span>
              <span className="dot" />
              <span>Schema-friendly Markdown export</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">What it does</div>
            <h2>Real FAQs, written from your real product.</h2>
          </div>
          <div className="lp-features">
            <div className="lp-feature">
              <span className="lp-feature-icon">01</span>
              <h3>Multi-source input</h3>
              <p>
                Combine a product description, a target audience, an optional URL, and file
                uploads (PDF, DOCX, Markdown, plain text). The more context, the more specific
                the FAQs.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">02</span>
              <h3>Grouped by persona</h3>
              <p>
                FAQs are clustered by the personas the input implies — solo founders, growth
                marketers, IT buyers, whatever fits your product — so the output maps to how your
                customers actually break down.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">03</span>
              <h3>Grounded in your source</h3>
              <p>
                Every answer ties back to your input. No hallucinated features. If the input
                doesn&apos;t cover a question, TinyGTM flags it as a gap rather than guessing.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">04</span>
              <h3>Editable + regeneratable</h3>
              <p>
                Edit any answer inline. Regenerate a single FAQ that missed. Generate more FAQs
                in the same session. The output bends to your edits without losing the rest.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">05</span>
              <h3>Multiple exports</h3>
              <p>
                Markdown (schema-friendly Q&amp;A for your marketing site), structured JSON for
                engineers, DOCX or PDF for stakeholders, and a per-FAQ copy button.
              </p>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">06</span>
              <h3>Anonymous-friendly</h3>
              <p>
                Generate without an account. Sign in only when you want history, the dashboard,
                in-place editing, or a shareable view-only link.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">How it works</div>
            <h2>Three steps from product context to FAQ block.</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">STEP 01</div>
              <h3>Describe the product</h3>
              <p>
                Paste a description, add a target audience, drop a URL or upload PDFs/DOCXs.
                Anything that describes the product or how customers talk about it.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 02</div>
              <h3>Generate</h3>
              <p>
                TinyGTM extracts personas, drafts realistic questions, and grounds each answer in
                your source material. About 8-12 FAQs the first run; generate more on demand.
              </p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">STEP 03</div>
              <h3>Edit + export</h3>
              <p>
                Edit anything that doesn&apos;t feel right. Regenerate the FAQs that miss. Export
                to Markdown, DOCX, PDF, or JSON. Or share a view-only link.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">Built for</div>
            <h2>Product marketers, founders, and PMMs.</h2>
            <p>
              Anyone shipping a product page, a help center, or a sales-enablement deck. Anyone
              who&apos;s ever stared at a blank FAQ block on a landing page wishing it would write
              itself.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>About the FAQ Generator</h2>
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
                <span className="lp-pair-tag">Track traffic to your FAQ page</span>
              </span>
            </Link>
            <Link href="/campaign-planner" className="lp-pair-card">
              <span className="lp-pair-num">02</span>
              <span className="lp-pair-text">
                <span className="lp-pair-name">GTM/Campaign Planner</span>
                <span className="lp-pair-tag">Plan the launch around the page</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Generate your first FAQ block in 30 seconds.</h2>
            <p>Free to use. No sign-up. Save sessions when you&apos;re ready.</p>
          </div>
          <Link className="btn btn-primary" href="/faq/new">
            Open the FAQ Generator
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
