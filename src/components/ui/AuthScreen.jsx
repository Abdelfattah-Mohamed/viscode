import { useState, useRef, useEffect } from "react";
import LogoMark from "./LogoMark";

const MIN_PASSWORD_LENGTH = 6;

export default function AuthScreen({ onAuth, t, themeMode }) {
  const [tab, setTab]     = useState("login");
  const [form, setForm]   = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [resetEmail, setResetEmail]       = useState("");
  const [resetCode, setResetCode]         = useState("");
  const [resetPw, setResetPw]             = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");

  const googleButtonRef = useRef(null);
  const [googleButtonMounted, setGoogleButtonMounted] = useState(false);
  const pending     = onAuth.pendingVerification;
  const pendingReset = onAuth.pendingReset;

  useEffect(() => {
    if (onAuth.googleClientId && googleButtonRef.current && !pending?.email && !pendingReset?.email && tab !== "forgot") {
      onAuth.initGoogleButton(googleButtonRef.current, tab === "signup");
    }
  }, [onAuth.googleClientId, onAuth.initGoogleButton, pending?.email, pendingReset?.email, tab, googleButtonMounted]);

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
    else setResetCode("");
  };

  const handleResetVerify = async e => {
    e.preventDefault();
    if (!resetCode.trim()) { setError("Enter the verification code"); return; }
    setError("");
    setBusy(true);
    const res = await onAuth.verifyResetCode(resetCode.trim());
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
    setResetCode("");
    setResetPw("");
    setResetPwConfirm("");
    setTab("login");
  };

  const field = (name, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); setError(""); setSuccessMsg(""); }}
      style={{
        width: "100%", padding: "10px 14px",
        fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem",
        border: `2px solid ${t.border}`, borderRadius: 9,
        background: t.bg, color: t.ink, outline: "none",
        boxSizing: "border-box",
      }}
    />
  );

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem",
    border: `2px solid ${t.border}`, borderRadius: 9,
    background: t.bg, color: t.ink, outline: "none",
    boxSizing: "border-box",
  };

  const codeInputStyle = {
    width: "100%", padding: "12px 14px", textAlign: "center", letterSpacing: 8,
    fontFamily: "'JetBrains Mono',monospace", fontSize: "1.2rem",
    border: `2px solid ${t.border}`, borderRadius: 9,
    background: t.bg, color: t.ink, outline: "none", boxSizing: "border-box",
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
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
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

  /* ── Reset password: enter new password ── */
  if (pendingReset?.codeVerified) {
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
        {btnPrimary("Reset Password", false)}
        {backLink("← Cancel", () => { onAuth.cancelReset(); setError(""); })}
      </form>
    ));
  }

  /* ── Reset password: verify code ── */
  if (pendingReset?.email && !pendingReset.codeVerified) {
    return shell("Verify your email", (
      <>
        {pendingReset.demoHint ? (
          <div style={{ margin: "0 0 16px", padding: "10px 14px", background: t.blue + "15", border: `1.5px solid ${t.blue}44`, borderRadius: 8 }}>
            <p style={{ margin: 0, color: t.ink, fontSize: "0.9rem", fontWeight: 500 }}>
              Enter code <code style={{ background: t.surfaceAlt, padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, letterSpacing: 2 }}>123456</code> to continue.
            </p>
            {pendingReset.sendError && (
              <p style={{ margin: "6px 0 0", color: t.inkMuted, fontSize: "0.78rem" }}>{pendingReset.sendError}</p>
            )}
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", color: t.inkMuted, fontSize: "0.9rem" }}>
              We sent a 6-digit code to <strong style={{ color: t.ink }}>{pendingReset.email}</strong>. Enter it below.
            </p>
            {pendingReset.sendError && (
              <div style={{ margin: "0 0 16px", padding: "8px 12px", background: t.red + "15", border: `1.5px solid ${t.red}44`, borderRadius: 8, color: t.red, fontSize: "0.82rem" }}>
                {pendingReset.sendError}
              </div>
            )}
          </>
        )}
        <form onSubmit={handleResetVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text" inputMode="numeric" maxLength={6} placeholder="000000"
            value={resetCode}
            onChange={e => { setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
            style={codeInputStyle} />
          {errorBox}
          {btnPrimary("Verify", busy)}
          {backLink("← Cancel", () => { onAuth.cancelReset(); setError(""); })}
        </form>
      </>
    ));
  }

  /* ── Signup email verification ── */
  if (pending?.email) {
    return shell("Verify your email", (
      <>
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
                {pending.sendError}
              </div>
            )}
          </>
        )}
        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text" inputMode="numeric" maxLength={6} placeholder="000000"
            value={verifyCode}
            onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
            style={codeInputStyle} />
          {errorBox}
          {btnPrimary("Verify", busy)}
          {backLink("← Back to sign up", onAuth.cancelVerification)}
        </form>
      </>
    ));
  }

  /* ── Forgot password: enter email ── */
  if (tab === "forgot") {
    return shell("Reset password", (
      <form onSubmit={handleResetRequest} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.9rem" }}>
          Enter the email address associated with your account and we'll send you a verification code.
        </p>
        <input type="email" placeholder="Email address" value={resetEmail}
          onChange={e => { setResetEmail(e.target.value); setError(""); }}
          style={inputStyle} />
        {errorBox}
        {btnPrimary("Send Code", busy)}
        {backLink("← Back to sign in", () => { setTab("login"); setError(""); setResetEmail(""); })}
      </form>
    ));
  }

  /* ── Login / Signup ── */
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LogoMark size={56} darkBorder={t._resolved === "dark"} />
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink }}>
            Vis<span style={{ color: t.blue }}>Code</span>
          </span>
          <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.9rem" }}>Learn DSA by seeing it work</p>
        </div>

        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1.5px solid ${t.border}` }}>
            {["login", "signup"].map(id => (
              <button key={id} onClick={() => { setTab(id); setError(""); setSuccessMsg(""); }}
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
            {successMsg && (
              <div style={{ padding: "8px 12px", background: t.green + "22", border: `1.5px solid ${t.green}`, borderRadius: 8, color: t.green, fontSize: "0.85rem" }}>
                {successMsg}
              </div>
            )}

            {field("username", "Username")}
            {tab === "signup" && field("email", "Email", "email")}
            {field("password", "Password", "password")}
            {tab === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(""); }}
                style={inputStyle}
              />
            )}

            {tab === "login" && (
              <div style={{ textAlign: "right", marginTop: -6 }}>
                <button type="button"
                  onClick={() => { setTab("forgot"); setError(""); setSuccessMsg(""); setResetEmail(""); }}
                  style={{ background: "none", border: "none", color: t.blue, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {errorBox}

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

            {onAuth.googleClientId && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: t.border }} />
                  <span style={{ color: t.inkMuted, fontSize: "0.8rem" }}>or sign in with</span>
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
