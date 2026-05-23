import type { NextConfig } from "next";

// TinyGTM treats /faq and /utm as canonical tool URLs. Both are real route
// groups inside this app — /faq/* (FAQ Generator) and /utm/* (UTM Builder).
// The bare paths /faq and /utm redirect to each tool's natural entry point.
//
// Domain canonicalization: tinygtm.tools is the canonical brand domain. Any
// request that lands on tinygtm.vercel.app gets 308'd to the same path on
// tinygtm.tools so SEO authority + share signals consolidate on one host.

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Functional route redirect.
      { source: "/faq", destination: "/faq/new", permanent: false },

      // Domain canonicalization: vercel.app → tools.
      {
        source: "/:path*",
        has: [{ type: "host", value: "tinygtm.vercel.app" }],
        destination: "https://tinygtm.tools/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
