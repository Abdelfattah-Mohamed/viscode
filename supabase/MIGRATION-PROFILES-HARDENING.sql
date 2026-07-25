-- =============================================================================
-- Harden profiles RLS: block self-grant of is_admin and client profile deletes.
-- Run once on projects that already applied schema.sql / MIGRATION-AUTH.sql.
-- =============================================================================

begin;

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id and is_admin = false);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant insert (id, email, username, avatar_url, provider, created_at, updated_at) on public.profiles to authenticated;
grant update (username, avatar_url, updated_at) on public.profiles to authenticated;

drop policy if exists "profiles_delete" on public.profiles;

commit;
