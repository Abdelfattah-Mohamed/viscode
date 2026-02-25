import { getSupabase } from "./supabase";

const DEMO_CODE = "123456";

export { DEMO_CODE };

export async function sendVerificationCode(email, code) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase not configured", demo: true };
  const { data, error } = await sb.functions.invoke("send-verification-code", {
    body: { email: email.trim().toLowerCase(), code },
  });
  if (error) return { ok: false, error: error.message || "Failed to send", demo: true };
  if (data?.error) {
    const is503 = data.status === 503 || (data.error && data.error.includes("not configured"));
    return { ok: false, error: data.error, demo: is503 };
  }
  return { ok: true };
}

export async function verifyCodeWithApi(email, code) {
  const normalized = String(code).replace(/\D/g, "").slice(0, 6);
  const sb = getSupabase();
  if (!sb) return { ok: normalized === DEMO_CODE, demo: true };
  const { data, error } = await sb.functions.invoke("verify-code", {
    body: { email: email.trim().toLowerCase(), code: normalized },
  });
  if (error) return { ok: false, demo: false };
  if (data?.ok === true) return { ok: true, demo: false };
  return { ok: false, error: data?.error || "Invalid code", demo: false };
}

export function isDemoCode(code) {
  return String(code).replace(/\D/g, "").slice(0, 6) === DEMO_CODE;
}
