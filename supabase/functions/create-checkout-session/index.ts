import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_PRO_MONTHLY = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
const STRIPE_PRICE_PRO_YEARLY = Deno.env.get("STRIPE_PRICE_PRO_YEARLY");
const STRIPE_API_BASE = "https://api.stripe.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function jsonResponse(body: object, status: number, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers },
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

  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_PRO_MONTHLY || !STRIPE_PRICE_PRO_YEARLY) {
    return jsonResponse(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY or price IDs missing)" },
      503
    );
  }

  try {
    const { email, plan_id } = (await req.json()) as { email?: string; plan_id?: string };
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const planId = typeof plan_id === "string" ? plan_id.trim() : "";

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return jsonResponse({ error: "Valid email required" }, 400);
    }
    if (planId !== "pro" && planId !== "pro_yearly") {
      return jsonResponse({ error: "plan_id must be 'pro' or 'pro_yearly'" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError || !profile?.id) {
      return jsonResponse({ error: "Profile not found. Sign up first." }, 404);
    }

    const priceId = planId === "pro_yearly" ? STRIPE_PRICE_PRO_YEARLY : STRIPE_PRICE_PRO_MONTHLY;
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/billing?canceled=true`;

    const sessionRes = await stripePost("/checkout/sessions", {
      mode: "subscription",
      "customer_email": normalizedEmail,
      "client_reference_id": profile.id,
      "metadata[profile_id]": profile.id,
      "metadata[plan_id]": planId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "success_url": successUrl,
      "cancel_url": cancelUrl,
      "subscription_data[metadata][profile_id]": profile.id,
      "subscription_data[metadata][plan_id]": planId,
    });

    const sessionData = await sessionRes.json();
    if (sessionData.error) {
      console.error("Stripe session error:", sessionData);
      return jsonResponse({ error: sessionData.error?.message || "Stripe error" }, 502);
    }
    return jsonResponse({ url: sessionData.url });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Failed to create checkout session" },
      500
    );
  }
});
