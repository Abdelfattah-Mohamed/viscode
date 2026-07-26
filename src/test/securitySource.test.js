import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(relPath) {
  return readFileSync(resolve(root, relPath), "utf8");
}

describe("subscription INSERT hardening (IDOR)", () => {
  it("schema forbids client-supplied Stripe IDs on free self-provision", () => {
    const schema = read("supabase/schema.sql");
    expect(schema).toMatch(/stripe_customer_id is null/);
    expect(schema).toMatch(/stripe_subscription_id is null/);
    expect(schema).toMatch(
      /grant insert \(user_id, plan_id, status, updated_at\) on public\.user_subscriptions to authenticated/
    );
    expect(schema).toMatch(
      /revoke insert on public\.user_subscriptions from anon, authenticated/
    );
  });

  it("migration hardening script exists for existing projects", () => {
    const migration = read("supabase/MIGRATION-SUBSCRIPTIONS-HARDENING.sql");
    expect(migration).toMatch(/stripe_subscription_id is null/);
    expect(migration).toMatch(/grant insert \(user_id, plan_id, status, updated_at\)/);
  });
});

describe("billing Edge Function ownership checks", () => {
  const functions = [
    "supabase/functions/cancel-subscription/index.ts",
    "supabase/functions/resume-subscription/index.ts",
    "supabase/functions/change-subscription-plan/index.ts",
    "supabase/functions/create-upgrade-portal-session/index.ts",
  ];

  it("shared ownership helper verifies metadata.profile_id or customer email", () => {
    const helper = read("supabase/functions/_shared/stripeOwnership.ts");
    expect(helper).toMatch(/assertSubscriptionOwnedByProfile/);
    expect(helper).toMatch(/metadata\?\.profile_id/);
    expect(helper).toMatch(/customers\/\$\{customerId\}/);
    expect(helper).toMatch(/Subscription does not belong to this account/);
  });

  for (const file of functions) {
    it(`${file} asserts Stripe subscription ownership before mutating`, () => {
      const src = read(file);
      expect(src).toMatch(/assertSubscriptionOwnedByProfile/);
      expect(src).toMatch(/if \(!owned\.ok\)/);
    });
  }
});

describe("lifetime upgrade and duplicate checkout guards", () => {
  it("create-checkout-session blocks a second active recurring checkout", () => {
    const src = read("supabase/functions/create-checkout-session/index.ts");
    expect(src).toMatch(/hasActiveRecurring/);
    expect(src).toMatch(/already have an active subscription/i);
    expect(src).toMatch(/prior_stripe_subscription_id/);
  });

  it("stripe-webhook cancels prior recurring sub on lifetime and requires payment", () => {
    const src = read("supabase/functions/stripe-webhook/index.ts");
    expect(src).toMatch(/cancelStripeSubscription/);
    expect(src).toMatch(/prior_stripe_subscription_id/);
    expect(src).toMatch(/payment_status/);
    expect(src).toMatch(/no_payment_required/);
    expect(src).toMatch(/method:\s*"DELETE"/);
    expect(src).toMatch(/Lifetime upgrade blocked; prior sub cancel failed/);
    expect(src).toMatch(/return jsonResponse\(\{ error: canceled\.error \}, 500\)/);
  });
});
