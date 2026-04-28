export default function ContainerViz({ heights = [], stepState = {}, t }) {
  const { left = 0, right = 0, maxArea = 0, bestLeft = -1, bestRight = -1, currentArea, done } = stepState;
  const arr = heights && heights.length > 0 ? heights : [];
  const maxH = Math.max(...arr, 1);
  const n = arr.length;
  const isDark = t._resolved === "dark";

  const chartHeight = 210;
  const barWidth = 12;
  const gap = 22;
  const cellWidth = barWidth + gap;
  const marginLeft = 38;
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          pointers: L={left >= 0 ? left : "-"}, R={right >= 0 ? right : "-"}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          width={right > left ? right - left : 0}, water height={waterLevel}
        </div>
        <div style={{ padding: "8px 11px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: t.inkMuted }}>
          current area={currentArea ?? 0}
        </div>
      </div>

      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surface, boxShadow: t.shadowSm, padding: 12, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.02em", color: t.inkMuted, fontWeight: 900, marginBottom: 8 }}>Heights & Water Container</div>
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
            fill={t.blue}
            opacity={0.45}
            rx={0}
          />
        )}

        {/* Bars */}
        {arr.map((h, idx) => {
          const isBoundary = idx === left || idx === right;
          const heightPx = h * scale;
          const x = xForIndex(idx);
          const y = chartHeight - marginBottom - heightPx;
          const fill = isBoundary ? t.red : (isDark ? "#374151" : "#1f2937");
          const stroke = isBoundary ? t.red : t.border;
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
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill={isBoundary ? t.red : t.inkMuted}
                fontFamily="'JetBrains Mono',monospace"
                fontSize="10"
                fontWeight="700"
              >
                {h}
              </text>
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
            fill={idx === left || idx === right ? t.red : "transparent"}
            fontFamily="'JetBrains Mono',monospace"
            fontSize="11"
            fontWeight="800"
          >
            {idx === left ? "L" : idx === right ? "R" : ""}
          </text>
        ))}
      </svg>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
        <div style={{ padding: "8px 12px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 800 }}>
          <span style={{ color: t.inkMuted }}>maxArea </span>
          <span style={{ color: t.green }}>{maxArea}</span>
        </div>
        {currentArea != null && !done && (
          <div style={{ padding: "8px 12px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 800 }}>
            <span style={{ color: t.inkMuted }}>current </span>
            <span style={{ color: t.blue }}>{currentArea}</span>
          </div>
        )}
        {bestLeft >= 0 && bestRight >= 0 && (
          <div style={{ padding: "8px 12px", border: `1.5px solid ${t.green}`, borderRadius: 10, background: t.green + "14", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 800, color: t.green }}>
            best pair: ({bestLeft}, {bestRight})
          </div>
        )}
      </div>
    </div>
  );
}
