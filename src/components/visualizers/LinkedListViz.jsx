import { useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 24;
const NODE_SPACING = 72;
const ARROW_LEN = 28;

export default function LinkedListViz({ head = [], stepState = {}, problemId, input = {}, t }) {
  const { prevIdx, currIdx, nextIdx, reversed = [], done, slowIdx, fastIdx, toRemoveIdx } = stepState;
  const rawNodes = Array.isArray(head) ? head : [];
  const nodes = rawNodes.filter(v => v != null && v !== "");
  const roughRef = useRef(null);
  const isDark = t._resolved === "dark";
  const isRemoveNth = problemId === "remove-nth-node";

  const splitPoint = reversed.length;
  const showSlowFast = isRemoveNth && (slowIdx !== undefined || fastIdx !== undefined);

  const width = nodes.length > 0 ? nodes.length * NODE_SPACING + ARROW_LEN * (nodes.length - 1) + 120 : 200;
  const height = 120;

  useEffect(() => {
    if (!roughRef.current || nodes.length === 0) return;
    const g = roughRef.current;
    g.innerHTML = "";
    const rc = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

    // Draw directed arrows first (Excalidraw sketchy style) so nodes appear on top
    for (let idx = 0; idx < nodes.length - 1; idx++) {
      const isReversed = !isRemoveNth && idx + 1 <= splitPoint;
      const isBreakingLink = toRemoveIdx >= 0 && idx === slowIdx && idx + 1 === toRemoveIdx;
      const isArrowFromRemoved = toRemoveIdx >= 0 && idx === toRemoveIdx;
      if (isBreakingLink || isArrowFromRemoved) continue;
      const cx0 = 40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
      const cx1 = 40 + (idx + 1) * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
      const y = height / 2;
      const stroke = isReversed ? t.green : t.border;
      const x1 = cx0 + NODE_R;
      const x2 = cx1 - NODE_R;
      const [sX, sY, eX, eY] = isReversed ? [x2, y, x1, y] : [x1, y, x2, y];

      const headSize = 8;
      const dx = eX - sX;
      const dy = eY - sY;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const tipX = eX;
      const tipY = eY;
      const baseX = tipX - ux * headSize;
      const baseY = tipY - uy * headSize;

      const line = rc.line(sX, sY, baseX, baseY, {
        stroke,
        strokeWidth: 1.5,
        roughness: 1.2,
      });
      g.appendChild(line);
      const perpX = -uy * (headSize * 0.6);
      const perpY = ux * (headSize * 0.6);
      const leftX = baseX + perpX;
      const leftY = baseY + perpY;
      const rightX = baseX - perpX;
      const rightY = baseY - perpY;
      const arrowHead = rc.polygon([[tipX, tipY], [leftX, leftY], [rightX, rightY]], {
        stroke,
        fill: stroke,
        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0.8,
      });
      g.appendChild(arrowHead);
    }

    nodes.forEach((val, idx) => {
      const isPrev = !showSlowFast && idx === prevIdx;
      const isCurr = !showSlowFast && idx === currIdx;
      const isNext = !showSlowFast && idx === nextIdx;
      const isSlow = showSlowFast && idx === slowIdx;
      const isFast = showSlowFast && idx === fastIdx;
      const isToRemove = idx === toRemoveIdx;
      const isReversed = !isRemoveNth && idx < splitPoint;

      const stroke = isToRemove ? t.red : isCurr ? t.yellow : isPrev || isSlow ? t.blue : isNext || isFast ? t.purple : isReversed ? t.green : t.border;
      const fill = isToRemove ? t.red + "25" : isCurr ? t.yellow + "30" : isPrev || isSlow ? t.blue + "20" : isNext || isFast ? t.purple + "20" : isReversed ? t.green + "14" : t.surface;

      const cx = 40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
      const cy = height / 2;

      if ((isCurr || isFast || isSlow) && !isToRemove) {
        const ringColor = isFast ? t.purple : isSlow ? t.blue : t.yellow;
        const ring = rc.circle(cx, cy, (NODE_R + 6) * 2, {
          fill: "none",
          stroke: ringColor,
          strokeWidth: isSlow ? 3 : 2,
          roughness: 1.5,
        });
        g.appendChild(ring);
      }

      const node = rc.circle(cx, cy, NODE_R * 2, {
        fill,
        fillStyle: "solid",
        stroke,
        strokeWidth: isSlow ? 2.5 : 2,
        roughness: 1,
      });
      g.appendChild(node);
    });
  }, [nodes, prevIdx, currIdx, nextIdx, slowIdx, fastIdx, toRemoveIdx, splitPoint, isRemoveNth, showSlowFast, t, isDark]);

  if (nodes.length === 0) {
    return (
      <div style={{
        padding: "24px 20px",
        textAlign: "center",
        color: t.inkMuted,
        fontFamily: "'Caveat',cursive",
        fontSize: "1.1rem",
        lineHeight: 1.6,
      }}>
        <span style={{ display: "block", fontSize: "2rem", marginBottom: 8 }}>🔗</span>
        <strong style={{ color: t.ink }}>Add a linked list to explore</strong>
        <p style={{ margin: "8px 0 0", fontSize: "0.95rem" }}>
          Enter values as a comma-separated list, e.g. <code style={{ fontFamily: "'JetBrains Mono',monospace", background: t.surfaceAlt, padding: "2px 6px", borderRadius: 6 }}>1,2,3,4,5</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 14px",
        borderRadius: 14,
        background: isDark ? "rgba(31,41,55,0.5)" : "rgba(249,250,251,0.9)",
        border: `1px solid ${t.border}30`,
      }}>
        <span style={{
          fontFamily: "'Caveat',cursive",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: t.ink,
        }}>
          linked list · {nodes.length} node{nodes.length !== 1 ? "s" : ""}
          {isRemoveNth && input.n != null && (
            <span style={{ marginLeft: 8, color: t.inkMuted, fontWeight: 600 }}>· n = {input.n}</span>
          )}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          width,
          height: height + 48,
          borderRadius: 20,
          overflow: "hidden",
          background: isDark ? "#1e293b" : "#f8fafc",
        }}
      >
        <svg width={width} height={height + 48} style={{ display: "block" }}>
          <defs>
            <pattern id="ll-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill={isDark ? "#334155" : "#e2e8f0"} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ll-dot-grid)" />
          <g ref={roughRef} transform="translate(0, 24)" />
          <g transform="translate(0, 24)" style={{ isolation: "isolate" }}>
            {nodes.map((val, idx) => {
              const cx = 40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
              const cy = height / 2;
              const isCurr = !showSlowFast && idx === currIdx;
              const isPrev = !showSlowFast && idx === prevIdx;
              const isNext = !showSlowFast && idx === nextIdx;
              const isSlow = showSlowFast && idx === slowIdx;
              const isFast = showSlowFast && idx === fastIdx;
              const isToRemove = idx === toRemoveIdx;
              const isReversed = !isRemoveNth && idx < splitPoint;
              const textFill = (isCurr || isPrev || isNext || isSlow || isFast || isToRemove || isReversed) ? "#1e1e1e" : t.ink;
              return (
                <text
                  key={idx}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 16,
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
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 24,
          flexWrap: "wrap",
        }}>
          {showSlowFast ? (
            <>
              {slowIdx != null && slowIdx >= 0 && slowIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.blue, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.blue }} />
                  slow
                </span>
              )}
              {fastIdx != null && fastIdx >= 0 && fastIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.purple, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.purple }} />
                  fast
                </span>
              )}
              {toRemoveIdx != null && toRemoveIdx >= 0 && toRemoveIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.red, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.red }} />
                  remove
                </span>
              )}
            </>
          ) : (
            <>
              {prevIdx != null && prevIdx >= 0 && prevIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.blue, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.blue }} />
                  prev
                </span>
              )}
              {currIdx != null && currIdx >= 0 && currIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.yellow, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.yellow }} />
                  curr
                </span>
              )}
              {nextIdx != null && nextIdx >= 0 && nextIdx < nodes.length && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.purple, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.purple }} />
                  next
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {(showSlowFast ? (slowIdx != null || fastIdx != null || toRemoveIdx != null) : (prevIdx != null || currIdx != null || nextIdx != null)) && (
        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "8px 12px",
          borderRadius: 12,
          background: t.surfaceAlt + "80",
          border: `1px solid ${t.border}30`,
          fontFamily: "'Caveat',cursive",
          fontSize: "0.9rem",
          color: t.inkMuted,
        }}>
          {showSlowFast ? (
            <>
              {slowIdx != null && slowIdx >= 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.blue + "40", border: `2px solid ${t.blue}` }} />
                  slow
                </span>
              )}
              {fastIdx != null && fastIdx >= 0 && fastIdx < nodes.length && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.purple + "40", border: `2px solid ${t.purple}` }} />
                  fast
                </span>
              )}
              {toRemoveIdx != null && toRemoveIdx >= 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.red + "40", border: `2px solid ${t.red}` }} />
                  remove
                </span>
              )}
            </>
          ) : (
            <>
              {prevIdx != null && prevIdx >= 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.blue + "40", border: `2px solid ${t.blue}` }} />
                  prev
                </span>
              )}
              {currIdx != null && currIdx >= 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.yellow + "40", border: `2px solid ${t.yellow}` }} />
                  curr
                </span>
              )}
              {nextIdx != null && nextIdx >= 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.purple + "40", border: `2px solid ${t.purple}` }} />
                  next
                </span>
              )}
            </>
          )}
        </div>
      )}

      {done && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          textAlign: "center",
          border: `2px solid ${t.green}`,
          background: t.green + "18",
          fontFamily: "'Caveat',cursive",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: t.green,
        }}>
          {isRemoveNth ? "✅ Node removed!" : "✅ List reversed!"}
        </div>
      )}
    </div>
  );
}
