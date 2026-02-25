export default function GenerateParenthesesViz({ stepState = {}, t }) {
  const { n = 0, open = 0, close = 0, path = "", results = [], done } = stepState;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>n</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{n}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>open</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{open}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>close</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.purple }}>{close}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          current path
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.2em", fontWeight: 700, color: t.yellow, padding: "12px 16px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surface }}>
          {path || "(empty)"}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          results ({results.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflow: "auto" }}>
          {results.length === 0 && (
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>none yet</div>
          )}
          {results.map((r, idx) => (
            <div key={idx} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 600, color: t.green, padding: "6px 10px", border: `2px solid ${t.green}40`, borderRadius: 6 }}>
              "{r}"
            </div>
          ))}
        </div>
      </div>
      {done && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green }}>
          ✅ Total: {results.length} valid combinations
        </div>
      )}
    </div>
  );
}
