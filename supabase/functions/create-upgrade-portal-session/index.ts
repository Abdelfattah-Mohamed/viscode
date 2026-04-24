import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const targetPriceId = PRICE_BY_PLAN[targetPlanId];
    if (!targetPriceId) return jsonResponse({ error: "Target price is not configured" }, 503);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (profileError || !profile?.id) {
      return jsonResponse({ error: "Profile not found" }, 404);
    }

    const { data: subRow, error: subError } = await supabase
      .from("user_subscriptions")
      .select("plan_id, stripe_customer_id, stripe_subscription_id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (subError) return jsonResponse({ error: subError.message }, 500);
    if (!subRow?.stripe_customer_id || !subRow?.stripe_subscription_id) {
      return jsonResponse({ error: "No active recurring subscription found. Start checkout first." }, 400);
    }

    const dbCurrentPlanId = subRow.plan_id || currentPlanId;
    if (!(dbCurrentPlanId in PLAN_RANK)) return jsonResponse({ error: "Current plan is not upgradable" }, 400);
    if (PLAN_RANK[targetPlanId] <= PLAN_RANK[dbCurrentPlanId]) {
      return jsonResponse({ error: "Target plan must be higher than current plan" }, 400);
    }

    const stripeSubRes = await stripeGet(`/subscriptions/${subRow.stripe_subscription_id}`);
    const stripeSubData = await stripeSubRes.json();
    if (stripeSubData?.error) {
      return jsonResponse({ error: stripeSubData.error?.message || "Failed to load Stripe subscription" }, 502);
    }

    const subscriptionItemId = stripeSubData?.items?.data?.[0]?.id as string | undefined;
    if (!subscriptionItemId) return jsonResponse({ error: "Subscription item not found in Stripe" }, 502);

    const origin = req.headers.get("origin") || "http://localhost:5173";
    const returnUrl = `${origin}/billing?upgraded=true`;

    const portalRes = await stripePost("/billing_portal/sessions", {
      customer: subRow.stripe_customer_id,
      return_url: returnUrl,
      "flow_data[type]": "subscription_update_confirm",
      "flow_data[after_completion][type]": "redirect",
      "flow_data[after_completion][redirect][return_url]": returnUrl,
      "flow_data[subscription_update_confirm][subscription]": subRow.stripe_subscription_id,
      "flow_data[subscription_update_confirm][items][0][id]": subscriptionItemId,
      "flow_data[subscription_update_confirm][items][0][price]": targetPriceId,
    });

    const portalData = await portalRes.json();
    if (portalData?.error) {
      return jsonResponse({ error: portalData.error?.message || "Failed to create Stripe portal session" }, 502);
    }

    return jsonResponse({ url: portalData.url }, 200);
  } catch (e) {
    console.error("create-upgrade-portal-session error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Failed to create upgrade portal session" },
      500
    );
  }
});
