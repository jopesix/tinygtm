"use client";

// Email capture form. Client-only for now — flips to "Thanks ✓" on submit.
// Wire to a real ESP later (ConvertKit / Loops / Resend audiences).

import { useState } from "react";

export function EmailForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="email-form"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        placeholder="you@company.com"
        aria-label="Email address"
        required
        disabled={done}
      />
      <button type="submit" disabled={done}>
        {done ? "Thanks ✓" : "Notify me"}
      </button>
    </form>
  );
}
