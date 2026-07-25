import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readRepoFile(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

describe("security-sensitive deployment sources", () => {
  it("does not document a concrete Stripe webhook signing secret", () => {
    const docs = readRepoFile("docs/GO-LIVE.md");

    expect(docs).not.toMatch(/whsec_[A-Za-z0-9]{10,}/);
    expect(docs).toContain("whsec_your_webhook_signing_secret");
  });

  it("verifies Stripe webhook objects against the Stripe API before billing writes", () => {
    const source = readRepoFile("supabase/functions/stripe-webhook/index.ts");
    const checkoutCaseStart = source.indexOf('case "checkout.session.completed"');
    const subscriptionCaseStart = source.indexOf('case "customer.subscription.updated"');
    const invoiceCaseStart = source.indexOf('case "invoice.paid"');

    const checkoutCase = source.slice(checkoutCaseStart, subscriptionCaseStart);
    const subscriptionCase = source.slice(subscriptionCaseStart, invoiceCaseStart);
    const invoiceCase = source.slice(invoiceCaseStart);

    expect(checkoutCase).toMatch(/stripeGet\(\s*`\/checkout\/sessions\/\$\{encodeURIComponent\(eventSession\.id\)\}`\s*\)/);
    expect(checkoutCase.indexOf("stripeGet")).toBeLessThan(checkoutCase.indexOf("user_subscriptions"));

    expect(subscriptionCase).toMatch(/stripeGet\(\s*`\/subscriptions\/\$\{encodeURIComponent\(eventSub\.id\)\}`\s*\)/);
    expect(subscriptionCase.indexOf("stripeGet")).toBeLessThan(subscriptionCase.indexOf("user_subscriptions"));

    expect(invoiceCase).toMatch(/stripeGet\(\s*`\/invoices\/\$\{encodeURIComponent\(eventInvoice\.id\)\}`\s*\)/);
    expect(invoiceCase.indexOf("stripeGet")).toBeLessThan(invoiceCase.indexOf("billing_invoices"));
  });

  it("blocks client profile admin privilege escalation and client deletes", () => {
    const schema = readRepoFile("supabase/schema.sql");
    const profilesStart = schema.indexOf("create table if not exists public.profiles");
    const flagsStart = schema.indexOf("create table if not exists public.user_problem_flags");
    const profilesSection = schema.slice(profilesStart, flagsStart);

    expect(profilesSection).toMatch(/profiles_insert[\s\S]*is_admin\s*=\s*false/);
    expect(profilesSection).toContain("grant insert (id, email, username, avatar_url, provider, created_at, updated_at)");
    expect(profilesSection).not.toMatch(/create policy "profiles_delete"/);
    expect(profilesSection).toContain("No client-side deletes");
  });
});
