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

    expect(checkoutCase).toContain("stripeGet(`/checkout/sessions/${encodeURIComponent(eventSession.id)}`)");
    expect(checkoutCase.indexOf("stripeGet")).toBeLessThan(checkoutCase.indexOf("user_subscriptions"));

    expect(subscriptionCase).toContain("stripeGet(`/subscriptions/${encodeURIComponent(eventSub.id)}`)");
    expect(subscriptionCase.indexOf("stripeGet")).toBeLessThan(subscriptionCase.indexOf("user_subscriptions"));

    expect(invoiceCase).toContain("stripeGet(`/invoices/${encodeURIComponent(eventInvoice.id)}`)");
    expect(invoiceCase.indexOf("stripeGet")).toBeLessThan(invoiceCase.indexOf("billing_invoices"));
  });

  it("removes email-keyed notes and flags during account deletion", () => {
    const source = readRepoFile("supabase/functions/delete-account/index.ts");
    const cleanupIndex = source.indexOf("deleteEmailScopedRows(admin, normalizedEmail)");
    const deleteUserIndex = source.indexOf("admin.auth.admin.deleteUser");

    expect(source).toContain('"user_problem_notes"');
    expect(source).toContain('"user_problem_flags"');
    expect(cleanupIndex).toBeGreaterThan(-1);
    expect(deleteUserIndex).toBeGreaterThan(-1);
    expect(cleanupIndex).toBeLessThan(deleteUserIndex);
  });
});
