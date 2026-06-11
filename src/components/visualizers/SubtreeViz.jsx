import { useMemo } from "react";
import TreeRoughView from "./TreeRoughView";
import TreeSvgFrame from "./TreeSvgFrame";
import { useTreeLayout } from "./treeLayout";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

function TreeView({ arr, label, icon, highlightSet, currentIndex, matchSet, t }) {
  const { nodes, edges, nullMarkers, width, height, nodeR } = useTreeLayout(arr);

  if (!nodes.length) return (
    <div style={{
      padding: 16, textAlign: "center",
      border: `2px dashed ${t.border}40`, borderRadius: 10,
      color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "0.95rem",
    }}>
      {icon} {label}: (empty)
    </div>
  );

  const labelSize = "1.15em";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
      <div style={{
        fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700,
        color: t.inkMuted, padding: "2px 10px", borderRadius: 6,
        background: t.surfaceAlt, border: `1.5px solid ${t.border}25`,
      }}>
        {icon} {label}
      </div>
      <TreeSvgFrame width={width} height={height}>
        <g transform="translate(0, 4)">
          <TreeRoughView
            nodes={nodes}
            edges={edges}
            nullMarkers={nullMarkers}
            width={width}
            height={height}
            nodeR={nodeR}
            t={t}
            getNodeStyle={(n) => {
              const isCur = n.index === currentIndex;
              const isHl = highlightSet.has(n.index);
              const isMt = matchSet.has(n.index);
              if (isMt) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.success };
              if (isCur) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.current };
              if (isHl) return { stroke: EXCALIDRAW_TREE.highlight, fill: EXCALIDRAW_TREE.highlight + "18", strokeWidth: 2 };
              return null;
            }}
            getEdgeStyle={(e) => {
              const mt = matchSet.has(e.from.index) && matchSet.has(e.to.index);
              if (mt) return { stroke: EXCALIDRAW_TREE.success, strokeWidth: 2.5 };
              return null;
            }}
          />
          {nullMarkers.map((m, i) => (
            <text key={`nm${i}`} x={m.x} y={m.y + 0.5} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: "0.5em", fill: t.inkMuted + "77", fontFamily: "sans-serif" }}>×</text>
          ))}
          {nodes.map((n) => (
            <text key={n.index} x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
              style={{ fontFamily: "'Caveat',cursive", fontSize: labelSize, fontWeight: 700, fill: t.ink }}>
              {n.val}
            </text>
          ))}
        </g>
      </TreeSvgFrame>
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", gap: 16, justifyContent: "center",
        flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreeView arr={rootArr} label="Root" icon="🌳" t={t}
            currentIndex={rootVisit} highlightSet={rootHighlight} matchSet={rootMatchSet} />
        </div>
        <div style={{
          width: 1, alignSelf: "stretch",
          background: `linear-gradient(to bottom, transparent, ${t.border}33, transparent)`,
          flexShrink: 0,
        }} />
        <div style={{ flex: "0 1 auto", minWidth: 0 }}>
          <TreeView arr={subArr} label="SubRoot" icon="🔍" t={t}
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
