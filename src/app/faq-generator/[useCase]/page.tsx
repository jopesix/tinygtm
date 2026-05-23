// Programmatic SEO: per-use-case FAQ Generator landing pages.
// One indexable page per entry in src/lib/faq-use-cases.ts. Each page targets
// search intent like "FAQ generator for SaaS" or "product page FAQ generator"
// and links into the actual /faq/new wizard.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingTopNav } from "@/components/landing/LandingTopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import { FAQ_USE_CASES, findUseCase } from "@/lib/faq-use-cases";

type RouteParams = { useCase: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return FAQ_USE_CASES.map((c) => ({ useCase: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { useCase: slug } = await params;
  const entry = findUseCase(slug);
  if (!entry) return {};

  const path = `/faq-generator/${entry.slug}`;
  const title = entry.name;
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

export default async function FaqUseCasePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { useCase: slug } = await params;
  const entry = findUseCase(slug);
  if (!entry) notFound();

  const path = `/faq-generator/${entry.slug}`;

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
        name: "FAQ Generator",
        item: absoluteUrl("/faq-generator"),
      },
      { "@type": "ListItem", position: 3, name: entry.shortName, item: absoluteUrl(path) },
    ],
  };

  const otherUseCases = FAQ_USE_CASES.filter((c) => c.slug !== entry.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={[softwareLd, faqLd, breadcrumbLd]} />
      <LandingTopNav />

      <section className="lp-hero">
        <div className="wrap">
          <div className="inner">
            <div className="eyebrow">FAQ Generator · {entry.shortName}</div>
            <h1>
              {entry.name},{" "}
              <span className="accent">grounded in your real content.</span>
            </h1>
            <p className="lede">{entry.whyItMatters}</p>
            <div className="lp-hero-ctas">
              <Link className="btn btn-primary" href="/faq/new">
                Generate {entry.shortName} FAQs
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
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h2
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              marginTop: 0,
            }}
          >
            What good {entry.shortName.toLowerCase()} FAQs look like
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{entry.whatGoodFaqsLookLike}</p>
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
            Questions {entry.shortName.toLowerCase()} FAQs should answer
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Examples of the questions a {entry.shortName.toLowerCase()} FAQ block typically covers.
            TinyGTM produces persona-specific variations of these grounded in your source material.
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {entry.exampleQuestions.map((q, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                {q}
              </li>
            ))}
          </ul>
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
            What source material works best
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{entry.sourceMaterialAdvice}</p>
        </div>
      </section>

      <section className="lp-section">
        <div className="wrap">
          <div className="lp-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>About generating {entry.shortName.toLowerCase()} FAQs</h2>
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
            <div className="eyebrow">Other use cases</div>
            <h2>FAQ Generator for other contexts</h2>
          </div>
          <div className="lp-pair">
            {otherUseCases.map((c) => (
              <Link key={c.slug} href={`/faq-generator/${c.slug}`} className="lp-pair-card">
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
              href="/faq-generator"
              style={{
                color: "var(--coral)",
                textDecoration: "underline",
                fontSize: 14,
              }}
            >
              ← Back to all FAQ Generator features
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="lp-section-head">
            <h2>Generate {entry.shortName.toLowerCase()} FAQs in 30 seconds.</h2>
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
