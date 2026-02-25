export default function ParenthesesViz({ s = "", stepState = {}, t }) {
  const { i, char, stack = [], action, valid, done } = stepState;
  const chars = s.split("");

  const actionLabel = action === "push" ? "push ↓" : action === "pop" ? "pop ✓" : action === "mismatch" ? "mismatch ✗" : null;
  const actionColor = action === "push" ? t.blue : action === "pop" ? t.green : action === "mismatch" ? t.red : t.inkMuted;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          input
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chars.map((ch, idx) => {
            const isCur = idx === i;
            return (
              <div key={idx} style={{
                width: 40, height: 40,
                border: `2.5px solid ${isCur ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                background: isCur ? t.yellow + "30" : t.surface, color: t.ink,
                transform: isCur ? "translateY(-4px) scale(1.08)" : "scale(1)",
                boxShadow: isCur ? t.shadowSm : "none",
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {ch}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
            stack
          </div>
          <div style={{
            display: "flex", flexDirection: "column-reverse", gap: 4,
            minHeight: 48, minWidth: 48, alignItems: "center",
            padding: 8, border: `2px solid ${t.border}`, borderRadius: 10,
            background: t.surfaceAlt,
          }}>
            {stack.length === 0 ? (
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.inkMuted, fontStyle: "italic" }}>empty</span>
            ) : (
              stack.map((ch, idx) => (
                <div key={idx} style={{
                  width: 38, height: 38,
                  border: `2px solid ${idx === stack.length - 1 ? t.blue : t.border}`,
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                  background: idx === stack.length - 1 ? t.blue + "20" : t.surface,
                  color: t.ink,
                  transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  {ch}
                </div>
              ))
            )}
          </div>
        </div>

        {actionLabel && (
          <div style={{
            padding: "6px 14px", borderRadius: 8,
            background: actionColor + "18", border: `2px solid ${actionColor}33`,
            fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700,
            color: actionColor,
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {actionLabel}
          </div>
        )}
      </div>

      {done && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${valid ? t.green : t.red}`,
          background: valid ? t.green + "18" : t.red + "18",
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: valid ? t.green : t.red,
        }}>
          {valid ? "✅ Valid parentheses" : "❌ Invalid parentheses"}
        </div>
      )}
    </div>
  );
}
