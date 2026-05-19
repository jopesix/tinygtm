"use client";

// TinyGTM landing email capture. POSTs to /api/subscribe which inserts into
// public.subscribers via the Supabase service-role key (RLS bypass).

import { useRef, useState } from "react";

type State = "idle" | "submitting" | "done" | "error";

export function EmailForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value.trim();
    if (!email) return;

    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "message" in data && typeof data.message === "string"
            ? data.message
            : "Couldn't subscribe right now. Try again later.";
        setErrorMsg(message);
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setErrorMsg("Network error. Try again.");
      setState("error");
    }
  }

  const isLocked = state === "submitting" || state === "done";

  return (
    <>
      <form className="email-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="email"
          placeholder="you@company.com"
          aria-label="Email address"
          required
          disabled={isLocked}
        />
        <button type="submit" disabled={isLocked}>
          {state === "submitting" ? "Sending…" : state === "done" ? "Thanks ✓" : "Notify me"}
        </button>
      </form>
      {state === "error" && errorMsg && (
        <div
          role="alert"
          style={{ marginTop: 10, fontSize: 13, color: "#9c3d12", textAlign: "center" }}
        >
          {errorMsg}
        </div>
      )}
    </>
  );
}
