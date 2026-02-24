import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("vc:session");
        if (raw) setUser(JSON.parse(raw));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const signup = async (username, password) => {
    try {
      const existing = localStorage.getItem(`vc:user:${username}`);
      if (existing) return { error: "Username already taken" };
    } catch (_) {}
    const profile = { username, createdAt: new Date().toISOString() };
    localStorage.setItem(`vc:user:${username}`, JSON.stringify({ password, profile }));
    localStorage.setItem("vc:session", JSON.stringify(profile));
    setUser(profile);
    return { ok: true };
  };

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

  return { user, loading, signup, login, logout, loginAsGuest };
}
