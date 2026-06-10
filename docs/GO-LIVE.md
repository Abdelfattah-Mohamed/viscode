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

Vercel hosts the React app. Supabase Edge Functions (steps 3–4) stay on
Supabase — only the static frontend goes to Vercel.

### 7a. First-time setup (Vercel Dashboard)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. Click **Add New… → Project**.
3. Import `Abdelfattah-Mohamed/viscode` (or your fork).
4. On the **Configure Project** screen, confirm these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | **Vite** (auto-detected) |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default for Vite) |
| Install Command | `npm install` (default) |

5. **Do not deploy yet** — add environment variables first (next section).
6. Click **Deploy**. Vercel builds on every push to `main`.

`vercel.json` already rewrites all routes to `index.html` so client-side
routing works (`/billing`, `/problem/two-sum`, etc.).

### 7b. Environment variables (Vercel → Project → Settings → Environment Variables)

Add each variable for **Production** (and **Preview** if you want PR previews
to work with auth/billing). Copy values from your local `.env` or the sources
below.

| Variable | Required | Where to get it | Example |
|----------|----------|-----------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase → **Project Settings → API → Project URL** | `https://faguedpduasxsuwnmmct.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase → **Project Settings → API → anon public** | `eyJhbGciOiJIUzI1NiIs…` |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google Cloud Console → **Credentials → OAuth client ID (Web)** | `123…apps.googleusercontent.com` |
| `VITE_ANALYTICS_ENDPOINT` | Optional | Your deployed `track-event` function URL | `https://faguedpduasxsuwnmmct.supabase.co/functions/v1/track-event` |
| `SITE_URL` | Recommended | Your production domain (used when generating `sitemap.xml` at build time) | `https://viscode.dev` |

Notes:

- Only variables prefixed with `VITE_` are exposed to the browser. Never put
  Stripe secret keys or the Supabase **service role** key here.
- After changing env vars, go to **Deployments → … → Redeploy** so the new
  values are baked into the build.
- `SITE_URL` is read by `scripts/generate-sitemap.mjs` during `npm run build`.
  Without it, the sitemap defaults to `https://viscode.dev`.

### 7c. Custom domain (optional)

1. Vercel → Project → **Settings → Domains**.
2. Add `viscode.dev` (or your domain) and follow the DNS instructions.
3. Vercel provisions HTTPS automatically once DNS propagates.

After the domain is live, update these **outside** Vercel:

- **Supabase** → Authentication → **URL Configuration**:
  - **Site URL** = `https://viscode.dev`
  - **Redirect URLs** — add `https://viscode.dev` (keep `http://localhost:5173`)
- **Google Cloud Console** → OAuth client → **Authorized JavaScript origins**:
  - add `https://viscode.dev`

### 7d. Verify the deployment

Open your Vercel URL and check:

| Check | How |
|-------|-----|
| Home page loads | `/` shows the hero and problem list |
| Client routing | `/billing`, `/problems`, `/terms` load without 404 |
| Sign up / sign in | Email or Google auth completes |
| Billing checkout | Subscribe redirects to Stripe (step 6 test matrix) |
| Sitemap | `https://your-domain/sitemap.xml` returns XML |
| OG image | `https://your-domain/og-image.jpg` loads |

### 7e. CI vs Vercel (what runs where)

| System | Trigger | What it does |
|--------|---------|--------------|
| **GitHub Actions** (`.github/workflows/ci.yml`) | Every push / PR | `lint` → `validate:problems` → `test` → `build` (quality gate only) |
| **Vercel** | Every push to `main` | `npm install` → `npm run build` → deploy `dist/` |

GitHub Actions does **not** deploy the site. If CI fails, fix it before merging
to `main` so Vercel doesn't deploy a broken build.

### 7f. Common Vercel build failures

| Error | Fix |
|-------|-----|
| `ERESOLVE could not resolve` on `npm install` | Ensure `@eslint/js` is `^9.x` (matches `eslint@^9`) in `package.json` |
| Blank page after deploy | Check browser console for missing `VITE_SUPABASE_*` env vars |
| Auth works locally but not on Vercel | Add production URL to Supabase redirect URLs (7c) |
| Google sign-in fails on production | Add production origin to Google OAuth + Supabase Google provider |
| Billing "Profile not found" | Sign in (not guest); run `MIGRATION-AUTH.sql` if profiles table is empty |
| Wrong URLs in sitemap | Set `SITE_URL` env var in Vercel and redeploy |

## 8. Final switches before public launch

- Swap Stripe test keys for live keys (repeat step 4 with live IDs).
- Update `https://viscode.dev` URLs in `index.html`, `public/robots.txt`, and
  `scripts/generate-sitemap.mjs` (`SITE_URL` env) if the domain differs.
- Verify legal pages (/terms, /privacy, /refunds) render and are linked.
