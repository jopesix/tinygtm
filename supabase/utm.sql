-- UTM Link Builder & Tracker — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL → New query → paste → Run).

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles  (1 row per auth user — auto-created on signup via trigger)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row + default naming_rules row on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;

  insert into public.naming_rules (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- naming_rules  (one workspace-level rule set per user, for MVP)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.naming_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  force_lowercase boolean not null default true,
  separator text not null default '_' check (separator in ('_', '-')),
  allowed_sources text[] not null default array[
    'google','linkedin','facebook','instagram','twitter','tiktok','youtube',
    'reddit','newsletter','partner','direct','referral'
  ]::text[],
  allowed_mediums text[] not null default array[
    'cpc','paid_social','organic_social','email','referral','affiliate',
    'partner','display','video','organic','sms','push'
  ]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.naming_rules enable row level security;

drop policy if exists "naming_rules_select_own" on public.naming_rules;
create policy "naming_rules_select_own" on public.naming_rules
  for select using (auth.uid() = user_id);

drop policy if exists "naming_rules_insert_own" on public.naming_rules;
create policy "naming_rules_insert_own" on public.naming_rules
  for insert with check (auth.uid() = user_id);

drop policy if exists "naming_rules_update_own" on public.naming_rules;
create policy "naming_rules_update_own" on public.naming_rules
  for update using (auth.uid() = user_id);

drop policy if exists "naming_rules_delete_own" on public.naming_rules;
create policy "naming_rules_delete_own" on public.naming_rules
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- campaigns
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  utm_campaign text not null,
  utm_id text,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, utm_campaign)
);

create index if not exists campaigns_user_id_idx on public.campaigns(user_id);
create index if not exists campaigns_status_idx on public.campaigns(status);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_select_own" on public.campaigns;
create policy "campaigns_select_own" on public.campaigns
  for select using (auth.uid() = user_id);

drop policy if exists "campaigns_insert_own" on public.campaigns;
create policy "campaigns_insert_own" on public.campaigns
  for insert with check (auth.uid() = user_id);

drop policy if exists "campaigns_update_own" on public.campaigns;
create policy "campaigns_update_own" on public.campaigns
  for update using (auth.uid() = user_id);

drop policy if exists "campaigns_delete_own" on public.campaigns;
create policy "campaigns_delete_own" on public.campaigns
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- links
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  destination_url text not null,
  generated_url text not null,
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text not null,
  utm_id text,
  utm_term text,
  utm_content text,
  notes text,
  -- normalized signature used for exact-duplicate detection
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_copied_at timestamptz,
  unique (user_id, dedupe_key)
);

create index if not exists links_user_id_idx on public.links(user_id);
create index if not exists links_campaign_id_idx on public.links(campaign_id);
create index if not exists links_created_at_idx on public.links(created_at desc);
create index if not exists links_user_campaign_source_medium_idx
  on public.links(user_id, campaign_id, utm_source, utm_medium);

alter table public.links enable row level security;

drop policy if exists "links_select_own" on public.links;
create policy "links_select_own" on public.links
  for select using (auth.uid() = user_id);

drop policy if exists "links_insert_own" on public.links;
create policy "links_insert_own" on public.links
  for insert with check (auth.uid() = user_id);

drop policy if exists "links_update_own" on public.links;
create policy "links_update_own" on public.links
  for update using (auth.uid() = user_id);

drop policy if exists "links_delete_own" on public.links;
create policy "links_delete_own" on public.links
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists naming_rules_set_updated_at on public.naming_rules;
create trigger naming_rules_set_updated_at
  before update on public.naming_rules
  for each row execute function public.set_updated_at();

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

drop trigger if exists links_set_updated_at on public.links;
create trigger links_set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();
