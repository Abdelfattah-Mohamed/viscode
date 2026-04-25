# Billing Schema

This project includes a simple billing schema in Supabase for plans and subscriptions. It is designed to work with or without Stripe.

## Tables

### `billing_plans`
Defines plan tiers (e.g. free, weekly, monthly, yearly, lifetime).

| Column            | Type    | Description                                      |
|-------------------|---------|--------------------------------------------------|
| id                | text PK | `free`, `pro_weekly`, `pro`, `pro_yearly`, `lifetime` |
| name              | text    | Display name                                     |
| description       | text    | Short description                                |
| amount_cents      | integer | Price in cents (0 for free)                      |
| interval          | text    | `week`, `month`, `year`, or `one_time`           |
| stripe_price_id   | text    | Optional Stripe Price ID                         |
| features          | jsonb   | Array of feature strings                         |

Default seed: **free** ($0), **pro_weekly** ($1.59/wk), **pro** ($3.99/mo), **pro_yearly** ($39.99/yr), **lifetime** ($89.99 once).

Edge Function secrets: `STRIPE_PRICE_PRO_WEEKLY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_LIFETIME` (recurring prices must use matching Stripe intervals: week / month / year).

### `user_subscriptions`
One row per user: their current plan and optional Stripe data.

| Column                  | Type    | Description                          |
|-------------------------|---------|--------------------------------------|
| user_id                 | uuid FK | References `profiles(id)`            |
| plan_id                 | text FK | References `billing_plans(id)`      |
| status                  | text    | `active`, `canceled`, `past_due`, `trialing`, `incomplete` |
| stripe_customer_id      | text    | Optional                             |
| stripe_subscription_id  | text    | Optional                             |
| current_period_start/end| timestamptz | Billing period                   |
| cancel_at_period_end    | boolean | If true, cancel when period ends    |

### `billing_invoices`
Optional history of invoices (e.g. from Stripe webhooks).

| Column             | Type    | Description                |
|--------------------|---------|----------------------------|
| user_id            | uuid FK | References `profiles(id)`  |
| stripe_invoice_id  | text    | Optional                   |
| amount_cents       | integer | Invoice amount             |
| currency           | text    | e.g. `usd`                 |
| status             | text    | `paid`, `open`, `void`, `uncollectible` |
| period_start/end   | timestamptz | Billing period        |

## Setup

1. Run the billing section of `schema.sql` in the Supabase SQL Editor (the part from `-- Billing schema` to the end), or run the full `schema.sql` if you haven’t yet.
2. Ensure every user has a row in `profiles` (your signup flow should create one). The billing tables use `profiles.id` (UUID), not email.
3. On signup, optionally insert a row into `user_subscriptions` with `plan_id = 'free'` and `user_id = profiles.id`.

### Supabase CLI commands

Use `npx supabase ...` for CLI operations in this project, for example:

- `npx supabase login`
- `npx supabase link --project-ref <YOUR_PROJECT_REF>`
- `npx supabase functions deploy create-checkout-session`
- `npx supabase functions deploy stripe-webhook`

## Usage ideas

- **Check plan in app:** Query `user_subscriptions` (and join `billing_plans`) by `user_id` (from the current profile) to show plan name, features, and status.
- **Stripe:** Store `stripe_customer_id` and `stripe_subscription_id` when you create a Stripe customer/subscription. Use webhooks to update `user_subscriptions` (status, period end) and to insert rows into `billing_invoices`.
- **Gating features:** If `plan_id` is `free`, restrict access; allow full access for `pro_weekly`, `pro`, `pro_yearly`, or `lifetime`.

## Operational notes

- Keep a weekly check on checkout failures and webhook errors before shipping pricing/copy changes.
- If a billing incident occurs, follow `docs/INCIDENT-RUNBOOK.md` and `docs/RELEASE-CHECKLIST.md` before reopening upgrades.
- For beta launches, pair billing changes with tester communication in `docs/BETA-OPS.md`.

## RLS

Policies are permissive (`using (true)`) to match the rest of the project. For production, restrict `user_subscriptions` and `billing_invoices` so users can only read/update their own row (e.g. `user_id = auth.uid()` or your app’s user id).
