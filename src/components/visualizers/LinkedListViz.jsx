import { useEffect, useRef } from "react";
import rough from "roughjs";

const NODE_R = 24;
const NODE_SPACING = 72;
const ARROW_LEN = 28;
const ROW_GAP = 56;

function CopyListRandomViz({ stepState, interweaved, copyHead, copyRandom, head, t, roughRef }) {
  const { phase, pIdx, done } = stepState;
  const isDark = t._resolved === "dark";
  const n = head.length;
  const hasCopyRow = (phase === 1 || phase === 2) && interweaved.length > 0;
  const showTwoRows = hasCopyRow || ((phase === 3 || done) && copyHead.length > 0);
  const showOriginalOnly = (phase === 1 || phase === 2) && interweaved.length === 0 && n > 0;
  const rand = stepState.random;
  const width = n * (NODE_SPACING + ARROW_LEN) - ARROW_LEN + 120;
  const singleRowH = 68;
  const rowGap = 44;
  const totalH = showTwoRows ? singleRowH * 2 + rowGap : singleRowH;
  const yOrig = singleRowH / 2;
  const yCopy = singleRowH + rowGap + singleRowH / 2;

  useEffect(() => {
    const g = roughRef.current;
    if (!g) return;
    g.innerHTML = "";
    const rc = rough.svg(g, { options: { roughness: 1.2, bowing: 2 } });

    function drawArrow(rc, x1, y1, x2, y2, stroke) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const headSize = 8;
      const tipX = x2;
      const tipY = y2;
      const baseX = tipX - ux * headSize;
      const baseY = tipY - uy * headSize;
      const line = rc.line(x1, y1, baseX, baseY, { stroke, strokeWidth: 1.5, roughness: 1.2 });
      g.appendChild(line);
      const perpX = -uy * (headSize * 0.6);
      const perpY = ux * (headSize * 0.6);
      const arrowHead = rc.polygon(
        [[tipX, tipY], [baseX + perpX, baseY + perpY], [baseX - perpX, baseY - perpY]],
        { stroke, fill: stroke, fillStyle: "solid", strokeWidth: 1, roughness: 0.8 }
      );
      g.appendChild(arrowHead);
    }

    function cx(i) {
      return 40 + i * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
    }

    const drawRandomArc = (fromIdx, toIdx, y, stroke, arcOffset) => {
      if (toIdx < 0 || toIdx >= n || fromIdx === toIdx) return;
      const x1 = cx(fromIdx);
      const x2 = cx(toIdx);
      const arcY = y + arcOffset;
      const line1 = rc.line(x1, y, x1, arcY, { stroke, strokeWidth: 1.5, roughness: 1.2 });
      g.appendChild(line1);
      const line2 = rc.line(x1, arcY, x2, arcY, { stroke, strokeWidth: 1.5, roughness: 1.2 });
      g.appendChild(line2);
      drawArrow(rc, x2, arcY, x2, y, stroke);
    };

    if (showOriginalOnly) {
      for (let i = 0; i < n - 1; i++) {
        drawArrow(rc, cx(i) + NODE_R, yOrig, cx(i + 1) - NODE_R, yOrig, t.border);
      }
      if (rand && rand.length === n) {
        for (let i = 0; i < n; i++) drawRandomArc(i, rand[i], yOrig, t.purple, 26);
      }
      head.forEach((val, idx) => {
        const x = cx(idx);
        const circle = rc.circle(x, yOrig, NODE_R * 2, { fill: t.surface, fillStyle: "solid", stroke: t.border, strokeWidth: 2, roughness: 1 });
        g.appendChild(circle);
      });
    } else if (showTwoRows) {
      for (let i = 0; i < n - 1; i++) {
        drawArrow(rc, cx(i) + NODE_R, yOrig, cx(i + 1) - NODE_R, yOrig, t.border);
        drawArrow(rc, cx(i) + NODE_R, yCopy, cx(i + 1) - NODE_R, yCopy, t.green);
      }
      if (rand && rand.length === n) {
        for (let i = 0; i < n; i++) drawRandomArc(i, rand[i], yOrig, showOriginalOnly ? t.purple : t.purple + "99", -22);
      }
      if (copyRandom && copyRandom.length === n) {
        for (let i = 0; i < n; i++) drawRandomArc(i, copyRandom[i], yCopy, t.purple, 26);
      }
      head.forEach((val, idx) => {
        const x = cx(idx);
        const isHighlight = (phase === 1 || phase === 2) ? (pIdx === idx) : (phase === 3 && pIdx === idx);
        const stroke = isHighlight ? t.yellow : t.border;
        const fill = isHighlight ? t.yellow + "35" : t.surface;
        const c = rc.circle(x, yOrig, NODE_R * 2, { fill, fillStyle: "solid", stroke, strokeWidth: 2, roughness: 1 });
        g.appendChild(c);
        if (isHighlight) {
          const ring = rc.circle(x, yOrig, (NODE_R + 6) * 2, { fill: "none", stroke: t.yellow, strokeWidth: 2.5, roughness: 1.5 });
          g.appendChild(ring);
        }
      });
      const copyVals = hasCopyRow ? head.map((v, i) => head[i]) : copyHead;
      copyVals.forEach((val, idx) => {
        const x = cx(idx);
        const isHighlight = (phase === 1 || phase === 2) && pIdx === idx;
        const stroke = isHighlight ? t.yellow : t.green;
        const fill = isHighlight ? t.yellow + "35" : t.green + "22";
        const c = rc.circle(x, yCopy, NODE_R * 2, { fill, fillStyle: "solid", stroke, strokeWidth: 2, roughness: 1 });
        g.appendChild(c);
        if (isHighlight) {
          const ring = rc.circle(x, yCopy, (NODE_R + 6) * 2, { fill: "none", stroke: t.yellow, strokeWidth: 2.5, roughness: 1.5 });
          g.appendChild(ring);
        }
      });
      if (hasCopyRow && n > 0) {
        for (let i = 0; i < n; i++) {
          const x = cx(i);
          const dash = rc.line(x, yOrig + NODE_R, x, yCopy - NODE_R, { stroke: t.border + "88", strokeWidth: 1, roughness: 0.5 });
          g.appendChild(dash);
        }
      }
    }
  }, [showOriginalOnly, showTwoRows, hasCopyRow, phase, pIdx, interweaved, copyHead, copyRandom, head, rand, n, t]);

  const phaseLabel = phase === 1 ? "Phase 1: Interweave" : phase === 2 ? "Phase 2: Assign random" : phase === 3 ? "Phase 3: Unweave" : "Done";
  const phaseTip = showOriginalOnly
    ? "Each node has a next pointer (→) and a random pointer (purple). We will insert a copy of each node, then set the copy's random, then split the lists."
    : phase === 1
      ? "Copy of each node sits directly below the original. In memory they're interleaved: orig→copy→orig→copy…"
      : phase === 2
        ? "Set each copy's random to the copy of whoever the original's random points to (that copy is original.random.next)."
        : phase === 3
          ? "Move copy nodes into the result list and restore the original list's next pointers."
          : "The copy list has the same structure as the original and is independent in memory.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", maxWidth: 520 }}>
      <div style={{ padding: "10px 16px", borderRadius: 12, background: isDark ? "rgba(31,41,55,0.6)" : "rgba(249,250,251,0.95)", border: `2px solid ${t.border}40`, fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.ink }}>
        {phaseLabel}
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Caveat',cursive", fontSize: "1rem", color: t.inkMuted }}>
          <span style={{ width: 20, height: 3, borderRadius: 2, background: t.border }} />
          <strong style={{ color: t.ink }}>next</strong> (order of the list)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Caveat',cursive", fontSize: "1rem", color: t.inkMuted }}>
          <span style={{ width: 16, height: 16, border: `2px solid ${t.purple}`, borderRadius: 4 }} />
          <strong style={{ color: t.purple }}>random</strong> (can point to any node)
        </span>
      </div>
      <p style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: t.inkMuted, textAlign: "center", margin: 0, maxWidth: 440 }}>
        {phaseTip}
      </p>
      <div style={{ position: "relative", width, height: totalH + 60, borderRadius: 16, overflow: "visible", background: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${t.border}30` }}>
        <svg width={width} height={totalH + 60} style={{ display: "block", overflow: "visible" }}>
          <g ref={roughRef} transform="translate(0, 36)" />
          <g transform="translate(0, 36)" style={{ isolation: "isolate" }}>
            {showOriginalOnly && head.map((val, idx) => (
              <text key={idx} x={40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2} y={yOrig} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, fill: isDark ? "#e2e8f0" : "#1e293b", paintOrder: "stroke fill", stroke: isDark ? "#1e293b" : "#f1f5f9", strokeWidth: 2 }}>{val}</text>
            ))}
            {showTwoRows && (
              <>
                <text x={12} y={yOrig - singleRowH / 2 + 10} textAnchor="start" style={{ fontFamily: "'Caveat',cursive", fontSize: 14, fontWeight: 700, fill: t.inkMuted }}>Original</text>
                {head.map((val, idx) => (
                  <text key={`o-${idx}`} x={40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2} y={yOrig} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, fill: isDark ? "#e2e8f0" : "#1e293b", paintOrder: "stroke fill", stroke: isDark ? "#1e293b" : "#f1f5f9", strokeWidth: 2 }}>{val}</text>
                ))}
                <text x={12} y={yCopy - singleRowH / 2 + 10} textAnchor="start" style={{ fontFamily: "'Caveat',cursive", fontSize: 14, fontWeight: 700, fill: t.green }}>Copy</text>
                {(hasCopyRow ? head : copyHead).map((val, idx) => (
                  <text key={`c-${idx}`} x={40 + idx * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2} y={yCopy} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, fill: isDark ? "#e2e8f0" : "#1e293b", paintOrder: "stroke fill", stroke: isDark ? "#1e293b" : "#f1f5f9", strokeWidth: 2 }}>{val}</text>
                ))}
              </>
            )}
          </g>
          {rand && rand.length === n && (showOriginalOnly || showTwoRows) && (
            <g transform="translate(0, 36)">
              {rand.map((r, i) => {
                if (r === i || r < 0 || r >= n) return null;
                const x1 = 40 + i * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
                const x2 = 40 + r * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
                const midX = (x1 + x2) / 2;
                const yLabel = showOriginalOnly ? yOrig + 32 : (yOrig + yCopy) / 2 - 6;
                return (
                  <text key={`l-${i}`} x={midX} y={yLabel} textAnchor="middle" style={{ fontFamily: "'Caveat',cursive", fontSize: 13, fontWeight: 700, fill: t.purple }}>→{head[r]}</text>
                );
              })}
            </g>
          )}
          {copyRandom && copyRandom.length === n && showTwoRows && !hasCopyRow && (
            <g transform="translate(0, 36)">
              {copyRandom.map((r, i) => {
                if (r === i || r < 0 || r >= n) return null;
                const x1 = 40 + i * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
                const x2 = 40 + r * (NODE_SPACING + ARROW_LEN) + NODE_SPACING / 2;
                const midX = (x1 + x2) / 2;
                return (
                  <text key={`lc-${i}`} x={midX} y={yCopy + 38} textAnchor="middle" style={{ fontFamily: "'Caveat',cursive", fontSize: 12, fontWeight: 700, fill: t.purple }}>→{copyHead[r]}</text>
                );
              })}
            </g>
          )}
        </svg>
      </div>
      {done && (
        <div style={{ padding: "12px 20px", borderRadius: 10, textAlign: "center", border: `2px solid ${t.green}`, background: t.green + "20", fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.green }}>
          ✓ Deep copy complete — same structure, independent list
        </div>
      )}
    </div>
  );
}


export default function LinkedListViz({ head = [], stepState = {}, problemId, input = {}, t }) {
  const { prevIdx, currIdx, nextIdx, reversed = [], done, slowIdx, fastIdx, toRemoveIdx, phase, pIdx, interweaved = [], copyHead = [], copyRandom = [], head: stateHead, random: stateRandom } = stepState;
  const rawNodes = Array.isArray(stateHead ?? head) ? (stateHead ?? head) : [];
  const nodes = rawNodes.filter(v => v != null && v !== "");
  const roughRef = useRef(null);
  const copyListRoughRef = useRef(null);
  const isDark = t._resolved === "dark";
  const isRemoveNth = problemId === "remove-nth-node";
  const isCopyListRandom = problemId === "copy-list-random-pointer";

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

  if (isCopyListRandom && stepState.phase != null) {
    return (
      <CopyListRandomViz
        stepState={stepState}
        interweaved={interweaved}
        copyHead={copyHead}
        copyRandom={copyRandom}
        head={nodes.length ? nodes : (stepState.head || [])}
        t={t}
        roughRef={copyListRoughRef}
      />
    );
  }

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
