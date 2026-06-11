import { ensureCompleteTree } from "../../utils/treeFormat";
import TreeRoughView from "./TreeRoughView";
import TreeSvgFrame from "./TreeSvgFrame";
import { useTreeLayout } from "./treeLayout";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

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
  const arr = ensureCompleteTree(raw);
  const { visiting, p, q, lca, done, currentVal, bothLeft, bothRight, decision, path = [] } = stepState;

  const { nodes, edges, nullMarkers, width, height, nodeR } = useTreeLayout(arr, {
    baseNodeR: 22, baseRowH: 52, minWidth: 200,
  });

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

  const labelSize = "1.1em";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
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

      <div style={{
        width: "100%",
        maxWidth: width,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}>
        <div style={{
          border: `1px solid ${t.border}55`,
          borderRadius: 10,
          padding: "8px 10px",
          background: t.surface,
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: "0.76rem",
          color: t.ink,
          lineHeight: 1.45,
        }}>
          <div>node: {currentVal ?? "-"}</div>
          <div>p, q: {p ?? "-"}, {q ?? "-"}</div>
          <div>both &lt; node: {bothLeft === true ? "yes" : bothLeft === false ? "no" : "-"}</div>
          <div>both &gt; node: {bothRight === true ? "yes" : bothRight === false ? "no" : "-"}</div>
        </div>
        <div style={{
          border: `1px solid ${t.border}55`,
          borderRadius: 10,
          padding: "8px 10px",
          background: t.surface,
          fontFamily: "'Caveat',cursive",
          fontSize: "0.92rem",
          color: t.ink,
          lineHeight: 1.4,
        }}>
          <div style={{ fontWeight: 700 }}>
            Decision: {decision ?? "-"}
          </div>
          <div style={{ color: t.inkMuted }}>
            Path: {Array.isArray(path) && path.length ? path.map((idx) => arr[idx]).join(" → ") : "-"}
          </div>
        </div>
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
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: labelSize, fontWeight: 700, fill: t.ink }}>{n.val}</text>
                {label && (
                  <text x={n.x} y={n.y + nodeR + 10} textAnchor="middle"
                    style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", fontWeight: 700, fill: isLCA ? t.green : (isP ? t.blue : isQ ? t.purple : t.yellow) }}>{label}</text>
                )}
              </g>
            );
          })}
        </g>
      </TreeSvgFrame>

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
