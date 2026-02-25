export default function MaxProductViz({ nums = [], stepState = {}, t }) {
  const { i, highlight = [], curMax, curMin, maxProd, done } = stepState;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          nums
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: 40 }}>
          {nums.map((val, idx) => {
            const isCur = idx === i;
            const isHl = highlight.includes(idx);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, whiteSpace: "nowrap" }}>
                  {isCur && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.blue }}>i={idx}</span>}
                </div>
                <div style={{
                  width: 54, height: 54,
                  border: `2.5px solid ${isCur ? t.yellow : isHl ? t.green : t.border}`,
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                  background: isCur ? t.yellow + "30" : isHl ? t.green + "22" : t.surface,
                  color: t.ink,
                  transform: isCur ? "translateY(-6px) scale(1.1)" : "scale(1)",
                  boxShadow: isCur ? t.shadowSm : "none",
                  transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  {val}
                </div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {curMax !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>curMax</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.blue }}>{curMax}</span>
          </div>
        )}
        {curMin !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>curMin</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.purple }}>{curMin}</span>
          </div>
        )}
        {maxProd !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${done ? t.green : t.border}`, borderRadius: 10, background: done ? t.green + "18" : t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>maxProd</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.green }}>{maxProd}</span>
          </div>
        )}
        {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green, alignSelf: "center" }}>✅ Done</span>}
      </div>
    </div>
  );
}
