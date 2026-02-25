import { useMemo } from "react";

const NODE_R = 20;
const ROW_H = 52;
const WIDTH = 420;

// Level-order: index i has left 2i+1, right 2i+2. Compute (level, posInLevel) and then x,y.
function useTreeLayout(arr) {
  return useMemo(() => {
    if (!arr || !arr.length) return { nodes: [], edges: [] };
    const nodes = [];
    for (let i = 0; i < arr.length; i++) {
      const level = i === 0 ? 0 : Math.floor(Math.log2(i + 1));
      const posInLevel = i - (1 << level) + 1;
      const totalInLevel = 1 << level;
      const x = ((posInLevel + 0.5) / totalInLevel) * WIDTH;
      const y = level * ROW_H + NODE_R;
      nodes.push({ index: i, val: arr[i], level, posInLevel, totalInLevel, x, y });
    }
    const edges = [];
    nodes.forEach(n => {
      const leftIdx = 2 * n.index + 1;
      const rightIdx = 2 * n.index + 2;
      if (leftIdx < arr.length) edges.push({ from: n, to: nodes[leftIdx], side: "left" });
      if (rightIdx < arr.length) edges.push({ from: n, to: nodes[rightIdx], side: "right" });
    });
    return { nodes, edges };
  }, [arr]);
}

function TreeView({ arr, highlightSet, currentIndex, matchSet, t }) {
  const { nodes, edges } = useTreeLayout(arr);
  if (!nodes.length) return <div style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted }}>root: (empty)</div>;

  const maxLevel = Math.max(0, ...nodes.map(n => n.level));
  const height = maxLevel * ROW_H + NODE_R * 2 + 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.inkMuted }}>root</div>
      <svg width="100%" viewBox={`0 0 ${WIDTH} ${height}`} style={{ maxWidth: WIDTH, overflow: "visible" }}>
        <g transform="translate(0, 8)">
          {/* Edges first (behind nodes), from parent edge to child edge */}
          {edges.map((e, i) => {
            const dx = e.to.x - e.from.x;
            const dy = e.to.y - e.from.y;
            const d = Math.hypot(dx, dy) || 1;
            const x1 = e.from.x + (dx / d) * NODE_R;
            const y1 = e.from.y + (dy / d) * NODE_R;
            const x2 = e.to.x - (dx / d) * NODE_R;
            const y2 = e.to.y - (dy / d) * NODE_R;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={t.border}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          {/* Nodes */}
          {nodes.map(n => {
            const isCurrent = n.index === currentIndex;
            const isHighlight = highlightSet.has(n.index);
            const isMatch = matchSet.has(n.index);
            const border = isMatch ? t.green : isCurrent ? t.yellow : isHighlight ? t.blue : t.border;
            const bg = isMatch ? t.green + "33" : isCurrent ? t.yellow + "33" : isHighlight ? t.blue + "22" : t.surface;
            return (
              <g key={n.index}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R}
                  fill={bg}
                  stroke={border}
                  strokeWidth="2"
                />
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15em", fontWeight: 700, fill: t.ink }}
                >
                  {n.val}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {(currentIndex >= 0 || matchSet.size) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", fontSize: "0.8rem", color: t.inkMuted }}>
          {currentIndex >= 0 && <span>Current: index <strong style={{ color: t.yellow }}>{currentIndex}</strong></span>}
          {matchSet.size > 0 && <span style={{ color: t.green }}>✓ Subtree match at index {[...matchSet][0]}</span>}
        </div>
      )}
    </div>
  );
}

export default function SubtreeViz({ root = [], subRoot = [], stepState = {}, t }) {
  const rootArr = Array.isArray(root) ? root : [];
  const {
    rootVisit = -1,
    sameRootPath = [],
    found = false,
    matchAt = -1,
    done = false,
  } = stepState;

  const rootHighlight = useMemo(() => new Set(sameRootPath), [sameRootPath]);
  const rootMatchSet = useMemo(() => (found && matchAt >= 0 ? new Set([matchAt]) : new Set()), [found, matchAt]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TreeView
        arr={rootArr}
        t={t}
        currentIndex={rootVisit}
        highlightSet={rootHighlight}
        matchSet={rootMatchSet}
      />
      {(found || done) && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: `2px solid ${found ? t.green : t.border}`,
          background: found ? t.green + "22" : t.surfaceAlt,
          fontFamily: "'Caveat',cursive",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: found ? t.green : t.inkMuted,
        }}>
          {found ? `✅ Subtree found at root index ${matchAt}` : "❌ No matching subtree"}
        </div>
      )}
    </div>
  );
}
