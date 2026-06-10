# Go-Live Runbook

Everything code-side is done. The steps below need the project owner's accounts
(Supabase login + Stripe account) and take roughly 30–45 minutes.

## 1. Database (Supabase SQL Editor)

1. Open the SQL Editor for project `faguedpduasxsuwnmmct`.
2. Run `supabase/MIGRATION-AUTH.sql` (converts the old permissive schema; wipes
   orphan pre-auth rows — see warning inside the file).
3. Run `supabase/schema.sql` (idempotent; adds content requests/votes and
   analytics tables).

## 2. Supabase Auth settings (Dashboard)

- Auth → Providers → Email: enabled, keep **Confirm email** ON.
- Auth → Providers → Google: enable and paste the same client ID used in
  `VITE_GOOGLE_CLIENT_ID` (the app uses `signInWithIdToken`).
- Auth → URL Configuration: Site URL = production domain; add
  `http://localhost:5173` to additional redirect URLs.

## 3. Edge Functions

```bash
npx supabase login
npx supabase link --project-ref faguedpduasxsuwnmmct   # already linked locally
npm run deploy:functions   # uses npx supabase under the hood — do NOT use "npx run"
```

This deploys: create-checkout-session, create-upgrade-portal-session,
change-subscription-plan, cancel-subscription, resume-subscription,
stripe-webhook, delete-account, track-event.

## 4. Stripe

1. Dashboard → Products: create 4 prices and note the IDs:
   - Pro Weekly: $1.59 recurring **weekly**
   - Pro Monthly: $3.99 recurring **monthly** (7-day trial optional)
   - Pro Yearly: $39.99 recurring **yearly**
   - Lifetime: $89.99 **one-time**
2. Set the function secrets:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
npx supabase secrets set STRIPE_PRICE_PRO_WEEKLY=price_1TPhRX2ca6Cu26tRD0CfjYg0
npx supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_1T6NJv2ca6Cu26tRQuiHRbKJ
npx supabase secrets set STRIPE_PRICE_PRO_YEARLY=price_1T6NJv2ca6Cu26tRuKURqbHE
npx supabase secrets set STRIPE_PRICE_LIFETIME=price_1T6NJv2ca6Cu26tRrf2GF7pk
```

3. Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://faguedpduasxsuwnmmct.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy the signing secret:

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_WFlboT3lOK7KAYtrD8CKx5wsU0OHgf1j
```

## 5. Make yourself admin

After signing up through the new auth flow:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

## 6. Test matrix (Stripe test mode, card 4242 4242 4242 4242)

| Scenario | Expected |
|----------|----------|
| Subscribe weekly/monthly/yearly | Redirect to Stripe → success → Billing shows Pro, premium problems unlock |
| Buy lifetime | One-time payment → Pro forever, no renew note |
| Upgrade monthly → yearly | Hosted portal flow → plan updates |
| Cancel | "Cancels at period end" notice; access retained |
| Resume | Cancellation removed |
| Failed payment (card 4000 0000 0000 0341) | Subscription past_due; user keeps access during grace |
| Delete account (Profile page) | Auth user + all rows removed |

## 7. Deploy the frontend (Vercel)

- Import the repo in Vercel (SPA rewrites already in `vercel.json`).
- Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_GOOGLE_CLIENT_ID`, `VITE_ANALYTICS_ENDPOINT`.
- GitHub Actions now runs lint + tests + build as a quality gate only.

## 8. Final switches before public launch

- Swap Stripe test keys for live keys (repeat step 4 with live IDs).
- Update `https://viscode.dev` URLs in `index.html`, `public/robots.txt`, and
  `scripts/generate-sitemap.mjs` (`SITE_URL` env) if the domain differs.
- Verify legal pages (/terms, /privacy, /refunds) render and are linked.
