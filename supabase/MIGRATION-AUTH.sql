-- =============================================================================
-- MIGRATION: custom client-side auth  ->  Supabase Auth + locked-down RLS
-- =============================================================================
--
-- Run this ONCE in the SQL Editor of an EXISTING project that was set up with
-- the old (pre-auth) schema.sql. Fresh projects should run schema.sql instead.
--
-- WARNING (pre-launch assumption): existing profile rows were created with
-- random UUIDs that do not match any auth.users id. They cannot be linked
-- automatically. This script DELETES those orphan rows (profiles + dependent
-- flags/notes/subscriptions/invoices cascade or are wiped). Users simply sign
-- up again through the new flow. If you have rows you must keep, export them
-- first and re-attach manually after the owners re-register.
-- =============================================================================

begin;

-- 1. Wipe orphan data from the old auth system -------------------------------
delete from public.user_problem_flags;
delete from public.user_problem_notes;
delete from public.billing_invoices;
delete from public.user_subscriptions;
delete from public.profiles;

-- 2. Reshape profiles to mirror auth.users -----------------------------------
alter table public.profiles drop column if exists password_hash;
alter table public.profiles drop column if exists google_sub;
alter table public.profiles add column if not exists is_admin boolean not null default false;

alter table public.profiles alter column id drop default;
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- 3. Replace permissive policies with owner-only ones -------------------------

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
revoke update on public.profiles from anon, authenticated;
grant update (username, avatar_url, updated_at) on public.profiles to authenticated;
drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles for delete using (auth.uid() = id);

-- flags
drop policy if exists "flags_select" on public.user_problem_flags;
create policy "flags_select" on public.user_problem_flags
  for select using (lower(auth.jwt() ->> 'email') = lower(email));
drop policy if exists "flags_insert" on public.user_problem_flags;
create policy "flags_insert" on public.user_problem_flags
  for insert with check (lower(auth.jwt() ->> 'email') = lower(email));
drop policy if exists "flags_delete" on public.user_problem_flags;
create policy "flags_delete" on public.user_problem_flags
  for delete using (lower(auth.jwt() ->> 'email') = lower(email));

-- notes
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

-- billing plans: public read-only
alter table public.billing_plans enable row level security;
drop policy if exists "plans_select" on public.billing_plans;
create policy "plans_select" on public.billing_plans for select using (true);

-- subscriptions: owner read; self-provision free only; everything else via service role
drop policy if exists "subscriptions_select" on public.user_subscriptions;
create policy "subscriptions_select" on public.user_subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists "subscriptions_insert" on public.user_subscriptions;
create policy "subscriptions_insert" on public.user_subscriptions
  for insert with check (auth.uid() = user_id and plan_id = 'free');
drop policy if exists "subscriptions_update" on public.user_subscriptions;
drop policy if exists "subscriptions_delete" on public.user_subscriptions;

-- invoices: owner read-only
drop policy if exists "invoices_select" on public.billing_invoices;
create policy "invoices_select" on public.billing_invoices
  for select using (auth.uid() = user_id);
drop policy if exists "invoices_insert" on public.billing_invoices;

-- 4. Auto-create profile rows for new auth users ------------------------------
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

commit;

-- 5. ALSO run schema.sql once after this migration — it is idempotent and adds
--    any new tables this migration does not cover (content_requests/content_votes).
-- 6. AFTER running this script, in the Dashboard:
--    * Auth -> Providers -> Email: ensure "Confirm email" is ON (recommended).
--    * Auth -> Providers -> Google: enable, paste the same OAuth Client ID used
--      by VITE_GOOGLE_CLIENT_ID (the app signs in with signInWithIdToken).
--    * Auth -> URL Configuration: set Site URL to your production domain and
--      add http://localhost:5173 to additional redirect URLs for local dev.
-- 7. To make yourself admin (after signing up through the new flow):
--    update public.profiles set is_admin = true where email = 'you@example.com';
