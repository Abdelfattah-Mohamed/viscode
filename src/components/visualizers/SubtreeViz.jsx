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

function TreeView({ arr, label, icon, highlightSet, currentIndex, matchSet, t, width }) {
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
          {edges.map((e, i) => {
            const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y;
            const d = Math.hypot(dx, dy) || 1;
            const hl = highlightSet.has(e.from.index) && highlightSet.has(e.to.index);
            const mt = matchSet.has(e.from.index) && matchSet.has(e.to.index);
            return (
              <line key={`e${i}`}
                x1={e.from.x + (dx / d) * NODE_R} y1={e.from.y + (dy / d) * NODE_R}
                x2={e.to.x - (dx / d) * NODE_R} y2={e.to.y - (dy / d) * NODE_R}
                stroke={mt ? t.green + "80" : hl ? t.blue + "70" : t.border + "44"}
                strokeWidth={mt ? 2.5 : hl ? 2 : 1.5}
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
            const isCur = n.index === currentIndex;
            const isHl = highlightSet.has(n.index);
            const isMt = matchSet.has(n.index);
            const border = isMt ? t.green : isCur ? t.yellow : isHl ? t.blue : t.border + "66";
            const bg = isMt ? t.green + "30" : isCur ? t.yellow + "30" : isHl ? t.blue + "20" : t.surface;
            const sw = isMt || isCur ? 2.5 : 2;
            return (
              <g key={n.index}>
                {(isMt || isCur) && (
                  <circle cx={n.x} cy={n.y} r={NODE_R + 5}
                    fill="none" stroke={border} strokeWidth={1} opacity={0.25} />
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
    </div>
  );
}

export default function SubtreeViz({ root = [], subRoot = [], stepState = {}, t }) {
  const rootArr = Array.isArray(root) ? root : [];
  const subArr = Array.isArray(subRoot) ? subRoot : [];

  const {
    rootVisit = -1,
    sameRootPath = [],
    sameSubPath = [],
    found = false,
    matchAt = -1,
    done = false,
  } = stepState;

  const rootHighlight = useMemo(() => new Set(sameRootPath), [sameRootPath]);
  const subHighlight = useMemo(() => new Set(sameSubPath), [sameSubPath]);

  const rootMatchSet = useMemo(() => {
    if (!found || matchAt < 0) return new Set();
    const set = new Set();
    function collect(rIdx, sIdx) {
      if (rIdx < 0 || rIdx >= rootArr.length || rootArr[rIdx] === null) return;
      if (sIdx < 0 || sIdx >= subArr.length || subArr[sIdx] === null) return;
      set.add(rIdx);
      collect(2 * rIdx + 1, 2 * sIdx + 1);
      collect(2 * rIdx + 2, 2 * sIdx + 2);
    }
    collect(matchAt, 0);
    return set;
  }, [found, matchAt, rootArr, subArr]);

  const subMatchSet = useMemo(() => {
    if (!found) return new Set();
    return new Set(subArr.map((_, i) => i).filter(i => subArr[i] !== null && subArr[i] !== undefined));
  }, [found, subArr]);

  const rootWidth = getTreeWidth(rootArr);
  const subWidth = getTreeWidth(subArr);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", gap: 16, justifyContent: "center",
        flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreeView arr={rootArr} label="Root" icon="🌳" t={t} width={rootWidth}
            currentIndex={rootVisit} highlightSet={rootHighlight} matchSet={rootMatchSet} />
        </div>
        <div style={{
          width: 1, alignSelf: "stretch",
          background: `linear-gradient(to bottom, transparent, ${t.border}33, transparent)`,
          flexShrink: 0,
        }} />
        <div style={{ flex: "0 1 auto", minWidth: 0 }}>
          <TreeView arr={subArr} label="SubRoot" icon="🔍" t={t} width={subWidth}
            currentIndex={-1} highlightSet={subHighlight} matchSet={subMatchSet} />
        </div>
      </div>

      {rootVisit >= 0 && !found && !done && (
        <div style={{
          display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
          fontSize: "0.82rem", fontFamily: "'Caveat',cursive",
        }}>
          <span style={{
            padding: "2px 10px", borderRadius: 6,
            background: t.yellow + "22", color: t.yellow,
            border: `1px solid ${t.yellow}33`,
          }}>
            Visiting index {rootVisit}
          </span>
          {sameRootPath.length > 0 && (
            <span style={{
              padding: "2px 10px", borderRadius: 6,
              background: t.blue + "22", color: t.blue,
              border: `1px solid ${t.blue}33`,
            }}>
              Comparing subtrees…
            </span>
          )}
        </div>
      )}

      {(found || done) && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${found ? t.green : t.border}`,
          background: found ? t.green + "18" : t.surfaceAlt,
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: found ? t.green : t.inkMuted,
        }}>
          {found ? `✅ Subtree found at root index ${matchAt}` : "❌ No matching subtree"}
        </div>
      )}
    </div>
  );
}
