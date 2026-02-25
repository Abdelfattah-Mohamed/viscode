import { useState, useEffect, useRef } from "react";
import { useTheme }           from "./hooks/useTheme";
import { useAuth }            from "./hooks/useAuth";
import { useFavorites }       from "./hooks/useFavorites";
import { useIsMobile }        from "./hooks/useIsMobile";
import { useRecentProblems }  from "./hooks/useRecentProblems";
import { PROBLEMS }           from "./data/problems";
import AuthScreen   from "./components/ui/AuthScreen";
import HomePage     from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import AppPage      from "./pages/AppPage";
import ProfilePage  from "./pages/ProfilePage";

const DEFAULT_PROBLEM = "two-sum";

function parseShareUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("p");
    if (pid && PROBLEMS[pid]) {
      const inputRaw = params.get("input");
      const input = inputRaw ? JSON.parse(decodeURIComponent(inputRaw)) : null;
      return { pid, input };
    }
  } catch {}
  return null;
}

function getRouteFromPath(pathname) {
  const path = (pathname || window.location.pathname).replace(/\/$/, "") || "/";
  if (path === "/" || path === "/home") return { page: "home" };
  if (path === "/problems") return { page: "problems" };
  if (path === "/profile") return { page: "profile" };
  const match = path.match(/^\/problem\/(.+)$/);
  if (match && PROBLEMS[match[1]]) return { page: "app", problemId: match[1] };
  return { page: "home" };
}

function pathFor(page, problemId) {
  if (page === "app" && problemId) return `/problem/${problemId}`;
  if (page === "home") return "/";
  if (page === "problems") return "/problems";
  if (page === "profile") return "/profile";
  return "/";
}

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

  const shared = useRef(parseShareUrl());
  const initialRoute = shared.current
    ? { page: "app", problemId: shared.current.pid }
    : getRouteFromPath(window.location.pathname);
  const [page, setPage]                = useState(initialRoute.page);
  const [selectedProblem, setSelected] = useState(initialRoute.problemId || shared.current?.pid || DEFAULT_PROBLEM);
  const [sharedInput, setSharedInput]  = useState(shared.current?.input || null);

  const t      = useTheme(themeMode);
  const mobile = useIsMobile();
  const auth   = useAuth();
  const favData = useFavorites(auth.user);
  const fav  = auth.user?.isGuest ? null : favData;
  const { recent, track } = useRecentProblems();
  const prevUser = useRef(null);

  useEffect(() => {
    if (shared.current) {
      window.history.replaceState({}, "", pathFor("app", shared.current.pid));
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const route = getRouteFromPath(window.location.pathname);
      setPage(route.page);
      if (route.problemId) setSelected(route.problemId);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!prevUser.current && auth.user && !shared.current) setPage("home");
    prevUser.current = auth.user;
  }, [auth.user]);

  const selectProblem = (id) => {
    if (!PROBLEMS[id]) return;
    setSelected(id);
    setSharedInput(null);
    setPage("app");
    track(id);
    window.history.pushState({}, "", pathFor("app", id));
  };

  const navigate = (dest) => {
    setPage(dest);
    window.history.pushState({}, "", pathFor(dest, dest === "app" ? selectedProblem : null));
  };

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

  if (page === "home") {
    return (
      <HomePage
        t={t} themeMode={themeMode} setThemeMode={setThemeMode}
        onNavigate={navigate} onLogout={auth.logout}
        username={auth.user?.username} mobile={mobile}
        recent={recent} onSelectProblem={selectProblem}
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
        recent={recent}
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

  return (
    <AppPage
      selectedProblem={selectedProblem}
      setSelectedProblem={id => { if (PROBLEMS[id]) { setSelected(id); track(id); window.history.pushState({}, "", pathFor("app", id)); } }}
      t={t} themeMode={themeMode} setThemeMode={setThemeMode}
      onNavigate={navigate}
      onLogout={auth.logout}
      user={auth.user}
      username={auth.user.username}
      fav={fav} mobile={mobile}
      sharedInput={sharedInput}
    />
  );
}
