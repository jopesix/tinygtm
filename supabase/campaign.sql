-- TinyGTM — Campaign Operations Planner (PRD locked 2026-05-19)
-- Run this in the tinygtm-suite Supabase project (SQL Editor → paste → Run).
-- Idempotent: CREATE IF NOT EXISTS, DROP POLICY IF EXISTS.
--
-- Replaces the earlier campaign_brief schema. If campaign_brief / checklist_item
-- already exist (from the abandoned earlier attempt), drop them first:
--   drop table if exists public.checklist_item;
--   drop table if exists public.campaign_brief;

-- ============================================================================
-- campaign_plan
-- One row per generated plan. Inputs + classification + meta.
-- ============================================================================
create table if not exists public.campaign_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Inputs (snapshot at plan time)
  source_text text not null,
  source_url text,

  -- Classification (AI-generated, user-editable in step 2)
  campaign_name text not null,
  campaign_type text not null,
  business_type text not null,
  team_structure text not null,
  gtm_motion text not null,
  channels text[] not null default '{}',
  launch_complexity text not null default 'medium' check (launch_complexity in ('low', 'medium', 'high')),

  -- Meta
  ai_model text,
  ai_input_tokens int,
  ai_output_tokens int,
  ai_cost_cents int,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_plan_user_idx
  on public.campaign_plan (user_id, created_at desc);

alter table public.campaign_plan enable row level security;

drop policy if exists "campaign_plan_select_own" on public.campaign_plan;
create policy "campaign_plan_select_own"
  on public.campaign_plan for select
  using (auth.uid() = user_id);

drop policy if exists "campaign_plan_insert_own" on public.campaign_plan;
create policy "campaign_plan_insert_own"
  on public.campaign_plan for insert
  with check (auth.uid() = user_id);

drop policy if exists "campaign_plan_update_own" on public.campaign_plan;
create policy "campaign_plan_update_own"
  on public.campaign_plan for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "campaign_plan_delete_own" on public.campaign_plan;
create policy "campaign_plan_delete_own"
  on public.campaign_plan for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- plan_task
-- One row per task in a plan. PRD §12 task fields.
-- ============================================================================
create table if not exists public.plan_task (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.campaign_plan(id) on delete cascade,

  task text not null,
  category text not null,
  suggested_owner text,
  launch_phase text not null check (launch_phase in ('pre_launch', 'launch_day', 'post_launch')),
  priority text not null default 'should_have' check (priority in ('must_have', 'should_have', 'optional')),
  dependency text,
  notes text,

  status text not null default 'pending' check (status in ('pending', 'done')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plan_task_plan_idx
  on public.plan_task (plan_id, launch_phase, sort_order);

alter table public.plan_task enable row level security;

drop policy if exists "plan_task_select_own" on public.plan_task;
create policy "plan_task_select_own"
  on public.plan_task for select
  using (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_task.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_task_insert_own" on public.plan_task;
create policy "plan_task_insert_own"
  on public.plan_task for insert
  with check (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_task.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_task_update_own" on public.plan_task;
create policy "plan_task_update_own"
  on public.plan_task for update
  using (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_task.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_task_delete_own" on public.plan_task;
create policy "plan_task_delete_own"
  on public.plan_task for delete
  using (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_task.plan_id and p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- plan_gap
-- Operational gap flags surfaced by the AI / rules engine.
-- ============================================================================
create table if not exists public.plan_gap (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.campaign_plan(id) on delete cascade,
  description text not null,
  area text,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists plan_gap_plan_idx
  on public.plan_gap (plan_id, severity);

alter table public.plan_gap enable row level security;

drop policy if exists "plan_gap_select_own" on public.plan_gap;
create policy "plan_gap_select_own"
  on public.plan_gap for select
  using (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_gap.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_gap_insert_own" on public.plan_gap;
create policy "plan_gap_insert_own"
  on public.plan_gap for insert
  with check (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_gap.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_gap_delete_own" on public.plan_gap;
create policy "plan_gap_delete_own"
  on public.plan_gap for delete
  using (
    exists (
      select 1 from public.campaign_plan p
      where p.id = plan_gap.plan_id and p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- updated_at triggers (set_updated_at function exists from FAQ Gen schema)
-- ============================================================================
drop trigger if exists campaign_plan_set_updated_at on public.campaign_plan;
create trigger campaign_plan_set_updated_at
  before update on public.campaign_plan
  for each row execute function public.set_updated_at();

drop trigger if exists plan_task_set_updated_at on public.plan_task;
create trigger plan_task_set_updated_at
  before update on public.plan_task
  for each row execute function public.set_updated_at();
