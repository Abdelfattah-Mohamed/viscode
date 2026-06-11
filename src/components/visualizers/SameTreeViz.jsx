import { useMemo } from "react";
import TreeRoughView from "./TreeRoughView";
import TreeSvgFrame from "./TreeSvgFrame";
import { useTreeLayout } from "./treeLayout";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

function TreePanel({ arr, label, icon, visitingIdx, matchSet, mismatchIdx, t }) {
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
              style={{ fontFamily: "'Caveat',cursive", fontSize: labelSize, fontWeight: 700, fill: t.ink }}>{n.val}</text>
          ))}
        </g>
      </TreeSvgFrame>
    </div>
  );
}

export default function SameTreeViz({ p = [], q = [], stepState = {}, t }) {
  const pArr = Array.isArray(p) ? p : [];
  const qArr = Array.isArray(q) ? q : [];

  const { visitingP, visitingQ, matchSet: matchArr = [], mismatch, result, done } = stepState;

  const matchSetP = useMemo(() => new Set(matchArr), [matchArr]);
  const matchSetQ = useMemo(() => new Set(matchArr), [matchArr]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", gap: 16, justifyContent: "center",
        flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreePanel arr={pArr} label="Tree P" icon="🌲" t={t}
            visitingIdx={visitingP} matchSet={matchSetP} mismatchIdx={mismatch} />
        </div>
        <div style={{
          width: 1, alignSelf: "stretch",
          background: `linear-gradient(to bottom, transparent, ${t.border}33, transparent)`,
          flexShrink: 0,
        }} />
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <TreePanel arr={qArr} label="Tree Q" icon="🌳" t={t}
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
