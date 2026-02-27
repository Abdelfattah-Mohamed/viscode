export default function TrappingRainWaterViz({ nums = [], stepState = {}, t = {} }) {
  let height = [];
  if (Array.isArray(nums)) {
    height = nums.map((v) => Number(v)).filter((v) => !isNaN(v));
  } else if (typeof nums === "string") {
    height = nums.split(",").map((v) => Number(v.trim())).filter((v) => !isNaN(v));
  }
  const n = height.length;
  const maxH = n ? Math.max(1, ...height) : 1;

  // Use waterAt from stepState — only show water at cells that have been calculated
  const { l = 0, r = Math.max(0, n - 1), water: waterState, waterAt = [], done } = stepState;
  const water = Array.isArray(waterAt) && waterAt.length >= n ? waterAt : Array(n).fill(0);
  const isDark = t._resolved === "dark";

  if (n === 0) {
    return (
      <div style={{ padding: 24, color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "1.1rem" }}>
        Enter height array (e.g. 0,1,0,2,1,0,1,3,2,1,2,1)
      </div>
    );
  }
  const groundColor = isDark ? "#1f2937" : "#1e1e1e";
  const waterColor = isDark ? "#0ea5e9" : "#38bdf8";
  const cellSize = 28;
  const maxBars = Math.max(maxH, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          <span style={{ color: groundColor, fontWeight: 700 }}>■</span> ground &nbsp; <span style={{ color: waterColor, fontWeight: 700 }}>■</span> water
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, paddingLeft: 28 }}>
          {/* Y-axis */}
          <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", height: maxBars * cellSize + 24, marginRight: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: t.inkMuted }}>
            {Array.from({ length: maxBars + 1 }, (_, i) => maxBars - i).map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          {/* Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, flex: 1, flexWrap: "wrap" }}>
            {height.map((h, idx) => {
              const w = water[idx] || 0;
              const isL = idx === l && !done;
              const isR = idx === r && !done;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ display: "flex", flexDirection: "column-reverse", height: maxBars * cellSize, width: cellSize }}>
                    {/* Ground blocks (black) at bottom */}
                    {Array.from({ length: h }, (_, k) => (
                      <div
                        key={`g-${k}`}
                        style={{
                          width: cellSize - 2,
                          height: cellSize - 2,
                          background: groundColor,
                          border: `1px solid ${isDark ? "#374151" : "#111"}`,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                    {/* Water blocks (blue) above ground */}
                    {Array.from({ length: w }, (_, k) => (
                      <div
                        key={`w-${k}`}
                        style={{
                          width: cellSize - 2,
                          height: cellSize - 2,
                          background: waterColor,
                          border: `1px solid ${isDark ? "#0284c7" : "#0ea5e9"}`,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Caveat',cursive",
                      fontSize: "0.75em",
                      color: isL ? t.blue : isR ? t.purple : t.inkMuted,
                      fontWeight: isL || isR ? 700 : 400,
                    }}
                  >
                    {idx}
                    {isL && " l"}
                    {isR && " r"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>l</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.blue }}>{l}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>r</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.purple }}>{r}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>water</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.green }}>{waterState ?? water.reduce((a, b) => a + b, 0)}</span>
        </div>
        {done && (
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>
            ✅ Answer: {waterState ?? water.reduce((a, b) => a + b, 0)}
          </span>
        )}
      </div>
    </div>
  );
}
