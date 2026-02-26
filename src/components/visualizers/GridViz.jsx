export default function GridViz({ stepState = {}, input, problemId, t }) {
  const { grid = [], visited = [], current = null, islandCount, maxArea, currentArea, done, pacific = [], atlantic = [], result = [], phase } = stepState;
  const isPacificAtlantic = problemId === "pacific-atlantic" && (pacific.length > 0 || atlantic.length > 0);
  const isDark = t._resolved === "dark";
  const water = isDark ? "#1e3a5f" : "#bae6fd";
  const land = isDark ? "#374151" : "#d1d5db";
  const visitedLand = isDark ? "#065f46" : "#6ee7b7";
  const currentBorder = "#ea580c";
  const cellSize = 36;
  const gap = 4;
  const pacificColor = isDark ? "rgba(59, 130, 246, 0.5)" : "rgba(96, 165, 250, 0.45)";
  const atlanticColor = isDark ? "rgba(249, 115, 22, 0.5)" : "rgba(251, 146, 60, 0.5)";
  const bothColor = isDark ? "#059669" : "#10b981";

  if (!grid.length || !grid[0].length) {
    return (
      <div style={{ padding: 12, color: t.inkMuted, fontFamily: "'Caveat',cursive" }}>
        No grid to display. Provide grid and rows.
      </div>
    );
  }

  const R = grid.length;
  const C = grid[0].length;
  const isResultCell = (r, c) => result.some(([a, b]) => a === r && b === c);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {isPacificAtlantic && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: pacificColor, border: "1px solid #3b82f6" }} /> Pacific</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: atlanticColor, border: "1px solid #f97316" }} /> Atlantic</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: bothColor }} /> Both ({result?.length ?? 0})</span>
        </div>
      )}
      {(islandCount != null || maxArea != null) && !isPacificAtlantic && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'Caveat',cursive", fontSize: "1.05em", color: t.inkMuted }}>
          {islandCount != null && <span><strong>Islands:</strong> {islandCount}</span>}
          {maxArea != null && <span><strong>Max area:</strong> {maxArea}</span>}
          {currentArea != null && currentArea > 0 && <span><strong>Current area:</strong> {currentArea}</span>}
        </div>
      )}
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${C}, ${cellSize}px)`,
          gap,
          padding: 8,
          background: isDark ? "#111827" : "#f3f4f6",
          borderRadius: 8,
        }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isVisited = !isPacificAtlantic && visited[r] && visited[r][c];
            const isCurrent = current && current[0] === r && current[1] === c;
            const toBoth = isPacificAtlantic && isResultCell(r, c);
            const toPac = isPacificAtlantic && pacific[r] && pacific[r][c];
            const toAtl = isPacificAtlantic && atlantic[r] && atlantic[r][c];
            let bg = land;
            if (val === 0 && !isPacificAtlantic) bg = water;
            else if (isPacificAtlantic) {
              if (toBoth) bg = bothColor;
              else if (toPac && toAtl) bg = bothColor;
              else if (toPac) bg = pacificColor;
              else if (toAtl) bg = atlanticColor;
            } else if (isVisited) bg = visitedLand;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: bg,
                  border: `2px solid ${isCurrent ? currentBorder : "transparent"}`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: val === 0 && !isPacificAtlantic ? (isDark ? "#93c5fd" : "#0369a1") : (isDark ? "#d1d5db" : "#1f2937"),
                }}
              >
                {val}
              </div>
            );
          })
        )}
      </div>
      {isPacificAtlantic && result && result.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${bothColor}`, background: bothColor + "22" }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.ink, marginBottom: 6 }}>
            Answer — cells that flow to both oceans
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.ink, display: "flex", flexWrap: "wrap", gap: "6px 10px" }}>
            {result.map(([r, c], i) => (
              <span key={i} style={{ padding: "2px 8px", background: t.surfaceAlt, borderRadius: 6, border: `1px solid ${t.border}` }}>
                [{r},{c}]
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
