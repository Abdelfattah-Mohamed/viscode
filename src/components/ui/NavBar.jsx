import LogoMark from "./LogoMark";

export default function NavBar({ page, onNavigate, t, themeMode, right, mobile }) {
  const links = [
    { id: "home",     label: "🏠 Home" },
    { id: "problems", label: "📋 Problems" },
  ];

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 0,
      padding: mobile ? "0 10px" : "0 20px", height: 52,
      background: t.surface,
      borderBottom: `1.5px solid ${t.border}`,
      position: "sticky", top: 0, zIndex: 200,
      flexShrink: 0, boxShadow: t.shadow,
    }}>
      {/* Logo */}
      <button
        onClick={() => onNavigate("home")}
        style={{
          display: "flex", alignItems: "center", gap: mobile ? 6 : 10, marginRight: 4,
          background: "none", border: "none", padding: 0, cursor: "pointer",
        }}
      >
        <LogoMark size={mobile ? 30 : 38} darkBorder={themeMode === "dark"} />
        {!mobile && (
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.55rem", fontWeight: 700, color: t.ink }}>
            Vis<span style={{ color: t.blue }}>Code</span>
          </span>
        )}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: t.border, opacity: 0.25, margin: mobile ? "0 6px" : "0 14px" }} />

      {/* Nav links */}
      {links.map(({ id, label }) => {
        const active = page === id;
        return (
          <button key={id} onClick={() => onNavigate(id)}
            style={{
              fontFamily: "'Caveat',cursive", fontSize: mobile ? "0.88rem" : "1rem", fontWeight: 700,
              padding: mobile ? "6px 8px" : "6px 12px", border: "none", borderRadius: 7,
              background: active ? t.surfaceAlt : "transparent",
              color: active ? t.ink : t.inkMuted,
              cursor: "pointer", transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceAlt; e.currentTarget.style.color = t.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? t.surfaceAlt : "transparent"; e.currentTarget.style.color = active ? t.ink : t.inkMuted; }}>
            {label}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Right slot */}
      {right}
    </nav>
  );
}
