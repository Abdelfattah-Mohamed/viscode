import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_API_BASE = "https://api.stripe.com/v1";

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

  if (!STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Stripe is not configured (STRIPE_SECRET_KEY missing)" }, 503);
  }

  try {
    const { email } = (await req.json()) as { email?: string };
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return jsonResponse({ error: "Valid email required" }, 400);
    }

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
      .select("stripe_subscription_id, cancel_at_period_end")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (subError) return jsonResponse({ error: subError.message }, 500);
    if (!subRow?.stripe_subscription_id) {
      return jsonResponse({ error: "No active recurring subscription found" }, 400);
    }
    if (!subRow.cancel_at_period_end) {
      return jsonResponse({ ok: true }, 200);
    }

    const stripeRes = await stripePost(`/subscriptions/${subRow.stripe_subscription_id}`, {
      cancel_at_period_end: "false",
    });
    const stripeData = await stripeRes.json();
    if (stripeData?.error) {
      return jsonResponse({ error: stripeData.error?.message || "Failed to resume subscription" }, 502);
    }

    await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id);

    return jsonResponse({ ok: true }, 200);
  } catch (e) {
    console.error("resume-subscription error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Failed to resume subscription" },
      500
    );
  }
});
