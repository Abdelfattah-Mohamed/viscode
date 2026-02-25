import { useState, useEffect, useRef } from "react";
import { useTheme }     from "./hooks/useTheme";
import { useAuth }      from "./hooks/useAuth";
import { useFavorites } from "./hooks/useFavorites";
import { useIsMobile }  from "./hooks/useIsMobile";
import { PROBLEMS }     from "./data/problems";
import AuthScreen   from "./components/ui/AuthScreen";
import HomePage     from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import AppPage      from "./pages/AppPage";
import ProfilePage  from "./pages/ProfilePage";

const DEFAULT_PROBLEM = "two-sum";

export default function App() {
  const [themeMode, setThemeModeRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("vc:theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const setThemeMode = mode => {
    setThemeModeRaw(mode);
    try { localStorage.setItem("vc:theme", mode); } catch {}
  };
  const [page, setPage]                 = useState("home");
  const [selectedProblem, setSelected]  = useState(DEFAULT_PROBLEM);
  const t      = useTheme(themeMode);
  const mobile = useIsMobile();
  const auth   = useAuth();
  const favData = useFavorites(auth.user);
  const fav  = auth.user?.isGuest ? null : favData;
  const prevUser = useRef(null);

  useEffect(() => {
    if (!prevUser.current && auth.user) setPage("home");
    prevUser.current = auth.user;
  }, [auth.user]);

  if (auth.loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, fontFamily: "'Caveat',cursive", fontSize: "1.4rem", color: t.inkMuted }}>
        Loading…
      </div>
    );
  }

  if (!auth.user) {
    return <AuthScreen onAuth={auth} t={t} themeMode={themeMode} />;
  }

  const navigate = dest => setPage(dest);

  const selectProblem = id => {
    if (!PROBLEMS[id]) return;
    setSelected(id);
    setPage("app");
  };

  if (page === "home") {
    return (
      <HomePage
        t={t} themeMode={themeMode} setThemeMode={setThemeMode}
        onNavigate={navigate} onLogout={auth.logout}
        username={auth.user?.username} mobile={mobile}
      />
    );
  }

  if (page === "problems") {
    return (
      <ProblemsPage
        t={t} themeMode={themeMode} setThemeMode={setThemeMode}
        onNavigate={navigate} onSelectProblem={selectProblem}
        onLogout={auth.logout}
        username={auth.user?.username}
        fav={fav} mobile={mobile}
      />
    );
  }

  if (page === "profile") {
    return (
      <ProfilePage
        user={auth.user}
        t={t}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onNavigate={navigate}
        onLogout={auth.logout}
        onUpdateProfile={auth.updateProfile}
        onDeleteAccount={auth.deleteAccount}
        fav={fav}
        onSelectProblem={selectProblem}
        mobile={mobile}
      />
    );
  }

  // "app" page
  return (
    <AppPage
      selectedProblem={selectedProblem}
      setSelectedProblem={id => { if (PROBLEMS[id]) setSelected(id); }}
      t={t} themeMode={themeMode} setThemeMode={setThemeMode}
      onNavigate={navigate}
      onLogout={auth.logout}
      username={auth.user.username}
      fav={fav} mobile={mobile}
    />
  );
}
