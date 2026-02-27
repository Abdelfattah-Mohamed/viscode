import { useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 18;
const NODE_SPACING = 44;
const ARROW_LEN = 20;
const ROW_HEIGHT = 48;
const PADDING = 24;

function drawArrow(rc, x1, y1, x2, y2, stroke) {
  const headSize = 6;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const baseX = x2 - ux * headSize;
  const baseY = y2 - uy * headSize;
  const line = rc.line(x1, y1, baseX, baseY, { stroke, strokeWidth: 1.5, roughness: 1.2 });
  const perpX = -uy * (headSize * 0.6);
  const perpY = ux * (headSize * 0.6);
  const arrowHead = rc.polygon(
    [[x2, y2], [baseX + perpX, baseY + perpY], [baseX - perpX, baseY - perpY]],
    { stroke, fill: stroke, fillStyle: "solid", strokeWidth: 1, roughness: 0.8 }
  );
  return [line, arrowHead];
}

export default function MergeKViz({ lists = [], stepState = {}, t }) {
  const { lists: stateLists, heap = [], merged = [], poppedVal, listIdx, done } = stepState;
  const kLists = (stateLists && stateLists.length > 0 ? stateLists : lists) || [];
  const m = merged || [];
  const isDark = t._resolved === "dark";
  const listsRef = useRef(null);
  const heapRef = useRef(null);
  const mergedRef = useRef(null);

  const listRowY = (i) => PADDING + i * ROW_HEIGHT;
  const heapY = PADDING + kLists.length * ROW_HEIGHT + 20;
  const mergedY = heap.length > 0 ? heapY + ROW_HEIGHT + 20 : heapY;

  const maxListLen = kLists.length ? Math.max(...kLists.map(l => l.length)) : 0;
  const maxLen = Math.max(maxListLen, m.length, heap.length * 2);
  const width = Math.max(400, PADDING * 2 + 100 + maxLen * (NODE_SPACING + ARROW_LEN));
  const height = merged.length > 0 || heap.length > 0
    ? mergedY + ROW_HEIGHT + PADDING
    : kLists.length > 0
      ? listRowY(kLists.length) + PADDING
      : 120;

  useEffect(() => {
    if (listsRef.current) {
      listsRef.current.innerHTML = "";
      const g = listsRef.current;
      const rc2 = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

      kLists.forEach((list, listIndex) => {
        const y = listRowY(listIndex) + ROW_HEIGHT / 2;
        list.forEach((val, idx) => {
          const x = PADDING + 50 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
          const isCur = listIndex === listIdx && idx === 0;
          const stroke = isCur ? t.yellow : t.border;
          const fill = isCur ? t.yellow + "30" : t.surface;
          if (idx > 0) {
            const x1 = PADDING + 50 + (idx - 1) * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2 + NODE_R;
            const x2 = x - NODE_R;
            drawArrow(rc2, x1, y, x2, y, stroke).forEach(el => g.appendChild(el));
          }
          const node = rc2.circle(x, y, NODE_R * 2, {
            fill,
            fillStyle: "solid",
            stroke,
            strokeWidth: 2,
            roughness: 1,
          });
          g.appendChild(node);
        });
      });
    }

    if (heapRef.current) {
      heapRef.current.innerHTML = "";
      if (heap.length > 0) {
      const g = heapRef.current;
      const rc2 = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });
      const y = heapY + ROW_HEIGHT / 2;
      heap.forEach((node, i) => {
        const x = PADDING + 60 + i * 72;
        const isCur = poppedVal === node.val && listIdx === node.listIdx;
        const stroke = isCur ? t.yellow : t.border;
        const fill = isCur ? t.yellow + "22" : t.surfaceAlt;
        const rect = rc2.rectangle(x - 28, y - 16, 56, 32, {
          fill,
          fillStyle: "solid",
          stroke,
          strokeWidth: 2,
          roughness: 1,
        });
        g.appendChild(rect);
      });
      }
    }

    if (mergedRef.current) {
      mergedRef.current.innerHTML = "";
      if (m.length > 0) {
      const g = mergedRef.current;
      const rc2 = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });
      const y = mergedY + ROW_HEIGHT / 2;
      m.forEach((val, idx) => {
        const x = PADDING + 50 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
        const stroke = done ? t.green : t.border;
        const fill = done ? t.green + "22" : t.surface;
        if (idx > 0) {
          const x1 = PADDING + 50 + (idx - 1) * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2 + NODE_R;
          const x2 = x - NODE_R;
          drawArrow(rc2, x1, y, x2, y, stroke).forEach(el => g.appendChild(el));
        }
        const node = rc2.circle(x, y, NODE_R * 2, {
          fill,
          fillStyle: "solid",
          stroke,
          strokeWidth: 2,
          roughness: 1,
        });
        g.appendChild(node);
      });
      }
    }
  }, [kLists, heap, m, poppedVal, listIdx, done, t, isDark]);

  if (kLists.length === 0 && heap.length === 0 && m.length === 0) {
    return (
      <div style={{
        padding: "24px 20px",
        textAlign: "center",
        color: t.inkMuted,
        fontFamily: "'Caveat',cursive",
        fontSize: "1.1rem",
        lineHeight: 1.6,
      }}>
        <span style={{ display: "block", fontSize: "2rem", marginBottom: 8 }}>📋</span>
        <strong style={{ color: t.ink }}>Merge K Sorted Lists</strong>
        <p style={{ margin: "8px 0 0", fontSize: "0.95rem" }}>
          Enter lists as <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>1,4,5|1,3,4|2,6</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: 20,
          overflow: "hidden",
          background: isDark ? "#1e293b" : "#f8fafc",
        }}
      >
        <svg width={width} height={height} style={{ display: "block" }}>
          <defs>
            <pattern id="mergek-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill={isDark ? "#334155" : "#e2e8f0"} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mergek-dot-grid)" />
          <g ref={listsRef} />
          <g ref={heapRef} />
          <g ref={mergedRef} />
          <g style={{ isolation: "isolate" }}>
          {kLists.map((list, listIndex) => {
            const y = listRowY(listIndex) + ROW_HEIGHT / 2;
            return list.map((val, idx) => {
              const x = PADDING + 50 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
              const isCur = listIndex === listIdx && idx === 0;
              const textFill = isCur ? "#1e1e1e" : t.ink;
              return (
                <text
                  key={`${listIndex}-${idx}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 14,
                    fontWeight: 800,
                    fill: textFill,
                    pointerEvents: "none",
                    paintOrder: "stroke fill",
                    stroke: isDark ? "#1e293b" : "#f8fafc",
                    strokeWidth: 1.5,
                  }}
                >
                  {String(val)}
                </text>
              );
            });
          })}
          {heap.map((node, i) => {
            const x = PADDING + 60 + i * 72;
            const y = heapY + ROW_HEIGHT / 2;
            return (
              <g key={i}>
                <text
                  x={x - 10}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    fill: t.ink,
                    pointerEvents: "none",
                  }}
                >
                  {node.val}
                </text>
                <text
                  x={x + 12}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    fill: t.inkMuted,
                    pointerEvents: "none",
                  }}
                >
                  L{node.listIdx}
                </text>
              </g>
            );
          })}
          {m.map((val, idx) => {
            const x = PADDING + 50 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
            const y = mergedY + ROW_HEIGHT / 2;
            const textFill = done ? "#1e1e1e" : t.ink;
            return (
              <text
                key={idx}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 14,
                  fontWeight: 800,
                  fill: textFill,
                  pointerEvents: "none",
                  paintOrder: "stroke fill",
                  stroke: isDark ? "#1e293b" : "#f8fafc",
                  strokeWidth: 1.5,
                }}
              >
                {String(val)}
              </text>
            );
          })}
          </g>
        </svg>

        <div style={{
          position: "absolute",
          top: 4,
          left: 8,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}>
          {kLists.length > 0 && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.inkMuted }}>
              k lists
            </span>
          )}
          {heap.length > 0 && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.purple }}>
              heap
            </span>
          )}
          {m.length > 0 && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: done ? t.green : t.inkMuted }}>
              merged {done && "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
