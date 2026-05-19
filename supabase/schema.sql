-- FAQ Generator schema for the tinygtm-suite Supabase project.
-- 4 tables + RLS policies. Designed for cross-tool reuse (product_profile is
-- shared across all TinyGTM tools; the other 3 are tool-specific to FAQ Generator).
--
-- Run this in the Supabase SQL Editor after creating the tinygtm-suite project.

-- ============================================================================
-- product_profile
-- Shared across all TinyGTM tools. Stores reusable product context per user.
-- Each user can have multiple profiles (Episode, Rivva, TinyGTM, etc.).
-- ============================================================================
create table public.product_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,                              -- e.g. "Episode", "Rivva"
  description text not null,
  url text,
  target_audience text not null,
  key_problem text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_profile_user_idx on public.product_profile (user_id, updated_at desc);

alter table public.product_profile enable row level security;

create policy "users can read own profiles"
  on public.product_profile for select
  using (auth.uid() = user_id);

create policy "users can insert own profiles"
  on public.product_profile for insert
  with check (auth.uid() = user_id);

create policy "users can update own profiles"
  on public.product_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own profiles"
  on public.product_profile for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- generation_session
-- Records each FAQ generation run by a signed-in user. Anonymous runs are not
-- persisted (per the locked design — anonymous = generate/copy only).
-- ============================================================================
create table public.generation_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_profile_id uuid references public.product_profile(id) on delete set null,

  -- Snapshot of inputs at generation time. Profile may have changed since,
  -- but the session reflects what was actually generated from.
  product_description text not null,
  product_url text,
  target_audience text not null,
  key_problem text not null,

  persona text not null,                           -- persona key
  status text not null default 'completed',        -- 'completed' | 'failed'

  ai_model text,                                   -- which Claude model was used
  ai_input_tokens int,
  ai_output_tokens int,
  ai_cost_cents int,                               -- estimated cost in cents

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_session_user_idx on public.generation_session (user_id, created_at desc);

alter table public.generation_session enable row level security;

create policy "users can read own sessions"
  on public.generation_session for select
  using (auth.uid() = user_id);

create policy "users can insert own sessions"
  on public.generation_session for insert
  with check (auth.uid() = user_id);

create policy "users can update own sessions"
  on public.generation_session for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own sessions"
  on public.generation_session for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- faq_item
-- Individual generated FAQ rows. Cascade-delete with session.
-- Output principle: the artifact lives here clean. Confidence + source_basis +
-- assumption_flag are trust signals shown in side panel only, NEVER inline.
-- ============================================================================
create table public.faq_item (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.generation_session(id) on delete cascade,

  category text not null,                          -- faq category key
  question text not null,
  answer text not null,

  -- Trust-signal metadata (shown in side panel, not in the copied artifact)
  confidence text not null default 'medium',       -- 'low' | 'medium' | 'high'
  source_basis text,                               -- short note (e.g. "Product description + PRD")
  assumption_flag boolean not null default false,
  suggested_use text,                              -- 'landing_page' | 'help_center' | 'sales' | ...

  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faq_item_session_idx on public.faq_item (session_id, sort_order);

alter table public.faq_item enable row level security;

create policy "users can read own faqs"
  on public.faq_item for select
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = faq_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can insert own faqs"
  on public.faq_item for insert
  with check (
    exists (
      select 1 from public.generation_session s
      where s.id = faq_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can update own faqs"
  on public.faq_item for update
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = faq_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can delete own faqs"
  on public.faq_item for delete
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = faq_item.session_id and s.user_id = auth.uid()
    )
  );

-- ============================================================================
-- missing_context_item
-- Gaps detected by the AI for the session. Shown in side panel.
-- ============================================================================
create table public.missing_context_item (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.generation_session(id) on delete cascade,

  gap_type text not null,                          -- gap type key (PRD §13)
  description text not null,
  suggested_fix text,
  severity text not null default 'medium',         -- 'low' | 'medium' | 'high'

  created_at timestamptz not null default now()
);

create index missing_context_item_session_idx on public.missing_context_item (session_id, severity);

alter table public.missing_context_item enable row level security;

create policy "users can read own gaps"
  on public.missing_context_item for select
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = missing_context_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can insert own gaps"
  on public.missing_context_item for insert
  with check (
    exists (
      select 1 from public.generation_session s
      where s.id = missing_context_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can update own gaps"
  on public.missing_context_item for update
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = missing_context_item.session_id and s.user_id = auth.uid()
    )
  );

create policy "users can delete own gaps"
  on public.missing_context_item for delete
  using (
    exists (
      select 1 from public.generation_session s
      where s.id = missing_context_item.session_id and s.user_id = auth.uid()
    )
  );

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger product_profile_set_updated_at
  before update on public.product_profile
  for each row execute function public.set_updated_at();

create trigger generation_session_set_updated_at
  before update on public.generation_session
  for each row execute function public.set_updated_at();

create trigger faq_item_set_updated_at
  before update on public.faq_item
  for each row execute function public.set_updated_at();
