import { useMemo, useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 28;
const PADDING = 48;
const SVG_SIZE = 240;

// Excalidraw-style pastel palette
const COMPONENT_COLORS = ["", "#6965db", "#70b050", "#e03131", "#f2a33c", "#eb8af0", "#4dabf7"];
const EDGE_COLOR = "#64748b";
const EDGE_HIGHLIGHT = "#e03131";

export default function GraphViz({ stepState = {}, problemId, t }) {
  const { n = 0, edges = [], highlighted = [], vis = [], count, componentId = [], done, validTree, nodeState = [], canFinish, directed, labels = [], result } = stepState;
  const isDark = t._resolved === "dark";
  const isComponents = problemId === "num-connected-components";
  const isValidTree = problemId === "graph-valid-tree";
  const isCourseSchedule = problemId === "course-schedule";
  const isAlienDictionary = problemId === "alien-dictionary";
  const roughRef = useRef(null);

  const isIsolated = (i) => !connectedNodes.has(i);
  const nodeStroke = (i) => {
    if (isCourseSchedule && nodeState[i] === 1) return "#f2a33c";
    if (isCourseSchedule && nodeState[i] === 2) return "#70b050";
    if (highlighted.includes(i)) return "#e03131";
    if (isValidTree && vis[i]) return "#70b050";
    if (isComponents && componentId[i] > 0) return COMPONENT_COLORS[componentId[i]] || COMPONENT_COLORS[1];
    if (isIsolated(i)) return isDark ? "#64748b" : "#cbd5e1";
    return isDark ? "#94a3b8" : "#1e1e1e";
  };
  const nodeFill = (i) => {
    if (isCourseSchedule && nodeState[i] === 1) return "#fffbf0";
    if (isCourseSchedule && nodeState[i] === 2) return "#ebfbee";
    if (highlighted.includes(i)) return "#fff5f5";
    if (isValidTree && vis[i]) return "#ebfbee";
    if (isComponents && componentId[i] > 0) return (COMPONENT_COLORS[componentId[i]] || "#6965db") + "22";
    if (isIsolated(i)) return isDark ? "#1e293b" : "#f1f5f9";
    return isDark ? "#334155" : "#fafafa";
  };
  const edgeColor = (u, v) => {
    if (highlighted.includes(u) && highlighted.includes(v)) return EDGE_HIGHLIGHT;
    if (isComponents && componentId[u] > 0 && componentId[u] === componentId[v])
      return COMPONENT_COLORS[componentId[u]] || "#94a3b8";
    return isDark ? "#64748b" : "#1e1e1e";
  };

  const { width, height, positions, connectedNodes } = useMemo(() => {
    if (n <= 0) return { width: SVG_SIZE, height: SVG_SIZE, positions: [], connectedNodes: new Set() };
    const radius = Math.min(90, 150 - n * 5);
    const cx = SVG_SIZE / 2;
    const cy = SVG_SIZE / 2;
    const pos = [];
    const conn = new Set();
    for (const [u, v] of edges) {
      if (u >= 0 && u < n) conn.add(u);
      if (v >= 0 && v < n) conn.add(v);
    }
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      pos.push({
        x: radius * Math.cos(angle) + cx,
        y: radius * Math.sin(angle) + cy,
      });
    }
    return { width: SVG_SIZE, height: SVG_SIZE, positions: pos, connectedNodes: conn };
  }, [n, edges]);

  useEffect(() => {
    if (!roughRef.current || n <= 0 || positions.length === 0) return;
    const g = roughRef.current;
    g.innerHTML = "";
    const rc = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

    if (!directed) {
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
    }

    positions.forEach((p, i) => {
      const isHighlighted = highlighted.includes(i);
      const isolated = !connectedNodes.has(i);
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
        strokeWidth: isolated ? 1.5 : 2,
        roughness: 1,
      });
      g.appendChild(node);
    });
  }, [positions, edges, highlighted, vis, componentId, n, isComponents, isValidTree, isDark, directed, nodeState, connectedNodes]);

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
          {isCourseSchedule ? (
            <>Enter <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>n</code> (courses) and prerequisites as pairs <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>a,b</code> (course a depends on b), e.g. <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>1,0</code> for [[1,0]]</>
          ) : isAlienDictionary ? (
            <>Enter words as comma-separated, e.g. <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>wrt,wrf,er,ett,rftt</code></>
          ) : (
            <>Enter <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>n</code> (nodes) and edges as a flat list, e.g. <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>0,1,1,2,3,4</code></>
          )}
        </p>
      </div>
    );
  }

  const isolatedCount = n - connectedNodes.size;
  const showLegend = (isComponents && (count != null || done)) || (isValidTree && vis.some(Boolean)) || (isCourseSchedule && (nodeState.some(s => s > 0) || highlighted.length > 0)) || (isAlienDictionary && (highlighted.length > 0 || (result && result.length > 0))) || isolatedCount > 0;

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
          {isCourseSchedule
            ? `${n} course${n !== 1 ? "s" : ""} · ${edges.length} prerequisite${edges.length !== 1 ? "s" : ""}`
            : `${n} node${n !== 1 ? "s" : ""} · ${edges.length} edge${edges.length !== 1 ? "s" : ""}`}
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
        {isCourseSchedule && canFinish !== undefined && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.05rem",
            fontWeight: 800,
            color: canFinish ? t.green : t.red,
            padding: "6px 14px",
            borderRadius: 20,
            border: `2px solid ${canFinish ? t.green : t.red}`,
            background: (canFinish ? t.green : t.red) + "22",
            boxShadow: `0 2px 8px ${(canFinish ? t.green : t.red)}35`,
          }}>
            {canFinish ? "✓ Can finish" : "✗ Cycle detected"}
          </span>
        )}
        {isAlienDictionary && result != null && result !== "" && (
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.05rem",
            fontWeight: 800,
            color: t.green,
            padding: "6px 14px",
            borderRadius: 20,
            border: `2px solid ${t.green}`,
            background: t.green + "22",
            boxShadow: `0 2px 8px ${t.green}35`,
          }}>
            Order: &quot;{result}&quot;
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
            <marker id="graph-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={isDark ? "#64748b" : "#1e1e1e"} />
            </marker>
            <marker id="graph-arrow-hl" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={EDGE_HIGHLIGHT} />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-dot-grid)" />
          {directed && (
            <g transform={`translate(${PADDING}, ${PADDING})`}>
              {edges.map(([u, v], idx) => {
                if (u >= positions.length || v >= positions.length) return null;
                const pu = positions[u];
                const pv = positions[v];
                const dx = pv.x - pu.x;
                const dy = pv.y - pu.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                const trim = NODE_R + 2;
                const x1 = pu.x + ux * trim;
                const y1 = pu.y + uy * trim;
                const x2 = pv.x - ux * trim;
                const y2 = pv.y - uy * trim;
                const isHl = highlighted.includes(u) && highlighted.includes(v);
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isHl ? EDGE_HIGHLIGHT : (isDark ? "#64748b" : "#1e1e1e")}
                    strokeWidth={isHl ? 2.5 : 1.5}
                    strokeLinecap="round"
                    markerEnd={isHl ? "url(#graph-arrow-hl)" : "url(#graph-arrow)"}
                  />
                );
              })}
            </g>
          )}
          <g ref={roughRef} transform={`translate(${PADDING}, ${PADDING})`} />
          <g transform={`translate(${PADDING}, ${PADDING})`} style={{ isolation: "isolate" }}>
            {positions.map((p, i) => {
              const isolated = !connectedNodes.has(i);
              const textFill = isolated
                ? (isDark ? "#94a3b8" : "#475569")
                : (highlighted.includes(i) || (isValidTree && vis[i]) || (isCourseSchedule && nodeState[i] > 0)
                  ? "#1e1e1e"
                  : (isDark ? "#e2e8f0" : "#1e1e1e"));
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono','Caveat',monospace",
                    fontSize: labels[i] != null ? 18 : 17,
                    fontWeight: 800,
                    fill: textFill,
                    pointerEvents: "none",
                    paintOrder: "stroke fill",
                    stroke: isDark ? "#1e293b" : "#f8fafc",
                    strokeWidth: 1.5,
                  }}
                >
                  {labels[i] != null ? String(labels[i]) : String(i)}
                </text>
              );
            })}
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
          {isCourseSchedule && (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f2a33c" }} />
                Visiting
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#70b050" }} />
                Done
              </span>
            </>
          )}
          {isolatedCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: isDark ? "#1e293b" : "#f1f5f9", border: `2px dashed ${isDark ? "#64748b" : "#cbd5e1"}` }} />
              No edges ({isolatedCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
