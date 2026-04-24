export default function SectionHeader({
  t,
  title,
  subtitle,
  action = null,
  compact = false,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        ...style,
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "'Caveat',cursive",
            fontSize: compact ? "1.3rem" : "2.4rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              color: t.inkMuted,
              fontSize: compact ? "0.88rem" : "0.95rem",
              margin: compact ? "4px 0 0" : "6px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
