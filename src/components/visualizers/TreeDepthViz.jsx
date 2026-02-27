import { useMemo } from "react";
import TreeRoughView from "./TreeRoughView";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

const NODE_R = 20;
const NULL_R = 6;
const ROW_H = 56;

function getTreeWidth(arr) {
  if (!arr || !arr.length) return 180;
  const depth = Math.floor(Math.log2(arr.length));
  return Math.max(180, Math.min(440, (1 << depth) * 54));
}

function useTreeLayout(arr, width) {
  return useMemo(() => {
    if (!arr || !arr.length) return { nodes: [], edges: [], nullMarkers: [], maxLevel: 0 };

    const validSet = new Set();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === null || arr[i] === undefined) continue;
      if (i === 0 || validSet.has(Math.floor((i - 1) / 2))) validSet.add(i);
    }

    const nodes = [], nullMarkers = [], nodeMap = new Map();

    for (let i = 0; i < arr.length; i++) {
      const level = i === 0 ? 0 : Math.floor(Math.log2(i + 1));
      const posInLevel = i - (1 << level) + 1;
      const totalInLevel = 1 << level;
      const x = ((posInLevel + 0.5) / totalInLevel) * width;
      const y = level * ROW_H + NODE_R + 2;

      if (validSet.has(i)) {
        const node = { index: i, val: arr[i], level, x, y };
        nodes.push(node);
        nodeMap.set(i, node);
      } else if (arr[i] === null && i > 0 && validSet.has(Math.floor((i - 1) / 2))) {
        nullMarkers.push({ index: i, x, y, parentIdx: Math.floor((i - 1) / 2) });
      }
    }

    nullMarkers.forEach(m => { m.parentNode = nodeMap.get(m.parentIdx); });

    const edges = [];
    nodes.forEach(n => {
      const li = 2 * n.index + 1, ri = 2 * n.index + 2;
      if (nodeMap.has(li)) edges.push({ from: n, to: nodeMap.get(li) });
      if (nodeMap.has(ri)) edges.push({ from: n, to: nodeMap.get(ri) });
    });

    const maxLevel = nodes.length ? Math.max(0, ...nodes.map(n => n.level)) : 0;
    return { nodes, edges, nullMarkers, maxLevel };
  }, [arr, width]);
}

export default function TreeDepthViz({ root = [], stepState = {}, t }) {
  const arr = Array.isArray(root) ? root : [];
  const { visiting, depthMap = {}, maxDepth, done } = stepState;

  const width = getTreeWidth(arr);
  const { nodes, edges, nullMarkers, maxLevel } = useTreeLayout(arr, width);

  if (!nodes.length) return (
    <div style={{
      padding: 16, textAlign: "center",
      border: `2px dashed ${t.border}40`, borderRadius: 10,
      color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "0.95rem",
    }}>
      (empty tree)
    </div>
  );

  const height = maxLevel * ROW_H + NODE_R * 2 + 36;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width, overflow: "visible" }}>
        <g transform="translate(0, 4)">
          <TreeRoughView
            nodes={nodes}
            edges={edges}
            nullMarkers={nullMarkers}
            width={width}
            height={height}
            t={t}
            getNodeStyle={(n) => {
              const isCur = n.index === visiting;
              const hasDepth = depthMap[n.index] !== undefined;
              if (isCur) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.current };
              if (hasDepth) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "18", strokeWidth: 2.5 };
              return null;
            }}
          />
          {nullMarkers.map((m, i) => (
            <text key={`nm${i}`} x={m.x} y={m.y + 0.5} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: "0.5em", fill: t.inkMuted + "77", fontFamily: "sans-serif" }}>×</text>
          ))}
          {nodes.map((n) => (
            <g key={n.index}>
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15em", fontWeight: 700, fill: t.ink }}>{n.val}</text>
              {depthMap[n.index] !== undefined && (
                <text x={n.x} y={n.y + NODE_R + 13} textAnchor="middle"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6em", fontWeight: 600, fill: t.green }}>
                  d={depthMap[n.index]}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {maxDepth !== undefined && (
        <div style={{
          padding: "8px 18px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${done ? t.green : t.border}`,
          background: done ? t.green + "18" : t.surfaceAlt,
          fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700,
          color: done ? t.green : t.ink,
        }}>
          Max Depth: <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{maxDepth}</span>
          {done && " ✅"}
        </div>
      )}
    </div>
  );
}
