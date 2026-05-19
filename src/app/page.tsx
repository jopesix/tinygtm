// TinyGTM landing — minimal text-only design (handoff 2026-05-19).
// Top bar (brand + Tools dropdown + live pill) → centered hero → tools list →
// footer with email capture + Peace Itimi credit. No SVG art.

import Link from "next/link";
import { EmailForm } from "@/components/EmailForm";
import { TOOLS, liveCount } from "@/lib/tools";

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link className="brand" href="/" aria-label="TinyGTM home">
            <span className="brand-mark" aria-hidden="true" />
            TinyGTM
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
                {TOOLS.filter((t) => t.status === "live" && t.href).map((t) => (
                  <a
                    key={t.slug}
                    className="dropdown-item"
                    role="menuitem"
                    href={t.href!}
                  >
                    <span className="di-num">{t.number}</span>
                    <span className="di-text">
                      <span className="di-title">{t.name}</span>
                      <span className="di-tag">{t.tag}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <span className="live-pill">
              <span className="dot" />
              {liveCount()} live · more soon
            </span>
          </nav>
        </div>
      </header>

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
              const isLive = t.status === "live" && Boolean(t.href);

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

              return isLive && t.href ? (
                <a
                  key={t.slug}
                  className="tool"
                  href={t.href}
                  aria-label={`Open TinyGTM ${t.shortName}`}
                >
                  {inner}
                </a>
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
            <div className="brand" style={{ fontSize: "14px" }}>
              <span
                className="brand-mark"
                aria-hidden="true"
                style={{ width: "20px", height: "20px", borderRadius: "6px" }}
              />
              TinyGTM
            </div>
            <div className="credit">
              Built by{" "}
              <a href="https://peaceitimi.com" target="_blank" rel="noopener noreferrer">
                Peace Itimi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
