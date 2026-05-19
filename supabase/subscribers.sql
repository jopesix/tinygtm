-- TinyGTM landing — email subscribers
-- Run this in the tinygtm-suite Supabase project (SQL Editor → paste → Run).
-- Idempotent: CREATE IF NOT EXISTS, DROP POLICY IF EXISTS.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing',  -- e.g. 'landing', 'tool_signup', etc.
  created_at timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);

-- RLS: nobody can read or modify subscribers from the client. The /api/subscribe
-- route uses the service-role key to insert. Public access is blocked.
alter table public.subscribers enable row level security;

drop policy if exists "subscribers_no_public_read" on public.subscribers;
drop policy if exists "subscribers_no_public_write" on public.subscribers;
-- Intentionally no SELECT/INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Service role bypasses RLS, so the API route can write but the anon key cannot.
