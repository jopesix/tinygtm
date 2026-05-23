// Tiny admin gating: a comma-separated list of admin emails lives in the
// ADMIN_EMAILS env var. Any signed-in user whose email is in the list can
// access /admin/* routes. Anyone else gets redirected.
//
// Set ADMIN_EMAILS in Vercel env: peace@tinygtm.tools,you@something.com

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
