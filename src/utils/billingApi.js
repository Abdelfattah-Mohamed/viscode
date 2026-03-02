import { getSupabase } from "./supabase";

/**
 * Creates a Stripe Checkout session for the given plan.
 * Returns { url } to redirect to, or { error }.
 */
export async function createCheckoutSession(email, planId) {
  const sb = getSupabase();
  if (!sb) return { error: "Not configured" };
  const { data, error } = await sb.functions.invoke("create-checkout-session", {
    body: { email: email?.trim()?.toLowerCase(), plan_id: planId },
  });
  if (error) return { error: error.message || "Failed to start checkout" };
  if (data?.error) return { error: data.error };
  if (data?.url) return { url: data.url };
  return { error: "No checkout URL returned" };
}
