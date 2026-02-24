export default function ClimbingViz({ n, stepState = {}, t }) {
  const { step, prev2, prev1, curr, done } = stepState;
  const total = Math.max(1, Number(n) || 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", color: t.inkMuted, marginBottom: 10 }}>Staircase (n={total})</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Array.from({ length: total }, (_, i) => i + 1).map(s => {
            const isAct = s === step, isDone = done && s === total;
            return (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 46, height: 46, border: `2px solid ${isDone ? t.green : isAct ? t.yellow : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, background: isDone ? t.green + "33" : isAct ? t.yellow + "33" : t.surface, color: t.ink, transform: isAct || isDone ? "translateY(-6px) scale(1.08)" : "scale(1)", transition: "all 0.3s" }}>{s}</div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7rem", color: t.inkMuted }}>s{s}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 46, height: 46, border: `2px solid ${done ? t.green : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", background: done ? t.green + "33" : t.surfaceAlt, transform: done ? "translateY(-6px)" : "", transition: "all 0.3s" }}>🏁</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[{ label: "prev2", val: prev2 ?? "-", color: t.blue },
          { label: "prev1", val: prev1 ?? "-", color: t.purple },
          { label: "curr",  val: curr  ?? "-", color: t.yellow }].map(x => (
          <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: t.inkMuted }}>{x.label}</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.8rem", fontWeight: 700, color: x.color, minWidth: 24, textAlign: "center", transition: "all 0.3s" }}>{x.val}</span>
          </div>
        ))}
        {done && <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", border: `2px solid ${t.green}`, borderRadius: 10, background: t.green + "18" }}><span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.green }}>✅ Ways = {prev1}</span></div>}
      </div>
    </div>
  );
}
