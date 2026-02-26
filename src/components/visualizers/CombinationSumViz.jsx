export default function CombinationSumViz({ stepState = {}, t }) {
  const { c = [], target = 0, t: remaining = 0, start = 0, path = [], res = [], i: candidateIdx = -1, done } = stepState;
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>target</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{target}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>t (remaining)</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.yellow }}>{remaining}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>start</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{start}</span>
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          candidates
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(c || []).map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 40,
                padding: "8px 10px",
                border: `2px solid ${idx === candidateIdx ? t.yellow : t.border}`,
                borderRadius: 8,
                background: idx === candidateIdx ? t.yellow + "30" : (isDark ? "#374151" : "#e5e7eb"),
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1em",
                fontWeight: 700,
                color: t.ink,
                textAlign: "center",
              }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          path (current combination)
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.yellow, padding: "12px 16px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#1f2937" : t.surface }}>
          {(path || []).length ? `[${path.join(", ")}]` : "[]"}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          res (combinations that sum to target)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflow: "auto" }}>
          {(res || []).length === 0 && (
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>none yet</div>
          )}
          {(res || []).map((r, idx) => (
            <div key={idx} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 600, color: t.green, padding: "8px 12px", border: `2px solid ${t.green}50`, borderRadius: 6, background: t.green + "15" }}>
              [{Array.isArray(r) ? r.join(", ") : r}]
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05em", fontWeight: 800, color: t.green }}>
          Answer: {res?.length ?? 0} combination(s)
        </div>
      )}
    </div>
  );
}
