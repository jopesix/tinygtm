// TinyGTM landing — ported from the Claude Design handoff bundle (chat1.md).
// Structure mirrors the design file: TopBar (with Tools dropdown) → Hero →
// Tool grid (2×2) → Footer with email capture + Peace Itimi credit.

import Link from "next/link";
import { EmailForm } from "@/components/EmailForm";
import { TOOLS, liveCount } from "@/lib/tools";
import {
  UtmArt,
  CampaignArt,
  FaqArt,
  ExperimentArt,
  HeroArt,
  ChevronDown,
} from "@/components/landing-svgs";

const TOOL_ART = {
  utm: UtmArt,
  campaign: CampaignArt,
  faq: FaqArt,
  experiments: ExperimentArt,
} as const;

export default function HomePage() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link className="brand" href="/" aria-label="TinyGTM home">
            <span className="brand-mark" aria-hidden="true" />
            Tiny<span className="lc">GTM</span>
          </Link>

          <nav className="topnav" aria-label="Primary">
            <div className="has-dropdown">
              <button
                className="dropdown-trigger"
                aria-haspopup="true"
                aria-expanded="false"
                type="button"
              >
                Tools
                <ChevronDown />
              </button>
              <div className="dropdown-panel" role="menu">
                {TOOLS.map((t) => {
                  const Inner = (
                    <>
                      <span className="di-icon">{t.number}</span>
                      <span className="di-text">
                        <span className="di-title">{t.shortName}</span>
                        <span className="di-desc">{t.shortDesc}</span>
                      </span>
                      <span className="di-arrow">→</span>
                    </>
                  );
                  return t.href ? (
                    <a
                      key={t.slug}
                      className="dropdown-item"
                      role="menuitem"
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <a key={t.slug} className="dropdown-item" role="menuitem" href="#tools">
                      {Inner}
                    </a>
                  );
                })}
              </div>
            </div>
            <span className="live-pill">
              <span className="dot" />
              {liveCount()} live · more shipping
            </span>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Tiny tools for go-to-market work</div>
              <h1>
                Tiny tools for the marketing work{" "}
                <span className="accent">you repeat weekly.</span>
              </h1>
              <p className="lede">
                TinyGTM turns product context, campaign notes, customer insights, and growth goals
                into structured marketing assets your team can copy, edit, export, and reuse; from
                tracking links and campaign briefs to launch checklists, FAQs, and growth
                experiments.
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

            <div className="hero-art" aria-hidden="true">
              <HeroArt />
            </div>
          </div>
        </div>
      </section>

      <section className="tools" id="tools">
        <div className="wrap">
          <div className="tools-head">
            <div>
              <div className="eyebrow">Four utilities</div>
              <h2>Pick the one that solves today&apos;s annoying task.</h2>
            </div>
          </div>

          <div className="tool-grid">
            {TOOLS.map((t) => {
              const Art = TOOL_ART[t.slug as keyof typeof TOOL_ART];
              const isClickable = Boolean(t.href);
              const className = `tool${isClickable ? "" : " is-soon"}`;
              const ariaLabel = isClickable
                ? `Open TinyGTM ${t.shortName}`
                : t.status === "live"
                  ? `${t.shortName} — TinyGTM tool`
                  : `${t.shortName} — coming soon`;

              const inner = (
                <>
                  <div className="tool-art">
                    <Art />
                  </div>
                  <div className="tool-body">
                    <div className="tool-meta">
                      <span className="tool-num">{t.number}</span>
                      <span className={`tool-status${t.status === "live" ? " live" : ""}`}>
                        {t.status === "live" ? "Live" : "Soon"}
                      </span>
                    </div>
                    <h3>{t.name}</h3>
                    <p>{t.longDesc}</p>
                    <div className="tool-foot">
                      <span className="tool-cta">
                        {t.ctaLabel} <span className="tool-cta-arrow">→</span>
                      </span>
                      <span className="tool-tag">{t.tag}</span>
                    </div>
                  </div>
                </>
              );

              return isClickable && t.href ? (
                <a
                  key={t.slug}
                  className={className}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                >
                  {inner}
                </a>
              ) : (
                <div key={t.slug} className={className} aria-label={ariaLabel}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-cta">
            <div className="eyebrow">Stay in the loop</div>
            <h2>Get an email when we ship a new tool.</h2>
            <p>
              Roughly one email per release. No newsletter, no funnel — just a note when a new tiny
              utility goes live.
            </p>
            <EmailForm />
            <div className="footer-meta">
              We&apos;ll only email about new TinyGTM tools. Unsubscribe anytime.
            </div>
          </div>

          <div className="footer-bottom">
            <div className="brand" style={{ fontSize: "15px" }}>
              <span
                className="brand-mark"
                aria-hidden="true"
                style={{ width: "22px", height: "22px", borderRadius: "6px" }}
              />
              Tiny<span className="lc">GTM</span>
            </div>
            <div className="credit">
              Built by{" "}
              <a href="https://peaceitimi.com" target="_blank" rel="noopener noreferrer">
                Peace Itimi
              </a>
            </div>
            <div>© 2026 · Made for marketers who don&apos;t want a platform.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
