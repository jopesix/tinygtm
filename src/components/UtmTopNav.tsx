import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Link2, LayoutDashboard, Settings, LogOut, LogIn } from "lucide-react";

export async function UtmTopNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="TinyGTM home">
          <div className="h-7 w-7 bg-brand rounded-md flex items-center justify-center">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-ink">
            Tiny<span className="text-zinc-400 font-normal">GTM</span>
            <span className="text-zinc-400 font-normal"> · UTM</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/utm"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-md"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Builder</span>
          </Link>

          {user && (
            <>
              <Link
                href="/utm/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/utm/settings/naming-rules"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-md"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Rules</span>
              </Link>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover px-3 py-1.5 rounded-md"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
