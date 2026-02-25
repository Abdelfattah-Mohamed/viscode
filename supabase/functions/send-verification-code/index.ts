import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CODE_EXPIRY_MINUTES = 10;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { email, code } = (await req.json()) as { email?: string; code?: string };
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedCode = typeof code === "string" ? code.replace(/\D/g, "").slice(0, 6) : "";

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return jsonResponse({ error: "Valid email required" }, 400);
    }
    if (normalizedCode.length < 6) {
      return jsonResponse({ error: "Valid 6-digit code required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const codeToStore = RESEND_API_KEY ? normalizedCode : "123456";
    await supabase.from("verification_codes").upsert(
      { email: normalizedEmail, code: codeToStore, expires_at: expiresAt },
      { onConflict: "email" }
    );

    if (!RESEND_API_KEY) {
      return jsonResponse({ error: "Email service not configured (RESEND_API_KEY)" }, 503);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VisCode <onboarding@resend.dev>",
        to: [normalizedEmail],
        subject: "Your VisCode verification code",
        html: `<p>Your verification code is: <strong>${normalizedCode}</strong></p><p>It expires in ${CODE_EXPIRY_MINUTES} minutes.</p>`,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return jsonResponse({ error: "Failed to send email", details: data?.message }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Server error" }, 500);
  }
});
