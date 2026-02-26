export default function UniquePathsViz({ stepState = {}, t }) {
  const { m = 0, n = 0, dp = [], i = 0, j = 0, done } = stepState;
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>grid</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{m} × {n}</span>
        </div>
        {!done && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.yellow}`, borderRadius: 8, background: t.yellow + "22" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>row i</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.yellow }}>{i}</span>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          dp (current row: paths to each column)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {(dp || []).map((val, idx) => {
            const isCurrent = idx === j;
            const isContrib = idx === j - 1 && j > 0;
            return (
              <div
                key={idx}
                style={{
                  minWidth: 42,
                  padding: "8px 10px",
                  border: `2px solid ${isCurrent ? t.yellow : isContrib ? t.green : t.border}`,
                  borderRadius: 8,
                  background: isCurrent ? t.yellow + "28" : isContrib ? t.green + "22" : (isDark ? "#374151" : "#e5e7eb"),
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
                  textAlign: "center",
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {(dp || []).map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 42, textAlign: "center" }}>j={idx}</span>
          ))}
        </div>
      </div>

      {done && dp.length > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Answer: {dp[dp.length - 1]}
        </div>
      )}
    </div>
  );
}
