"use client";

// Tools switcher shown in every tool's top nav so users can hop between
// UTM Links / Campaign Planner / FAQ Generator without bouncing back to the
// landing. The currently-viewed tool is detected from the URL and rendered
// as a non-clickable "current" row.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Grid2x2 } from "lucide-react";
import { TOOLS } from "@/lib/tools";

function currentSlugFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  if (pathname.startsWith("/utm")) return "utm";
  if (pathname.startsWith("/campaign")) return "campaign";
  if (pathname.startsWith("/faq")) return "faq";
  return null;
}

export function ToolSwitcher() {
  const pathname = usePathname();
  const currentSlug = currentSlugFromPath(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-700 hover:bg-zinc-100 px-3 py-1.5 rounded-md"
      >
        <Grid2x2 className="w-4 h-4" />
        <span className="hidden sm:inline">Tools</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg p-1.5 z-50"
        >
          {TOOLS.map((t) => {
            const isCurrent = t.slug === currentSlug;
            const isSoon = t.status !== "live" || !t.href;

            const inner = (
              <>
                <span
                  className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-mono text-[10.5px] font-semibold ${
                    isCurrent
                      ? "bg-brand text-white"
                      : "bg-brand-soft text-brand border border-orange-200"
                  }`}
                >
                  {t.number}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink leading-tight truncate">
                    {t.name}
                  </span>
                  <span className="block text-[11.5px] text-zinc-500 font-mono tracking-wide truncate">
                    {t.tag}
                  </span>
                </span>
                {isCurrent ? (
                  <span className="shrink-0 text-[10.5px] font-mono uppercase tracking-wider text-zinc-400">
                    Current
                  </span>
                ) : isSoon ? (
                  <span className="shrink-0 text-[10.5px] font-mono uppercase tracking-wider text-zinc-400">
                    Soon
                  </span>
                ) : null}
              </>
            );

            if (isCurrent || isSoon || !t.href) {
              return (
                <div
                  key={t.slug}
                  className="flex items-center gap-3 px-2 py-2 rounded-md cursor-default opacity-80"
                  aria-disabled="true"
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link
                key={t.slug}
                href={t.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-zinc-50 group"
              >
                {inner}
              </Link>
            );
          })}
          <div className="px-2 pt-2 pb-1 border-t border-zinc-100 mt-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block text-[11.5px] text-zinc-500 hover:text-ink"
            >
              ← Back to TinyGTM
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
