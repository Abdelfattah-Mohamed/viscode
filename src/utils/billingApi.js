import { getSupabase } from "./supabase";

async function extractEdgeError(error, fallback) {
  if (!error) return fallback;
  const context = error.context;
  if (context) {
    try {
      const body = await context.json();
      if (body?.error) return body.error;
    } catch {
      // ignore JSON parsing errors from non-JSON responses
    }
  }
  return error.message || fallback;
}

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
  if (error) return { error: await extractEdgeError(error, "Failed to start checkout") };
  if (data?.error) return { error: data.error };
  if (data?.url) return { url: data.url };
  return { error: "No checkout URL returned" };
}

/**
 * Opens a Stripe-hosted upgrade confirmation flow for an existing recurring subscription.
 * Returns { url } to redirect to, or { error }.
 */
export async function createUpgradePortalSession(email, currentPlanId, targetPlanId) {
  const sb = getSupabase();
  if (!sb) return { error: "Not configured" };
  const { data, error } = await sb.functions.invoke("create-upgrade-portal-session", {
    body: {
      email: email?.trim()?.toLowerCase(),
      current_plan_id: currentPlanId,
      target_plan_id: targetPlanId,
    },
  });
  if (error) return { error: await extractEdgeError(error, "Failed to start upgrade flow") };
  if (data?.error) return { error: data.error };
  if (data?.url) return { url: data.url };
  return { error: "No portal URL returned" };
}

/**
 * Cancels an active recurring subscription at period end.
 * Returns { ok } on success or { error }.
 */
export async function cancelSubscription(email) {
  const sb = getSupabase();
  if (!sb) return { error: "Not configured" };
  const { data, error } = await sb.functions.invoke("cancel-subscription", {
    body: { email: email?.trim()?.toLowerCase() },
  });
  if (error) return { error: await extractEdgeError(error, "Failed to cancel subscription") };
  if (data?.error) return { error: data.error };
  return { ok: true };
}

/**
 * Resumes a subscription that was set to cancel at period end.
 * Returns { ok } on success or { error }.
 */
export async function resumeSubscription(email) {
  const sb = getSupabase();
  if (!sb) return { error: "Not configured" };
  const { data, error } = await sb.functions.invoke("resume-subscription", {
    body: { email: email?.trim()?.toLowerCase() },
  });
  if (error) return { error: await extractEdgeError(error, "Failed to resume subscription") };
  if (data?.error) return { error: data.error };
  return { ok: true };
}
