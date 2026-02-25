export default function GridViz({ stepState = {}, input, problemId, t }) {
  const { grid = [], visited = [], current = null, islandCount, maxArea, currentArea, done } = stepState;
  const isDark = t._resolved === "dark";
  const water = isDark ? "#1e3a5f" : "#bae6fd";
  const land = isDark ? "#374151" : "#d1d5db";
  const visitedLand = isDark ? "#065f46" : "#6ee7b7";
  const currentBorder = "#ea580c";
  const cellSize = 36;
  const gap = 4;

  if (!grid.length || !grid[0].length) {
    return (
      <div style={{ padding: 12, color: t.inkMuted, fontFamily: "'Caveat',cursive" }}>
        No grid to display. Provide grid and rows.
      </div>
    );
  }

  const R = grid.length;
  const C = grid[0].length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(islandCount != null || maxArea != null) && (
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
            const isVisited = visited[r] && visited[r][c];
            const isCurrent = current && current[0] === r && current[1] === c;
            let bg = val === 0 ? water : isVisited ? visitedLand : land;
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
                  color: val === 0 ? (isDark ? "#93c5fd" : "#0369a1") : (isDark ? "#d1d5db" : "#1f2937"),
                }}
              >
                {val}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
