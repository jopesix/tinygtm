// Dynamic OG image rendered by Next.js at build time. Used as the default
// preview when /, /utm-link-builder, /campaign-planner, /faq-generator are
// shared on Twitter, LinkedIn, iMessage, Slack, etc.
//
// Uses system fonts only so it builds without any external font loading.

import { ImageResponse } from "next/og";

export const alt = "TinyGTM — Tiny tools for the marketing work you repeat weekly.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f26b3a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 999, background: "#ffffff" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#0a2540" }}>TinyGTM</div>
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "#0a2540",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Tiny tools for the marketing work{" "}
          <span style={{ color: "#f26b3a" }}>&nbsp;you repeat weekly.</span>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 24,
            color: "#5c6b7e",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span>tinygtm.io</span>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: "#d4d4d1" }} />
          <span>Free · No sign-up</span>
        </div>
      </div>
    ),
    size,
  );
}
