import { useEffect, useRef } from "react";
import rough from "roughjs";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

const DEFAULT_NODE_R = 20;
const NULL_R = 6;

/**
 * Renders tree edges and nodes with Excalidraw-style hand-drawn look (roughjs).
 * Caller must render node labels (text) in a separate <g> on top.
 */
export default function TreeRoughView({
  nodes,
  edges,
  nullMarkers,
  width,
  height,
  getNodeStyle,
  getEdgeStyle,
  nodeR = DEFAULT_NODE_R,
  t,
}) {
  const gRef = useRef(null);
  const isDark = t._resolved === "dark";

  useEffect(() => {
    const g = gRef.current;
    if (!g || !nodes?.length) return;
    const edgeList = edges ?? [];
    const nullList = nullMarkers ?? [];
    g.innerHTML = "";
    const rc = rough.svg(g, {
      options: { roughness: EXCALIDRAW_TREE.roughness, bowing: EXCALIDRAW_TREE.bowing },
    });

    // Edges
    edgeList.forEach((e, i) => {
      const dx = e.to.x - e.from.x;
      const dy = e.to.y - e.from.y;
      const d = Math.hypot(dx, dy) || 1;
      const x1 = e.from.x + (dx / d) * nodeR;
      const y1 = e.from.y + (dy / d) * nodeR;
      const x2 = e.to.x - (dx / d) * nodeR;
      const y2 = e.to.y - (dy / d) * nodeR;
      const defaultEdge = { stroke: isDark ? EXCALIDRAW_TREE.strokeMuted : EXCALIDRAW_TREE.stroke, strokeWidth: 1.8 };
      const style = (getEdgeStyle ? getEdgeStyle(e, i) : null) || defaultEdge;
      const el = rc.line(x1, y1, x2, y2, {
        stroke: style.stroke,
        strokeWidth: style.strokeWidth ?? 1.8,
      });
      g.appendChild(el);
    });

    // Null marker lines (dashed – keep as plain SVG for clarity)
    nullList.forEach((m) => {
      if (!m.parentNode) return;
      const dx = m.x - m.parentNode.x;
      const dy = m.y - m.parentNode.y;
      const d = Math.hypot(dx, dy) || 1;
      const line = rc.line(
        m.parentNode.x + (dx / d) * nodeR,
        m.parentNode.y + (dy / d) * nodeR,
        m.x,
        m.y,
        { stroke: isDark ? EXCALIDRAW_TREE.strokeLight + "44" : EXCALIDRAW_TREE.strokeMuted + "66", strokeWidth: 1, roughness: 0.5 }
      );
      g.appendChild(line);
      const circle = rc.circle(m.x, m.y, NULL_R * 2, {
        fill: "none",
        stroke: isDark ? EXCALIDRAW_TREE.strokeLight + "66" : EXCALIDRAW_TREE.strokeMuted + "99",
        strokeWidth: 1.5,
        roughness: 0.8,
      });
      g.appendChild(circle);
    });

    // Nodes
    nodes.forEach((n) => {
      const defaultStyle = {
        stroke: isDark ? EXCALIDRAW_TREE.strokeLight : EXCALIDRAW_TREE.stroke,
        fill: isDark ? EXCALIDRAW_TREE.fillNodeDark : EXCALIDRAW_TREE.fillNode,
        strokeWidth: EXCALIDRAW_TREE.strokeWidth,
      };
      const style = (getNodeStyle ? getNodeStyle(n) : null) || defaultStyle;
      const stroke = style.stroke ?? (isDark ? EXCALIDRAW_TREE.strokeLight : EXCALIDRAW_TREE.stroke);
      const fill = style.fill ?? (isDark ? EXCALIDRAW_TREE.fillNodeDark : EXCALIDRAW_TREE.fillNode);
      const sw = style.strokeWidth ?? EXCALIDRAW_TREE.strokeWidth;
      if (style.ring) {
        const ring = rc.circle(n.x, n.y, (nodeR + 5) * 2, {
          fill: "none",
          stroke: style.ring,
          strokeWidth: 1.5,
          roughness: 1.2,
        });
        g.appendChild(ring);
      }
      const circle = rc.circle(n.x, n.y, nodeR * 2, {
        fill,
        fillStyle: "solid",
        stroke,
        strokeWidth: sw,
        roughness: EXCALIDRAW_TREE.roughness,
      });
      g.appendChild(circle);
    });
  }, [nodes, edges, nullMarkers, getNodeStyle, getEdgeStyle, nodeR, t, isDark]);

  return <g ref={gRef} />;
}
