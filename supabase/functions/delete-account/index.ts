import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

async function cancelStripeSubscription(subscriptionId: string) {
  const res = await fetch(`${STRIPE_API_BASE}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const data = await res.json();
  if (data?.error && data.error?.code !== "resource_missing") {
    return data.error?.message || "Failed to cancel Stripe subscription";
  }
  return null;
}

async function deleteEmailScopedRows(admin: ReturnType<typeof createClient>, email: string) {
  for (const table of ["user_problem_notes", "user_problem_flags"]) {
    const { error } = await admin.from(table).delete().eq("email", email);
    if (error) throw error;
  }
}

/** Core deletion order for a verified user id — Stripe cancel before Auth delete. */
export async function deleteAccountForUser(
  admin: ReturnType<typeof createClient>,
  user: { id: string; email?: string | null },
) {
  const { data: subRow, error: subError } = await admin
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (subError) {
    return { error: "Failed to verify billing state", status: 500 };
  }
  if (subRow?.stripe_subscription_id) {
    if (!STRIPE_SECRET_KEY) {
      return { error: "Stripe is not configured (STRIPE_SECRET_KEY missing)", status: 503 };
    }
    const stripeError = await cancelStripeSubscription(subRow.stripe_subscription_id);
    if (stripeError) {
      return { error: stripeError, status: 502 };
    }
  }

  const normalizedEmail = user.email?.trim().toLowerCase();
  if (normalizedEmail) {
    await deleteEmailScopedRows(admin, normalizedEmail);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return { error: "Failed to delete account", status: 500 };
  }
  return { ok: true as const };
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
    const result = await deleteAccountForUser(admin, userData.user);
    if ("error" in result && result.error) {
      console.error("delete-account error:", result.error);
      return jsonResponse({ error: result.error }, result.status || 500);
    }
    // profiles row (and dependent rows) are removed via ON DELETE CASCADE.
    return jsonResponse({ ok: true }, 200);
  } catch (e) {
    console.error("delete-account exception:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Failed" }, 500);
  }
});
