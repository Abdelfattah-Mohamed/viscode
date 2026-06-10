import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_BODY_BYTES = 8_192;
const MAX_NAME_LENGTH = 80;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "Payload too large" }, 413);

    const body = JSON.parse(raw) as {
      name?: string;
      type?: string;
      properties?: Record<string, unknown>;
      path?: string;
      ts?: string;
      [key: string]: unknown;
    };

    // Feedback submissions arrive as { type: "feedback", ...record } — keep them too.
    const name = String(body.name || body.type || "").slice(0, MAX_NAME_LENGTH).trim();
    if (!name) return jsonResponse({ error: "name required" }, 400);

    const properties =
      body.properties && typeof body.properties === "object"
        ? body.properties
        : Object.fromEntries(
            Object.entries(body).filter(([k]) => !["name", "type", "path", "ts"].includes(k))
          );

    const clientTs = typeof body.ts === "string" && !Number.isNaN(Date.parse(body.ts)) ? body.ts : null;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await admin.from("analytics_events").insert({
      name,
      properties,
      path: typeof body.path === "string" ? body.path.slice(0, 500) : null,
      client_ts: clientTs,
    });
    if (error) {
      console.error("track-event insert error:", error.message);
      return jsonResponse({ error: "Failed to record event" }, 500);
    }
    return jsonResponse({ ok: true }, 200);
  } catch {
    return jsonResponse({ error: "Invalid payload" }, 400);
  }
});
