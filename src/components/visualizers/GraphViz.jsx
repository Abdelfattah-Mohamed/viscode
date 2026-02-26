import { useMemo } from "react";

const NODE_R = 26;
const PADDING = 44;

const COMPONENT_COLORS = ["", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function GraphViz({ stepState = {}, problemId, t }) {
  const { n = 0, edges = [], highlighted = [], vis = [], count, componentId = [], done } = stepState;
  const isDark = t._resolved === "dark";
  const isComponents = problemId === "num-connected-components";

  const nodeColor = (i) => {
    if (highlighted.includes(i)) return isDark ? "#fbbf24" : "#f59e0b";
    if (isComponents && componentId[i] > 0) return COMPONENT_COLORS[componentId[i]] || COMPONENT_COLORS[1];
    return isDark ? "#4b5563" : "#e5e7eb";
  };
  const edgeColor = (u, v) => {
    const both = highlighted.includes(u) && highlighted.includes(v);
    if (both) return isDark ? "#fbbf24" : "#f59e0b";
    if (isComponents && componentId[u] > 0 && componentId[u] === componentId[v])
      return COMPONENT_COLORS[componentId[u]] || "#6b7280";
    return isDark ? "#6b7280" : "#9ca3af";
  };

  const { width, height, positions } = useMemo(() => {
    if (n <= 0) return { width: 200, height: 200, positions: [] };
    const radius = Math.min(100, 160 - n * 6);
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
        Enter <code>n</code> (number of nodes) and edges as flat list (e.g. 0,1,1,2,3,4).
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 600, color: t.inkMuted }}>
          {n} nodes, {edges.length} edges
        </span>
        {isComponents && count != null && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.05em",
            fontWeight: 700,
            color: t.green,
            padding: "4px 12px",
            borderRadius: 8,
            border: `2px solid ${t.green}`,
            background: t.green + "18",
          }}>
            Components: {count}
          </span>
        )}
        {isComponents && done && count != null && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.15em",
            fontWeight: 800,
            color: t.green,
            padding: "6px 14px",
            borderRadius: 8,
            border: `2px solid ${t.green}`,
            background: t.green + "22",
          }}>
            Answer: {count}
          </span>
        )}
      </div>
      <div
        style={{
          position: "relative",
          width: width + PADDING * 2,
          height: height + PADDING * 2,
          background: "transparent",
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
                  stroke={highlighted.includes(i) ? (isDark ? "#fbbf24" : "#d97706") : (componentId[i] > 0 && isComponents ? (COMPONENT_COLORS[componentId[i]] || "#059669") : (isDark ? "#374151" : "#d1d5db"))}
                  strokeWidth={highlighted.includes(i) ? 2.5 : 1.5}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, fill: isDark ? "#e5e7eb" : "#1f2937" }}
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
