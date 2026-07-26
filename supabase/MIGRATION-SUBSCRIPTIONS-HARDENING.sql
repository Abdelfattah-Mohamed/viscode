-- Harden user_subscriptions client INSERT against Stripe ID poisoning / IDOR.
-- Apply on existing projects (schema.sql / MIGRATION-AUTH.sql already include this
-- for fresh installs).

begin;

drop policy if exists "subscriptions_insert" on public.user_subscriptions;
create policy "subscriptions_insert" on public.user_subscriptions
  for insert with check (
    auth.uid() = user_id
    and plan_id = 'free'
    and status = 'active'
    and stripe_customer_id is null
    and stripe_subscription_id is null
  );

revoke insert on public.user_subscriptions from anon, authenticated;
grant insert (user_id, plan_id, status, updated_at) on public.user_subscriptions to authenticated;

commit;
