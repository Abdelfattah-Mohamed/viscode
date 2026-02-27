export default function CharReplacementViz({ s = "", k = 0, stepState = {}, t = {} }) {
  const str = typeof s === "string" ? s : "";
  const chars = str ? str.split("") : [];
  const {
    l = 0,
    r = -1,
    count = {},
    maxFreq = 0,
    best = 0,
    done = false,
  } = stepState;

  const windowStart = l;
  const windowEnd = r;
  const inWindow = (idx) => idx >= windowStart && idx <= windowEnd && windowStart >= 0 && windowEnd >= 0;
  const isL = (idx) => idx === l && l >= 0 && !done;
  const isR = (idx) => idx === r && r >= 0 && !done;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 4 }}>
        Sliding window [l..r]: valid if (length − maxFreq) ≤ k. Expand r; shrink l when invalid.
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          s (char indices)
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexWrap: "wrap", paddingTop: 48 }}>
          {chars.map((c, idx) => {
            const isInWindow = inWindow(idx);
            const isCurrentL = isL(idx);
            const isCurrentR = isR(idx);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, whiteSpace: "nowrap" }}>
                  {isCurrentL && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.blue }}>l</span>}
                  {isCurrentR && !isCurrentL && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.purple }}>r</span>}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    border: `2.5px solid ${isCurrentL ? t.blue : isCurrentR ? t.purple : isInWindow ? t.yellow : t.border}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "1.2em",
                    fontWeight: 700,
                    background: isCurrentL ? t.blue + "25" : isCurrentR ? t.purple + "25" : isInWindow ? t.yellow + "30" : t.surface,
                    color: t.ink,
                    transform: isInWindow || isCurrentL || isCurrentR ? "translateY(-4px) scale(1.05)" : "scale(1)",
                    transition: "all 0.3s ease",
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
            Window: <span style={{ color: t.yellow, fontWeight: 700 }}>s[{windowStart}..{windowEnd}]</span> = &quot;{str.slice(windowStart, windowEnd + 1)}&quot; (length = {windowEnd - windowStart + 1}, maxFreq = {maxFreq}, need replace = {windowEnd - windowStart + 1 - maxFreq})
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>l</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{l}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>r</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.purple }}>{r >= 0 ? r : "—"}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>k</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{k}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>maxFreq</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{maxFreq}</span>
        </div>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>best</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.green }}>{best}</span>
        </div>
        {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Answer: {best}</span>}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          count (char → freq in window)
        </div>
        {Object.keys(count).length === 0 ? (
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>{"{ }  empty"}</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(count).map(([ch, freq]) => (
              <div key={ch} style={{ display: "flex", border: `2px solid ${t.border}`, borderRadius: 8, overflow: "hidden", fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 600, boxShadow: t.shadowSm }}>
                <span style={{ padding: "4px 10px", background: t.purple, color: "#fff", borderRight: `2px solid ${t.border}` }}>&quot;{ch}&quot;</span>
                <span style={{ padding: "4px 10px", background: t.surfaceAlt, color: t.ink }}>→ {freq}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
