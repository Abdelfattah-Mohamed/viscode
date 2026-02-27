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

function TreePanel({ arr, label, icon, visitingIdx, matchSet, mismatchIdx, t, width }) {
  const { nodes, edges, nullMarkers, maxLevel } = useTreeLayout(arr, width);

  if (!nodes.length) return (
    <div style={{
      padding: 16, textAlign: "center",
      border: `2px dashed ${t.border}40`, borderRadius: 10,
      color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "0.95rem",
    }}>
      {icon} {label}: (empty)
    </div>
  );

  const height = maxLevel * ROW_H + NODE_R * 2 + 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <div style={{
        fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700,
        color: t.inkMuted, padding: "2px 10px", borderRadius: 6,
        background: t.surfaceAlt, border: `1.5px solid ${t.border}25`,
      }}>
        {icon} {label}
      </div>
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
              const isCur = n.index === visitingIdx;
              const isMt = matchSet.has(n.index);
              const isMismatch = n.index === mismatchIdx;
              if (isMismatch) return { stroke: EXCALIDRAW_TREE.error, fill: EXCALIDRAW_TREE.error + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.error };
              if (isMt) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "22", strokeWidth: 2.5 };
              if (isCur) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.current };
              return null;
            }}
            getEdgeStyle={(e) => {
              if (matchSet.has(e.from.index) && matchSet.has(e.to.index)) return { stroke: EXCALIDRAW_TREE.success, strokeWidth: 2.5 };
              return null;
            }}
          />
          {nullMarkers.map((m, i) => (
            <text key={`nm${i}`} x={m.x} y={m.y + 0.5} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: "0.5em", fill: t.inkMuted + "77", fontFamily: "sans-serif" }}>×</text>
          ))}
          {nodes.map((n) => (
            <text key={n.index} x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
              style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15em", fontWeight: 700, fill: t.ink }}>{n.val}</text>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function SameTreeViz({ p = [], q = [], stepState = {}, t }) {
  const pArr = Array.isArray(p) ? p : [];
  const qArr = Array.isArray(q) ? q : [];

  const { visitingP, visitingQ, matchSet: matchArr = [], mismatch, result, done } = stepState;

  const matchSetP = useMemo(() => new Set(matchArr), [matchArr]);
  const matchSetQ = useMemo(() => new Set(matchArr), [matchArr]);

  const pWidth = getTreeWidth(pArr);
  const qWidth = getTreeWidth(qArr);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", gap: 16, justifyContent: "center",
        flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreePanel arr={pArr} label="Tree P" icon="🌲" t={t} width={pWidth}
            visitingIdx={visitingP} matchSet={matchSetP} mismatchIdx={mismatch} />
        </div>
        <div style={{
          width: 1, alignSelf: "stretch",
          background: `linear-gradient(to bottom, transparent, ${t.border}33, transparent)`,
          flexShrink: 0,
        }} />
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreePanel arr={qArr} label="Tree Q" icon="🌳" t={t} width={qWidth}
            visitingIdx={visitingQ} matchSet={matchSetQ} mismatchIdx={mismatch} />
        </div>
      </div>

      {done && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${result ? t.green : t.red}`,
          background: result ? t.green + "18" : t.red + "18",
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: result ? t.green : t.red,
        }}>
          {result ? "✅ Same tree!" : "❌ Different trees"}
        </div>
      )}
    </div>
  );
}
