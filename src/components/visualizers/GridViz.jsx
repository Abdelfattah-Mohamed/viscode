export default function GridViz({ stepState = {}, input, problemId, t }) {
  const { grid = [], visited = [], current = null, highlighted = [], islandCount, maxArea, currentArea, done, pacific = [], atlantic = [], result = [], phase, word = "", matched = "", res = [], markerCells = [], activeMarkers = [] } = stepState;
  const isPacificAtlantic = problemId === "pacific-atlantic" && (pacific.length > 0 || atlantic.length > 0);
  const isSetMatrixZeroes = problemId === "set-matrix-zeroes";
  const isSpiralMatrix = problemId === "spiral-matrix";
  const isRotateImage = problemId === "rotate-image";
  const isWordSearch = problemId === "word-search";
  const isPolishedMatrix = isSetMatrixZeroes || isSpiralMatrix || isRotateImage || isWordSearch;
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
  const isHighlighted = (r, c) => highlighted.some(([a, b]) => a === r && b === c);
  const isMarkerCell = (r, c) => markerCells.some(([a, b]) => a === r && b === c);
  const isActiveMarker = (r, c) => activeMarkers.some(([a, b]) => a === r && b === c);
  const phaseLabel = phase === "mark" ? "Mark zeros" : phase === "scan" ? "Scan matrix" : phase === "sweep" ? "Apply markers" : phase === "zero_col0" ? "Zero first column" : phase === "zero_row0" ? "Zero first row" : done ? "Complete" : "Initialize markers";
  const spiralPhaseLabel = phase === "go_right" ? "Move right" : phase === "go_down" ? "Move down" : phase === "go_left" ? "Move left" : phase === "go_up" ? "Move up" : done ? "Complete" : "Initialize bounds";
  const rotatePhaseLabel = phase === "transpose" ? "Transpose" : phase === "reverse" ? "Reverse rows" : done ? "Complete" : "Prepare rotation";
  const wordPhaseLabel = done ? "Complete" : matched ? `Matched ${matched.length}/${word.length}` : "Find start";

  const markerBadge = (label, color, bg) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 800, color: t.inkMuted }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1.5px solid ${color}` }} />
      {label}
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {isPacificAtlantic && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: pacificColor, border: "1px solid #3b82f6" }} /> Pacific</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: atlanticColor, border: "1px solid #f97316" }} /> Atlantic</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: bothColor }} /> Both ({result?.length ?? 0})</span>
        </div>
      )}
      {(islandCount != null || maxArea != null) && !isPacificAtlantic && problemId !== "rotate-image" && problemId !== "set-matrix-zeroes" && problemId !== "spiral-matrix" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'Caveat',cursive", fontSize: "1.05em", color: t.inkMuted }}>
          {islandCount != null && <span><strong>Islands:</strong> {islandCount}</span>}
          {maxArea != null && <span><strong>Max area:</strong> {maxArea}</span>}
          {currentArea != null && currentArea > 0 && <span><strong>Current area:</strong> {currentArea}</span>}
        </div>
      )}
      {isRotateImage && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.18rem", fontWeight: 800, color: t.ink, lineHeight: 1 }}>
                Rotation workspace
              </div>
              <div style={{ marginTop: 4, fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: t.inkMuted }}>
                Rotate 90 degrees clockwise by transposing, then reversing each row.
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: done ? t.green : t.blue, background: (done ? t.green : t.blue) + "18", border: `1.25px solid ${(done ? t.green : t.blue)}66`, borderRadius: 999, padding: "5px 10px" }}>
              {rotatePhaseLabel}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {markerBadge("swap cells", t.yellow, t.yellow + "24")}
            {markerBadge("current phase", t.blue, t.blue + "18")}
            {done && markerBadge("rotated", t.green, t.green + "22")}
          </div>
        </div>
      )}
      {isSetMatrixZeroes && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.18rem", fontWeight: 800, color: t.ink, lineHeight: 1 }}>
                Matrix state
              </div>
              <div style={{ marginTop: 4, fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: t.inkMuted }}>
                First row and first column are reused as in-place markers.
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: done ? t.green : t.blue, background: (done ? t.green : t.blue) + "18", border: `1.25px solid ${(done ? t.green : t.blue)}66`, borderRadius: 999, padding: "5px 10px" }}>
              {phaseLabel}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {markerBadge("marker row", t.blue, t.blue + "20")}
            {markerBadge("marker column", t.purple, t.purple + "20")}
            {markerBadge("updated marker", t.green, t.green + "22")}
            {markerBadge("current cell", currentBorder, currentBorder + "22")}
            {markerBadge("zero", t.red, t.red + "18")}
          </div>
        </div>
      )}
      {isWordSearch && word && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.18rem", fontWeight: 800, color: t.ink, lineHeight: 1 }}>
                Word search board
              </div>
              <div style={{ marginTop: 4, fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: t.inkMuted }}>
                DFS tries each cell, marks the current path, then backtracks.
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: done ? t.green : t.blue, background: (done ? t.green : t.blue) + "18", border: `1.25px solid ${(done ? t.green : t.blue)}66`, borderRadius: 999, padding: "5px 10px" }}>
              {wordPhaseLabel}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: t.ink, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 999, padding: "3px 8px" }}>
              word: {word}
            </span>
            {matched && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: t.green, background: t.green + "18", border: `1px solid ${t.green}66`, borderRadius: 999, padding: "3px 8px" }}>
                matched: {matched}
              </span>
            )}
            {markerBadge("path", t.green, t.green + "22")}
            {markerBadge("current cell", currentBorder, currentBorder + "22")}
          </div>
        </div>
      )}
      {isSpiralMatrix && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.18rem", fontWeight: 800, color: t.ink, lineHeight: 1 }}>
                Spiral traversal
              </div>
              <div style={{ marginTop: 4, fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: t.inkMuted }}>
                The path moves around the current boundary and then tightens inward.
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 900, color: done ? t.green : t.blue, background: (done ? t.green : t.blue) + "18", border: `1.25px solid ${(done ? t.green : t.blue)}66`, borderRadius: 999, padding: "5px 10px" }}>
              {spiralPhaseLabel}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {markerBadge("visited path", t.green, t.green + "22")}
            {markerBadge("current cell", currentBorder, currentBorder + "22")}
            {res?.length > 0 && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 800, color: t.ink, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 999, padding: "3px 8px" }}>
                res[{res.length}]
              </span>
            )}
          </div>
          {res?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 800, color: t.inkMuted }}>
                Output array
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {res.map((value, idx) => {
                  const latest = idx === res.length - 1 && !done;
                  return (
                    <div
                      key={`${idx}-${value}`}
                      style={{
                        minWidth: 34,
                        padding: "6px 9px",
                        borderRadius: 10,
                        border: `1.5px solid ${latest ? currentBorder : t.border}`,
                        background: latest ? currentBorder + "22" : t.surface,
                        color: latest ? currentBorder : t.ink,
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        textAlign: "center",
                        boxShadow: latest ? t.shadowSm : "none",
                      }}
                      title={`res[${idx}]`}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: isPolishedMatrix ? `28px repeat(${C}, ${cellSize}px)` : `repeat(${C}, ${cellSize}px)`,
          gap,
          padding: isPolishedMatrix ? 12 : 8,
          background: isPolishedMatrix ? t.surface : isDark ? "#111827" : "#f3f4f6",
          border: isPolishedMatrix ? `1.5px solid ${t.border}` : "none",
          borderRadius: isPolishedMatrix ? 16 : 8,
          boxShadow: isPolishedMatrix ? t.shadowSm : "none",
          width: "fit-content",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {isPolishedMatrix && (
          <>
            <div />
            {Array.from({ length: C }, (_, c) => (
              <div key={`col-${c}`} style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 900, color: isSetMatrixZeroes && c === 0 ? t.purple : t.inkMuted }}>
                c{c}
              </div>
            ))}
          </>
        )}
        {grid.map((row, r) =>
          [
            ...(isPolishedMatrix ? [
              <div key={`row-${r}`} style={{ width: 24, height: cellSize, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 900, color: isSetMatrixZeroes && r === 0 ? t.blue : t.inkMuted }}>
                r{r}
              </div>,
            ] : []),
            ...row.map((val, c) => {
            const isVisited = !isPacificAtlantic && problemId !== "rotate-image" && problemId !== "set-matrix-zeroes" && visited[r] && visited[r][c];
            const isCurrent = current && current[0] === r && current[1] === c;
            const isRotateHighlight = problemId === "rotate-image" && isHighlighted(r, c);
            const isMarkerRow = isSetMatrixZeroes && r === 0;
            const isMarkerCol = isSetMatrixZeroes && c === 0;
            const markerCell = isSetMatrixZeroes && isMarkerCell(r, c);
            const activeMarker = isSetMatrixZeroes && isActiveMarker(r, c);
            const isSpiralVisited = isSpiralMatrix && visited[r] && visited[r][c];
            const isWordVisited = isWordSearch && visited[r] && visited[r][c];
            const toBoth = isPacificAtlantic && isResultCell(r, c);
            const toPac = isPacificAtlantic && pacific[r] && pacific[r][c];
            const toAtl = isPacificAtlantic && atlantic[r] && atlantic[r][c];
            let bg = land;
            if (isSetMatrixZeroes) {
              bg = val === 0 ? t.red + "18" : t.surfaceAlt;
              if (isMarkerRow && isMarkerCol) bg = `linear-gradient(135deg, ${t.blue}24 0%, ${t.blue}24 50%, ${t.purple}24 50%, ${t.purple}24 100%)`;
              else if (isMarkerRow) bg = t.blue + "18";
              else if (isMarkerCol) bg = t.purple + "18";
              if (markerCell) bg = t.green + "22";
              if (activeMarker) bg = t.green + "35";
              if (isCurrent) bg = currentBorder + "24";
            } else if (isSpiralMatrix) {
              bg = isCurrent ? currentBorder + "24" : isSpiralVisited ? t.green + "22" : t.surfaceAlt;
            } else if (isRotateImage) {
              bg = isRotateHighlight ? t.yellow + "30" : done ? t.green + "14" : t.surfaceAlt;
            } else if (isWordSearch) {
              bg = isCurrent ? currentBorder + "24" : isWordVisited ? t.green + "22" : t.surfaceAlt;
            } else if (val === 0 && !isPacificAtlantic) bg = water;
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
                  border: `2px solid ${isCurrent ? currentBorder : activeMarker ? t.green : markerCell ? t.green + "aa" : isWordVisited ? t.green + "88" : isSpiralVisited ? t.green + "88" : isRotateHighlight ? t.yellow : isSetMatrixZeroes && val === 0 ? t.red + "88" : isSetMatrixZeroes && (isMarkerRow || isMarkerCol) ? t.border : "transparent"}`,
                  borderRadius: isPolishedMatrix ? 10 : 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: isPolishedMatrix ? "'JetBrains Mono',monospace" : undefined,
                  fontSize: isPolishedMatrix ? "0.9rem" : "0.75rem",
                  fontWeight: isPolishedMatrix ? 900 : 600,
                  color: isWordVisited ? t.green : isRotateHighlight ? t.ink : isSpiralVisited ? t.green : activeMarker || markerCell ? t.green : isSetMatrixZeroes && val === 0 ? t.red : val === 0 && !isPacificAtlantic ? (isDark ? "#93c5fd" : "#0369a1") : (isDark ? "#d1d5db" : "#1f2937"),
                  boxShadow: isCurrent ? `0 0 0 3px ${currentBorder}22, ${t.shadowSm}` : isRotateHighlight ? t.shadowSm : isSetMatrixZeroes && (isMarkerRow || isMarkerCol) ? t.shadowSm : "none",
                  transform: isCurrent || isRotateHighlight ? "translateY(-2px)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                {problemId === "word-search" ? (val === 35 ? "#" : (typeof val === "number" && val >= 65 && val <= 122 ? String.fromCharCode(val) : (typeof val === "number" && val >= 97 && val <= 122 ? String.fromCharCode(val) : val))) : val}
              </div>
            );
          }),
          ]
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
