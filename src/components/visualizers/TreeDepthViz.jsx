import TreeRoughView from "./TreeRoughView";
import TreeSvgFrame from "./TreeSvgFrame";
import { useTreeLayout } from "./treeLayout";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

export default function TreeDepthViz({ root = [], stepState = {}, t }) {
  const arr = Array.isArray(root) ? root : [];
  const { visiting, depthMap = {}, maxDepth, done } = stepState;

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
                style={{ fontFamily: "'Caveat',cursive", fontSize: labelSize, fontWeight: 700, fill: t.ink }}>{n.val}</text>
              {depthMap[n.index] !== undefined && (
                <text x={n.x} y={n.y + nodeR + 13} textAnchor="middle"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6em", fontWeight: 600, fill: t.green }}>
                  d={depthMap[n.index]}
                </text>
              )}
            </g>
          ))}
        </g>
      </TreeSvgFrame>

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
