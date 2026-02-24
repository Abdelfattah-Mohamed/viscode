export function Card({ children, style = {}, t }) {
  return (
    <div style={{
      background: t.surface,
      border: `1.5px solid ${t.border}`,
      borderRadius: 12,
      boxShadow: t.shadow,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, extra, t }) {
  return (
    <div style={{
      padding: "9px 14px",
      borderBottom: `1.5px solid ${t.border}`,
      fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700,
      display: "flex", alignItems: "center", gap: 7,
      color: t.ink, background: t.surfaceAlt, flexShrink: 0,
    }}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{title}</span>
      {extra}
    </div>
  );
}
