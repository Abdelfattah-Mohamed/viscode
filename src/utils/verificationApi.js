import { getSupabase } from "./supabase";

const DEMO_CODE = "123456";

export { DEMO_CODE };

async function parseInvokeError(error) {
  if (!error) return { message: "Failed to send", demo: true };
  let message = error.message || "Failed to send";
  let demo = true;
  try {
    const status = error.context?.status ?? (error.message && /(\d{3})/.exec(error.message)?.[1]);
    if (String(status) === "503") {
      message = "Email service not configured. Use code 123456 to test.";
      demo = true;
    } else if (String(status) === "404" || /not found|function/i.test(error.message || "")) {
      message = "Verification service not deployed. Deploy Edge Functions or use 123456 to test.";
      demo = true;
    } else if (error.context?.json) {
      const body = await error.context.json();
      if (body?.error) message = body.error;
      if (String(status) === "503" || (body?.error && body.error.includes("not configured"))) demo = true;
    }
  } catch (_) {}
  return { message, demo };
}

export async function sendVerificationCode(email, code) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY when building.", demo: true };
  const { data, error } = await sb.functions.invoke("send-verification-code", {
    body: { email: email.trim().toLowerCase(), code },
  });
  if (error) {
    const { message, demo } = await parseInvokeError(error);
    return { ok: false, error: message, demo };
  }
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
  if (error) {
    let errMsg = "Verification failed.";
    try {
      if (error.context?.json) {
        const body = await error.context.json();
        if (body?.error) errMsg = body.error;
      } else if (error.message) errMsg = error.message;
    } catch (_) {}
    return { ok: false, error: errMsg, demo: false };
  }
  if (data?.ok === true) return { ok: true, demo: false };
  return { ok: false, error: data?.error || "Invalid code", demo: false };
}

export function isDemoCode(code) {
  return String(code).replace(/\D/g, "").slice(0, 6) === DEMO_CODE;
}
