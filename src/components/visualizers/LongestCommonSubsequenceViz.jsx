export default function LongestCommonSubsequenceViz({ stepState = {}, t }) {
  const { t1 = [], t2 = [], dp = [], i, j, done } = stepState;
  const m = (t1 || []).length;
  const n = (t2 || []).length;
  const isDark = t._resolved === "dark";
  const cellSize = 42;
  const gap = 4;

  if (!dp.length || !dp[0].length) {
    return (
      <div style={{ padding: 12, color: t.inkMuted, fontFamily: "'Caveat',cursive" }}>
        Enter two strings (text1 = s, text2 = t).
      </div>
    );
  }

  const rows = dp.length;
  const cols = dp[0].length;
  const activeI = Number.isFinite(i) ? i : -1;
  const activeJ = Number.isFinite(j) ? j : -1;

  const cellBg = (r, c) => {
    if (r === activeI && c === activeJ) return t.yellow + "30";
    if (done && r === rows - 1 && c === cols - 1) return t.green + "30";
    if (r === 0 || c === 0) return isDark ? "#1f2937" : "#e2e8f0";
    return t.surface;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt, padding: "10px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.74rem", color: t.inkMuted }}>
        DP rule: if text1[i-1] == text2[j-1], dp[i][j] = 1 + dp[i-1][j-1], else dp[i][j] = max(dp[i-1][j], dp[i][j-1])
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          text1 length = {m}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          text2 length = {n}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${activeI >= 0 && activeJ >= 0 ? t.yellow : t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: activeI >= 0 && activeJ >= 0 ? t.ink : t.inkMuted }}>
          cursor = [{activeI >= 0 ? activeI : "-"}, {activeJ >= 0 ? activeJ : "-"}]
        </div>
        {done && (
          <div style={{ padding: "8px 11px", border: `1.5px solid ${t.green}`, borderRadius: 10, background: t.green + "14", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.green, fontWeight: 800 }}>
            LCS length = {dp[rows - 1][cols - 1]}
          </div>
        )}
      </div>

      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `${cellSize}px repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `${cellSize}px repeat(${rows}, ${cellSize}px)`,
          gap,
          padding: 12,
          background: t.surface,
          border: `1.5px solid ${t.border}`,
          borderRadius: 14,
          boxShadow: t.shadowSm,
          alignSelf: "flex-start",
        }}
      >
        {/* Corner cell */}
        <div style={{ gridColumn: 1, gridRow: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68em", color: t.inkMuted, fontFamily: "'JetBrains Mono',monospace" }} />
        {/* Column 0 = empty prefix of text2 */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.8em",
            fontWeight: 800,
            color: t.inkMuted,
            background: t.surfaceAlt,
            borderRadius: 8,
          }}
        >
          ∅
        </div>
        {/* Columns 1..n = text2[0] .. text2[n-1] */}
        {t2.map((c, idx) => (
          <div
            key={`h-${idx}`}
            style={{
              gridColumn: idx + 3,
              gridRow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "0.8em",
              fontWeight: 800,
              color: t.ink,
              background: t.surfaceAlt,
              borderRadius: 8,
            }}
          >
            {c}
          </div>
        ))}
        {dp.map((row, r) => (
          <div key={`row-${r}`} style={{ display: "contents" }}>
            <div
              key={`r-${r}`}
              style={{
                gridColumn: 1,
                gridRow: r + 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.8em",
                fontWeight: 800,
                color: t.ink,
                background: t.surfaceAlt,
                borderRadius: 8,
              }}
            >
              {r === 0 ? "∅" : t1[r - 1]}
            </div>
            {row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  gridColumn: c + 2,
                  gridRow: r + 2,
                  width: cellSize,
                  height: cellSize,
                  background: cellBg(r, c),
                  border: `2px solid ${r === activeI && c === activeJ ? t.yellow : done && r === rows - 1 && c === cols - 1 ? t.green + "99" : t.border + "66"}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "0.95em",
                  fontWeight: 800,
                  color: t.ink,
                  boxShadow: r === activeI && c === activeJ ? t.shadowSm : "none",
                }}
              >
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>
      {done && rows > 0 && cols > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Answer: {dp[rows - 1][cols - 1]}
        </div>
      )}
    </div>
  );
}
