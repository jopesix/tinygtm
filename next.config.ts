import type { NextConfig } from "next";

// TinyGTM treats /faq and /utm as canonical tool URLs. Today they 308 to the
// external Vercel apps that host each tool. When we consolidate into a real
// monorepo, these redirects get replaced by route groups inside this app and
// the public URLs stay stable.

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/faq",
        destination: "https://faq-generator-eight.vercel.app/new",
        permanent: false, // 307 — easier to flip to a route group later
      },
      {
        source: "/utm",
        destination: "https://utm-builder-eosin.vercel.app/",
        permanent: false,
      },
      // Reserve the future tool paths now so they have a sensible 404 → home
      // for early link-sharing. Will become real route groups when built.
      // (Intentionally not redirecting /campaign and /experiments yet — they
      // 404 cleanly until shipped.)
    ];
  },
};

export default nextConfig;
