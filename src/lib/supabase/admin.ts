// Service-role Supabase client. Bypasses RLS. Use ONLY for:
// - Public-share read routes that fetch by exact id without auth
// - The /api/subscribe route (writing to the locked subscribers table)
//
// Never expose this client or the service_role key to a browser bundle.

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
