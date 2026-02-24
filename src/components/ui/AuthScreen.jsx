import { useState } from "react";
import LogoMark from "./LogoMark";

export default function AuthScreen({ onAuth, t, themeMode }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  const handle = async e => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) { setError("Both fields required"); return; }
    setBusy(true); setError("");
    const res = tab === "login"
      ? await onAuth.login(form.username.trim(), form.password)
      : await onAuth.signup(form.username.trim(), form.password);
    setBusy(false);
    if (res.error) setError(res.error);
  };

  const field = (name, placeholder, type = "text") => (
    <input
      type={type} placeholder={placeholder} value={form[name]}
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

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LogoMark size={56} darkBorder={themeMode === "dark"} />
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink }}>
            Vis<span style={{ color: t.blue }}>Code</span>
          </span>
          <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.9rem" }}>Learn DSA by seeing it work</p>
        </div>

        {/* Card */}
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, overflow: "hidden" }}>
          {/* Tabs */}
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

          {/* Form */}
          <form onSubmit={handle} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {field("username", "Username")}
            {field("password", "Password", "password")}

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
