import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deleteAccountForUser } from "../_shared/delete-account.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
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

function stripeDelete(path: string) {
  return fetch(`${STRIPE_API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });
}

async function responseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Not signed in" }, 401);

    // Resolve the caller from their JWT — users can only delete themselves.
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user?.id) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const result = await deleteAccountForUser(userData.user.id, {
      getStripeSubscriptionId: async (userId) => {
        const { data, error } = await admin
          .from("user_subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) {
          console.error("delete-account subscription lookup error:", error);
          return {
            error: "Failed to load billing subscription",
            status: 500,
            stripeSubscriptionId: null,
          };
        }
        return { stripeSubscriptionId: data?.stripe_subscription_id ?? null };
      },
      cancelStripeSubscription: async (stripeSubscriptionId) => {
        if (!STRIPE_SECRET_KEY) {
          return {
            error: "Stripe is not configured (STRIPE_SECRET_KEY missing)",
            status: 503,
          };
        }
        const stripeRes = await stripeDelete(
          `/subscriptions/${encodeURIComponent(stripeSubscriptionId)}`
        );
        const stripeData = await responseJson(stripeRes);
        if (!stripeRes.ok || stripeData?.error) {
          console.error("delete-account Stripe cancellation error:", stripeData);
          return {
            error: stripeData?.error?.message || "Failed to cancel subscription",
            status: 502,
          };
        }
        return {};
      },
      deleteAuthUser: async (userId) => {
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) {
          console.error("delete-account auth delete error:", error);
          return { error: "Failed to delete account", status: 500 };
        }
        return {};
      },
    });

    if ("error" in result) {
      return jsonResponse({ error: result.error }, result.status);
    }
    // profiles row (and dependent rows) are removed via ON DELETE CASCADE.
    return jsonResponse({ ok: true }, 200);
  } catch (e) {
    console.error("delete-account exception:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Failed" }, 500);
  }
});
