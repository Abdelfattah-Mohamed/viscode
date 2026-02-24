export default function AnagramViz({ s, tStr, stepState = {}, t }) {
  const { freq = {}, hl_s = -1, hl_t = -1, result, badChar } = stepState;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 8 }}>s</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(s || "").split("").map((c, i) => (
            <div key={i} style={{ width: 42, height: 42, border: `2px solid ${t.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, background: hl_s === i ? t.yellow + "aa" : t.surface, color: t.ink, transform: hl_s === i ? "scale(1.12)" : "scale(1)", transition: "all 0.25s" }}>{c}</div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 8 }}>t</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(tStr || "").split("").map((c, i) => (
            <div key={i} style={{ width: 42, height: 42, border: `2px solid ${t.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, background: hl_t === i ? (badChar === c ? t.red + "88" : t.blue + "66") : t.surface, color: t.ink, transform: hl_t === i ? "scale(1.12)" : "scale(1)", transition: "all 0.25s" }}>{c}</div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 8 }}>frequency map</div>
        {Object.keys(freq).length === 0
          ? <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, fontStyle: "italic" }}>empty</span>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(freq).map(([k, v]) => (
                <div key={k} style={{ display: "flex", border: `2px solid ${v < 0 ? t.red : v === 0 ? t.green : t.border}`, borderRadius: 8, overflow: "hidden", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", fontWeight: 700 }}>
                  <span style={{ padding: "4px 10px", background: t.purple, color: "#fff" }}>{k}</span>
                  <span style={{ padding: "4px 10px", background: v < 0 ? t.red + "33" : v === 0 ? t.green + "33" : t.surfaceAlt, color: v < 0 ? t.red : v === 0 ? t.green : t.ink }}>{v > 0 ? "+" : ""}{v}</span>
                </div>
              ))}
            </div>}
        {result === true  && <div style={{ marginTop: 10, padding: "10px 14px", background: t.green + "22", border: `2px solid ${t.green}`, borderRadius: 10, fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Valid anagram!</div>}
        {result === false && <div style={{ marginTop: 10, padding: "10px 14px", background: t.red   + "22", border: `2px solid ${t.red}`,   borderRadius: 10, fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.red   }}>❌ Not an anagram</div>}
      </div>
    </div>
  );
}
