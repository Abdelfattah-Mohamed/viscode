import { useId } from "react";

const NODE_WIDTH = 44;
const ARROW_GAP = 28;
const CELL = NODE_WIDTH + ARROW_GAP;

export default function CycleViz({ head = [], stepState = {}, t }) {
  const markerId = useId();
  const { slow = -1, fast = -1, hasCycle = null, pos = -1 } = stepState;
  const nodes = Array.isArray(head) ? head : [];
  const n = nodes.length;
  const showCycle = pos >= 0 && pos < n;

  const svgWidth = n * CELL;
  const startX = (n - 1) * CELL + NODE_WIDTH / 2;
  const endX = pos * CELL + NODE_WIDTH / 2;
  const midX = (startX + endX) / 2;
  const curveH = 56;
  const sameNode = startX === endX;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>linked list {showCycle && <span style={{ fontSize: "0.8em", color: t.purple }}>(cycle at index {pos})</span>}</div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", paddingTop: 48 }}>
            {nodes.map((val, idx) => {
              const isSlow = idx === slow;
              const isFast = idx === fast;
              const isCycleTarget = idx === pos;
              const border = isSlow ? t.blue : isFast ? t.purple : isCycleTarget ? t.yellow : t.border;
              const bg = isSlow ? t.blue + "22" : isFast ? t.purple + "22" : t.surface;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {isSlow && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", fontWeight: 700, color: t.blue }}>slow</span>}
                      {isFast && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", fontWeight: 700, color: t.purple }}>fast</span>}
                    </div>
                    <div style={{ width: NODE_WIDTH, height: NODE_WIDTH, border: `2.5px solid ${border}`, borderRadius: NODE_WIDTH / 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, background: bg, color: t.ink }}>
                      {val}
                    </div>
                    <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.inkMuted }}>{idx}</span>
                  </div>
                  {idx < nodes.length - 1 ? (
                    <div style={{ width: ARROW_GAP, textAlign: "center", color: t.border, fontSize: "1.1em" }}>→</div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {showCycle && n > 0 && !sameNode && (
            <svg
              width={svgWidth}
              height={curveH + 16}
              style={{ display: "block", marginLeft: 0, marginTop: -4 }}
              aria-hidden
            >
              <defs>
                <marker id={markerId} markerWidth="10" markerHeight="8" refX="5" refY="4" orient="auto">
                  <path d="M0 0 L10 4 L0 8 Z" fill={t.yellow} stroke={t.yellow} strokeWidth="1" />
                </marker>
              </defs>
              <path
                d={`M ${startX} 0 Q ${midX} ${curveH} ${endX} 0`}
                fill="none"
                stroke={t.yellow}
                strokeWidth="2.5"
                strokeDasharray="4 3"
                markerEnd={`url(#${markerId})`}
              />
              <text x={midX} y={curveH / 2 + 4} textAnchor="middle" fill={t.inkMuted} fontFamily="'Caveat',cursive" fontSize="12" fontWeight="700">→ index {pos}</text>
            </svg>
          )}
        </div>
      </div>
      {hasCycle === true && (
        <div style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.green }}>
          ✅ Cycle detected!
        </div>
      )}
      {hasCycle === false && (
        <div style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", color: t.inkMuted }}>
          No cycle
        </div>
      )}
    </div>
  );
}
