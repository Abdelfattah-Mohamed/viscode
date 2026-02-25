import { useMemo } from "react";

const NODE_R = 22;
const PADDING = 40;

export default function GraphViz({ stepState = {}, t }) {
  const { n = 0, edges = [], highlighted = [] } = stepState;
  const isDark = t._resolved === "dark";
  const nodeColor = (i) => {
    if (highlighted.includes(i)) return isDark ? "#fbbf24" : "#f59e0b";
    return isDark ? "#4b5563" : "#e5e7eb";
  };
  const edgeColor = (u, v) => {
    const both = highlighted.includes(u) && highlighted.includes(v);
    return both ? (isDark ? "#fbbf24" : "#f59e0b") : isDark ? "#6b7280" : "#9ca3af";
  };

  const { width, height, positions } = useMemo(() => {
    if (n <= 0) return { width: 200, height: 200, positions: [] };
    const radius = Math.min(120, 180 - n * 8);
    const pos = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      pos.push({
        x: radius * Math.cos(angle) + (200 / 2),
        y: radius * Math.sin(angle) + (200 / 2),
      });
    }
    return { width: 200, height: 200, positions: pos };
  }, [n]);

  if (n <= 0) {
    return (
      <div style={{ padding: 12, color: t.inkMuted, fontFamily: "'Caveat',cursive" }}>
        Enter <code>n</code> (number of nodes) and edges as flat list (e.g. 0,1,1,2).
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>
        {n} nodes, {edges.length} edges
      </div>
      <div
        style={{
          position: "relative",
          width: width + PADDING * 2,
          height: height + PADDING * 2,
          background: isDark ? "#111827" : "#f3f4f6",
          borderRadius: 12,
        }}
      >
        <svg
          width={width + PADDING * 2}
          height={height + PADDING * 2}
          style={{ display: "block" }}
        >
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {edges.map(([u, v], idx) => {
              if (u >= positions.length || v >= positions.length) return null;
              const pu = positions[u];
              const pv = positions[v];
              const color = edgeColor(u, v);
              const strokeW = highlighted.includes(u) && highlighted.includes(v) ? 2.5 : 1.5;
              return (
                <line
                  key={idx}
                  x1={pu.x}
                  y1={pu.y}
                  x2={pv.x}
                  y2={pv.y}
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                />
              );
            })}
            {positions.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_R}
                  fill={nodeColor(i)}
                  stroke={highlighted.includes(i) ? (isDark ? "#fbbf24" : "#d97706") : (isDark ? "#374151" : "#d1d5db")}
                  strokeWidth={highlighted.includes(i) ? 2.5 : 1.5}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, fill: isDark ? "#e5e7eb" : "#1f2937" }}
                >
                  {i}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
