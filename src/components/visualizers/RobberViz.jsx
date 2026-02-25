export default function RobberViz({ nums = [], stepState = {}, t }) {
  const { i, dp = [], choice, maxRob, done } = stepState;

  const houseBorder = (idx) => {
    if (idx !== i) return t.border;
    if (choice === "rob") return t.green;
    if (choice === "skip") return t.inkMuted + "66";
    return t.yellow;
  };

  const houseBg = (idx) => {
    if (idx !== i) return t.surface;
    if (choice === "rob") return t.green + "22";
    if (choice === "skip") return t.surfaceAlt;
    return t.yellow + "30";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          houses
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", paddingTop: 32 }}>
          {nums.map((val, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              <div style={{ position: "absolute", bottom: "100%", marginBottom: 6, whiteSpace: "nowrap" }}>
                {idx === i && choice && (
                  <span style={{
                    fontFamily: "'Caveat',cursive", fontSize: "0.85em", fontWeight: 700,
                    color: choice === "rob" ? t.green : t.inkMuted,
                  }}>
                    {choice}
                  </span>
                )}
              </div>
              <div style={{
                width: 56, height: 50,
                border: `2.5px solid ${houseBorder(idx)}`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 700,
                background: houseBg(idx), color: t.ink,
                transform: idx === i ? "translateY(-6px) scale(1.08)" : "scale(1)",
                boxShadow: idx === i ? t.shadowSm : "none",
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                ${val}
              </div>
              {dp[idx] !== undefined && (
                <div style={{
                  padding: "2px 8px", borderRadius: 6,
                  border: `1.5px solid ${t.border}`,
                  background: t.surfaceAlt,
                  fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7em", fontWeight: 600,
                  color: t.inkMuted,
                }}>
                  {dp[idx]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {maxRob !== undefined && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px",
            border: `2px solid ${done ? t.green : t.border}`,
            borderRadius: 10,
            background: done ? t.green + "18" : t.surfaceAlt,
          }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>maxRob</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.2em", fontWeight: 700, color: t.green }}>${maxRob}</span>
          </div>
          {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green, alignSelf: "center" }}>✅ Done</span>}
        </div>
      )}
    </div>
  );
}
