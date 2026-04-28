export default function ClimbingViz({ n, stepState = {}, t }) {
  const { step, prev2, prev1, curr, done } = stepState;
  const total = Math.max(1, Number(n) || 5);
  const activeStep = Number.isFinite(step) ? step : -1;
  const isBaseCase = total <= 2;

  const metricCardStyle = {
    border: `1.5px solid ${t.border}`,
    borderRadius: 12,
    background: t.surfaceAlt,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 130,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 16, background: t.surface, boxShadow: t.shadowSm, padding: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((s) => {
            const isAct = s === activeStep;
            const isComputed = activeStep > 0 && s <= activeStep;
            const isDone = done && s === total;
            const borderColor = isDone ? t.green : isAct ? t.yellow : isComputed ? t.blue : t.border;
            const bgColor = isDone ? t.green + "22" : isAct ? t.yellow + "28" : isComputed ? t.blue + "14" : t.surface;
            return (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    border: `2px solid ${borderColor}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    background: bgColor,
                    color: t.ink,
                    transform: isAct || isDone ? "translateY(-6px) scale(1.06)" : "scale(1)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {s}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.66rem", color: t.inkMuted }}>s{s}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 46, height: 46, border: `2px solid ${done ? t.green : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1em", background: done ? t.green + "33" : t.surfaceAlt, transform: done ? "translateY(-6px)" : "", transition: "all 0.3s" }}>
              🏁
            </div>
          </div>
        </div>
      </div>

      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 14, background: t.surfaceAlt, padding: "11px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.74rem", color: t.inkMuted }}>
        Formula: ways(i) = ways(i-1) + ways(i-2)
        <span style={{ marginLeft: 10, color: t.ink }}>{isBaseCase ? `Base case: n = ${total}` : `Active i = ${activeStep > 0 ? activeStep : "-"}`}</span>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
        {[{ label: "prev2", val: prev2 ?? "-", color: t.blue, hint: "ways(i-2)" },
          { label: "prev1", val: prev1 ?? "-", color: t.purple, hint: "ways(i-1)" },
          { label: "curr", val: curr ?? "-", color: t.yellow, hint: "ways(i)" }].map((x) => (
          <div key={x.label} style={metricCardStyle}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted, textTransform: "uppercase", fontWeight: 900 }}>{x.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.12rem", fontWeight: 900, color: x.color }}>{x.val}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.66rem", color: t.inkMuted }}>{x.hint}</span>
          </div>
        ))}
      </div>

      {done && (
        <div style={{ border: `1.5px solid ${t.green}`, borderRadius: 12, background: t.green + "15", padding: "10px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: t.green, fontWeight: 800 }}>
          Total distinct ways to reach step {total}: {prev1}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.blue, border: `1px solid ${t.blue}` }} />
          computed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.yellow, border: `1px solid ${t.yellow}` }} />
          current step
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.green, border: `1px solid ${t.green}` }} />
          finished
        </div>
      </div>
    </div>
  );
}
