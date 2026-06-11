import { useMemo } from "react";
import TreeRoughView from "./TreeRoughView";
import TreeSvgFrame from "./TreeSvgFrame";
import { useTreeLayout } from "./treeLayout";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

export default function InvertTreeViz({ root = [], stepState = {}, t }) {
  const { visiting, swapped = [], inverted, serialized, tokenIdx, done } = stepState;
  const hasInvertedNodes =
    Array.isArray(inverted) && inverted.some((v) => v !== null && v !== undefined);
  const arr = hasInvertedNodes ? inverted : (Array.isArray(root) ? root : []);
  const hasSerializedString = typeof serialized === "string" && serialized.length > 0;

  const swappedSet = useMemo(() => new Set(swapped), [swapped]);

  const { nodes, edges, nullMarkers, width, height, nodeR } = useTreeLayout(arr);

  if (!nodes.length) return (
    <div style={{
      padding: 16, textAlign: "center",
      border: `2px dashed ${t.border}40`, borderRadius: 10,
      color: t.inkMuted, fontFamily: "'Caveat',cursive", fontSize: "0.95rem",
    }}>
      (empty tree)
    </div>
  );

  const labelSize = "1.15em";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%" }}>
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
              const isCur = n.index === visiting;
              const isSwapped = swappedSet.has(n.index);
              if (isSwapped) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.success };
              if (isCur) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5, ring: EXCALIDRAW_TREE.current };
              return null;
            }}
            getEdgeStyle={(e) => {
              if (swappedSet.has(e.from.index) && swappedSet.has(e.to.index)) return { stroke: EXCALIDRAW_TREE.success, strokeWidth: 2.5 };
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

      {hasSerializedString && (
        <div style={{
          width: "100%",
          maxWidth: Math.max(300, Math.min(560, width + 80)),
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${t.border}55`,
          background: t.surface,
          color: t.ink,
          boxShadow: t.shadowSm,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.inkMuted }}>
            Serialized String
          </div>
          <div style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: "0.86rem",
            wordBreak: "break-word",
            lineHeight: 1.45,
          }}>
            {serialized}
          </div>
          {Number.isInteger(tokenIdx) && tokenIdx >= 0 && (
            <div style={{ fontSize: "0.8rem", color: t.inkMuted }}>
              Reading token index: <strong>{tokenIdx}</strong>
            </div>
          )}
        </div>
      )}

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
