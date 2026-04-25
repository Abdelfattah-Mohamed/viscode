# VisCode Release Checklist

Use this checklist before each soft-beta and public release.

## 1) Environment And Config

- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for the target environment.
- [ ] Optional auth/billing env keys are present where needed (`VITE_GOOGLE_CLIENT_ID`, `VITE_EMAILJS_*`, Stripe-related function secrets).
- [ ] `supabase/schema.sql` is applied to the target Supabase project.
- [ ] Edge Functions are deployed and healthy:
  - [ ] `create-checkout-session`
  - [ ] `create-upgrade-portal-session`
  - [ ] `cancel-subscription`
  - [ ] `resume-subscription`
  - [ ] `stripe-webhook`
  - [ ] `send-verification-code`
  - [ ] `verify-code`

## 2) Core Product Journeys

- [ ] Guest can browse Home and Problems pages.
- [ ] Free user can open Famous Algorithms and run visualizations.
- [ ] Free user is blocked from premium problems and redirected to Billing.
- [ ] Signup/signin works (email flow and Google flow if enabled).
- [ ] Pro user can open premium problems.
- [ ] Pro user can use editable inputs and personal notes.
- [ ] Share URL opens the correct problem and input.

## 3) Billing Journeys

- [ ] Checkout starts successfully for each paid plan.
- [ ] Successful checkout updates plan and unlocks features.
- [ ] Upgrade flow works from recurring plans.
- [ ] Cancel at period end sets pending cancellation state.
- [ ] Undo cancellation restores normal renewal.
- [ ] Lifetime plan displays highest-plan message and no recurring cancellation action.

## 4) Visualization Integrity

- [ ] Step playback controls work: play, pause, next, previous, speed, jump start/end.
- [ ] Code-line highlighting is synchronized for core categories.
- [ ] Graph/tree previews and weighted input parsing work in input editor.
- [ ] At least one representative problem per major category passes manual smoke test.

## 5) Performance And Reliability

- [ ] `npm run build` succeeds without errors.
- [ ] Home, Problems, App, and Billing initial render time is acceptable on target device.
- [ ] No critical console errors during normal usage.
- [ ] Billing operations display clear success/error state to users.

## 6) Analytics And Feedback

- [ ] Event tracking is active for:
  - [ ] Landing CTA click
  - [ ] Problem opened
  - [ ] Paywall shown
  - [ ] Checkout started/succeeded/failed/canceled
  - [ ] Subscription cancel/resume lifecycle
- [ ] In-app helpfulness vote works.
- [ ] In-app "Report issue" submission works and includes context.

## 7) Launch Assets

- [ ] Pricing and plan descriptions are consistent across UI, docs, and Stripe.
- [ ] Screenshots and GIFs are up to date.
- [ ] Public support contact and policies are available.
- [ ] Launch posts are prepared for invite and community channels.
