export default function MissingViz({ nums = [], stepState = {}, t }) {
  const { i, highlight, expectedSum, currentSum, missing, done } = stepState;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          nums
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {nums.map((val, idx) => {
            const isCur = idx === highlight || idx === i;
            return (
              <div key={idx} style={{
                width: 50, height: 50,
                border: `2.5px solid ${isCur ? t.yellow : t.border}`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                background: isCur ? t.yellow + "30" : t.surface, color: t.ink,
                transform: isCur ? "translateY(-4px) scale(1.08)" : "scale(1)",
                boxShadow: isCur ? t.shadowSm : "none",
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {val}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {expectedSum !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>expectedSum</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.blue }}>{expectedSum}</span>
          </div>
        )}
        {currentSum !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>currentSum</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.purple }}>{currentSum}</span>
          </div>
        )}
      </div>

      {done && missing !== undefined && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          padding: "16px 24px", borderRadius: 10,
          border: `2.5px solid ${t.green}`,
          background: t.green + "18",
        }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted }}>missing number</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "2em", fontWeight: 700, color: t.green }}>{missing}</span>
        </div>
      )}
    </div>
  );
}
