import { useState, useEffect } from "react";

const VERIFICATION_CODE_LENGTH = 6;
const DEMO_VERIFICATION_CODE = "123456"; // For demo; in production this would be sent by email

function generateCode() {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
}

export function useAuth() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("vc:session");
        if (raw) setUser(JSON.parse(raw));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const signup = async (username, email, password) => {
    try {
      const existing = localStorage.getItem(`vc:user:${username}`);
      if (existing) return { error: "Username already taken" };
      const existingEmail = localStorage.getItem(`vc:email:${email.toLowerCase()}`);
      if (existingEmail) return { error: "Email already registered" };
    } catch (_) {}
    const code = generateCode();
    setPendingVerification({ username, email: email.trim().toLowerCase(), password, code });
    return { ok: true, needVerification: true, email: email.trim() };
  };

  const verifyEmail = async (code) => {
    if (!pendingVerification) return { error: "No pending verification" };
    const normalized = String(code).replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
    const accepted = normalized === pendingVerification.code || normalized === DEMO_VERIFICATION_CODE;
    if (!accepted) return { error: "Invalid or expired code" };
    const { username, email, password } = pendingVerification;
    const profile = { username, email, createdAt: new Date().toISOString() };
    localStorage.setItem(`vc:user:${username}`, JSON.stringify({ password, profile }));
    localStorage.setItem(`vc:email:${email}`, username);
    localStorage.setItem("vc:session", JSON.stringify(profile));
    setPendingVerification(null);
    setUser(profile);
    return { ok: true };
  };

  const cancelVerification = () => setPendingVerification(null);

  const login = async (username, password) => {
    let data;
    try {
      const raw = localStorage.getItem(`vc:user:${username}`);
      if (!raw) return { error: "User not found" };
      data = JSON.parse(raw);
    } catch (_) { return { error: "User not found" }; }
    if (data.password !== password) return { error: "Incorrect password" };
    localStorage.setItem("vc:session", JSON.stringify(data.profile));
    setUser(data.profile);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("vc:session");
    setUser(null);
  };

  const loginAsGuest = () => {
    setUser({ username: "Guest", isGuest: true });
  };

  const loginWithGoogle = (googlePayload) => {
    if (googlePayload && (googlePayload.email || googlePayload.sub)) {
      const profile = {
        username: googlePayload.name || googlePayload.email?.split("@")[0] || "Google User",
        email: googlePayload.email || null,
        picture: googlePayload.picture || null,
        sub: googlePayload.sub,
        isGoogle: true,
        createdAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem("vc:session", JSON.stringify(profile));
      } catch (_) {}
      setUser(profile);
      return;
    }
    setUser({ username: "Google User", email: "user@gmail.com", isGoogle: true });
  };

  return {
    user,
    loading,
    signup,
    verifyEmail,
    cancelVerification,
    pendingVerification,
    login,
    logout,
    loginAsGuest,
    loginWithGoogle,
  };
}
