import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { email, code } = (await req.json()) as { email?: string; code?: string };
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedCode = typeof code === "string" ? code.replace(/\D/g, "").slice(0, 6) : "";

    if (!normalizedEmail || !normalizedCode) {
      return jsonResponse({ ok: false, error: "Email and code required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: row, error: fetchError } = await supabase
      .from("verification_codes")
      .select("code, expires_at")
      .eq("email", normalizedEmail)
      .single();

    if (fetchError || !row) {
      return jsonResponse({ ok: false, error: "Invalid or expired code" }, 400);
    }
    if (row.code !== normalizedCode) {
      return jsonResponse({ ok: false, error: "Invalid or expired code" }, 400);
    }
    if (new Date(row.expires_at) <= new Date()) {
      await supabase.from("verification_codes").delete().eq("email", normalizedEmail);
      return jsonResponse({ ok: false, error: "Code expired" }, 400);
    }

    await supabase.from("verification_codes").delete().eq("email", normalizedEmail);
    return jsonResponse({ ok: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ ok: false, error: "Server error" }, 500);
  }
});
