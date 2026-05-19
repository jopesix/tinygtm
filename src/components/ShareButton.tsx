"use client";

// Copies a share URL to the clipboard. Used on FAQ result + campaign plan pages.

import { toast } from "sonner";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ShareButton({ href }: { href: string }) {
  async function copy() {
    try {
      const full = `${window.location.origin}${href}`;
      await navigator.clipboard.writeText(full);
      toast.success("Share link copied — view-only access.");
    } catch {
      toast.error("Couldn't reach the clipboard.");
    }
  }
  return (
    <Button variant="secondary" onClick={copy}>
      <LinkIcon className="w-4 h-4" /> Share
    </Button>
  );
}
