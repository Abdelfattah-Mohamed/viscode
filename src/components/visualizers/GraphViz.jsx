import { useMemo, useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 28;
const EDGE_TRIM = NODE_R + 2;
const PADDING = 48;
const SVG_SIZE = 300;

/** Trim segment from node center to node rim along chord pu→pv */
function trimmedChordPoints(pu, pv) {
  const dx = pv.x - pu.x;
  const dy = pv.y - pu.y;
  const len = Math.hypot(dx, dy) || 1;
  if (len < EDGE_TRIM * 2) return null;
  const ux = dx / len;
  const uy = dy / len;
  return {
    p0: [pu.x + ux * EDGE_TRIM, pu.y + uy * EDGE_TRIM],
    p1: [pv.x - ux * EDGE_TRIM, pv.y - uy * EDGE_TRIM],
    len,
    perp: [-dy / len, dx / len],
  };
}

/** Quadratic Bézier from p0 to p2 with outward bend; returns SVG path d */
function quadraticEdgePathD(p0, p1, bendSign = 1) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * bendSign;
  const ny = (dx / len) * bendSign;
  const bend = Math.min(18 + len * 0.2, 56);
  const cx = (p0[0] + p1[0]) / 2 + nx * bend;
  const cy = (p0[1] + p1[1]) / 2 + ny * bend;
  return { d: `M ${p0[0]} ${p0[1]} Q ${cx} ${cy} ${p1[0]} ${p1[1]}`, midChord: [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], nx, ny };
}

/** Sample points along same curve for rough.js linearPath */
function quadraticEdgeSamples(p0, p1, bendSign = 1, segments = 18) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * bendSign;
  const ny = (dx / len) * bendSign;
  const bend = Math.min(18 + len * 0.2, 56);
  const cx = (p0[0] + p1[0]) / 2 + nx * bend;
  const cy = (p0[1] + p1[1]) / 2 + ny * bend;
  const out = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const mt = 1 - t;
    out.push([
      mt * mt * p0[0] + 2 * mt * t * cx + t * t * p1[0],
      mt * mt * p0[1] + 2 * mt * t * cy + t * t * p1[1],
    ]);
  }
  return out;
}

// Excalidraw-style pastel palette
const COMPONENT_COLORS = ["", "#6965db", "#70b050", "#e03131", "#f2a33c", "#eb8af0", "#4dabf7"];
const EDGE_COLOR = "#64748b";
const EDGE_HIGHLIGHT = "#e03131";

