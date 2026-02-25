import { useState, useEffect } from "react";
import { getSupabase, PROFILES_TABLE } from "../utils/supabase";
import { sendVerificationCode, verifyCodeWithApi, isDemoCode } from "../utils/verificationApi";

const VERIFICATION_CODE_LENGTH = 6;

function generateCode() {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
}

function profileToRow(profile) {
  const now = new Date().toISOString();
  const avatarUrl = profile.picture || (profile.avatarId ? `avatar:${profile.avatarId}` : null);
  return {
    email: profile.email || null,
    username: profile.username || "User",
    avatar_url: avatarUrl,
    provider: profile.isGoogle ? "google" : "email",
    google_sub: profile.sub || null,
    updated_at: now,
  };
}

function rowToProfile(row) {
  if (!row) return null;
  const avatarUrl = row.avatar_url;
  const isAvatarId = typeof avatarUrl === "string" && avatarUrl.startsWith("avatar:");
  return {
    username: row.username,
    email: row.email ?? undefined,
    picture: isAvatarId ? undefined : avatarUrl ?? undefined,
    avatarId: isAvatarId ? parseInt(avatarUrl.slice(7), 10) : undefined,
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
    setPendingVerification({
      username,
      email: normalizedEmail,
      password,
      code,
      demoHint: sendResult.demo,
      sendError: sendResult.ok ? null : sendResult.error,
    });
    return {
      ok: true,
      needVerification: true,
      email: email.trim(),
      sendFailed: !sendResult.ok,
      demoHint: sendResult.demo,
      sendError: sendResult.error,
    };
  };

  const verifyEmail = async (code) => {
    if (!pendingVerification) return { error: "No pending verification" };
    const normalized = String(code).replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
    const apiResult = await verifyCodeWithApi(pendingVerification.email, normalized);
    const accepted = apiResult.ok || (isDemoCode(normalized) && (apiResult.demo || !getSupabase()));
    if (!accepted) return { error: apiResult.error || "Invalid or expired code" };
    const { username, email, password } = pendingVerification;
    const profile = { username, email, createdAt: new Date().toISOString(), avatarId: 1 };
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

  const updateProfile = (updates) => {
    if (!user) return;
    const next = { ...user, ...updates };
    setUser(next);
    try {
      localStorage.setItem("vc:session", JSON.stringify(next));
      if (user.username && !user.isGuest) {
        const raw = localStorage.getItem(`vc:user:${user.username}`);
        if (raw) {
          const data = JSON.parse(raw);
          data.profile = next;
          localStorage.setItem(`vc:user:${user.username}`, JSON.stringify(data));
        }
      }
      upsertProfile(next);
    } catch (_) {}
  };

  const deleteAccount = async (currentUser) => {
    if (!currentUser) return { error: "Not signed in" };
    if (currentUser.isGuest) {
      logout();
      return { ok: true };
    }
    const username = currentUser.username;
    const email = currentUser.email ? currentUser.email.toLowerCase() : null;
    try {
      const sb = getSupabase();
      if (sb && email) {
        await sb.from(PROFILES_TABLE).delete().eq("email", email);
      }
      if (email) localStorage.removeItem(`vc:email:${email}`);
      localStorage.removeItem(`vc:user:${username}`);
      localStorage.removeItem("vc:session");
    } catch (e) {
      return { error: "Failed to delete account" };
    }
    setUser(null);
    return { ok: true };
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
    updateProfile,
    deleteAccount,
  };
}
