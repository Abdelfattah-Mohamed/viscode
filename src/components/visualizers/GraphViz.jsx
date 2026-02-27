import { useMemo, useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 28;
const PADDING = 48;
const SVG_SIZE = 240;

// Excalidraw-style pastel palette
const COMPONENT_COLORS = ["", "#6965db", "#70b050", "#e03131", "#f2a33c", "#eb8af0", "#4dabf7"];
export default function GraphViz({ stepState = {}, problemId, t }) {
  const { n = 0, edges = [], highlighted = [], vis = [], count, componentId = [], done, validTree } = stepState;
  const isDark = t._resolved === "dark";
  const isComponents = problemId === "num-connected-components";
  const isValidTree = problemId === "graph-valid-tree";
  const roughRef = useRef(null);

  const nodeStroke = (i) => {
    if (highlighted.includes(i)) return "#e03131";
    if (isValidTree && vis[i]) return "#70b050";
    if (isComponents && componentId[i] > 0) return COMPONENT_COLORS[componentId[i]] || COMPONENT_COLORS[1];
    return isDark ? "#94a3b8" : "#1e1e1e";
  };
  const nodeFill = (i) => {
    if (highlighted.includes(i)) return "#fff5f5";
    if (isValidTree && vis[i]) return "#ebfbee";
    if (isComponents && componentId[i] > 0) return (COMPONENT_COLORS[componentId[i]] || "#6965db") + "22";
    return isDark ? "#334155" : "#fafafa";
  };
  const edgeColor = (u, v) => {
    if (highlighted.includes(u) && highlighted.includes(v)) return "#e03131";
    if (isComponents && componentId[u] > 0 && componentId[u] === componentId[v])
      return COMPONENT_COLORS[componentId[u]] || "#94a3b8";
    return isDark ? "#64748b" : "#1e1e1e";
  };

  const { width, height, positions } = useMemo(() => {
    if (n <= 0) return { width: SVG_SIZE, height: SVG_SIZE, positions: [] };
    const radius = Math.min(90, 150 - n * 5);
    const cx = SVG_SIZE / 2;
    const cy = SVG_SIZE / 2;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      pos.push({
        x: radius * Math.cos(angle) + cx,
        y: radius * Math.sin(angle) + cy,
      });
    }
    return { width: SVG_SIZE, height: SVG_SIZE, positions: pos };
  }, [n]);

  useEffect(() => {
    if (!roughRef.current || n <= 0 || positions.length === 0) return;
    const g = roughRef.current;
    g.innerHTML = "";
    const rc = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

    edges.forEach(([u, v]) => {
      if (u >= positions.length || v >= positions.length) return;
      const pu = positions[u];
      const pv = positions[v];
      const el = rc.line(pu.x, pu.y, pv.x, pv.y, {
        stroke: edgeColor(u, v),
        strokeWidth: highlighted.includes(u) && highlighted.includes(v) ? 2.5 : 1.5,
      });
      g.appendChild(el);
    });

    positions.forEach((p, i) => {
      const isHighlighted = highlighted.includes(i);
      if (isHighlighted) {
        const ring = rc.circle(p.x, p.y, (NODE_R + 8) * 2, {
          fill: "none",
          stroke: "#e03131",
          strokeWidth: 1.5,
          roughness: 1.5,
        });
        g.appendChild(ring);
      }
      const node = rc.circle(p.x, p.y, NODE_R * 2, {
        fill: nodeFill(i),
        fillStyle: "solid",
        stroke: nodeStroke(i),
        strokeWidth: 2,
        roughness: 1,
      });
      g.appendChild(node);
    });
  }, [positions, edges, highlighted, vis, componentId, n, isComponents, isValidTree, isDark]);

  if (n <= 0) {
    return (
      <div style={{
        padding: "24px 20px",
        textAlign: "center",
        color: t.inkMuted,
        fontFamily: "'Caveat',cursive",
        fontSize: "1.1rem",
        lineHeight: 1.6,
      }}>
        <span style={{ display: "block", fontSize: "2rem", marginBottom: 8 }}>🕸️</span>
        <strong style={{ color: t.ink }}>Add a graph to explore</strong>
        <p style={{ margin: "8px 0 0", fontSize: "0.95rem" }}>
          Enter <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>n</code> (nodes) and edges as a flat list, e.g. <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>0,1,1,2,3,4</code>
        </p>
      </div>
    );
  }

  const showLegend = (isComponents && (count != null || done)) || (isValidTree && vis.some(Boolean));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 14px",
        borderRadius: 14,
        background: isDark ? "rgba(31,41,55,0.5)" : "rgba(249,250,251,0.9)",
        border: `1px solid ${t.border}30`,
      }}>
        <span style={{
          fontFamily: "'Caveat',cursive",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: t.ink,
        }}>
          {n} node{n !== 1 ? "s" : ""} · {edges.length} edge{edges.length !== 1 ? "s" : ""}
        </span>
        {isComponents && count != null && !done && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: t.green,
            padding: "5px 12px",
            borderRadius: 20,
            border: `2px solid ${t.green}60`,
            background: t.green + "20",
          }}>
            Components: {count}
          </span>
        )}
        {isComponents && done && count != null && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.1rem",
            fontWeight: 800,
            color: t.green,
            padding: "6px 14px",
            borderRadius: 20,
            border: `2px solid ${t.green}`,
            background: t.green + "25",
            boxShadow: `0 2px 8px ${t.green}40`,
          }}>
            ✓ Answer: {count}
          </span>
        )}
        {isValidTree && validTree !== undefined && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.05rem",
            fontWeight: 800,
            color: validTree ? t.green : t.red,
            padding: "6px 14px",
            borderRadius: 20,
            border: `2px solid ${validTree ? t.green : t.red}`,
            background: (validTree ? t.green : t.red) + "22",
            boxShadow: `0 2px 8px ${(validTree ? t.green : t.red)}35`,
          }}>
            {validTree ? "✓ Valid tree" : "✗ Not a tree"}
          </span>
        )}
      </div>

      <div
        style={{
          position: "relative",
          width: width + PADDING * 2,
          height: height + PADDING * 2,
          borderRadius: 20,
          overflow: "hidden",
          background: isDark ? "#1e293b" : "#f8fafc",
        }}
      >
        <svg
          width={width + PADDING * 2}
          height={height + PADDING * 2}
          style={{ display: "block" }}
        >
          <defs>
            <pattern id="graph-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill={isDark ? "#334155" : "#e2e8f0"} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-dot-grid)" />
          <g ref={roughRef} transform={`translate(${PADDING}, ${PADDING})`} />
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            {positions.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Caveat',cursive",
                  fontSize: 18,
                  fontWeight: 700,
                  fill: highlighted.includes(i) || (isValidTree && vis[i]) ? "#1e1e1e" : (isDark ? "#e2e8f0" : "#1e1e1e"),
                  pointerEvents: "none",
                }}
              >
                {i}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {showLegend && (
        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "8px 12px",
          borderRadius: 12,
          background: t.surfaceAlt + "80",
          border: `1px solid ${t.border}30`,
          fontFamily: "'Caveat',cursive",
          fontSize: "0.9rem",
          color: t.inkMuted,
        }}>
          {highlighted.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e03131", border: "2px solid #e03131" }} />
              Current
            </span>
          )}
          {isValidTree && vis.some(Boolean) && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#70b050" }} />
              Visited
            </span>
          )}
          {isComponents && componentId.some((c) => c > 0) && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: COMPONENT_COLORS[1] }} />
              Component
            </span>
          )}
        </div>
      )}
    </div>
  );
}
