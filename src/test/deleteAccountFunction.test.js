import { describe, expect, it, vi } from "vitest";
import { deleteAccountForUser } from "../../supabase/functions/_shared/delete-account";

describe("deleteAccountForUser", () => {
  it("cancels an active Stripe subscription before deleting the auth user", async () => {
    const calls = [];
    const result = await deleteAccountForUser("user-1", {
      getStripeSubscriptionId: vi.fn(async () => ({ stripeSubscriptionId: "sub_123" })),
      cancelStripeSubscription: vi.fn(async (stripeSubscriptionId) => {
        calls.push(`cancel:${stripeSubscriptionId}`);
        return {};
      }),
      deleteAuthUser: vi.fn(async (userId) => {
        calls.push(`delete:${userId}`);
        return {};
      }),
    });

    expect(result).toEqual({ ok: true, status: 200 });
    expect(calls).toEqual(["cancel:sub_123", "delete:user-1"]);
  });

  it("does not delete the auth user when Stripe cancellation fails", async () => {
    const deleteAuthUser = vi.fn(async () => ({}));

    const result = await deleteAccountForUser("user-1", {
      getStripeSubscriptionId: vi.fn(async () => ({ stripeSubscriptionId: "sub_123" })),
      cancelStripeSubscription: vi.fn(async () => ({
        error: "Failed to cancel subscription",
        status: 502,
      })),
      deleteAuthUser,
    });

    expect(result).toEqual({ error: "Failed to cancel subscription", status: 502 });
    expect(deleteAuthUser).not.toHaveBeenCalled();
  });

  it("deletes the auth user directly when there is no recurring subscription", async () => {
    const cancelStripeSubscription = vi.fn(async () => ({}));
    const deleteAuthUser = vi.fn(async () => ({}));

    const result = await deleteAccountForUser("user-1", {
      getStripeSubscriptionId: vi.fn(async () => ({ stripeSubscriptionId: null })),
      cancelStripeSubscription,
      deleteAuthUser,
    });

    expect(result).toEqual({ ok: true, status: 200 });
    expect(cancelStripeSubscription).not.toHaveBeenCalled();
    expect(deleteAuthUser).toHaveBeenCalledWith("user-1");
  });
});
