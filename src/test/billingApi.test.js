import { describe, it, expect, vi, beforeEach } from "vitest";

const invokeMock = vi.fn();

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({ functions: { invoke: invokeMock } }),
  PROFILES_TABLE: "profiles",
  FLAGS_TABLE: "user_problem_flags",
  NOTES_TABLE: "user_problem_notes",
  BILLING_PLANS_TABLE: "billing_plans",
  USER_SUBSCRIPTIONS_TABLE: "user_subscriptions",
  BILLING_INVOICES_TABLE: "billing_invoices",
}));

vi.mock("../utils/profile", () => ({
  ensureProfile: vi.fn(async () => ({ ok: true, profileId: "profile-1" })),
}));

const { createCheckoutSession, cancelSubscription } = await import("../utils/billingApi");

beforeEach(() => {
  invokeMock.mockReset();
});

describe("createCheckoutSession", () => {
  it("returns the checkout url on success", async () => {
    invokeMock.mockResolvedValue({ data: { url: "https://stripe.test/session" }, error: null });
    const res = await createCheckoutSession("user@example.com", "pro");
    expect(res).toEqual({ url: "https://stripe.test/session" });
    expect(invokeMock).toHaveBeenCalledWith("create-checkout-session", {
      body: { email: "user@example.com", plan_id: "pro" },
    });
  });

  it("normalizes the email before sending", async () => {
    invokeMock.mockResolvedValue({ data: { url: "https://x" }, error: null });
    await createCheckoutSession("  USER@Example.COM ", "pro_yearly");
    expect(invokeMock).toHaveBeenCalledWith("create-checkout-session", {
      body: { email: "user@example.com", plan_id: "pro_yearly" },
    });
  });

  it("maps network failures to a friendly message", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError", message: "Failed to send a request to the Edge Function" },
    });
    const res = await createCheckoutSession("user@example.com", "pro");
    expect(res.error).toMatch(/billing service/i);
  });

  it("surfaces server-side error bodies", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: { json: async () => ({ error: "Stripe is not configured" }) },
      },
    });
    const res = await createCheckoutSession("user@example.com", "pro");
    expect(res.error).toBe("Stripe is not configured");
  });

  it("errors when no url is returned", async () => {
    invokeMock.mockResolvedValue({ data: {}, error: null });
    const res = await createCheckoutSession("user@example.com", "pro");
    expect(res.error).toMatch(/no checkout url/i);
  });
});

describe("cancelSubscription", () => {
  it("returns ok on success", async () => {
    invokeMock.mockResolvedValue({ data: {}, error: null });
    const res = await cancelSubscription("user@example.com");
    expect(res).toEqual({ ok: true });
  });

  it("propagates data-level errors", async () => {
    invokeMock.mockResolvedValue({ data: { error: "No active recurring subscription found" }, error: null });
    const res = await cancelSubscription("user@example.com");
    expect(res.error).toBe("No active recurring subscription found");
  });
});
