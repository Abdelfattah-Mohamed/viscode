export default function UniquePathsViz({ stepState = {}, t }) {
  const { m = 0, n = 0, dp = [], matrix = [], i = 0, j = 0, done } = stepState;
  const isDark = t._resolved === "dark";
  const rows = matrix.length || m;
  const cols = (matrix[0] || []).length || n;

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
          DP matrix (visualized as 2D grid)
        </div>
        <div style={{ overflowX: "auto", border: `1.5px solid ${t.border}`, borderRadius: 12, background: t.surface, boxShadow: t.shadowSm, padding: 10, width: "fit-content", maxWidth: "100%" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 4 }}>
            <thead>
              <tr>
                <th style={{ width: 30 }} />
                {Array.from({ length: cols }, (_, c) => (
                  <th key={`c-${c}`} style={{ minWidth: 42, height: 20, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 900, color: t.inkMuted }}>
                    c{c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, r) => (
                <tr key={`r-${r}`}>
                  <th style={{ width: 30, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 900, color: t.inkMuted }}>
                    r{r}
                  </th>
                  {Array.from({ length: cols }, (_, c) => {
                    const val = matrix[r]?.[c];
                    const isCurrent = r === i && c === j;
                    const isLeft = r === i && c === j - 1 && j > 0;
                    const isUp = r === i - 1 && c === j && i > 0;
                    const isAnswer = done && r === rows - 1 && c === cols - 1;
                    return (
                      <td
                        key={`${r}-${c}`}
                        style={{
                          minWidth: 42,
                          height: 42,
                          textAlign: "center",
                          border: `2px solid ${isCurrent ? t.yellow : isAnswer ? t.green : isLeft || isUp ? t.blue : t.border + "88"}`,
                          borderRadius: 8,
                          background: isCurrent ? t.yellow + "22" : isAnswer ? t.green + "18" : isLeft || isUp ? t.blue + "12" : (isDark ? "#374151" : "#e5e7eb"),
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: "0.95rem",
                          fontWeight: 800,
                          color: t.ink,
                        }}
                      >
                        {val == null ? "·" : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
