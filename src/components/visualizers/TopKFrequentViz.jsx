export default function TopKFrequentViz({ nums = [], stepState = {}, t }) {
  const { k = 0, count = {}, heap = [], res = [], phase, countIdx, heapNum, heapFreq, poppedNum, done } = stepState;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          nums <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75em" }}>k = {k}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {nums.map((val, idx) => {
            const isCur = phase === "count" && countIdx === idx;
            return (
              <div key={idx} style={{
                width: 48, height: 44,
                border: `2px solid ${isCur ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 700,
                background: isCur ? t.yellow + "28" : t.surface, color: t.ink,
                transform: isCur ? "translateY(-4px) scale(1.06)" : "scale(1)",
                boxShadow: isCur ? t.shadowSm : "none",
                transition: "all 0.3s ease",
              }}>
                {val}
              </div>
            );
          })}
        </div>
      </div>

      {Object.keys(count).length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
            count (num → freq)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(count).map(([num, freq]) => {
              const isCur = phase === "heap" && heapNum === Number(num) && heapFreq === Number(freq);
              return (
                <div key={num} style={{
                  display: "flex", border: `2px solid ${isCur ? t.yellow : t.border}`, borderRadius: 8, overflow: "hidden",
                  fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85em", fontWeight: 600,
                  background: isCur ? t.yellow + "22" : t.surfaceAlt, boxShadow: isCur ? t.shadowSm : "none",
                }}>
                  <span style={{ padding: "4px 10px", background: t.purple + "cc", color: "#fff" }}>{num}</span>
                  <span style={{ padding: "4px 10px", color: t.ink }}>→ {freq}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {heap.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
            min-heap (freq, num) — size ≤ k
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {heap.map((node, i) => (
              <div key={i} style={{
                display: "flex", border: `2px solid ${t.border}`, borderRadius: 8, overflow: "hidden",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85em", fontWeight: 600,
                background: t.surfaceAlt,
              }}>
                <span style={{ padding: "4px 8px", background: t.blue + "99", color: "#fff" }}>freq {node.freq}</span>
                <span style={{ padding: "4px 10px", color: t.ink }}>→ {node.num}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          result (top {k})
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {res.length === 0 ? (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>[]</span>
          ) : (
            res.map((x, i) => (
              <div key={i} style={{
                width: 44, height: 40,
                border: `2px solid ${done ? t.green : t.border}`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "1em", fontWeight: 700,
                background: done ? t.green + "22" : t.surface, color: t.ink,
              }}>
                {x}
              </div>
            ))
          )}
          {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green, marginLeft: 4 }}>✅ Done</span>}
        </div>
      </div>
    </div>
  );
}
