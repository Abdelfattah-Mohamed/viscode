export default function ConsecutiveVisualizer({ nums, stepState = {}, t }) {
  const { current, setArr = [], streakNums = [], longest = 0, skipped, done } = stepState;
  const isInStreak = n => streakNums.includes(n);
  const isCurrent  = n => n === current;
  const isSkipped  = n => n === skipped;
  const cellBg = n => {
    if (done && longest > 0 && isInStreak(n)) return t.green;
    if (isInStreak(n)) return t.yellow;
    if (isSkipped(n))  return t.surfaceAlt;
    if (isCurrent(n))  return t.blue + "44";
    return t.surface;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>nums (input)</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {nums.map((val, idx) => (
            <div key={idx} style={{ width: 50, height: 50, border: `2px solid ${t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, background: t.surfaceAlt, color: t.ink }}>{val}</div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          hash set <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem" }}>(sorted for display)</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 48 }}>
          {setArr.map((n, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              <div style={{ position: "absolute", bottom: "100%", marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                {isCurrent(n) && !isInStreak(n) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.blue }}>n={n}</span>}
                {isInStreak(n) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: done ? t.green : t.yellow }}>{done ? "✓" : "↑"}</span>}
                {isSkipped(n)  && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", color: t.inkMuted }}>skip</span>}
              </div>
              <div style={{ width: 54, height: 54, border: `2.5px solid ${isCurrent(n) ? t.blue : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, background: cellBg(n), color: t.ink, transform: isInStreak(n) ? "translateY(-8px) scale(1.08)" : "scale(1)", boxShadow: isInStreak(n) ? t.shadowSm : "none", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: "10px 18px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", color: t.inkMuted }}>longest</span>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.green, transition: "all 0.3s" }}>{longest}</span>
        </div>
        {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.green }}>✅ Done!</span>}
      </div>
    </div>
  );
}
