"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to TinyGTM</CardTitle>
            <CardDescription>
              One sign-in for the whole suite — FAQ Generator, UTM Builder, Campaign Planner.
              We&apos;ll email you a one-time link.
            </CardDescription>
          </CardHeader>
          <CardBody>
            {sent ? (
              <div className="rounded-lg bg-brand-soft p-4 text-sm text-ink">
                <p className="font-medium">Check your email</p>
                <p className="mt-1 text-zinc-600">
                  We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
                </p>
              </div>
            ) : (
              <form onSubmit={sendMagicLink} className="space-y-4">
                <Field label="Email">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Button type="submit" disabled={sending} className="w-full">
                  <Mail className="w-4 h-4" />
                  {sending ? "Sending…" : "Send magic link"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
