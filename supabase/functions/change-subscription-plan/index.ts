import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveProfileFromRequest } from "../_shared/profile.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_PRO_WEEKLY = Deno.env.get("STRIPE_PRICE_PRO_WEEKLY");
const STRIPE_PRICE_PRO_MONTHLY = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
const STRIPE_PRICE_PRO_YEARLY = Deno.env.get("STRIPE_PRICE_PRO_YEARLY");
const STRIPE_API_BASE = "https://api.stripe.com/v1";

const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro_weekly: 1,
  pro: 2,
  pro_yearly: 3,
  lifetime: 4,
};

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  pro_weekly: STRIPE_PRICE_PRO_WEEKLY,
  pro: STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: STRIPE_PRICE_PRO_YEARLY,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function stripeGet(path: string) {
  return fetch(`${STRIPE_API_BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
}

function stripePost(path: string, body: Record<string, string>) {
  const params = new URLSearchParams(body);
  return fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
}

function invoiceIdFromSubscriptionUpdate(updateData: Record<string, unknown>): string | null {
  const latest = updateData?.latest_invoice;
  if (!latest) return null;
  if (typeof latest === "string") return latest;
  if (typeof latest === "object" && latest !== null && typeof latest.id === "string") {
    return latest.id;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_PRO_WEEKLY || !STRIPE_PRICE_PRO_MONTHLY || !STRIPE_PRICE_PRO_YEARLY) {
    return jsonResponse({ error: "Stripe recurring prices are not configured" }, 503);
  }

  try {
    const { email, current_plan_id, target_plan_id } = (await req.json()) as {
      email?: string;
      current_plan_id?: string;
      target_plan_id?: string;
    };

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const currentPlanId = typeof current_plan_id === "string" ? current_plan_id.trim() : "";
    const targetPlanId = typeof target_plan_id === "string" ? target_plan_id.trim() : "";

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return jsonResponse({ error: "Valid email required" }, 400);
    }
    if (!(targetPlanId in PRICE_BY_PLAN)) {
      return jsonResponse({ error: "target_plan_id must be one of 'pro_weekly', 'pro', or 'pro_yearly'" }, 400);
    }
    if (!currentPlanId || !(currentPlanId in PLAN_RANK)) {
      return jsonResponse({ error: "current_plan_id is required" }, 400);
    }
    if (PLAN_RANK[targetPlanId] <= PLAN_RANK[currentPlanId]) {
      return jsonResponse({ error: "Target plan must be higher than current plan" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const resolved = await resolveProfileFromRequest(req, supabase);
    if ("error" in resolved) {
      return jsonResponse({ error: resolved.error }, resolved.status);
    }
    const profile = resolved.profile;
    const profileEmail = profile.email?.toLowerCase() || normalizedEmail;
    if (normalizedEmail && profileEmail && normalizedEmail !== profileEmail) {
      return jsonResponse({ error: "Email does not match signed-in account" }, 403);
    }

    const { data: subRow, error: subError } = await supabase
      .from("user_subscriptions")
      .select("plan_id, stripe_subscription_id")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (subError) return jsonResponse({ error: subError.message }, 500);
    if (!subRow?.stripe_subscription_id) {
      return jsonResponse({ error: "No active recurring subscription found. Start checkout first." }, 400);
    }

    const dbCurrentPlanId = subRow.plan_id || currentPlanId;
    if (!(dbCurrentPlanId in PLAN_RANK)) {
      return jsonResponse({ error: "Current plan is not upgradable" }, 400);
    }
    if (PLAN_RANK[targetPlanId] <= PLAN_RANK[dbCurrentPlanId]) {
      return jsonResponse({ error: "Target plan must be higher than current plan" }, 400);
    }

    const targetPriceId = PRICE_BY_PLAN[targetPlanId];
    if (!targetPriceId) return jsonResponse({ error: "Target price is not configured" }, 503);

    const stripeSubRes = await stripeGet(`/subscriptions/${subRow.stripe_subscription_id}`);
    const stripeSubData = await stripeSubRes.json();
    if (stripeSubData?.error) {
      return jsonResponse({ error: stripeSubData.error?.message || "Failed to load Stripe subscription" }, 502);
    }

    const itemId = stripeSubData?.items?.data?.[0]?.id as string | undefined;
    if (!itemId) return jsonResponse({ error: "Subscription item not found in Stripe" }, 502);

    const currentInterval = stripeSubData?.items?.data?.[0]?.price?.recurring?.interval as string | undefined;

    const targetInterval =
      targetPlanId === "pro_weekly"
        ? "week"
        : targetPlanId === "pro"
          ? "month"
          : "year";

    const updateBody: Record<string, string> = {
      "items[0][id]": itemId,
      "items[0][price]": targetPriceId,
      proration_behavior: "create_prorations",
    };

    // Stripe rejects `billing_cycle_anchor=unchanged` when switching intervals.
    // Keep anchor only for same-interval upgrades; otherwise start a new cycle now.
    updateBody.billing_cycle_anchor =
      currentInterval && currentInterval === targetInterval ? "unchanged" : "now";

    const updateRes = await stripePost(`/subscriptions/${subRow.stripe_subscription_id}`, updateBody);
    const updateData = await updateRes.json();
    if (updateData?.error) {
      return jsonResponse({ error: updateData.error?.message || "Failed to update subscription" }, 502);
    }

    let chargeInfo: {
      amount_paid_cents: number;
      amount_due_cents: number;
      currency: string;
      status: string;
      invoice_id: string;
    } | null = null;

    const latestInvoiceId = invoiceIdFromSubscriptionUpdate(updateData);
    if (latestInvoiceId) {
      const invoiceRes = await stripeGet(`/invoices/${latestInvoiceId}`);
      const invoiceData = await invoiceRes.json();
      if (!invoiceData?.error) {
        chargeInfo = {
          amount_paid_cents: Number(invoiceData.amount_paid ?? 0),
          amount_due_cents: Number(invoiceData.amount_due ?? 0),
          currency: String(invoiceData.currency || "usd"),
          status: String(invoiceData.status || "unknown"),
          invoice_id: latestInvoiceId,
        };
      }
    }

    await supabase
      .from("user_subscriptions")
      .update({
        plan_id: targetPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id);

    return jsonResponse({ ok: true, charge: chargeInfo }, 200);
  } catch (e) {
    console.error("change-subscription-plan error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Failed to change subscription plan" },
      500
    );
  }
});
