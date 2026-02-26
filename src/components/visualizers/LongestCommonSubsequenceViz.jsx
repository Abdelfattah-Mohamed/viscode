export default function LongestCommonSubsequenceViz({ stepState = {}, t }) {
  const { t1 = [], t2 = [], dp = [], i, j, done } = stepState;
  const m = (t1 || []).length;
  const n = (t2 || []).length;
  const isDark = t._resolved === "dark";
  const cellSize = 40;
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

  const cellBg = (r, c) => {
    if (r === i && c === j) return t.yellow + "35";
    if (done && r === rows - 1 && c === cols - 1) return t.green + "30";
    return isDark ? "#374151" : "#e5e7eb";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>
        dp[i][j] = LCS of text1[0..i] and text2[0..j]
      </div>
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `${cellSize}px repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `${cellSize}px repeat(${rows}, ${cellSize}px)`,
          gap,
          padding: 10,
          background: isDark ? "#111827" : "#f3f4f6",
          borderRadius: 10,
          alignSelf: "flex-start",
        }}
      >
        {/* Corner cell */}
        <div style={{ gridColumn: 1, gridRow: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7em", color: t.inkMuted, fontFamily: "'JetBrains Mono',monospace" }} />
        {/* Column 0 = empty prefix of text2 */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.85em",
            fontWeight: 700,
            color: t.ink,
            background: isDark ? "#1f2937" : "#e5e7eb",
            borderRadius: 6,
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
              fontSize: "0.85em",
              fontWeight: 700,
              color: t.ink,
              background: isDark ? "#1f2937" : "#e5e7eb",
              borderRadius: 6,
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
                fontSize: "0.85em",
                fontWeight: 700,
                color: t.ink,
                background: isDark ? "#1f2937" : "#e5e7eb",
                borderRadius: 6,
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
                  border: `2px solid ${r === i && c === j ? t.yellow : "transparent"}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
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
