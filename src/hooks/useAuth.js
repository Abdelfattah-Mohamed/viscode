import { useState, useEffect } from "react";
import { getSupabase, PROFILES_TABLE } from "../utils/supabase";
import { sendVerificationCode, verifyCodeWithApi, isDemoCode } from "../utils/verificationApi";

const VERIFICATION_CODE_LENGTH = 6;

function generateCode() {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
}

function profileToRow(profile) {
  const now = new Date().toISOString();
  return {
    email: profile.email || null,
    username: profile.username || "User",
    avatar_url: profile.picture || null,
    provider: profile.isGoogle ? "google" : "email",
    google_sub: profile.sub || null,
    updated_at: now,
  };
}

function rowToProfile(row) {
  if (!row) return null;
  return {
    username: row.username,
    email: row.email ?? undefined,
    picture: row.avatar_url ?? undefined,
    sub: row.google_sub ?? undefined,
    isGoogle: row.provider === "google",
    createdAt: row.created_at,
  };
}

async function upsertProfile(profile) {
  const sb = getSupabase();
  if (!sb || profile.isGuest) return;
  const row = profileToRow(profile);
  await sb.from(PROFILES_TABLE).upsert(row, { onConflict: "email" });
}

async function fetchProfileFromDb(profile) {
  const sb = getSupabase();
  if (!sb || !profile) return null;
  let row = null;
  if (profile.email) {
    const { data } = await sb.from(PROFILES_TABLE).select("*").eq("email", profile.email).maybeSingle();
    row = data;
  }
  if (!row && profile.sub) {
    const { data } = await sb.from(PROFILES_TABLE).select("*").eq("google_sub", profile.sub).maybeSingle();
    row = data;
  }
  return row ? rowToProfile(row) : null;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [pendingGoogleVerification, setPendingGoogleVerification] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("vc:session");
        if (raw) {
          const local = JSON.parse(raw);
          const fromDb = await fetchProfileFromDb(local);
          setUser(fromDb ? { ...local, ...fromDb } : local);
        }
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
    const normalizedEmail = email.trim().toLowerCase();
    const sendResult = await sendVerificationCode(normalizedEmail, code);
    setPendingVerification({ username, email: normalizedEmail, password, code, demoHint: sendResult.demo });
    return {
      ok: true,
      needVerification: true,
      email: email.trim(),
      sendFailed: !sendResult.ok,
      demoHint: sendResult.demo,
    };
  };

  const verifyEmail = async (code) => {
    if (!pendingVerification) return { error: "No pending verification" };
    const normalized = String(code).replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
    const apiResult = await verifyCodeWithApi(pendingVerification.email, normalized);
    const accepted = apiResult.ok || (isDemoCode(normalized) && (apiResult.demo || !getSupabase()));
    if (!accepted) return { error: apiResult.error || "Invalid or expired code" };
    const { username, email, password } = pendingVerification;
    const profile = { username, email, createdAt: new Date().toISOString() };
    localStorage.setItem(`vc:user:${username}`, JSON.stringify({ password, profile }));
    localStorage.setItem(`vc:email:${email}`, username);
    localStorage.setItem("vc:session", JSON.stringify(profile));
    setPendingVerification(null);
    setUser(profile);
    upsertProfile(profile);
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
    upsertProfile(data.profile);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("vc:session");
    setUser(null);
  };

  const loginAsGuest = () => {
    setUser({ username: "Guest", isGuest: true });
  };

  const startGoogleVerification = async (googlePayload) => {
    if (!googlePayload || (!googlePayload.email && !googlePayload.sub)) {
      setUser({ username: "Google User", email: "user@gmail.com", isGoogle: true });
      return { ok: false };
    }
    const email = googlePayload.email || null;
    if (!email) {
      setUser({
        username: googlePayload.name || "Google User",
        email: null,
        picture: googlePayload.picture || null,
        sub: googlePayload.sub,
        isGoogle: true,
        createdAt: new Date().toISOString(),
      });
      return { ok: false, noEmail: true };
    }
    const code = generateCode();
    const sendResult = await sendVerificationCode(email, code);
    const profile = {
      username: googlePayload.name || email.split("@")[0] || "Google User",
      email,
      picture: googlePayload.picture || null,
      sub: googlePayload.sub,
      isGoogle: true,
      createdAt: new Date().toISOString(),
    };
    setPendingGoogleVerification({ email, profile, demoHint: sendResult.demo });
    return { ok: true, sendFailed: !sendResult.ok, demoHint: sendResult.demo };
  };

  const verifyGoogleCode = async (code) => {
    if (!pendingGoogleVerification) return { error: "No pending verification" };
    const normalized = String(code).replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
    const apiResult = await verifyCodeWithApi(pendingGoogleVerification.email, normalized);
    const accepted = apiResult.ok || (isDemoCode(normalized) && (apiResult.demo || !getSupabase()));
    if (!accepted) return { error: apiResult.error || "Invalid or expired code" };
    const { profile } = pendingGoogleVerification;
    try {
      localStorage.setItem("vc:session", JSON.stringify(profile));
    } catch (_) {}
    setUser(profile);
    upsertProfile(profile);
    setPendingGoogleVerification(null);
    return { ok: true };
  };

  const cancelGoogleVerification = () => setPendingGoogleVerification(null);

  const loginWithGoogle = async (googlePayload) => {
    if (googlePayload && (googlePayload.email || googlePayload.sub)) {
      await startGoogleVerification(googlePayload);
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
    pendingGoogleVerification,
    verifyGoogleCode,
    cancelGoogleVerification,
    startGoogleVerification,
    login,
    logout,
    loginAsGuest,
    loginWithGoogle,
  };
}
