export default function ExplanationPanel({ explanation, t }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "100%", minHeight: 0 }}>
      {explanation.map((block, idx) => (
        <div key={idx} style={{
          padding: "12px 14px",
          border: `1.5px solid ${t.border}`,
          borderRadius: 10,
          background: t.surfaceAlt,
          boxShadow: t.shadowSm,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: "1.2rem" }}>{block.emoji}</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink }}>{block.title}</span>
          </div>
          {block.title === "Step by Step" && typeof block.body === "string" ? (
            <ol style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem",
              lineHeight: 1.7, color: t.inkMuted, margin: 0, paddingLeft: 20,
            }}>
              {block.body.split(/\n+/).filter(Boolean).map((line, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{line.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          ) : (
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem",
              lineHeight: 1.7, color: t.inkMuted, margin: 0, whiteSpace: "pre-line",
            }}>
              {block.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
