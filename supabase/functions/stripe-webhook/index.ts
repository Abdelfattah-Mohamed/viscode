import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

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

function planIdFromPriceId(priceId: string): string {
  const monthly = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
  const yearly = Deno.env.get("STRIPE_PRICE_PRO_YEARLY");
  if (priceId === yearly) return "pro_yearly";
  if (priceId === monthly) return "pro";
  return "pro";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
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
        const session = event.data?.object as {
          id?: string;
          mode?: string;
          customer?: string;
          subscription?: string;
          client_reference_id?: string;
          metadata?: { profile_id?: string; plan_id?: string };
        };
        const profileId = session?.metadata?.profile_id || session?.client_reference_id;
        if (!profileId) break;
        const planId = (session.metadata?.plan_id as string) || "pro";
        const isLifetime = planId === "lifetime" || session?.mode === "payment";
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: profileId,
            plan_id: planId,
            status: "active",
            stripe_customer_id: session.customer ?? null,
            stripe_subscription_id: isLifetime ? null : (session.subscription ?? null),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data?.object as {
          id?: string;
          status?: string;
          customer?: string;
          current_period_start?: number;
          current_period_end?: number;
          cancel_at_period_end?: boolean;
          items?: { data?: Array<{ price?: { id?: string } }> };
        };
        if (!sub?.id) break;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const planId = priceId ? planIdFromPriceId(priceId) : "pro";
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
          await supabase
            .from("user_subscriptions")
            .update({
              plan_id: planId,
              status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: !!sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existing.user_id);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data?.object as {
          id?: string;
          customer?: string;
          amount_paid?: number;
          currency?: string;
          status?: string;
          period_start?: number;
          period_end?: number;
        };
        if (!invoice?.id) break;
        const { data: subRow } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", invoice.customer)
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
