-- =============================================================================
-- STEP 3: Create the profiles table in Supabase (one-time setup)
-- =============================================================================
--
-- 1. Open your project in the Supabase Dashboard:
--    https://supabase.com/dashboard/project/faguedpduasxsuwnmmct
--
-- 2. In the left sidebar, click "SQL Editor".
--
-- 3. Click "New query" (or use the default empty editor).
--
-- 4. Copy this ENTIRE file (all lines from "create table" below to the end)
--    and paste it into the SQL Editor.
--
-- 5. Click "Run" (or press Ctrl+Enter / Cmd+Enter).
--
-- 6. You should see "Success. No rows returned." That means the table and
--    policies were created. You can confirm under: Table Editor → profiles.
--
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text not null,
  avatar_url text,
  provider text not null default 'email',
  google_sub text,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: index for lookups by email or google_sub
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_google_sub_idx on public.profiles (google_sub);

-- Row Level Security: allow all for anon (app uses client-side auth; no Supabase Auth).
-- For production with a backend, replace with policies that use auth.uid().
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (true);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (true);

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles for delete using (true);

-- Verification codes (used by Edge Functions only; no anon access)
create table if not exists public.verification_codes (
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  primary key (email)
);

alter table public.verification_codes enable row level security;
-- No policies for anon: only service role (Edge Functions) can read/write.

-- =============================================================================
-- User problem flags (favorites & flagged)
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
create policy "flags_select" on public.user_problem_flags for select using (true);

drop policy if exists "flags_insert" on public.user_problem_flags;
create policy "flags_insert" on public.user_problem_flags for insert with check (true);

drop policy if exists "flags_delete" on public.user_problem_flags;
create policy "flags_delete" on public.user_problem_flags for delete using (true);

-- =============================================================================
-- User problem notes (personal notes per problem, per user)
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
create policy "notes_select" on public.user_problem_notes for select using (true);

drop policy if exists "notes_insert" on public.user_problem_notes;
create policy "notes_insert" on public.user_problem_notes for insert with check (true);

drop policy if exists "notes_update" on public.user_problem_notes;
create policy "notes_update" on public.user_problem_notes for update using (true);

drop policy if exists "notes_delete" on public.user_problem_notes;
create policy "notes_delete" on public.user_problem_notes for delete using (true);

-- =============================================================================
-- Billing schema (plans, subscriptions, optional Stripe fields)
-- =============================================================================

-- Plan definitions (e.g. free, pro, team). Optional: stripe_price_id for Stripe.
create table if not exists public.billing_plans (
  id text primary key,
  name text not null,
  description text,
  amount_cents integer not null default 0,
  interval text check (interval in ('month', 'year', 'one_time')),
  stripe_price_id text,
  features jsonb default '[]',
  created_at timestamptz not null default now()
);

-- Seed default plans: free $0/mo, pro $4.99/mo, pro_yearly $39.99/yr
insert into public.billing_plans (id, name, description, amount_cents, interval, features)
values
  ('free', 'Free', 'Basic access', 0, 'month', '["Limited problems", "Basic visualizations"]'),
  ('pro', 'Pro', 'Full access', 499, 'month', '["All problems", "All visualizations", "Export", "Priority support"]'),
  ('pro_yearly', 'Pro (Yearly)', 'Full access, billed yearly', 3999, 'year', '["All problems", "All visualizations", "Export", "Priority support", "Save 33%"]')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  amount_cents = excluded.amount_cents,
  interval = excluded.interval,
  features = excluded.features;

-- User subscriptions: one active subscription per user (by profile id).
-- stripe_customer_id can live here or on profiles; here keeps billing in one place.
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
create policy "subscriptions_select" on public.user_subscriptions for select using (true);

drop policy if exists "subscriptions_insert" on public.user_subscriptions;
create policy "subscriptions_insert" on public.user_subscriptions for insert with check (true);

drop policy if exists "subscriptions_update" on public.user_subscriptions;
create policy "subscriptions_update" on public.user_subscriptions for update using (true);

drop policy if exists "subscriptions_delete" on public.user_subscriptions;
create policy "subscriptions_delete" on public.user_subscriptions for delete using (true);

-- Optional: invoice history (e.g. from Stripe webhooks)
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
create policy "invoices_select" on public.billing_invoices for select using (true);

drop policy if exists "invoices_insert" on public.billing_invoices;
create policy "invoices_insert" on public.billing_invoices for insert with check (true);
