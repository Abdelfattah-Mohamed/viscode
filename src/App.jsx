import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useAuth }  from "./hooks/useAuth";
import { PROBLEMS } from "./data/problems";
import AuthScreen   from "./components/ui/AuthScreen";
import HomePage     from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import AppPage      from "./pages/AppPage";

const DEFAULT_PROBLEM = "two-sum";

export default function App() {
  const [themeMode, setThemeMode]       = useState("light");
  const [page, setPage]                 = useState("home");
  const [selectedProblem, setSelected]  = useState(DEFAULT_PROBLEM);
  const t    = useTheme(themeMode);
  const auth = useAuth();

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
    return <HomePage t={t} themeMode={themeMode} setThemeMode={setThemeMode} onNavigate={navigate} />;
  }

  if (page === "problems") {
    return (
      <ProblemsPage
        t={t} themeMode={themeMode} setThemeMode={setThemeMode}
        onNavigate={navigate} onSelectProblem={selectProblem}
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
    />
  );
}
