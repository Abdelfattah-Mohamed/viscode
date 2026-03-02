# Billing Schema

This project includes a simple billing schema in Supabase for plans and subscriptions. It is designed to work with or without Stripe.

## Tables

### `billing_plans`
Defines plan tiers (e.g. free, pro, pro_yearly).

| Column            | Type    | Description                                      |
|-------------------|---------|--------------------------------------------------|
| id                | text PK | Plan key: `free`, `pro`, `pro_yearly`            |
| name              | text    | Display name                                     |
| description       | text    | Short description                                |
| amount_cents      | integer | Price in cents (0 for free)                      |
| interval          | text    | `month`, `year`, or `one_time`                   |
| stripe_price_id   | text    | Optional Stripe Price ID                         |
| features          | jsonb   | Array of feature strings                         |

Default seed: **free** ($0/mo), **pro** ($4.99/mo), **pro_yearly** ($39.99/yr).

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

## Usage ideas

- **Check plan in app:** Query `user_subscriptions` (and join `billing_plans`) by `user_id` (from the current profile) to show plan name, features, and status.
- **Stripe:** Store `stripe_customer_id` and `stripe_subscription_id` when you create a Stripe customer/subscription. Use webhooks to update `user_subscriptions` (status, period end) and to insert rows into `billing_invoices`.
- **Gating features:** If `plan_id` is `free`, restrict access to certain problems or visualizations; allow full access for `pro` or `pro_yearly`.

## RLS

Policies are permissive (`using (true)`) to match the rest of the project. For production, restrict `user_subscriptions` and `billing_invoices` so users can only read/update their own row (e.g. `user_id = auth.uid()` or your app’s user id).
