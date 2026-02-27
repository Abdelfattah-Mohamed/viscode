export default function SlidingWindowViz({ s = "", stepState = {}, t }) {
  const str = typeof s === "string" ? s : "";
  const chars = str ? str.split("") : [];
  const {
    start = -1,
    i: currentI = -1,
    best = 0,
    last = {},
    done = false,
  } = stepState;

  // Window [start+1, currentI] inclusive = indices that are in the current valid substring
  const windowStart = start + 1;
  const windowEnd = currentI;
  const inWindow = (idx) => idx >= windowStart && idx <= windowEnd && windowStart >= 0 && windowEnd >= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          string <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85em", background: t.surfaceAlt, padding: "1px 6px", borderRadius: 4 }}>s</code> — Sliding window [start+1 .. i]
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexWrap: "wrap", paddingTop: 56 }}>
          {chars.map((c, idx) => {
            const isInWindow = inWindow(idx);
            const isCurrent = idx === currentI;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
                  {isCurrent && !done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.blue }}>i={idx}</span>}
                  {idx === windowStart && windowStart <= windowEnd && !done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.purple }}>start+1</span>}
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: `2.5px solid ${isCurrent ? t.blue : isInWindow ? t.yellow : t.border}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "1.25em",
                    fontWeight: 700,
                    background: isCurrent ? t.blue + "25" : isInWindow ? t.yellow + "30" : t.surface,
                    color: t.ink,
                    transform: isCurrent || isInWindow ? "translateY(-6px) scale(1.05)" : "scale(1)",
                    boxShadow: isInWindow || isCurrent ? t.shadowSm : "none",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  {c}
                </div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
        {windowStart >= 0 && windowEnd >= windowStart && !done && (
          <div style={{ marginTop: 8, fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>
            Window: <span style={{ color: t.yellow, fontWeight: 700 }}>s[{windowStart}..{windowEnd}]</span> = &quot;{str.slice(windowStart, windowEnd + 1)}&quot; (length = {windowEnd - windowStart + 1})
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>start</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.purple }}>{start}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>i</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.blue }}>{currentI >= 0 ? currentI : "—"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>best</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.green }}>{best}</span>
        </div>
        {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Answer: {best}</span>}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          last (char → last index)
        </div>
        {Object.keys(last).length === 0 ? (
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>{"{ }  empty"}</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(last).map(([k, v]) => (
              <div key={k} style={{ display: "flex", border: `2px solid ${t.border}`, borderRadius: 8, overflow: "hidden", fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 600, boxShadow: t.shadowSm }}>
                <span style={{ padding: "4px 10px", background: t.purple, color: "#fff", borderRight: `2px solid ${t.border}` }}>&quot;{k}&quot;</span>
                <span style={{ padding: "4px 10px", background: t.surfaceAlt, color: t.ink }}>→ {v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
