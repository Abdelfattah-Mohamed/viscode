export default function JumpGameViz({ nums: numsProp = [], stepState = {}, t }) {
  const { nums: numsState = [], i = -1, reach = 0, unreachable = false, done = false } = stepState;
  const nums = Array.isArray(numsState) && numsState.length > 0 ? numsState : (Array.isArray(numsProp) ? numsProp : []);
  const isDark = t._resolved === "dark";
  const lastIdx = nums.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          nums (max jump from each index)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {nums.map((val, idx) => {
            const isCurrent = idx === i;
            const isReachable = idx <= reach && i >= 0;
            const isPastReach = i >= 0 && idx > reach;
            return (
              <div
                key={idx}
                style={{
                  minWidth: 44,
                  padding: "8px 10px",
                  border: `2px solid ${isCurrent ? t.yellow : isPastReach && unreachable && idx === i ? "#ef4444" : isReachable ? t.green : t.border}`,
                  borderRadius: 8,
                  background: isCurrent ? t.yellow + "28" : unreachable && idx === i ? "#ef4444" + "28" : isReachable ? t.green + "22" : (isDark ? "#374151" : "#e5e7eb"),
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
                  textAlign: "center",
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {nums.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>i={idx}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>reach</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{reach}</span>
        </div>
        {i >= 0 && !done && !unreachable && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.yellow}`, borderRadius: 8, background: t.yellow + "22" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>current i</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.yellow }}>{i}</span>
          </div>
        )}
      </div>

      {unreachable && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: "2px solid #ef4444", background: "#ef4444" + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05em", fontWeight: 700, color: "#ef4444" }}>
          i ({i}) &gt; reach ({reach}) → return false
        </div>
      )}

      {done && !unreachable && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Reached index {lastIdx} → return true
        </div>
      )}
    </div>
  );
}
