// Public-facing top bar used on tinygtm.io marketing pages: the homepage and
// the per-tool SEO landings. Mirrors the design handoff: brand mark + wordmark,
// Tools dropdown of live tools only, and a "N live · more soon" pill.

import Link from "next/link";
import { TOOLS, liveCount } from "@/lib/tools";

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingTopNav() {
  const liveTools = TOOLS.filter((t) => t.status === "live" && t.landingHref);
  return (
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
              {liveTools.map((t) => (
                <a
                  key={t.slug}
                  className="dropdown-item"
                  role="menuitem"
                  href={t.landingHref!}
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
  );
}