export default function GraphViz({ stepState = {}, problemId, t }) {
  const { n = 0, edges = [], highlighted = [], vis = [], count, componentId = [], done, validTree, nodeState = [], canFinish, directed, labels = [], result, queue, stack, dist, mstEdges, matrixCell, k } = stepState;
  const edgesNormalized = (edges || []).map((e) => (Array.isArray(e) && e.length >= 2 ? [Number(e[0]), Number(e[1]), e[2] != null ? Number(e[2]) : 1] : e));
  const isWeightedGraph = (edges || []).some((e) => Array.isArray(e) && e.length >= 3);
  const isDark = t._resolved === "dark";
  const isComponents = problemId === "num-connected-components";
  const isValidTree = problemId === "graph-valid-tree";
  const isCourseSchedule = problemId === "course-schedule";
  const isAlienDictionary = problemId === "alien-dictionary";
  const isCloneGraph = problemId === "clone-graph";
  const isFloydWarshall = problemId === "floyd-warshall";
  const distMatrix = isFloydWarshall && Array.isArray(dist?.[0]) ? dist : null;
  const roughRef = useRef(null);
  const formatDist = (value) => (value == null || Math.abs(value) >= 1e8 ? "∞" : String(value));

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
    const radius = Math.min(120, Math.max(80, 175 - n * 6));
    const cx = SVG_SIZE / 2;
    const cy = SVG_SIZE / 2;
    const pos = [];
    const conn = new Set();
    for (const e of edgesNormalized) {
      const u = e[0], v = e[1];
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
  }, [n, edgesNormalized]);

  useEffect(() => {
    if (!roughRef.current || n <= 0 || positions.length === 0) return;
    const g = roughRef.current;
    g.innerHTML = "";
    const rc = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

    if (!directed && !isWeightedGraph) {
      edgesNormalized.forEach((e, idx) => {
        const u = e[0], v = e[1];
        if (u < 0 || v < 0 || u >= positions.length || v >= positions.length) return;
        if (u === v) return;
        const pu = positions[u];
        const pv = positions[v];
        const chord = trimmedChordPoints(pu, pv);
        if (!chord) return;
        const bendSign = (u + v + idx) % 2 === 0 ? 1 : -1;
        const pts = quadraticEdgeSamples(chord.p0, chord.p1, bendSign, 20);
        const el = rc.linearPath(pts, {
          stroke: edgeColor(u, v),
          strokeWidth: highlighted.includes(u) && highlighted.includes(v) ? 2.5 : 1.5,
          roughness: 1.15,
          bowing: 2.2,
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
  }, [positions, edgesNormalized, highlighted, vis, componentId, n, isComponents, isValidTree, isDark, directed, nodeState, connectedNodes, isWeightedGraph]);

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
            <>Enter <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>n</code> (nodes) and edges: pairs <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>0,1,1,2</code> or weighted triples <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>0,1,4,1,2,3</code> (u,v,w)</>
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
              {edgesNormalized.map((e, idx) => {
                const u = e[0], v = e[1], w = e[2];
                if (u < 0 || v < 0 || u >= positions.length || v >= positions.length) return null;
                if (u === v) return null;
                const pu = positions[u];
                const pv = positions[v];
                const chord = trimmedChordPoints(pu, pv);
                if (!chord) return null;
                const bendSign = (u + v + idx) % 2 === 0 ? 1 : -1;
                const { d, midChord, nx, ny } = quadraticEdgePathD(chord.p0, chord.p1, bendSign);
                const isHl = highlighted.includes(u) && highlighted.includes(v);
                const lx = midChord[0] + nx * 14;
                const ly = midChord[1] + ny * 14;
                return (
                  <g key={idx}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isHl ? EDGE_HIGHLIGHT : (isDark ? "#64748b" : "#1e1e1e")}
                      strokeWidth={isHl ? 2.5 : 1.5}
                      strokeLinecap="round"
                      markerEnd={isHl ? "url(#graph-arrow-hl)" : "url(#graph-arrow)"}
                    />
                    {isWeightedGraph && (
                      <g>
                        <circle cx={lx} cy={ly} r={11} fill={isDark ? "#0f172a" : "#ffffff"} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1.5" />
                        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 800, fill: isDark ? "#e2e8f0" : "#0f172a", pointerEvents: "none" }}>
                          {w}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}
          {!directed && isWeightedGraph && (
            <g transform={`translate(${PADDING}, ${PADDING})`}>
              {edgesNormalized.map((e, idx) => {
                const u = e[0], v = e[1], w = e[2];
                if (u < 0 || v < 0 || u >= positions.length || v >= positions.length) return null;
                if (u === v) return null;
                const pu = positions[u];
                const pv = positions[v];
                const chord = trimmedChordPoints(pu, pv);
                if (!chord) return null;
                const bendSign = (u + v + idx) % 2 === 0 ? 1 : -1;
                const { d, midChord, nx, ny } = quadraticEdgePathD(chord.p0, chord.p1, bendSign);
                const isHl = highlighted.includes(u) && highlighted.includes(v);
                const lx = midChord[0] + nx * 12;
                const ly = midChord[1] + ny * 12;
                return (
                  <g key={idx}>
                    <path
                      d={d}
                      fill="none"
                      stroke={edgeColor(u, v)}
                      strokeWidth={isHl ? 2.5 : 1.5}
                      strokeLinecap="round"
                    />
                    {isWeightedGraph && (
                      <>
                        <circle cx={lx} cy={ly} r={11} fill={isDark ? "#0f172a" : "#ffffff"} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1.5" />
                        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 800, fill: isDark ? "#e2e8f0" : "#0f172a", pointerEvents: "none" }}>
                        {w}
                        </text>
                      </>
                    )}
                  </g>
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

      {isCloneGraph && Array.isArray(queue) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 14px",
            borderRadius: 14,
            background: isDark ? "rgba(31,41,55,0.5)" : "rgba(249,250,251,0.9)",
            border: `1.5px solid ${t.border}`,
          }}
        >
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.inkMuted }}>
            Queue
          </span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, color: t.ink }}>
            {queue.length === 0 ? "[]" : `[${queue.join(", ")}]`}
          </span>
          {queue.length > 0 && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>
              (front → back)
            </span>
          )}
        </div>
      )}

      {(Array.isArray(dist) || result != null || (Array.isArray(queue) && !isCloneGraph) || Array.isArray(stack) || Array.isArray(mstEdges)) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 14,
            background: isDark ? "rgba(31,41,55,0.5)" : "rgba(249,250,251,0.9)",
            border: `1.5px solid ${t.border}`,
          }}
        >
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.inkMuted }}>
            Output
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {distMatrix && distMatrix.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.inkMuted }}>dist matrix</span>
                  {Number.isInteger(k) && k >= 0 && (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 800, color: t.blue, padding: "3px 8px", borderRadius: 999, background: t.blue + "18", border: `1px solid ${t.blue}55` }}>
                      via k={k}
                    </span>
                  )}
                </div>
                <div style={{ overflowX: "auto", paddingBottom: 2 }}>
                  <table style={{ borderCollapse: "separate", borderSpacing: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82rem" }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 28 }} />
                        {distMatrix.map((_, col) => (
                          <th key={col} style={{ minWidth: 34, padding: "5px 7px", color: t.inkMuted, fontWeight: 800, textAlign: "center" }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {distMatrix.map((row, r) => (
                        <tr key={r}>
                          <th style={{ minWidth: 28, padding: "5px 7px", color: t.inkMuted, fontWeight: 800, textAlign: "center" }}>{r}</th>
                          {row.map((value, c) => {
                            const isUpdated = Array.isArray(matrixCell) && matrixCell[0] === r && matrixCell[1] === c;
                            const isVia = Number.isInteger(k) && (r === k || c === k);
                            return (
                              <td
                                key={`${r}-${c}`}
                                style={{
                                  minWidth: 34,
                                  padding: "6px 8px",
                                  textAlign: "center",
                                  borderRadius: 8,
                                  border: `1.25px solid ${isUpdated ? t.green : isVia ? t.blue + "88" : t.border}`,
                                  background: isUpdated ? t.green + "22" : isVia ? t.blue + "12" : t.surface,
                                  color: isUpdated ? t.green : t.ink,
                                  fontWeight: isUpdated ? 900 : 700,
                                  boxShadow: isUpdated ? t.shadowSm : "none",
                                }}
                              >
                                {formatDist(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {Array.isArray(dist) && dist.length > 0 && !distMatrix && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.inkMuted }}>dist:</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95rem", fontWeight: 700, color: t.ink }}>
                  [{dist.map((d) => formatDist(d)).join(", ")}]
                </span>
              </div>
            )}
            {result != null && result !== "" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95rem", fontWeight: 700, color: t.ink }}>{result}</span>
              </div>
            )}
            {Array.isArray(queue) && !isCloneGraph && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.inkMuted }}>queue:</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95rem", fontWeight: 700, color: t.ink }}>
                  {queue.length === 0 ? "[]" : `[${queue.join(", ")}]`}
                </span>
              </div>
            )}
            {Array.isArray(stack) && stack.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.inkMuted }}>stack:</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95rem", fontWeight: 700, color: t.ink }}>
                  [{(stack || []).join(", ")}]
                </span>
              </div>
            )}
            {Array.isArray(mstEdges) && mstEdges.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: t.inkMuted }}>MST edges:</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9rem", fontWeight: 700, color: t.ink }}>
                  {mstEdges.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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
