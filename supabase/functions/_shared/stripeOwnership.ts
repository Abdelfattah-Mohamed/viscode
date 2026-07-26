const STRIPE_API_BASE = "https://api.stripe.com/v1";

type ProfileRef = { id: string; email: string | null };

type OwnershipOk = { ok: true; subscription: Record<string, unknown> };
type OwnershipErr = { ok: false; error: string; status: number };

export function stripeGet(path: string, secretKey: string) {
  return fetch(`${STRIPE_API_BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secretKey}` },
  });
}

/**
 * Ensure a Stripe subscription belongs to the signed-in profile before any
 * cancel / resume / plan-change / portal call. Prefer metadata.profile_id
 * (set at Checkout); fall back to matching the Stripe customer email.
 */
export async function assertSubscriptionOwnedByProfile(
  stripeSubscriptionId: string,
  profile: ProfileRef,
  secretKey: string
): Promise<OwnershipOk | OwnershipErr> {
  const subRes = await stripeGet(`/subscriptions/${stripeSubscriptionId}`, secretKey);
  const subscription = await subRes.json();
  if (subscription?.error) {
    return {
      ok: false,
      error: subscription.error?.message || "Failed to load Stripe subscription",
      status: 502,
    };
  }

  const metaProfileId = subscription?.metadata?.profile_id;
  if (typeof metaProfileId === "string" && metaProfileId.length > 0) {
    if (metaProfileId === profile.id) return { ok: true, subscription };
    return { ok: false, error: "Subscription does not belong to this account", status: 403 };
  }

  const customerId =
    typeof subscription?.customer === "string"
      ? subscription.customer
      : subscription?.customer && typeof subscription.customer === "object"
        ? (subscription.customer as { id?: string }).id
        : undefined;

  const profileEmail = profile.email?.trim().toLowerCase() || "";
  if (!customerId || !profileEmail) {
    return { ok: false, error: "Subscription does not belong to this account", status: 403 };
  }

  const custRes = await stripeGet(`/customers/${customerId}`, secretKey);
  const customer = await custRes.json();
  if (customer?.error) {
    return {
      ok: false,
      error: customer.error?.message || "Failed to load Stripe customer",
      status: 502,
    };
  }

  const customerEmail =
    typeof customer?.email === "string" ? customer.email.trim().toLowerCase() : "";
  if (!customerEmail || customerEmail !== profileEmail) {
    return { ok: false, error: "Subscription does not belong to this account", status: 403 };
  }

  return { ok: true, subscription };
}
