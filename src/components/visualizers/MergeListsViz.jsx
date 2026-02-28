import { useEffect, useRef } from "react";
import rough from "roughjs";
import { EXCALIDRAW_TREE } from "./treeExcalidrawTheme";

const NODE_R = 18;
const ARROW_GAP = 20;
const CELL = NODE_R * 2 + ARROW_GAP;
const ROW_GAP = 52;
const SVG_PAD = 24;

function drawListRow(rc, list, y, highlightIdx, mergedStyle, isDark) {
  const elements = [];
  const strokeDefault = isDark ? EXCALIDRAW_TREE.strokeLight : EXCALIDRAW_TREE.stroke;
  const fillDefault = isDark ? EXCALIDRAW_TREE.fillNodeDark : EXCALIDRAW_TREE.fillNode;
  const lineStroke = mergedStyle ? EXCALIDRAW_TREE.success : (isDark ? EXCALIDRAW_TREE.strokeMuted : EXCALIDRAW_TREE.stroke);

  for (let i = 0; i < list.length - 1; i++) {
    const x1 = SVG_PAD + i * CELL + NODE_R;
    const x2 = SVG_PAD + (i + 1) * CELL + NODE_R;
    const line = rc.line(x1, y, x2, y, {
      stroke: lineStroke,
      strokeWidth: EXCALIDRAW_TREE.strokeWidth,
    });
    elements.push(line);
  }

  list.forEach((_, idx) => {
    const x = SVG_PAD + idx * CELL + NODE_R;
    let stroke = strokeDefault;
    let fill = fillDefault;
    if (mergedStyle) {
      stroke = EXCALIDRAW_TREE.success;
      fill = EXCALIDRAW_TREE.success + "22";
    } else if (idx === highlightIdx) {
      stroke = EXCALIDRAW_TREE.current;
      fill = EXCALIDRAW_TREE.current + "22";
    }
    const circle = rc.circle(x, y, NODE_R * 2, {
      fill,
      fillStyle: "solid",
      stroke,
      strokeWidth: EXCALIDRAW_TREE.strokeWidth,
      roughness: EXCALIDRAW_TREE.roughness,
    });
    elements.push(circle);
  });

  return elements;
}

export default function MergeListsViz({ list1 = [], list2 = [], stepState = {}, t }) {
  const roughRef = useRef(null);
  const { i = 0, j = 0, merged = [], list1: s1, list2: s2, done } = stepState;
  const a = (s1 && s1.length >= 0 ? s1 : list1) || [];
  const b = (s2 && s2.length >= 0 ? s2 : list2) || [];
  const m = merged || [];
  const isDark = t._resolved === "dark";

  const maxLen = Math.max(a.length, b.length, m.length, 1);
  const rowW = maxLen * CELL + SVG_PAD * 2;
  const y1 = SVG_PAD + NODE_R;
  const y2 = y1 + ROW_GAP;
  const y3 = y2 + ROW_GAP;
  const svgHeight = a.length > 0 || b.length > 0 || m.length > 0 ? y3 + NODE_R + SVG_PAD : 80;

  useEffect(() => {
    const g = roughRef.current;
    if (!g) return;
    g.innerHTML = "";
    const rc = rough.svg(g, {
      options: { roughness: EXCALIDRAW_TREE.roughness, bowing: EXCALIDRAW_TREE.bowing },
    });

    const all = [];
    drawListRow(rc, a, y1, i, false, isDark).forEach((el) => all.push(el));
    drawListRow(rc, b, y2, j, false, isDark).forEach((el) => all.push(el));
    drawListRow(rc, m, y3, -1, true, isDark).forEach((el) => all.push(el));

    all.forEach((el) => g.appendChild(el));
  }, [a, b, m, i, j, isDark]);

  const cx = (idx) => SVG_PAD + idx * CELL + NODE_R;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <svg width={rowW} height={svgHeight} style={{ display: "block" }} aria-hidden>
        <g ref={roughRef} />
        {/* Labels: list1 */}
        <text x={8} y={y1 + 5} textAnchor="start" fontFamily="'Caveat',cursive" fontSize="14" fontWeight="600" fill={t.inkMuted}>
          list1
        </text>
        {a.map((val, idx) => (
          <g key={`a-${idx}`}>
            <text x={cx(idx)} y={y1 + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="'JetBrains Mono',monospace" fontSize="12" fontWeight="700" fill={isDark ? "#e2e8f0" : "#1e1e1e"}>
              {val}
            </text>
          </g>
        ))}
        {/* Labels: list2 */}
        <text x={8} y={y2 + 5} textAnchor="start" fontFamily="'Caveat',cursive" fontSize="14" fontWeight="600" fill={t.inkMuted}>
          list2
        </text>
        {b.map((val, idx) => (
          <g key={`b-${idx}`}>
            <text x={cx(idx)} y={y2 + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="'JetBrains Mono',monospace" fontSize="12" fontWeight="700" fill={isDark ? "#e2e8f0" : "#1e1e1e"}>
              {val}
            </text>
          </g>
        ))}
        {/* Labels: merged */}
        <text x={8} y={y3 + 5} textAnchor="start" fontFamily="'Caveat',cursive" fontSize="14" fontWeight="700" fill={EXCALIDRAW_TREE.success}>
          merged
        </text>
        {m.length === 0 && (
          <text x={cx(0)} y={y3 + 5} textAnchor="middle" fontFamily="'Caveat',cursive" fontSize="14" fill={t.inkMuted}>
            empty
          </text>
        )}
        {m.map((val, idx) => (
          <g key={`m-${idx}`}>
            <text x={cx(idx)} y={y3 + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="'JetBrains Mono',monospace" fontSize="12" fontWeight="700" fill={isDark ? "#e2e8f0" : "#1e1e1e"}>
              {val}
            </text>
          </g>
        ))}
      </svg>
      {done && m.length > 0 && (
        <div style={{ padding: "8px 14px", borderRadius: 8, border: `2px solid ${EXCALIDRAW_TREE.success}`, background: EXCALIDRAW_TREE.success + "18", fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: EXCALIDRAW_TREE.success }}>
          ✓ Merged
        </div>
      )}
    </div>
  );
}
