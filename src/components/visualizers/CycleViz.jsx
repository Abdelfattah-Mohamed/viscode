import { useEffect, useRef } from "react";
import rough from "roughjs";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

const NODE_R = 22;
const ARROW_GAP = 28;
const CELL = NODE_R * 2 + ARROW_GAP;
const CURVE_H = 56;
const SVG_PAD = 48;

export default function CycleViz({ head = [], stepState = {}, t }) {
  const roughRef = useRef(null);
  const { slow = -1, fast = -1, hasCycle = null, pos = -1 } = stepState;
  const nodes = Array.isArray(head) ? head : [];
  const n = nodes.length;
  const showCycle = pos >= 0 && pos < n;
  const isDark = t._resolved === "dark";

  const svgWidth = Math.max(n * CELL + SVG_PAD * 2, 120);
  const nodeRowY = 44;
  const curveY = nodeRowY + NODE_R + 20;
  const svgHeight = showCycle && n > 0 && pos >= 0 && pos < n - 1 ? curveY + CURVE_H + 24 : 100;

  useEffect(() => {
    const g = roughRef.current;
    if (!g || !nodes.length) return;
    g.innerHTML = "";
    const rc = rough.svg(g, {
      options: { roughness: EXCALIDRAW_TREE.roughness, bowing: EXCALIDRAW_TREE.bowing },
    });

    const getNodeStroke = (idx) => {
      if (idx === slow) return EXCALIDRAW_TREE.blue;
      if (idx === fast) return EXCALIDRAW_TREE.highlight;
      if (idx === pos && showCycle) return EXCALIDRAW_TREE.current;
      return isDark ? EXCALIDRAW_TREE.strokeLight : EXCALIDRAW_TREE.stroke;
    };
    const getNodeFill = (idx) => {
      if (idx === slow) return EXCALIDRAW_TREE.blue + "22";
      if (idx === fast) return EXCALIDRAW_TREE.highlight + "22";
      if (idx === pos && showCycle) return EXCALIDRAW_TREE.current + "22";
      return isDark ? EXCALIDRAW_TREE.fillNodeDark : EXCALIDRAW_TREE.fillNode;
    };

    const cx = (i) => SVG_PAD + i * CELL + NODE_R;

    // Edges (arrows between consecutive nodes)
    for (let i = 0; i < n - 1; i++) {
      const x1 = cx(i) + NODE_R;
      const x2 = cx(i + 1) - NODE_R;
      const stroke = isDark ? EXCALIDRAW_TREE.strokeMuted : EXCALIDRAW_TREE.stroke;
      const line = rc.line(x1, nodeRowY, x2, nodeRowY, {
        stroke,
        strokeWidth: EXCALIDRAW_TREE.strokeWidth,
      });
      g.appendChild(line);
    }

    // Node circles (hand-drawn)
    nodes.forEach((_, idx) => {
      const x = cx(idx);
      const stroke = getNodeStroke(idx);
      const fill = getNodeFill(idx);
      const circle = rc.circle(x, nodeRowY, NODE_R * 2, {
        fill,
        fillStyle: "solid",
        stroke,
        strokeWidth: EXCALIDRAW_TREE.strokeWidth,
        roughness: EXCALIDRAW_TREE.roughness,
      });
      g.appendChild(circle);
    });

    // Cycle back-edge (dashed path, Excalidraw-style color)
    const startX = cx(n - 1);
    const endX = cx(pos);
    const sameNode = startX === endX;
    if (showCycle && n > 0 && !sameNode) {
      const midX = (startX + endX) / 2;
      const yStart = nodeRowY + NODE_R;
      const yEnd = nodeRowY - NODE_R;
      const cpy = curveY + CURVE_H;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${startX} ${yStart} Q ${midX} ${cpy} ${endX} ${yEnd}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", EXCALIDRAW_TREE.current);
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("stroke-dasharray", "5 4");
      path.setAttribute("stroke-linecap", "round");
      g.appendChild(path);
    }
  }, [nodes, slow, fast, pos, showCycle, n, isDark]);

  const cx = (i) => SVG_PAD + i * CELL + NODE_R;
  const sameNode = n > 0 && pos >= 0 && pos < n && cx(n - 1) === cx(pos);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          linked list {showCycle && <span style={{ fontSize: "0.8em", color: EXCALIDRAW_TREE.highlight }}>(cycle at index {pos})</span>}
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg width={svgWidth} height={svgHeight} style={{ display: "block" }} aria-hidden>
            <g ref={roughRef} transform={`translate(0, 0)`} />
            {/* Labels on top */}
            {nodes.map((val, idx) => {
              const x = cx(idx);
              const isSlow = idx === slow;
              const isFast = idx === fast;
              return (
                <g key={idx}>
                  {(isSlow || isFast) && (
                    <text
                      x={x}
                      y={nodeRowY - NODE_R - 6}
                      textAnchor="middle"
                      fontFamily="'Caveat',cursive"
                      fontSize="14"
                      fontWeight="700"
                      fill={isSlow ? EXCALIDRAW_TREE.blue : EXCALIDRAW_TREE.highlight}
                    >
                      {isSlow ? "slow" : "fast"}
                    </text>
                  )}
                  <text
                    x={x}
                    y={nodeRowY + 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="'JetBrains Mono',monospace"
                    fontSize="14"
                    fontWeight="700"
                    fill={isDark ? "#e2e8f0" : "#1e1e1e"}
                  >
                    {val}
                  </text>
                  <text
                    x={x}
                    y={nodeRowY + NODE_R + 14}
                    textAnchor="middle"
                    fontFamily="'Caveat',cursive"
                    fontSize="12"
                    fill={t.inkMuted}
                  >
                    {idx}
                  </text>
                </g>
              );
            })}
            {showCycle && n > 0 && !sameNode && pos >= 0 && (
              <text
                x={(cx(n - 1) + cx(pos)) / 2}
                y={curveY + CURVE_H / 2}
                textAnchor="middle"
                fontFamily="'Caveat',cursive"
                fontSize="12"
                fontWeight="700"
                fill={t.inkMuted}
              >
                → index {pos}
              </text>
            )}
          </svg>
        </div>
      </div>
      {hasCycle === true && (
        <div style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${EXCALIDRAW_TREE.success}`, background: EXCALIDRAW_TREE.success + "22", fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: EXCALIDRAW_TREE.success }}>
          ✅ Cycle detected!
        </div>
      )}
      {hasCycle === false && (
        <div style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", color: t.inkMuted }}>
          No cycle
        </div>
      )}
    </div>
  );
}
