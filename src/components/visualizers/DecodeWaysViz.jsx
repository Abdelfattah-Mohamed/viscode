export default function DecodeWaysViz({ s = "", stepState = {}, t }) {
  const { s: sArr = [], dp = [], i = 0, highlight = [], done } = stepState;
  const chars = Array.isArray(sArr) && sArr.length ? sArr : (typeof s === "string" ? s.split("") : []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          string s
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chars.map((c, idx) => (
            <div
              key={idx}
              style={{
                width: 40,
                height: 40,
                border: `2.5px solid ${highlight.includes(idx) ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1.1em",
                fontWeight: 700,
                background: highlight.includes(idx) ? t.yellow + "30" : t.surface,
                color: t.ink,
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {chars.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, width: 40, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          dp (ways to decode s[0..i])
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(dp || []).map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 44,
                padding: "8px 10px",
                border: `2px solid ${idx === i ? t.yellow : t.border}`,
                borderRadius: 8,
                background: idx === i ? t.yellow + "25" : t.surface,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1em",
                fontWeight: 700,
                color: t.ink,
                textAlign: "center",
              }}
            >
              {val}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {(dp || []).map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>i={idx}</span>
          ))}
        </div>
      </div>
      {done && dp.length > 0 && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green }}>
          → result = {dp[dp.length - 1]}
        </div>
      )}
    </div>
  );
}
