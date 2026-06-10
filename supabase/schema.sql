-- =============================================================================
-- VisCode schema (Supabase Auth + locked-down RLS)
-- =============================================================================
--
-- Fresh-install setup:
-- 1. Supabase Dashboard -> SQL Editor -> New query
-- 2. Paste this ENTIRE file and Run.
--
-- Upgrading an existing pre-auth database? Run supabase/MIGRATION-AUTH.sql
-- instead (it converts old rows and replaces the permissive policies).
--
-- Security model:
-- * The app signs users in with Supabase Auth (email+password / Google).
-- * profiles.id == auth.users.id; every table is restricted to the owner via
--   auth.uid() / auth.email().
-- * Edge Functions use the service-role key and bypass RLS (billing webhooks).
-- =============================================================================

-- =============================================================================
-- Profiles (one row per auth user)
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text not null,
  avatar_url text,
  provider text not null default 'email',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Users can edit their display fields but never grant themselves admin.
revoke update on public.profiles from anon, authenticated;
grant update (username, avatar_url, updated_at) on public.profiles to authenticated;

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, avatar_url, provider)
  values (
    new.id,
    lower(new.email),
    coalesce(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      'User'
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', 'avatar:1'),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- User problem flags (favorites & flagged) — keyed by email, owner-only via JWT
-- =============================================================================
create table if not exists public.user_problem_flags (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  problem_id text not null,
  flag_type text not null check (flag_type in ('favorite', 'flagged')),
  created_at timestamptz not null default now(),
  unique(email, problem_id, flag_type)
);

create index if not exists user_problem_flags_email_idx on public.user_problem_flags (email);

alter table public.user_problem_flags enable row level security;

drop policy if exists "flags_select" on public.user_problem_flags;
create policy "flags_select" on public.user_problem_flags
  for select using (lower(auth.jwt() ->> 'email') = lower(email));

drop policy if exists "flags_insert" on public.user_problem_flags;
create policy "flags_insert" on public.user_problem_flags
  for insert with check (lower(auth.jwt() ->> 'email') = lower(email));

drop policy if exists "flags_delete" on public.user_problem_flags;
create policy "flags_delete" on public.user_problem_flags
  for delete using (lower(auth.jwt() ->> 'email') = lower(email));

-- =============================================================================
-- User problem notes — keyed by email, owner-only via JWT
-- =============================================================================
create table if not exists public.user_problem_notes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  problem_id text not null,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  unique(email, problem_id)
);

create index if not exists user_problem_notes_email_idx on public.user_problem_notes (email);
create index if not exists user_problem_notes_problem_idx on public.user_problem_notes (problem_id);

alter table public.user_problem_notes enable row level security;

drop policy if exists "notes_select" on public.user_problem_notes;
create policy "notes_select" on public.user_problem_notes
  for select using (lower(auth.jwt() ->> 'email') = lower(email));

drop policy if exists "notes_insert" on public.user_problem_notes;
create policy "notes_insert" on public.user_problem_notes
  for insert with check (lower(auth.jwt() ->> 'email') = lower(email));

drop policy if exists "notes_update" on public.user_problem_notes;
create policy "notes_update" on public.user_problem_notes
  for update using (lower(auth.jwt() ->> 'email') = lower(email))
  with check (lower(auth.jwt() ->> 'email') = lower(email));

drop policy if exists "notes_delete" on public.user_problem_notes;
create policy "notes_delete" on public.user_problem_notes
  for delete using (lower(auth.jwt() ->> 'email') = lower(email));

-- =============================================================================
-- Billing plans (public read-only; writes via service role only)
-- =============================================================================
create table if not exists public.billing_plans (
  id text primary key,
  name text not null,
  description text,
  amount_cents integer not null default 0,
  interval text check (interval in ('week', 'month', 'year', 'one_time')),
  stripe_price_id text,
  features jsonb default '[]',
  created_at timestamptz not null default now()
);

alter table public.billing_plans drop constraint if exists billing_plans_interval_check;
alter table public.billing_plans add constraint billing_plans_interval_check check (interval in ('week', 'month', 'year', 'one_time'));

insert into public.billing_plans (id, name, description, amount_cents, interval, features)
values
  ('free', 'Free', 'Basic access', 0, 'month', '["Limited problems", "Basic visualizations"]'),
  ('pro_weekly', 'Pro (Weekly)', 'Full access, billed weekly', 159, 'week', '["All problems", "All visualizations", "Export", "Priority support"]'),
  ('pro', 'Pro (Monthly)', 'Full access, billed monthly', 399, 'month', '["All problems", "All visualizations", "Export", "Priority support"]'),
  ('pro_yearly', 'Pro (Yearly)', 'Full access, billed yearly', 3999, 'year', '["All problems", "All visualizations", "Export", "Priority support", "Best value"]'),
  ('lifetime', 'Lifetime', 'One-time payment, access forever', 8999, 'one_time', '["All problems", "All visualizations", "Export", "Priority support", "Never pay again"]')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  amount_cents = excluded.amount_cents,
  interval = excluded.interval,
  features = excluded.features;

alter table public.billing_plans enable row level security;

drop policy if exists "plans_select" on public.billing_plans;
create policy "plans_select" on public.billing_plans
  for select using (true);
-- No insert/update/delete policies: anon/authenticated cannot modify plans.

-- =============================================================================
-- User subscriptions (owner read/insert; status changes via service role)
-- =============================================================================
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.billing_plans(id),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists user_subscriptions_user_id_idx on public.user_subscriptions (user_id);
create index if not exists user_subscriptions_stripe_customer_idx on public.user_subscriptions (stripe_customer_id);
create index if not exists user_subscriptions_stripe_subscription_idx on public.user_subscriptions (stripe_subscription_id);

alter table public.user_subscriptions enable row level security;

drop policy if exists "subscriptions_select" on public.user_subscriptions;
create policy "subscriptions_select" on public.user_subscriptions
  for select using (auth.uid() = user_id);

-- Users may only self-provision the free plan; paid plans are written by
-- Edge Functions (service role) after verified Stripe events.
drop policy if exists "subscriptions_insert" on public.user_subscriptions;
create policy "subscriptions_insert" on public.user_subscriptions
  for insert with check (auth.uid() = user_id and plan_id = 'free');

drop policy if exists "subscriptions_update" on public.user_subscriptions;
-- No client-side updates: cancel/resume/upgrade all go through Edge Functions.

drop policy if exists "subscriptions_delete" on public.user_subscriptions;
-- No client-side deletes.

-- =============================================================================
-- Billing invoices (owner read-only; written by Stripe webhook via service role)
-- =============================================================================
create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_invoice_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null check (status in ('paid', 'open', 'void', 'uncollectible')),
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_invoices_user_id_idx on public.billing_invoices (user_id);
create index if not exists billing_invoices_stripe_id_idx on public.billing_invoices (stripe_invoice_id);

alter table public.billing_invoices enable row level security;

drop policy if exists "invoices_select" on public.billing_invoices;
create policy "invoices_select" on public.billing_invoices
  for select using (auth.uid() = user_id);

drop policy if exists "invoices_insert" on public.billing_invoices;
-- No client-side inserts; webhook uses service role.

-- =============================================================================
-- Content requests + votes (community "vote for new content" board)
-- =============================================================================
create table if not exists public.content_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'LeetCode Problem',
  description text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  already_added boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists content_requests_created_idx on public.content_requests (created_at);

alter table public.content_requests enable row level security;

drop policy if exists "requests_select" on public.content_requests;
create policy "requests_select" on public.content_requests
  for select using (true);

drop policy if exists "requests_insert" on public.content_requests;
create policy "requests_insert" on public.content_requests
  for insert with check (auth.uid() = created_by);

-- Only admins may update (mark "already added") or delete requests.
drop policy if exists "requests_update" on public.content_requests;
create policy "requests_update" on public.content_requests
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "requests_delete" on public.content_requests;
create policy "requests_delete" on public.content_requests
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists public.content_votes (
  request_id uuid not null references public.content_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

alter table public.content_votes enable row level security;

drop policy if exists "votes_select" on public.content_votes;
create policy "votes_select" on public.content_votes
  for select using (true);

drop policy if exists "votes_insert" on public.content_votes;
create policy "votes_insert" on public.content_votes
  for insert with check (auth.uid() = user_id);

drop policy if exists "votes_delete" on public.content_votes;
create policy "votes_delete" on public.content_votes
  for delete using (auth.uid() = user_id);

-- Seed a few starter requests so the board is never empty (idempotent).
insert into public.content_requests (id, title, category, description)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Add LeetCode 146: LRU Cache', 'LeetCode Problem', 'Include a full visualizer for doubly linked list + hash map interactions.'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Add KMP string matching algorithm', 'Algorithm Topic', 'Show prefix table construction and matching traversal step by step.'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Add LeetCode 208: Implement Trie (Prefix Tree)', 'LeetCode Problem', 'Visualize node insertion, prefix traversal, and word-end markers.'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Add LeetCode 76: Minimum Window Substring', 'LeetCode Problem', 'Detailed left/right window movement with frequency map state changes.'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'Add Topological Sort (Kahn + DFS) comparison', 'Algorithm Topic', 'Show indegree queue flow and contrast with DFS postorder approach.')
on conflict (id) do nothing;

-- =============================================================================
-- Analytics events (written by the track-event Edge Function via service role)
-- =============================================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  properties jsonb default '{}',
  path text,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_idx on public.analytics_events (name);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);

alter table public.analytics_events enable row level security;
-- No anon/authenticated policies: only the service role (Edge Function) writes,
-- and reads happen in the Dashboard / SQL editor.

-- =============================================================================
-- Verification codes (legacy custom-code flow; Edge Functions only, no anon access)
-- =============================================================================
create table if not exists public.verification_codes (
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  primary key (email)
);

alter table public.verification_codes enable row level security;
-- No policies for anon: only service role (Edge Functions) can read/write.
