import { useMemo } from "react";

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

export default function InvertTreeViz({ root = [], stepState = {}, t }) {
  const { visiting, swapped = [], inverted, done } = stepState;
  const arr = Array.isArray(inverted) && inverted.length ? inverted : (Array.isArray(root) ? root : []);

  const swappedSet = useMemo(() => new Set(swapped), [swapped]);

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

  const height = maxLevel * ROW_H + NODE_R * 2 + 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width, overflow: "visible" }}>
        <g transform="translate(0, 4)">
          {edges.map((e, i) => {
            const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y;
            const d = Math.hypot(dx, dy) || 1;
            const hl = swappedSet.has(e.from.index) && swappedSet.has(e.to.index);
            return (
              <line key={`e${i}`}
                x1={e.from.x + (dx / d) * NODE_R} y1={e.from.y + (dy / d) * NODE_R}
                x2={e.to.x - (dx / d) * NODE_R} y2={e.to.y - (dy / d) * NODE_R}
                stroke={hl ? t.green + "70" : t.border + "44"}
                strokeWidth={hl ? 2 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {nullMarkers.map((m, i) => {
            if (!m.parentNode) return null;
            const dx = m.x - m.parentNode.x, dy = m.y - m.parentNode.y;
            const d = Math.hypot(dx, dy) || 1;
            return (
              <g key={`nm${i}`}>
                <line
                  x1={m.parentNode.x + (dx / d) * NODE_R} y1={m.parentNode.y + (dy / d) * NODE_R}
                  x2={m.x} y2={m.y}
                  stroke={t.border + "28"} strokeWidth={1} strokeDasharray="4,3"
                />
                <circle cx={m.x} cy={m.y} r={NULL_R}
                  fill="none" stroke={t.border + "40"} strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={m.x} y={m.y + 0.5} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: "0.5em", fill: t.inkMuted + "77", fontFamily: "sans-serif" }}>
                  ×
                </text>
              </g>
            );
          })}

          {nodes.map(n => {
            const isCur = n.index === visiting;
            const isSwapped = swappedSet.has(n.index);
            const border = isCur ? t.yellow : isSwapped ? t.green : t.border + "66";
            const bg = isCur ? t.yellow + "30" : isSwapped ? t.green + "20" : t.surface;
            const sw = isCur || isSwapped ? 2.5 : 2;
            return (
              <g key={n.index}>
                {isCur && (
                  <circle cx={n.x} cy={n.y} r={NODE_R + 5}
                    fill="none" stroke={t.yellow} strokeWidth={1} opacity={0.25} />
                )}
                <circle cx={n.x} cy={n.y} r={NODE_R} fill={bg} stroke={border} strokeWidth={sw} />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15em", fontWeight: 700, fill: t.ink }}>
                  {n.val}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {done && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${t.green}`,
          background: t.green + "18",
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: t.green,
        }}>
          ✅ Inverted!
        </div>
      )}
    </div>
  );
}
