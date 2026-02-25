export default function RpnViz({ stepState = {}, t }) {
  const { tokens = [], currentIndex = -1, stack = [], action, done } = stepState;
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          tokens
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tokens.map((tok, idx) => {
            const isCur = idx === currentIndex;
            return (
              <div
                key={idx}
                style={{
                  minWidth: 44,
                  height: 44,
                  padding: "0 10px",
                  border: `2.5px solid ${isCur ? t.yellow : t.border}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1.05em",
                  fontWeight: 700,
                  background: isCur ? t.yellow + "30" : t.surface,
                  color: t.ink,
                  boxShadow: isCur ? t.shadowSm : "none",
                  transition: "all 0.25s ease",
                }}
              >
                {tok}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          stack {action && <span style={{ fontSize: "0.85em", color: t.blue, marginLeft: 6 }}>{action}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, minHeight: 60 }}>
          {stack.length === 0 && (
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>empty</div>
          )}
          {stack.map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 60,
                padding: "8px 14px",
                border: `2px solid ${t.border}`,
                borderRadius: 8,
                background: isDark ? "#374151" : "#e5e7eb",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1.1em",
                fontWeight: 700,
                color: t.ink,
                textAlign: "center",
              }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>
      {done && stack.length > 0 && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green }}>
          → result = {stack[stack.length - 1]}
        </div>
      )}
    </div>
  );
}
