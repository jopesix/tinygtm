import type { NextConfig } from "next";

// TinyGTM treats /faq and /utm as canonical tool URLs. Today they 308 to the
// external Vercel apps that host each tool. When we consolidate into a real
// monorepo, these redirects get replaced by route groups inside this app and
// the public URLs stay stable.

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /faq is now a real route group inside this app — no redirect.
      // /faq → /faq/new is a nicer landing than 404 on the bare path.
      {
        source: "/faq",
        destination: "/faq/new",
        permanent: false,
      },
      // /utm still 307s to the external UTM Builder until Phase 3 lands.
      {
        source: "/utm",
        destination: "https://utm-builder-eosin.vercel.app/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
