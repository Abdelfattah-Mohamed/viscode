export default function ThemeToggle({ mode, setMode, t }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
      <select value={mode} onChange={e => setMode(e.target.value)}
        style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600,
          padding: "4px 28px 4px 10px",
          border: `2px solid ${t.border}`, borderRadius: 7,
          background: t.surface, color: t.ink,
          cursor: "pointer", boxShadow: t.shadowSm,
          appearance: "none", WebkitAppearance: "none", outline: "none", minWidth: 100,
        }}>
        <option value="light">☀️  Light</option>
        <option value="dark">🌙  Dark</option>
        <option value="system">💻  System</option>
      </select>
      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.6rem", color: t.ink, opacity: 0.6 }}>▼</span>
    </div>
  );
}
