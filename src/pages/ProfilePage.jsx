import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card } from "../components/ui/Card";

export default function ProfilePage({ user, t, themeMode, setThemeMode, onNavigate, onLogout }) {
  const initial = user?.username?.[0]?.toUpperCase() || "?";
  const accountType = user?.isGuest ? "Guest" : user?.isGoogle ? "Google" : "Email";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      <NavBar
        page="profile"
        onNavigate={onNavigate}
        t={t}
        themeMode={themeMode}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />
            <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700, color: t.inkMuted }}>
              {user?.username}
            </span>
          </div>
        }
      />

      <div style={{ flex: 1, maxWidth: 560, margin: "0 auto", padding: "40px 24px 60px", width: "100%" }}>
        <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "2.2rem", fontWeight: 700, color: t.ink, margin: "0 0 24px" }}>
          Profile
        </h1>

        <Card t={t} style={{ overflow: "hidden" }}>
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, borderBottom: `1.5px solid ${t.border}` }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: t.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "'Caveat',cursive",
                fontSize: "2.2rem",
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.5rem", fontWeight: 700, color: t.ink }}>{user?.username || "—"}</div>
              <div style={{ fontSize: "0.8rem", color: t.inkMuted, marginTop: 4 }}>Account type: {accountType}</div>
            </div>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
              <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 600, color: t.ink }}>
                {user?.username || "—"}
              </div>
            </div>
            {user?.email && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
                <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem", color: t.ink }}>
                  {user.email}
                </div>
              </div>
            )}
            {memberSince && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Member since</label>
                <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontSize: "0.9rem", color: t.ink }}>
                  {memberSince}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate("home")}
            style={{
              padding: "10px 20px",
              fontFamily: "'Caveat',cursive",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: `2px solid ${t.border}`,
              borderRadius: 8,
              background: t.surface,
              color: t.ink,
              cursor: "pointer",
              boxShadow: t.shadowSm,
            }}
          >
            ← Back to Home
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              fontFamily: "'Caveat',cursive",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: `2px solid ${t.red}`,
              borderRadius: 8,
              background: "transparent",
              color: t.red,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
