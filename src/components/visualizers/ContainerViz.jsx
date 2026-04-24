export default function ContainerViz({ heights = [], stepState = {}, t }) {
  const { left = 0, right = 0, maxArea = 0, bestLeft = -1, bestRight = -1, currentArea, done } = stepState;
  const arr = heights && heights.length > 0 ? heights : [];
  const maxH = Math.max(...arr, 1);
  const n = arr.length;

  const chartHeight = 200;
  const barWidth = 10;
  const gap = 20;
  const cellWidth = barWidth + gap;
  const marginLeft = 36;
  const marginBottom = 24;
  const scale = (chartHeight - marginBottom) / maxH;
  const waterLevel = n >= 2 ? Math.min(arr[left] ?? 0, arr[right] ?? 0) : 0;

  const xForIndex = (i) => marginLeft + i * cellWidth + (cellWidth - barWidth) / 2;
  const barLeftEdge = (i) => marginLeft + i * cellWidth + (cellWidth - barWidth) / 2;
  const barRightEdge = (i) => barLeftEdge(i) + barWidth;

  const waterX = n >= 2 ? barRightEdge(left) : 0;
  const waterW = n >= 2 ? Math.max(0, barLeftEdge(right) - barRightEdge(left)) : 0;
  const waterHeightPx = waterLevel * scale;
  const waterY = chartHeight - marginBottom - waterHeightPx;

  const totalWidth = marginLeft + n * cellWidth + 16;

  const xAxisLabelY = chartHeight - marginBottom + 14;
  const pointerLabelY = chartHeight - marginBottom + 28;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>heights</div>
      <svg width={totalWidth} height={chartHeight + 42} style={{ display: "block" }} aria-hidden>
        {/* Y-axis */}
        <line x1={marginLeft - 4} y1={0} x2={marginLeft - 4} y2={chartHeight - marginBottom} stroke={t.border} strokeWidth="1.5" />
        {Array.from({ length: maxH + 1 }, (_, i) => (
          <g key={i}>
            <line x1={marginLeft - 4} y1={chartHeight - marginBottom - i * scale} x2={marginLeft} y2={chartHeight - marginBottom - i * scale} stroke={t.border} strokeWidth="1" />
            <text x={marginLeft - 8} y={chartHeight - marginBottom - i * scale + 4} textAnchor="end" fill={t.inkMuted} fontFamily="'JetBrains Mono',monospace" fontSize="10">{i}</text>
          </g>
        ))}

        {/* Water (light blue band between left and right boundaries) */}
        {n >= 2 && left < right && waterW > 0 && waterHeightPx > 0 && (
          <rect
            x={waterX}
            y={waterY}
            width={waterW}
            height={waterHeightPx}
            fill="#93c5fd"
            opacity={0.85}
            rx={0}
          />
        )}

        {/* Bars */}
        {arr.map((h, idx) => {
          const isBoundary = idx === left || idx === right;
          const heightPx = h * scale;
          const x = xForIndex(idx);
          const y = chartHeight - marginBottom - heightPx;
          const fill = isBoundary ? "#dc2626" : (t._resolved === "dark" ? "#374151" : "#1f2937");
          const stroke = isBoundary ? "#b91c1c" : t.border;
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={heightPx}
                fill={fill}
                stroke={stroke}
                strokeWidth={isBoundary ? 2 : 1}
                rx={2}
              />
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line x1={marginLeft} y1={chartHeight - marginBottom} x2={marginLeft + n * cellWidth} y2={chartHeight - marginBottom} stroke={t.border} strokeWidth="1.5" />

        {/* X-axis index labels (kept inside same SVG coordinates for perfect alignment) */}
        {arr.map((_, idx) => (
          <text
            key={`x-${idx}`}
            x={xForIndex(idx) + barWidth / 2}
            y={xAxisLabelY}
            textAnchor="middle"
            fill={t.inkMuted}
            fontFamily="'JetBrains Mono',monospace"
            fontSize="10"
          >
            {idx}
          </text>
        ))}

        {/* L / R pointer labels (also inside SVG coordinates) */}
        {arr.map((_, idx) => (
          <text
            key={`lr-${idx}`}
            x={xForIndex(idx) + barWidth / 2}
            y={pointerLabelY}
            textAnchor="middle"
            fill={idx === left || idx === right ? "#dc2626" : "transparent"}
            fontFamily="'Caveat',cursive"
            fontSize="13"
            fontWeight="700"
          >
            {idx === left ? "L" : idx === right ? "R" : ""}
          </text>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700 }}>
          <span style={{ color: t.inkMuted }}>maxArea </span>
          <span style={{ color: t.green }}>{maxArea}</span>
        </div>
        {currentArea != null && !done && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700 }}>
            <span style={{ color: t.inkMuted }}>current </span>
            <span style={{ color: t.blue }}>{currentArea}</span>
          </div>
        )}
      </div>
    </div>
  );
}
