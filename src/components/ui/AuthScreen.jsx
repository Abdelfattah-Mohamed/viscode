import { useState } from "react";
import LogoMark from "./LogoMark";

const MIN_PASSWORD_LENGTH = 6;

export default function AuthScreen({ onAuth, t, themeMode }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const pending = onAuth.pendingVerification;

  const handle = async e => {
    e.preventDefault();
    setError("");
    if (tab === "login") {
      if (!form.username.trim() || !form.password) { setError("Username and password required"); return; }
      setBusy(true);
      const res = await onAuth.login(form.username.trim(), form.password);
      setBusy(false);
      if (res.error) setError(res.error);
      return;
    }
    if (!form.username.trim()) { setError("Username required"); return; }
    if (!form.email.trim()) { setError("Email required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) { setError("Enter a valid email"); return; }
    if (form.password.length < MIN_PASSWORD_LENGTH) { setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setBusy(true);
    const res = await onAuth.signup(form.username.trim(), form.email.trim(), form.password);
    setBusy(false);
    if (res.error) setError(res.error);
    if (res.needVerification) setVerifyCode("");
  };

  const handleVerify = async e => {
    e.preventDefault();
    if (!verifyCode.trim()) { setError("Enter the verification code"); return; }
    setError("");
    setBusy(true);
    const res = await onAuth.verifyEmail(verifyCode.trim());
    setBusy(false);
    if (res.error) setError(res.error);
  };

  const field = (name, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); setError(""); }}
      style={{
        width: "100%", padding: "10px 14px",
        fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem",
        border: `2px solid ${t.border}`, borderRadius: 9,
        background: t.bg, color: t.ink, outline: "none",
        boxSizing: "border-box",
      }}
    />
  );

  if (pending?.email) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>
        <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <LogoMark size={48} darkBorder={themeMode === "dark"} />
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.6rem", fontWeight: 700, color: t.ink }}>Verify your email</span>
          </div>
          <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, padding: 24 }}>
            {pending.demoHint ? (
              <div style={{ margin: "0 0 16px", padding: "10px 14px", background: t.blue + "15", border: `1.5px solid ${t.blue}44`, borderRadius: 8 }}>
                <p style={{ margin: 0, color: t.ink, fontSize: "0.9rem", fontWeight: 500 }}>
                  Enter code <code style={{ background: t.surfaceAlt, padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, letterSpacing: 2 }}>123456</code> to continue.
                </p>
                {pending.sendError && (
                  <p style={{ margin: "6px 0 0", color: t.inkMuted, fontSize: "0.78rem" }}>{pending.sendError}</p>
                )}
              </div>
            ) : (
              <>
                <p style={{ margin: "0 0 12px", color: t.inkMuted, fontSize: "0.9rem" }}>
                  We sent a 6-digit code to <strong style={{ color: t.ink }}>{pending.email}</strong>. Enter it below.
                </p>
                {pending.sendError && (
                  <div style={{ margin: "0 0 16px", padding: "8px 12px", background: t.red + "15", border: `1.5px solid ${t.red}44`, borderRadius: 8, color: t.red, fontSize: "0.82rem" }}>
                    ⚠️ {pending.sendError}
                  </div>
                )}
              </>
            )}
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                style={{
                  width: "100%", padding: "12px 14px", textAlign: "center", letterSpacing: 8,
                  fontFamily: "'JetBrains Mono',monospace", fontSize: "1.2rem",
                  border: `2px solid ${t.border}`, borderRadius: 9,
                  background: t.bg, color: t.ink, outline: "none", boxSizing: "border-box",
                }}
              />
              {error && (
                <div style={{ padding: "8px 12px", background: t.red + "22", border: `1.5px solid ${t.red}`, borderRadius: 8, color: t.red, fontSize: "0.85rem" }}>{error}</div>
              )}
              <button type="submit" disabled={busy}
                style={{
                  padding: "11px 0", width: "100%",
                  fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
                  border: `2px solid ${t.border}`, borderRadius: 9,
                  background: t.ink, color: t.yellow, cursor: busy ? "wait" : "pointer",
                  boxShadow: t.shadowSm, opacity: busy ? 0.7 : 1,
                }}>
                {busy ? "…" : "Verify"}
              </button>
              <button type="button" onClick={onAuth.cancelVerification}
                style={{
                  background: "none", border: "none", color: t.inkMuted, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline",
                }}>
                ← Back to sign up
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LogoMark size={56} darkBorder={themeMode === "dark"} />
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink }}>
            Vis<span style={{ color: t.blue }}>Code</span>
          </span>
          <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.9rem" }}>Learn DSA by seeing it work</p>
        </div>

        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1.5px solid ${t.border}` }}>
            {["login", "signup"].map(id => (
              <button key={id} onClick={() => { setTab(id); setError(""); }}
                style={{
                  flex: 1, padding: "13px 0",
                  fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
                  border: "none", cursor: "pointer", background: "transparent",
                  color: tab === id ? t.ink : t.inkMuted,
                  borderBottom: tab === id ? `3px solid ${t.yellow}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                {id === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handle} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {field("username", "Username")}
            {tab === "signup" && field("email", "Email", "email")}
            {field("password", "Password", "password")}
            {tab === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(""); }}
                style={{
                  width: "100%", padding: "10px 14px",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem",
                  border: `2px solid ${t.border}`, borderRadius: 9,
                  background: t.bg, color: t.ink, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}

            {error && (
              <div style={{ padding: "8px 12px", background: t.red + "22", border: `1.5px solid ${t.red}`, borderRadius: 8, color: t.red, fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy}
              style={{
                padding: "11px 0", width: "100%",
                fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700,
                border: `2px solid ${t.border}`, borderRadius: 9,
                background: t.ink, color: t.yellow,
                cursor: busy ? "wait" : "pointer",
                boxShadow: t.shadowSm, transition: "opacity 0.15s",
                opacity: busy ? 0.7 : 1,
              }}>
              {busy ? "…" : tab === "login" ? "Sign In" : "Create Account"}
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ color: t.inkMuted, fontSize: "0.85rem" }}>or </span>
              <button type="button" onClick={onAuth.loginAsGuest}
                style={{ background: "none", border: "none", color: t.blue, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                continue as guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
