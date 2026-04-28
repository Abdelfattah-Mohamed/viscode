export default function TrappingRainWaterViz({ nums = [], stepState = {}, t = {} }) {
  const height = Array.isArray(nums)
    ? nums.map((v) => Number(v)).filter((v) => !Number.isNaN(v))
    : typeof nums === "string"
      ? nums.split(",").map((v) => Number(v.trim())).filter((v) => !Number.isNaN(v))
      : [];

  const n = height.length;
  const { l = 0, r = Math.max(0, n - 1), leftMax = 0, rightMax = 0, water: waterState, waterAt = [], done } = stepState;
  const water = Array.isArray(waterAt) && waterAt.length >= n ? waterAt : Array(n).fill(0);
  const totalWater = Number.isFinite(Number(waterState)) ? Number(waterState) : water.reduce((acc, val) => acc + (Number(val) || 0), 0);

  const isDark = t._resolved === "dark";
  const maxGround = n ? Math.max(1, ...height) : 1;
  const maxWaterColumn = n ? Math.max(0, ...water.map((v) => Number(v) || 0)) : 0;
  const maxBars = Math.max(3, maxGround + maxWaterColumn);
  const cellSize = 22;

  if (n === 0) {
    return (
      <div style={{ padding: 24, color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "1.1rem" }}>
        Enter height array (e.g. 0,1,0,2,1,0,1,3,2,1,2,1)
      </div>
    );
  }

  const groundColor = isDark ? "#374151" : "#1f2937";
  const waterColor = t.blue;
  const pointerBorder = t.yellow;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          l={l}, r={r}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          leftMax={leftMax}, rightMax={rightMax}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.green}`, borderRadius: 10, background: t.green + "14", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.green, fontWeight: 800 }}>
          trapped water={totalWater}
        </div>
      </div>

      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surface, boxShadow: t.shadowSm, padding: 12, overflowX: "auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.02em", color: t.inkMuted, fontWeight: 900, marginBottom: 8 }}>
          Ground & Trapped Water by Index
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, paddingLeft: 6 }}>
          <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", height: maxBars * cellSize + 18, marginRight: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
            {Array.from({ length: maxBars + 1 }, (_, i) => maxBars - i).map((v) => <span key={v}>{v}</span>)}
          </div>
          {height.map((h, idx) => {
            const w = Number(water[idx]) || 0;
            const isL = idx === l && !done;
            const isR = idx === r && !done;
            const isActive = isL || isR;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${maxBars}, ${cellSize - 2}px)`,
                    gap: 1,
                    padding: 2,
                    border: `2px solid ${isActive ? pointerBorder : "transparent"}`,
                    borderRadius: 8,
                    background: isActive ? pointerBorder + "14" : "transparent",
                  }}
                >
                  {Array.from({ length: maxBars }, (_, rowIdx) => {
                    const level = maxBars - rowIdx;
                    const isGround = level <= h;
                    const isWater = !isGround && level <= h + w;
                    return (
                      <div
                        key={`${idx}-${rowIdx}`}
                        style={{
                          width: cellSize - 2,
                          height: cellSize - 2,
                          borderRadius: 2,
                          border: `1px solid ${isGround ? t.border : isWater ? waterColor + "99" : "transparent"}`,
                          background: isGround ? groundColor : isWater ? waterColor + "99" : "transparent",
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: isL ? t.blue : isR ? t.purple : t.inkMuted, fontWeight: isActive ? 800 : 600 }}>
                  {idx}{isL ? " L" : isR ? " R" : ""}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: t.inkMuted }}>
                  h={h}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: groundColor, border: `1px solid ${groundColor}` }} />
          ground height
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: waterColor, border: `1px solid ${waterColor}` }} />
          trapped water
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: pointerBorder, border: `1px solid ${pointerBorder}` }} />
          active pointer
        </div>
      </div>

      {done && (
        <div style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${t.green}`, background: t.green + "14", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", fontWeight: 800, color: t.green }}>
          Final trapped water = {totalWater}
        </div>
      )}

      {!done && (
        <div style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          At each step, we move the pointer on the smaller side and use its max boundary (`leftMax` / `rightMax`) to compute trapped water.
        </div>
      )}
    </div>
  );
}
