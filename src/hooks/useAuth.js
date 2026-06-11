import { useState, useEffect, useRef } from "react";
import { getSupabase, PROFILES_TABLE } from "../utils/supabase";
import { isValidAvatarId } from "../data/avatars";
import { trackEvent } from "../utils/analytics";

const GOOGLE_SCRIPT_ID = "google-gsi-script";

function authEmailRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

function loadGoogleScript() {
  if (document.getElementById(GOOGLE_SCRIPT_ID)) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

function rowToProfile(row) {
  if (!row) return null;
  const avatarUrl = row.avatar_url;
  const isAvatarId = typeof avatarUrl === "string" && avatarUrl.startsWith("avatar:");
  const parsedAvatarId = isAvatarId ? parseInt(avatarUrl.slice(7), 10) : undefined;
  const validAvatarId = isValidAvatarId(parsedAvatarId);
  return {
    username: row.username,
    email: row.email ?? undefined,
    picture: isAvatarId ? undefined : avatarUrl ?? undefined,
    avatarId: validAvatarId ? parsedAvatarId : undefined,
    isGoogle: row.provider === "google",
    isAdmin: !!row.is_admin,
    createdAt: row.created_at,
  };
}

function authUserFallbackProfile(authUser) {
  const meta = authUser.user_metadata || {};
  const username =
    meta.username || meta.name || meta.full_name || authUser.email?.split("@")[0] || "User";
  return {
    username,
    email: authUser.email ?? undefined,
    picture: meta.avatar_url || meta.picture || undefined,
    isGoogle: authUser.app_metadata?.provider === "google",
    isAdmin: false,
    createdAt: authUser.created_at,
  };
}

/** Ensure a profiles row exists for the signed-in auth user; returns the app profile. */
async function loadOrCreateProfile(sb, authUser) {
  const fallback = authUserFallbackProfile(authUser);
  try {
    const { data: row } = await sb
      .from(PROFILES_TABLE)
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (row) return { ...rowToProfile(row), id: authUser.id };

    // First sign-in without DB trigger: create the row (RLS allows inserting own row).
    const insertRow = {
      id: authUser.id,
      email: authUser.email?.toLowerCase() || null,
      username: fallback.username,
      avatar_url: fallback.picture || "avatar:1",
      provider: fallback.isGoogle ? "google" : "email",
    };
    const { data: created } = await sb
      .from(PROFILES_TABLE)
      .upsert(insertRow, { onConflict: "id" })
      .select("*")
      .maybeSingle();
    if (created) return { ...rowToProfile(created), id: authUser.id };
  } catch {
    // Fall through to metadata-only profile.
  }
  return { ...fallback, id: authUser.id, avatarId: fallback.avatarId ?? 1 };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [pendingReset, setPendingReset] = useState(null);
  const userRef = useRef(null);
  userRef.current = user;

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const hydrate = async (session) => {
      if (cancelled) return;
      if (!session?.user) {
        // Keep guest sessions; clear signed-in users.
        if (!userRef.current?.isGuest) setUser(null);
        setLoading(false);
        return;
      }
      const profile = await loadOrCreateProfile(sb, session.user);
      if (!cancelled) {
        setUser(profile);
        setPendingVerification(null);
        setLoading(false);
      }
    };

    sb.auth.getSession().then(({ data }) => hydrate(data?.session));

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPendingReset({ recovery: true });
        setLoading(false);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        hydrate(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const signup = async (username, email, password) => {
    const sb = getSupabase();
    if (!sb) return { error: "Cloud auth is not configured. Continue as guest instead." };
    const normalizedEmail = email.trim().toLowerCase();
    trackEvent("signup_started", { method: "email" });

    const { data, error } = await sb.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: authEmailRedirectTo(),
      },
    });
    if (error) {
      if (/already registered/i.test(error.message)) return { error: "Email already registered" };
      return { error: error.message };
    }

    if (data?.session) {
      // Email confirmation disabled in project settings — signed in immediately.
      trackEvent("signup_completed", { method: "email" });
      return { ok: true };
    }

    // Confirmation email sent by Supabase Auth.
    setPendingVerification({ email: normalizedEmail });
    return { ok: true, needVerification: true, email: normalizedEmail };
  };

  const resendConfirmation = async () => {
    const sb = getSupabase();
    if (!sb || !pendingVerification?.email) return { error: "Nothing to resend" };
    const { error } = await sb.auth.resend({
      type: "signup",
      email: pendingVerification.email,
      options: { emailRedirectTo: authEmailRedirectTo() },
    });
    if (error) return { error: error.message };
    return { ok: true };
  };

  const cancelVerification = () => setPendingVerification(null);

  const login = async (email, password) => {
    const sb = getSupabase();
    if (!sb) return { error: "Cloud auth is not configured. Continue as guest instead." };
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        setPendingVerification({ email: email.trim().toLowerCase() });
        return { error: "Please confirm your email first — check your inbox." };
      }
      if (/invalid login credentials/i.test(error.message)) {
        return { error: "Incorrect email or password" };
      }
      return { error: error.message };
    }
    if (data?.user) trackEvent("login_succeeded", { method: "password" });
    return { ok: true };
  };

  const logout = async () => {
    const sb = getSupabase();
    setUser(null);
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch {
        // Session already gone.
      }
    }
  };

  const loginAsGuest = () => {
    setUser({ username: "Guest", isGuest: true });
    trackEvent("login_guest");
  };

  const googleClientId =
    typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = async (credential) => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.auth.signInWithIdToken({
      provider: "google",
      token: credential,
    });
    if (!error) trackEvent("signup_completed", { method: "google" });
  };

  const initGoogleButton = (containerEl, isSignUp = false) => {
    if (!googleClientId || !containerEl) return;
    loadGoogleScript().then(() => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res) => res.credential && handleGoogleCredential(res.credential),
          auto_select: false,
        });
        containerEl.innerHTML = "";
        window.google.accounts.id.renderButton(containerEl, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: isSignUp ? "signup_with" : "signin_with",
          width: 320,
        });
      } catch {
        // GIS unavailable — email auth still works.
      }
    });
  };

  const updateProfile = async (updates) => {
    const current = userRef.current;
    if (!current || current.isGuest) return;
    const next = { ...current, ...updates };
    if (Object.prototype.hasOwnProperty.call(updates, "avatarId")) {
      // Choosing an in-app avatar should take precedence over a stale remote image URL.
      next.picture = undefined;
    }
    setUser(next);

    const sb = getSupabase();
    if (!sb || !current.id) return;
    const row = { updated_at: new Date().toISOString() };
    if (updates.username) row.username = updates.username;
    if (Object.prototype.hasOwnProperty.call(updates, "avatarId") && isValidAvatarId(updates.avatarId)) {
      row.avatar_url = `avatar:${updates.avatarId}`;
    }
    try {
      await sb.from(PROFILES_TABLE).update(row).eq("id", current.id);
    } catch {
      // Profile update is best-effort; local state already reflects the change.
    }
  };

  const deleteAccount = async (currentUser) => {
    if (!currentUser) return { error: "Not signed in" };
    if (currentUser.isGuest) {
      setUser(null);
      return { ok: true };
    }
    const sb = getSupabase();
    if (!sb) return { error: "Cloud auth is not configured" };
    try {
      // Edge Function deletes the auth user (and profiles row via cascade).
      const { data, error } = await sb.functions.invoke("delete-account", { body: {} });
      if (error || data?.error) {
        // Fallback: remove the profile row; auth user removal requires the function.
        if (currentUser.id) {
          await sb.from(PROFILES_TABLE).delete().eq("id", currentUser.id);
        }
      }
      await sb.auth.signOut();
    } catch {
      return { error: "Failed to delete account" };
    }
    setUser(null);
    return { ok: true };
  };

  const requestPasswordReset = async (email) => {
    const sb = getSupabase();
    if (!sb) return { error: "Cloud auth is not configured" };
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await sb.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    setPendingReset({ email: normalizedEmail, linkSent: true });
    return { ok: true };
  };

  const confirmPasswordReset = async (newPassword) => {
    const sb = getSupabase();
    if (!sb) return { error: "Cloud auth is not configured" };
    if (!pendingReset?.recovery) return { error: "Open the reset link from your email first" };
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    setPendingReset(null);
    return { ok: true };
  };

  const cancelReset = () => setPendingReset(null);

  return {
    user,
    loading,
    signup,
    resendConfirmation,
    cancelVerification,
    pendingVerification,
    login,
    logout,
    loginAsGuest,
    googleClientId,
    initGoogleButton,
    updateProfile,
    deleteAccount,
    pendingReset,
    requestPasswordReset,
    confirmPasswordReset,
    cancelReset,
  };
}
