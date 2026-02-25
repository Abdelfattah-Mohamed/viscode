# Email verification in production

For signup/sign-in with email verification to work in **production**, do the following.

## 1. Build-time environment variables

Vite bakes `VITE_*` variables into the build. Your **production build** must have:

- `VITE_SUPABASE_URL` = your project URL (e.g. `https://xxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` = your project anon public key

Set these in your host’s **build** environment (not only at runtime):

- **Vercel:** Project → Settings → Environment Variables → add for Production, then redeploy.
- **Netlify:** Site → Build & deploy → Environment → add variables, then trigger deploy.
- **Other:** Pass them when running `npm run build` (e.g. in CI) or use a `.env.production` that is only used in production builds.

If these are missing at build time, the app will show “Supabase not configured” and suggest using code `123456` for testing.

## 2. Deploy Edge Functions

Verification uses two Supabase Edge Functions. Deploy them once (from your machine or CI):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-verification-code --no-verify-jwt
npx supabase functions deploy verify-code --no-verify-jwt
```

Replace `YOUR_PROJECT_REF` with your project ref (e.g. `faguedpduasxsuwnmmct` from the dashboard URL).

If the functions are not deployed, the app will show “Verification service not deployed” and suggest using `123456` to test.

## 3. (Optional) Real emails via Resend

To send real verification emails (instead of using `123456`):

1. Create an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. In **Supabase Dashboard** → **Edge Functions** → **Secrets**, add:
   - Name: `RESEND_API_KEY`
   - Value: your Resend API key
3. Redeploy the send function so it picks up the secret:
   ```bash
   npx supabase functions deploy send-verification-code --no-verify-jwt
   ```

Without `RESEND_API_KEY`, the send function returns 503 and the app tells users to use code `123456` for testing.

## 4. Database

Ensure you have run the SQL in `supabase/schema.sql` in the Supabase SQL Editor (creates `profiles` and `verification_codes` tables and RLS). You only need to do this once per project.

## Quick checklist

- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in **production build** env
- [ ] `send-verification-code` and `verify-code` Edge Functions deployed
- [ ] (Optional) `RESEND_API_KEY` set in Supabase Edge Function secrets
- [ ] `supabase/schema.sql` run in Supabase SQL Editor
