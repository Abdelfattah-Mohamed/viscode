const CARD_DENSITY = {
  compact: { radius: 10, border: 1.25 },
  default: { radius: 12, border: 1.5 },
  spacious: { radius: 14, border: 1.75 },
};

export function Card({ children, style = {}, t, density = "default" }) {
  const d = CARD_DENSITY[density] || CARD_DENSITY.default;
  return (
    <div style={{
      background: t.surface,
      border: `${d.border}px solid ${t.border}`,
      borderRadius: d.radius,
      boxShadow: t.shadow,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

const HEADER_DENSITY = {
  compact: { padding: "8px 12px", size: "0.98rem" },
  default: { padding: "9px 14px", size: "1.05rem" },
  spacious: { padding: "11px 16px", size: "1.12rem" },
};

export function CardHeader({ icon, title, extra, t, density = "default" }) {
  const d = HEADER_DENSITY[density] || HEADER_DENSITY.default;
  return (
    <div style={{
      padding: d.padding,
      borderBottom: `1.5px solid ${t.border}`,
      fontFamily: "'Caveat',cursive", fontSize: d.size, fontWeight: 700,
      display: "flex", alignItems: "center", gap: 7,
      color: t.ink, background: t.surfaceAlt, flexShrink: 0,
    }}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{title}</span>
      {extra}
    </div>
  );
}
