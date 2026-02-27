import { useMemo } from "react";
import { leetcodeToComplete } from "../../utils/treeFormat";

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
          {edges.map((e, i) => {
            const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y;
            const d = Math.hypot(dx, dy) || 1;
            return (
              <line key={`e${i}`}
                x1={e.from.x + (dx / d) * NODE_R} y1={e.from.y + (dy / d) * NODE_R}
                x2={e.to.x - (dx / d) * NODE_R} y2={e.to.y - (dy / d) * NODE_R}
                stroke={t.border + "44"} strokeWidth={1.5} strokeLinecap="round"
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
            const isVisiting = n.index === visiting;
            const isP = n.index === pIdx;
            const isQ = n.index === qIdx;
            const isLCA = lca != null && n.val === lca;

            let border = t.border + "66";
            let bg = t.surface;
            let label = "";

            if (isLCA && done) {
              border = t.green;
              bg = t.green + "30";
              label = "LCA";
            } else if (isVisiting && lca != null) {
              border = t.green;
              bg = t.green + "25";
              label = "LCA";
            } else if (isVisiting) {
              border = t.yellow;
              bg = t.yellow + "30";
              label = "visit";
            } else if (isP && isQ) {
              border = t.blue + "cc";
              bg = t.blue + "22";
              label = "p,q";
            } else if (isP) {
              border = t.blue + "cc";
              bg = t.blue + "18";
              label = "p";
            } else if (isQ) {
              border = t.purple + "cc";
              bg = t.purple + "18";
              label = "q";
            }

            const sw = (isVisiting || isLCA) ? 2.5 : 2;

            return (
              <g key={n.index}>
                {(isVisiting || (isLCA && done)) && (
                  <circle cx={n.x} cy={n.y} r={NODE_R + 6}
                    fill="none" stroke={isLCA ? t.green : t.yellow} strokeWidth={1.5} opacity={0.3} />
                )}
                <circle cx={n.x} cy={n.y} r={NODE_R} fill={bg} stroke={border} strokeWidth={sw} />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, fill: t.ink }}>
                  {n.val}
                </text>
                {label && (
                  <text x={n.x} y={n.y + NODE_R + 10} textAnchor="middle"
                    style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", fontWeight: 700, fill: isLCA ? t.green : (isP ? t.blue : isQ ? t.purple : t.yellow) }}>
                    {label}
                  </text>
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
