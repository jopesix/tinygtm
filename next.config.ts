import type { NextConfig } from "next";

// TinyGTM treats /faq and /utm as canonical tool URLs. Both are real route
// groups inside this app — /faq/* (FAQ Generator) and /utm/* (UTM Builder).
// The bare paths /faq and /utm redirect to each tool's natural entry point.

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/faq", destination: "/faq/new", permanent: false },
      // /utm is its own real page (the link builder) so no redirect.
    ];
  },
};

export default nextConfig;
