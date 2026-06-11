import { useState, useRef, useEffect } from "react";
import LogoMark from "./LogoMark";

const MIN_PASSWORD_LENGTH = 6;

export default function AuthScreen({ onAuth, t, themeMode }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [resetEmail, setResetEmail]       = useState("");
  const [resetPw, setResetPw]             = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");

  const googleButtonRef = useRef(null);
  const [googleButtonMounted, setGoogleButtonMounted] = useState(false);
  const pending     = onAuth.pendingVerification;
  const pendingReset = onAuth.pendingReset;
  const isDark = themeMode === "dark" || t._resolved === "dark";
  const authPageBackground = isDark
    ? `radial-gradient(circle at top left, ${t.blue}24, transparent 32%), radial-gradient(circle at bottom right, ${t.purple}20, transparent 34%), ${t.bg}`
    : `radial-gradient(circle at top left, ${t.yellow}55, transparent 30%), radial-gradient(circle at bottom right, ${t.blue}22, transparent 34%), ${t.bg}`;
  const authCardBackground = isDark
    ? `linear-gradient(145deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)`
    : `linear-gradient(145deg, #fffef9 0%, ${t.surface} 100%)`;
  const featurePanelBackground = isDark
    ? `linear-gradient(160deg, ${t.surfaceAlt} 0%, ${t.surface} 58%, ${t.blue}18 100%)`
    : `linear-gradient(160deg, ${t.surface} 0%, #fff8df 55%, ${t.blue}1a 100%)`;

  useEffect(() => {
    if (onAuth.googleClientId && googleButtonRef.current && !pending?.email && !pendingReset?.email && tab !== "forgot") {
      onAuth.initGoogleButton(googleButtonRef.current, tab === "signup");
    }
  }, [onAuth.googleClientId, onAuth.initGoogleButton, pending?.email, pendingReset?.email, tab, googleButtonMounted]);

  const handle = async e => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tab === "login") {
      if (!form.email.trim() || !form.password) { setError("Email and password required"); return; }
      if (!emailRegex.test(form.email.trim())) { setError("Enter a valid email"); return; }
      setBusy(true);
      const res = await onAuth.login(form.email.trim(), form.password);
      setBusy(false);
      if (res.error) setError(res.error);
      return;
    }
    if (!form.username.trim()) { setError("Username required"); return; }
    if (!form.email.trim()) { setError("Email required"); return; }
    if (!emailRegex.test(form.email.trim())) { setError("Enter a valid email"); return; }
    if (form.password.length < MIN_PASSWORD_LENGTH) { setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setBusy(true);
    const res = await onAuth.signup(form.username.trim(), form.email.trim(), form.password);
    setBusy(false);
    if (res.error) setError(res.error);
  };

  const handleResend = async () => {
    setError("");
    setBusy(true);
    const res = await onAuth.resendConfirmation();
    setBusy(false);
    if (res.error) setError(res.error);
    else setSuccessMsg("Confirmation email re-sent.");
  };

  const handleResetRequest = async e => {
    e.preventDefault();
    setError("");
    if (!resetEmail.trim()) { setError("Email is required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) { setError("Enter a valid email"); return; }
    setBusy(true);
    const res = await onAuth.requestPasswordReset(resetEmail.trim());
    setBusy(false);
    if (res.error) setError(res.error);
  };

  const handleResetConfirm = async e => {
    e.preventDefault();
    setError("");
    if (resetPw.length < MIN_PASSWORD_LENGTH) { setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`); return; }
    if (resetPw !== resetPwConfirm) { setError("Passwords do not match"); return; }
    setBusy(true);
    const res = await onAuth.confirmPasswordReset(resetPw);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    setSuccessMsg("Password updated! You can now sign in.");
    setResetEmail("");
    setResetPw("");
    setResetPwConfirm("");
    setTab("login");
  };

  const inputBaseStyle = {
    width: "100%", padding: "12px 14px",
    fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem",
    border: `1.5px solid ${t.border}`, borderRadius: 12,
    background: isDark ? t.bg : "#fffef9", color: t.ink, outline: "none",
    boxSizing: "border-box",
    boxShadow: isDark ? "none" : "inset 0 1px 0 rgba(255,255,255,0.75)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
  };

  const field = (name, label, type = "text", autoComplete) => (
    <label style={{ display: "grid", gap: 7, color: t.ink, fontSize: "0.84rem", fontWeight: 700 }}>
      {label}
      <input
        type={type}
        placeholder={label}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); setError(""); setSuccessMsg(""); }}
        onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 3px ${t.blue}33`; e.currentTarget.style.borderColor = t.blue; }}
        onBlur={e => { e.currentTarget.style.boxShadow = inputBaseStyle.boxShadow; e.currentTarget.style.borderColor = t.border; }}
        style={inputBaseStyle}
      />
    </label>
  );

  const inputStyle = {
    ...inputBaseStyle,
  };

  const btnPrimary = (label, disabled) => (
    <button type="submit" disabled={disabled}
      style={{
        padding: "11px 0", width: "100%",
        fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
        border: `2px solid ${t.border}`, borderRadius: 9,
        background: t.ink, color: t.yellow, cursor: disabled ? "wait" : "pointer",
        boxShadow: t.shadowSm, opacity: disabled ? 0.7 : 1,
      }}>
      {disabled ? "…" : label}
    </button>
  );

  const backLink = (label, onClick) => (
    <button type="button" onClick={onClick}
      style={{ background: "none", border: "none", color: t.inkMuted, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}>
      {label}
    </button>
  );

  const errorBox = error && (
    <div style={{ padding: "8px 12px", background: t.red + "22", border: `1.5px solid ${t.red}`, borderRadius: 8, color: t.red, fontSize: "0.85rem" }}>
      {error}
    </div>
  );

  const shell = (title, children) => (
    <div style={{ minHeight: "100vh", background: authPageBackground, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <LogoMark size={48} darkBorder={t._resolved === "dark"} />
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.6rem", fontWeight: 700, color: t.ink }}>{title}</span>
        </div>
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );

  /* ── Reset password: arrived from recovery link — enter new password ── */
  if (pendingReset?.recovery) {
    return shell("Set new password", (
      <form onSubmit={handleResetConfirm} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: "0 0 4px", color: t.inkMuted, fontSize: "0.9rem" }}>
          Choose a new password for your account.
        </p>
        <input type="password" placeholder="New password" value={resetPw}
          onChange={e => { setResetPw(e.target.value); setError(""); }}
          style={inputStyle} />
        <input type="password" placeholder="Confirm new password" value={resetPwConfirm}
          onChange={e => { setResetPwConfirm(e.target.value); setError(""); }}
          style={inputStyle} />
        {errorBox}
        {btnPrimary("Reset Password", busy)}
        {backLink("← Cancel", () => { onAuth.cancelReset(); setError(""); })}
      </form>
    ));
  }

  /* ── Reset password: link sent ── */
  if (pendingReset?.linkSent) {
    return shell("Check your email", (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
          We sent a password reset link to <strong style={{ color: t.ink }}>{pendingReset.email}</strong>.
          Open it on this device to choose a new password.
        </p>
        {errorBox}
        {backLink("← Back to sign in", () => { onAuth.cancelReset(); setError(""); setTab("login"); })}
      </div>
    ));
  }

  /* ── Signup email confirmation ── */
  if (pending?.email) {
    return shell("Confirm your email", (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: t.ink }}>{pending.email}</strong>.
          Click the link in the email, then sign in.
        </p>
        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
          Check spam and Promotions. If nothing arrives after a few minutes, the Supabase project
          needs custom SMTP configured (see <code style={{ fontSize: "0.8rem" }}>docs/GO-LIVE.md</code> §2).
        </p>
        {successMsg && (
          <div style={{ padding: "8px 12px", background: t.green + "1f", border: `1.5px solid ${t.green}`, borderRadius: 8, color: t.green, fontSize: "0.85rem", fontWeight: 700 }}>
            {successMsg}
          </div>
        )}
        {errorBox}
        <button type="button" onClick={handleResend} disabled={busy}
          style={{
            padding: "11px 0", width: "100%",
            fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
            border: `2px solid ${t.border}`, borderRadius: 9,
            background: t.surface, color: t.ink, cursor: busy ? "wait" : "pointer",
            boxShadow: t.shadowSm, opacity: busy ? 0.7 : 1,
          }}>
          {busy ? "…" : "Resend confirmation email"}
        </button>
        {backLink("← Back to sign in", () => { onAuth.cancelVerification(); setError(""); setSuccessMsg(""); setTab("login"); })}
      </div>
    ));
  }

  /* ── Forgot password: enter email ── */
  if (tab === "forgot") {
    return shell("Reset password", (
      <form onSubmit={handleResetRequest} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.9rem" }}>
          Enter the email address associated with your account and we'll send you a reset link.
        </p>
        <input type="email" placeholder="Email address" value={resetEmail}
          onChange={e => { setResetEmail(e.target.value); setError(""); }}
          style={inputStyle} />
        {errorBox}
        {btnPrimary("Send Reset Link", busy)}
        {backLink("← Back to sign in", () => { setTab("login"); setError(""); setResetEmail(""); })}
      </form>
    ));
  }

  /* ── Login / Signup ── */
  return (
    <div style={{ minHeight: "100vh", background: authPageBackground, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .auth-shell { grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1fr); }
        @media (max-width: 860px) {
          .auth-shell { grid-template-columns: 1fr; max-width: 480px !important; }
          .auth-feature-panel { display: none !important; }
        }
      `}</style>

      <div className="auth-shell" style={{ width: "100%", maxWidth: 960, display: "grid", border: `1.5px solid ${t.border}`, borderRadius: 28, overflow: "hidden", background: authCardBackground, boxShadow: isDark ? t.shadow : "0 24px 70px rgba(28, 28, 46, 0.18)" }}>
        <aside className="auth-feature-panel" style={{ position: "relative", minHeight: 610, padding: 32, background: featurePanelBackground, borderRight: `1.5px solid ${t.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", right: -72, top: -72, width: 190, height: 190, borderRadius: "50%", background: t.yellow + (isDark ? "18" : "66"), border: `1.5px solid ${t.border}` }} />
          <div aria-hidden="true" style={{ position: "absolute", left: -56, bottom: 88, width: 150, height: 150, borderRadius: 34, transform: "rotate(-10deg)", background: t.blue + "1f", border: `1.5px solid ${t.border}` }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 16, background: t.surface, border: `1.5px solid ${t.border}`, boxShadow: t.shadowSm }}>
              <LogoMark size={36} darkBorder={t._resolved === "dark"} />
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.45rem", fontWeight: 700, color: t.ink }}>
                Vis<span style={{ color: t.blue }}>Code</span>
              </span>
            </div>

            <h1 style={{ margin: "42px 0 14px", color: t.ink, fontFamily: "'Caveat',cursive", fontSize: "clamp(2.45rem, 4vw, 3.65rem)", lineHeight: 0.98, fontWeight: 700 }}>
              Learn algorithms with code you can see.
            </h1>
            <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.98rem", lineHeight: 1.7, maxWidth: 370 }}>
              Sign in to continue your visual practice, revisit recent problems, and keep your DSA progress organized.
            </p>
          </div>

          <div style={{ position: "relative", display: "grid", gap: 12 }}>
            {[
              ["01", "Step-by-step visualizers"],
              ["02", "Synced code explanations"],
              ["03", "Practice notes and progress"],
            ].map(([n, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, background: isDark ? t.bg : "rgba(255,255,255,0.72)", border: `1.25px solid ${t.border}` }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.76rem", fontWeight: 800, color: t.blue }}>{n}</span>
                <span style={{ color: t.ink, fontSize: "0.9rem", fontWeight: 700 }}>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <main style={{ padding: "clamp(24px, 4vw, 42px)", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ margin: "0 0 7px", color: t.ink, fontSize: "1.7rem", lineHeight: 1.18, fontWeight: 800 }}>
                {tab === "login" ? "Sign in to your account" : "Create your VisCode account"}
              </h2>
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
                {tab === "login" ? "Pick up where you left off in your algorithm practice." : "Save your progress and build a repeatable interview practice workflow."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 5, borderRadius: 14, background: isDark ? t.bg : t.surfaceAlt, border: `1.25px solid ${t.border}`, marginBottom: 22 }}>
              {["login", "signup"].map(id => (
                <button key={id} type="button" onClick={() => { setTab(id); setError(""); setSuccessMsg(""); }}
                  style={{
                    padding: "11px 8px",
                    fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", fontWeight: 800,
                    border: `1.25px solid ${tab === id ? t.border : "transparent"}`, borderRadius: 11,
                    cursor: "pointer", background: tab === id ? t.surface : "transparent",
                    color: tab === id ? t.ink : t.inkMuted,
                    boxShadow: tab === id ? t.shadowSm : "none",
                    transition: "all 0.15s",
                  }}>
                  {id === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {successMsg && (
                <div style={{ padding: "10px 12px", background: t.green + "1f", border: `1.5px solid ${t.green}`, borderRadius: 12, color: t.green, fontSize: "0.85rem", fontWeight: 700 }}>
                  {successMsg}
                </div>
              )}

              {tab === "signup" && field("username", "Username", "text", "username")}
              {field("email", "Email address", "email", "email")}
              {field("password", "Password", "password", tab === "login" ? "current-password" : "new-password")}
              {tab === "signup" && (
                <label style={{ display: "grid", gap: 7, color: t.ink, fontSize: "0.84rem", fontWeight: 700 }}>
                  Confirm password
                  <input
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(""); }}
                    onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 3px ${t.blue}33`; e.currentTarget.style.borderColor = t.blue; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = inputBaseStyle.boxShadow; e.currentTarget.style.borderColor = t.border; }}
                    style={inputStyle}
                  />
                </label>
              )}

              {tab === "login" && (
                <div style={{ textAlign: "right", marginTop: -4 }}>
                  <button type="button"
                    onClick={() => { setTab("forgot"); setError(""); setSuccessMsg(""); setResetEmail(""); }}
                    style={{ background: "none", border: "none", color: t.blue, fontSize: "0.84rem", fontWeight: 800, cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {errorBox}

              <button type="submit" disabled={busy}
                style={{
                  padding: "13px 0", width: "100%",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.98rem", fontWeight: 900,
                  border: `1.5px solid ${t.border}`, borderRadius: 13,
                  background: t.ink, color: isDark ? t.bg : t.yellow,
                  cursor: busy ? "wait" : "pointer",
                  boxShadow: t.shadowSm, transition: "opacity 0.15s, transform 0.15s",
                  opacity: busy ? 0.7 : 1,
                }}>
                {busy ? "…" : tab === "login" ? "Sign In" : "Create Account"}
              </button>

              {onAuth.googleClientId && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
                    <div style={{ flex: 1, height: 1, background: t.border }} />
                    <span style={{ color: t.inkMuted, fontSize: "0.78rem", fontWeight: 700 }}>or continue with</span>
                    <div style={{ flex: 1, height: 1, background: t.border }} />
                  </div>
                  <div
                    ref={el => {
                      googleButtonRef.current = el;
                      if (el) setGoogleButtonMounted(true);
                    }}
                    style={{ display: "flex", justifyContent: "center", minHeight: 44 }}
                  />
                </>
              )}

              <div style={{ textAlign: "center", color: t.inkMuted, fontSize: "0.86rem", lineHeight: 1.5 }}>
                Want to explore first?{" "}
                <button type="button" onClick={onAuth.loginAsGuest}
                  style={{ background: "none", border: "none", color: t.blue, fontSize: "0.86rem", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                  Continue as guest
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
