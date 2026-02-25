import { getSupabase } from "./supabase";

const DEMO_CODE = "123456";

export { DEMO_CODE };

/* ── EmailJS (client-side email, no backend needed) ── */

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const emailjsReady     = !!(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_KEY);

async function sendViaEmailJS(email, code) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:  EMAILJS_SERVICE,
      template_id: EMAILJS_TEMPLATE,
      user_id:     EMAILJS_KEY,
      template_params: {
        to_email: email,
        email: email,
        user_email: email,
        to_name: email,
        code,
        app_name: "VisCode",
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (/recipients/i.test(text)) {
      throw new Error(
        'EmailJS template error: open your template on emailjs.com, ' +
        'set the "To Email" field to {{to_email}}, and save.'
      );
    }
    throw new Error(text || "Failed to send email");
  }
}

/* ── Supabase Edge Function helpers ── */

async function parseInvokeError(error) {
  if (!error) return { message: "Failed to send", demo: true };
  let message = error.message || "Failed to send";
  let demo = true;
  try {
    const status = error.context?.status ?? (error.message && /(\d{3})/.exec(error.message)?.[1]);
    if (String(status) === "503") {
      message = "Email service not configured.";
      demo = true;
    } else if (String(status) === "404" || /not found|function/i.test(error.message || "")) {
      message = "Email verification service is not available.";
      demo = true;
    } else if (error.context?.json) {
      const body = await error.context.json();
      if (body?.error) message = body.error;
      if (String(status) === "503" || (body?.error && body.error.includes("not configured"))) demo = true;
    }
  } catch (_) {}
  return { message, demo };
}

/* ── Public API ── */

export async function sendVerificationCode(email, code) {
  // Priority 1: EmailJS — works from the browser, no backend needed
  if (emailjsReady) {
    try {
      await sendViaEmailJS(email, code);
      return { ok: true, clientVerify: true };
    } catch (e) {
      return { ok: false, error: e.message || "Failed to send email", clientVerify: true };
    }
  }

  // Priority 2: Supabase Edge Functions (send-verification-code + Resend)
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No email service configured. Set up EmailJS or Supabase Edge Functions.", demo: true };

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
    const { message, demo } = await parseInvokeError(error);
    return { ok: false, error: message, demo };
  }
  if (data?.ok === true) return { ok: true, demo: false };
  return { ok: false, error: data?.error || "Invalid code", demo: false };
}

export function isDemoCode(code) {
  return String(code).replace(/\D/g, "").slice(0, 6) === DEMO_CODE;
}
