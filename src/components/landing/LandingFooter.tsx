// Shared footer for public pages: email capture + brand mark + Peace credit.

import { EmailForm } from "@/components/EmailForm";

export function LandingFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-cta">
          <div className="eyebrow">Stay in the loop</div>
          <h2>Get an email when we ship a new tool.</h2>
          <p>
            Roughly one email per release. No newsletter, no funnel — just a note when a new
            tiny utility goes live.
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
  );
}
