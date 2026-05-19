"use client";

// Sign-in link that preserves the current path as ?next=, so after the
// magic-link round-trip the user lands back where they started instead of
// a default route. Used in every tool's TopNav.

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export function SignInLink() {
  const pathname = usePathname() || "/";
  // Avoid setting next= to /login itself (would loop).
  const next = pathname.startsWith("/login") ? "/" : pathname;
  const href = `/login?next=${encodeURIComponent(next)}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover px-3 py-1.5 rounded-md"
    >
      <LogIn className="w-4 h-4" />
      Sign in
    </Link>
  );
}
