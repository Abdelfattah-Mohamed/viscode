export default function ProductViz({ nums = [], stepState = {}, t }) {
  const { i, phase, prefix = [], result = [], done } = stepState;

  const phaseBg = phase === "prefix" ? t.blue : phase === "suffix" ? t.purple : t.green;

  const renderRow = (arr, label, color, highlightPhase) => (
    <div>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {arr.map((val, idx) => {
          const isCur = idx === i && phase === highlightPhase;
          return (
            <div key={idx} style={{
              width: 54, height: 42,
              border: `2px solid ${done ? t.green : isCur ? t.yellow : t.border}`,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", fontWeight: 600,
              background: done ? t.green + "18" : isCur ? t.yellow + "30" : t.surface,
              color: t.ink,
              transform: isCur ? "translateY(-4px) scale(1.06)" : "scale(1)",
              boxShadow: isCur ? t.shadowSm : "none",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              {val ?? "—"}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          nums
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {nums.map((val, idx) => {
            const isCur = idx === i;
            return (
              <div key={idx} style={{
                width: 54, height: 42,
                border: `2.5px solid ${isCur ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "1em", fontWeight: 700,
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

      {prefix.length > 0 && renderRow(prefix, "prefix", t.blue, "prefix")}
      {result.length > 0 && renderRow(result, "result", t.green, "suffix")}

      {phase && (
        <div style={{
          display: "inline-flex", alignSelf: "flex-start",
          padding: "5px 14px", borderRadius: 8,
          background: phaseBg + "18", border: `2px solid ${phaseBg}33`,
          fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700,
          color: phaseBg,
        }}>
          phase: {phase}
        </div>
      )}
    </div>
  );
}
