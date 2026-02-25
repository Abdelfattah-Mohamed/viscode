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
