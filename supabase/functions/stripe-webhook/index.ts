import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_API_BASE = "https://api.stripe.com/v1";

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyStripeSignature(payload: string, signature: string | null): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET || !signature) return false;
  const [timestamp, v1] = signature.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    if (k === "t") acc[0] = v;
    if (k === "v1") acc[1] = v;
    return acc;
  }, ["", ""] as string[]);
  if (!timestamp || !v1) return false;
  const signed = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === v1;
}

function planIdFromPriceId(priceId: string): string | null {
  const weekly = Deno.env.get("STRIPE_PRICE_PRO_WEEKLY");
  const monthly = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
  const yearly = Deno.env.get("STRIPE_PRICE_PRO_YEARLY");
  const lifetime = Deno.env.get("STRIPE_PRICE_LIFETIME");
  if (lifetime && priceId === lifetime) return "lifetime";
  if (yearly && priceId === yearly) return "pro_yearly";
  if (monthly && priceId === monthly) return "pro";
  if (weekly && priceId === weekly) return "pro_weekly";
  return null;
}

function stripeId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

async function stripeGet(path: string): Promise<Record<string, unknown>> {
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  const res = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data as { error?: { message?: string } })?.error) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ||
      `Stripe API request failed (${res.status})`;
    throw new Error(message);
  }
  return data as Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
    console.error("Stripe webhook is missing required secrets");
    return jsonResponse({ error: "Webhook not configured" }, 503);
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  const ok = await verifyStripeSignature(rawBody, signature);
  if (!ok) {
    return jsonResponse({ error: "Invalid signature" }, 400);
  }

  let event: { type: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const eventSession = event.data?.object as { id?: string };
        if (!eventSession?.id) break;
        // Re-fetch from Stripe so a leaked webhook secret alone cannot forge entitlements.
        const session = (await stripeGet(
          `/checkout/sessions/${encodeURIComponent(eventSession.id)}`
        )) as {
          id?: string;
          status?: string;
          mode?: string;
          customer?: unknown;
          subscription?: unknown;
          client_reference_id?: string;
          metadata?: { profile_id?: string; plan_id?: string };
        };
        if (session.status && session.status !== "complete") break;
        const profileId = session?.metadata?.profile_id || session?.client_reference_id;
        if (!profileId) break;
        const metaPlan = session.metadata?.plan_id as string | undefined;
        const planId =
          metaPlan === "lifetime" ||
          metaPlan === "pro_yearly" ||
          metaPlan === "pro_weekly" ||
          metaPlan === "pro"
            ? metaPlan
            : "pro";
        const isLifetime = planId === "lifetime" || session?.mode === "payment";
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: profileId,
            plan_id: planId,
            status: "active",
            stripe_customer_id: stripeId(session.customer),
            stripe_subscription_id: isLifetime ? null : stripeId(session.subscription),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const eventSub = event.data?.object as { id?: string };
        if (!eventSub?.id) break;
        const sub = (await stripeGet(`/subscriptions/${encodeURIComponent(eventSub.id)}`)) as {
          id?: string;
          status?: string;
          customer?: unknown;
          current_period_start?: number;
          current_period_end?: number;
          cancel_at_period_end?: boolean;
          items?: { data?: Array<{ price?: { id?: string } }> };
        };
        if (!sub?.id) break;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : null;
        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : sub.status === "active" || sub.status === "trialing"
              ? sub.status
              : "past_due";
        const periodStart = sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null;
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        const { data: existing } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();
        if (existing?.user_id) {
          const patch: Record<string, unknown> = {
            status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: !!sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          };
          // Only overwrite plan_id when the Stripe price maps to a known plan.
          if (planId) patch.plan_id = planId;
          await supabase.from("user_subscriptions").update(patch).eq("user_id", existing.user_id);
        }
        break;
      }

      case "invoice.paid": {
        const eventInvoice = event.data?.object as { id?: string };
        if (!eventInvoice?.id) break;
        const invoice = (await stripeGet(`/invoices/${encodeURIComponent(eventInvoice.id)}`)) as {
          id?: string;
          customer?: unknown;
          amount_paid?: number;
          currency?: string;
          status?: string;
          period_start?: number;
          period_end?: number;
        };
        if (!invoice?.id) break;
        const customerId = stripeId(invoice.customer);
        if (!customerId) break;
        const { data: subRow } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (subRow?.user_id) {
          await supabase.from("billing_invoices").insert({
            user_id: subRow.user_id,
            stripe_invoice_id: invoice.id,
            amount_cents: invoice.amount_paid ?? 0,
            currency: (invoice.currency as string) || "usd",
            status: "paid",
            period_start: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : null,
            period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
          });
        }
        break;
      }

      default:
        break;
    }
    return jsonResponse({ received: true }, 200);
  } catch (e) {
    console.error("stripe-webhook error:", e);
    return jsonResponse({ error: "Webhook handler error" }, 500);
  }
});
