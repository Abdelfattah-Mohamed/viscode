import { useMemo } from "react";
import { leetcodeToComplete } from "../../utils/treeFormat";
import TreeRoughView from "./TreeRoughView";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

const NODE_R = 22;
const NULL_R = 6;
const ROW_H = 52;

function getTreeWidth(arr) {
  if (!arr || !arr.length) return 200;
  const depth = Math.floor(Math.log2(arr.length));
  return Math.max(200, Math.min(460, (1 << depth) * 58));
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

/** Find index of node with given value in level-order array */
function findNodeIndex(arr, val) {
  if (val == null || !arr?.length) return -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) return i;
  }
  return -1;
}

export default function LCAOfBSTViz({ root = [], stepState = {}, t }) {
  const raw = Array.isArray(root) ? root : [];
  const arr = raw.length && raw[0] != null ? leetcodeToComplete(raw) : raw;
  const { visiting, p, q, lca, done } = stepState;

  const width = getTreeWidth(arr);
  const { nodes, edges, nullMarkers, maxLevel } = useTreeLayout(arr, width);

  const pIdx = findNodeIndex(arr, p);
  const qIdx = findNodeIndex(arr, q);

  if (!nodes.length) return (
    <div style={{
      padding: 16, textAlign: "center",
      border: `2px dashed ${t.border}40`, borderRadius: 10,
      color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "0.95rem",
    }}>
      (empty tree)
    </div>
  );

  const height = maxLevel * ROW_H + NODE_R * 2 + 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      {/* Legend: p and q */}
      {(p != null || q != null) && (
        <div style={{ display: "flex", gap: 16, fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700 }}>
          {p != null && (
            <span style={{ color: t.blue }}>
              p = {p}
              <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 6, background: t.blue + "25", border: `2px solid ${t.blue}88` }}>target</span>
            </span>
          )}
          {q != null && (
            <span style={{ color: t.purple }}>
              q = {q}
              <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 6, background: t.purple + "25", border: `2px solid ${t.purple}88` }}>target</span>
            </span>
          )}
        </div>
      )}

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width, overflow: "visible" }}>
        <g transform="translate(0, 4)">
          <TreeRoughView
            nodes={nodes}
            edges={edges}
            nullMarkers={nullMarkers}
            width={width}
            height={height}
            nodeR={NODE_R}
            t={t}
            getNodeStyle={(n) => {
              const isVisiting = n.index === visiting;
              const isP = n.index === pIdx;
              const isQ = n.index === qIdx;
              const isLCA = lca != null && n.val === lca;
              if (isLCA && done) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.success };
              if (isVisiting && lca != null) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "25", strokeWidth: 2.5 };
              if (isVisiting) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.current };
              if (isP && isQ) return { stroke: EXCALIDRAW_TREE.blue, fill: EXCALIDRAW_TREE.blue + "22", strokeWidth: 2 };
              if (isP) return { stroke: EXCALIDRAW_TREE.blue, fill: EXCALIDRAW_TREE.blue + "18", strokeWidth: 2 };
              if (isQ) return { stroke: EXCALIDRAW_TREE.purple, fill: EXCALIDRAW_TREE.purple + "18", strokeWidth: 2 };
              return null;
            }}
          />
          {nullMarkers.map((m, i) => (
            <text key={`nm${i}`} x={m.x} y={m.y + 0.5} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: "0.5em", fill: t.inkMuted + "77", fontFamily: "sans-serif" }}>×</text>
          ))}
          {nodes.map(n => {
            const isVisiting = n.index === visiting;
            const isP = n.index === pIdx;
            const isQ = n.index === qIdx;
            const isLCA = lca != null && n.val === lca;
            let label = "";
            if (isLCA && done) label = "LCA";
            else if (isVisiting && lca != null) label = "LCA";
            else if (isVisiting) label = "visit";
            else if (isP && isQ) label = "p,q";
            else if (isP) label = "p";
            else if (isQ) label = "q";
            return (
              <g key={n.index}>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, fill: t.ink }}>{n.val}</text>
                {label && (
                  <text x={n.x} y={n.y + NODE_R + 10} textAnchor="middle"
                    style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", fontWeight: 700, fill: isLCA ? t.green : (isP ? t.blue : isQ ? t.purple : t.yellow) }}>{label}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Result panel */}
      {lca != null && (
        <div style={{
          padding: "12px 24px",
          borderRadius: 12,
          border: `2px solid ${done ? t.green : t.yellow}`,
          background: (done ? t.green : t.yellow) + "22",
          fontFamily: "'Caveat',cursive",
          fontSize: "1.2em",
          fontWeight: 700,
          color: t.ink,
          textAlign: "center",
        }}>
          LCA = <span style={{ fontFamily: "'JetBrains Mono',monospace", color: done ? t.green : t.yellow }}>{lca}</span>
          {done && <span style={{ marginLeft: 8, color: t.green }}>✓</span>}
        </div>
      )}
    </div>
  );
}
