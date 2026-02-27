import { useMemo } from "react";

const NODE_W = 44;
const NODE_H = 36;
const GAP_X = 8;
const GAP_Y = 12;

/** Render a heap as a binary tree (array index i has children at 2i+1, 2i+2) */
function HeapTree({ arr, color, isMaxHeap, t }) {
  const isDark = t._resolved === "dark";
  const { levels, width, height } = useMemo(() => {
    if (!arr?.length) return { levels: [], width: 0, height: 0 };
    const levels = [];
    let idx = 0;
    while (idx < arr.length) {
      const levelSize = Math.min(1 << levels.length, arr.length - idx);
      levels.push(arr.slice(idx, idx + levelSize));
      idx += levelSize;
    }
    const maxInLevel = Math.max(...levels.map(l => l.length), 1);
    const width = maxInLevel * (NODE_W + GAP_X) - GAP_X;
    const height = levels.length * (NODE_H + GAP_Y) - GAP_Y;
    return { levels, width, height };
  }, [arr]);

  if (!arr?.length) {
    return (
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic", padding: 16, minWidth: 100, textAlign: "center" }}>
        empty
      </div>
    );
  }

  const topBg = color + (isDark ? "55" : "33");
  const nodeBg = isDark ? "#374151" : "#e5e7eb";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: GAP_Y }}>
      {levels.map((row, lvl) => (
        <div key={lvl} style={{ display: "flex", gap: GAP_X, justifyContent: "center" }}>
          {row.map((val, col) => {
            const globalIdx = (1 << lvl) - 1 + col;
            const isTop = lvl === 0;
            return (
              <div
                key={globalIdx}
                style={{
                  width: NODE_W,
                  height: NODE_H,
                  padding: "4px 6px",
                  border: `2px solid ${isTop ? color : t.border}`,
                  borderRadius: 8,
                  background: isTop ? topBg : nodeBg,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function MedianFinderViz({ stepState = {}, t }) {
  const { nums = [], lo = [], hi = [], median = null, highlight = [], done } = stepState;
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Stream of addNum calls */}
      {nums?.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.inkMuted, marginBottom: 8 }}>
            Stream (addNum order)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {nums.map((val, idx) => (
              <div
                key={idx}
                style={{
                  padding: "6px 12px",
                  border: `2px solid ${highlight?.includes(idx) ? t.yellow : t.border}`,
                  borderRadius: 8,
                  background: highlight?.includes(idx) ? t.yellow + "33" : t.surfaceAlt,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 600,
                  color: t.ink,
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two heaps - side by side with tree structure */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
        {/* lo: max-heap (lower half) */}
        <div style={{ flex: 1, minWidth: 160, maxWidth: 280 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.blue, marginBottom: 4 }}>
            lo (max-heap)
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: t.inkMuted, marginBottom: 12 }}>
            lower half · max at root
          </div>
          <div style={{ padding: "14px 16px", border: `2px solid ${t.blue}80`, borderRadius: 12, background: (t.blue + "18") }}>
            <HeapTree arr={lo} color={t.blue} isMaxHeap={true} t={t} />
          </div>
        </div>

        {/* hi: min-heap (upper half) */}
        <div style={{ flex: 1, minWidth: 160, maxWidth: 280 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.purple, marginBottom: 4 }}>
            hi (min-heap)
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: t.inkMuted, marginBottom: 12 }}>
            upper half · min at root
          </div>
          <div style={{ padding: "14px 16px", border: `2px solid ${t.purple}80`, borderRadius: 12, background: (t.purple + "18") }}>
            <HeapTree arr={hi} color={t.purple} isMaxHeap={false} t={t} />
          </div>
        </div>
      </div>

      {/* Median result */}
      {median != null && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 12,
            border: `2px solid ${done ? t.green : t.yellow}`,
            background: (done ? t.green : t.yellow) + "22",
            fontFamily: "'Caveat',cursive",
            fontSize: "1.15em",
            fontWeight: 700,
            color: t.ink,
            textAlign: "center",
          }}
        >
          findMedian() → {typeof median === "number" && Number.isInteger(median) ? median : median.toFixed(2)}
          {lo?.length > 0 && hi?.length > 0 && lo.length === hi.length && (
            <span style={{ fontSize: "0.75em", fontWeight: 600, color: t.inkMuted, display: "block", marginTop: 4 }}>
              (lo.top + hi.top) / 2
            </span>
          )}
          {lo?.length > 0 && (!hi?.length || lo.length > hi.length) && (
            <span style={{ fontSize: "0.75em", fontWeight: 600, color: t.inkMuted, display: "block", marginTop: 4 }}>
              lo.top (odd count)
            </span>
          )}
        </div>
      )}
      {done && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green, textAlign: "center" }}>
          ✓ Median found
        </div>
      )}
    </div>
  );
}
